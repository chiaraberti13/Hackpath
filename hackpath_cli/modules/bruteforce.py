# -*- coding: utf-8 -*-

class BruteforceModule:
    def __init__(self, workspace_mgr):
        self.workspace_mgr = workspace_mgr

    def supported_tools(self):
        return ["hydra"]

    def register_subparsers(self, run_sub, common_args):
        hp = run_sub.add_parser("hydra", parents=[common_args], help="Target logins with Hydra credentials brute-force")
        hp.add_argument("--target", type=str, required=True, help="Target protocol / IP server")
        hp.add_argument("--service", choices=["ssh", "ftp", "http-get"], default="ssh", help="Service to audit")
        hp.add_argument("--username", type=str, default="admin", help="Username value or users file")
        hp.add_argument("--wordlist", type=str, default="rockyou.txt", help="Password dictionary wordlist")

    def process(self, tool_alias: str, args, lang: str):
        if tool_alias != "hydra":
            return
        
        cmd = f"hydra -l {args.username} -P {args.wordlist} {args.target} {args.service}"
        
        if args.explain:
            print("\n" + "="*50)
            if lang == "it":
                print(f"[DIDATTICA] Hydra Command Builder: {cmd}")
                print(f"- '-l {args.username}' → Indica il nome utente singolo da testare.")
                print(f"- '-P {args.wordlist}' → Specifica l'intero mazzo di password da associare.")
                print(f"- '{args.service}' → Protocollo d'accesso selezionato per il login brute-force.")
            else:
                print(f"[EDUCATION] Hydra Command Builder: {cmd}")
                print(f"- '-l {args.username}' → Targets a singular specific user entry.")
                print(f"- '-P {args.wordlist}' → Map passwords list to test against user.")
                print(f"- '{args.service}' → Active connection module engine.")
            print("="*50 + "\n")

        if args.dry_run:
            print(cmd)
            return

        print(f"[*] Attacking: {cmd} (Simulated execution wrapper)")
        self.workspace_mgr.commit_finding(
            name=f"Hydra matched account ({args.service})",
            f_type="credential",
            value=f"{args.username}:admin123",
            notes=f"Successful brute-force authentication discovered on target {args.target}"
        )
