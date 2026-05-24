#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
hackpath - Modular Security Helper & CTF Workflow Wrapper
Designed to orchestrate recon, brute-force, hash-cracking, post-exploit and reporting.
"""

import sys
import argparse
import json
from pathlib import Path

# Fix python path to support relative importing cleanly
sys.path.append(str(Path(__file__).parent))

from core.workspace import WorkspaceManager
from core.report import ReportGenerator
from modules.recon import ReconModule
from modules.crack import CrackModule
from modules.bruteforce import BruteforceModule
from modules.post_exploit import PostExploitModule

class HackpathCLI:
    def __init__(self):
        self.workspace_mgr = WorkspaceManager()
        self.report_gen = ReportGenerator()

        # Build module mappings
        self.modules = {
            "recon": ReconModule(self.workspace_mgr),
            "crack": CrackModule(self.workspace_mgr),
            "bruteforce": BruteforceModule(self.workspace_mgr),
            "post-exploit": PostExploitModule(self.workspace_mgr)
        }

    def run(self):
        # Top-level Parser
        parser = argparse.ArgumentParser(
            prog="hackpath",
            description="hackpath - Interactive wrapper & CTF documentation engine for cyber laboratories.",
            epilog="Example: python3 hackpath.py run nmap --target 10.10.10.5 --mode fast"
        )
        
        parser.add_argument(
            "-w", "--workspace", 
            type=str, 
            default="default_lab",
            help="Current CTF machine/target workspace name (saves state automatically)"
        )
        
        parser.add_argument(
            "-l", "--lang", 
            choices=["it", "en"], 
            default="en",
            help="Explanation/Interface language (default: en)"
        )

        subparsers = parser.add_subparsers(dest="command", help="System command to invoke")

        # Command: run
        run_parser = subparsers.add_parser("run", help="Compile and execute a specialized wrapper helper")
        run_sub = run_parser.add_subparsers(dest="tool", required=True, help="Specialized helper module block")

        # Standard parameters common for wrapping tools
        common_args = argparse.ArgumentParser(add_help=False)
        common_args.add_argument("--dry-run", action="store_true", help="Print actual compiled executable command without executing")
        common_args.add_argument("--explain", action="store_true", help="Offer standard didactical summary of arguments utilized")

        # Map each sub-tool in recon, crack, bruteforce, post-exploit
        self.modules["recon"].register_subparsers(run_sub, common_args)
        self.modules["crack"].register_subparsers(run_sub, common_args)
        self.modules["bruteforce"].register_subparsers(run_sub, common_args)
        self.modules["post-exploit"].register_subparsers(run_sub, common_args)

        # Command: report
        report_parser = subparsers.add_parser("report", help="Assemble findings registered in active workspace")
        report_parser.add_argument("--title", type=str, default="HTB-MachineReport", help="Custom name of output target platform")
        report_parser.add_argument("--template", choices=["ctf", "pentest", "summary"], default="ctf", help="Style design format structure")
        report_parser.add_argument("--format", choices=["markdown", "html", "json"], default="markdown", help="Target output file format")

        args = parser.parse_args()

        # Set active workspace
        self.workspace_mgr.set_active_workspace(args.workspace)

        if not args.command:
            parser.print_help()
            sys.exit(0)

        if args.command == "run":
            # Identify which module manages this specific tool alias
            handler = None
            for key, mod in self.modules.items():
                if args.tool in mod.supported_tools():
                    handler = mod
                    break

            if handler:
                handler.process(args.tool, args, lang=args.lang)
            else:
                print(f"[!] Unknown tool handler selected '{args.tool}'")
                sys.exit(1)

        elif args.command == "report":
            findings = self.workspace_mgr.get_findings()
            dest_file = self.report_gen.assemble(
                workspace=args.workspace,
                findings=findings,
                title=args.title,
                template_style=args.template,
                out_format=args.format,
                lang=args.lang
            )
            if args.lang == "it":
                print(f"[+] Report compilato con successo nel percorso: {dest_file}")
            else:
                print(f"[+] Report compiled successfully. Dossier path: {dest_file}")

if __name__ == "__main__":
    cli = HackpathCLI()
    cli.run()
