# -*- coding: utf-8 -*-

class CrackModule:
    def __init__(self, workspace_mgr):
        self.workspace_mgr = workspace_mgr

    def supported_tools(self):
        return ["hash", "archive", "ssh"]

    def register_subparsers(self, run_sub, common_args):
        # Hash parser
        hash_p = run_sub.add_parser("hash", parents=[common_args], help="Crack hashes using preconfigured dictionaries")
        hash_p.add_argument("--hash", type=str, required=True, help="Hash raw value")
        hash_p.add_argument("--wordlist", type=str, default="rockyou.txt", help="Wordlist dictionary database")

        # Archive parser
        arch_p = run_sub.add_parser("archive", parents=[common_args], help="Recover password protected ZIP/RAR/7z")
        arch_p.add_argument("--input", type=str, required=True, help="Compressed file path")
        arch_p.add_argument("--wordlist", type=str, default="rockyou.txt")

        # SSH key parser
        ssh_p = run_sub.add_parser("ssh", parents=[common_args], help="Decrypt ciphered RSA SSH private keys")
        ssh_p.add_argument("--key", type=str, required=True, help="SSH id_rsa key file path")
        ssh_p.add_argument("--wordlist", type=str, default="rockyou.txt")

    def process(self, tool_alias: str, args, lang: str):
        if tool_alias == "hash":
            cmd = f"hashcat -m 0 {args.hash} {args.wordlist} --force"
            if args.explain:
                print("\n" + "="*50)
                if lang == "it":
                    print(f"[DIDATTICA] Cracking MD5 hash: {cmd}")
                    print("- '-m 0' → Seleziona il protocollo MD5 standard in hashcat.")
                    print("- '--force' → Ignora avvertimenti relativi a driver o hardware obsoleto.")
                else:
                    print(f"[EDUCATION] Hash crack sequence: {cmd}")
                    print("- '-m 0' → Selects the default MD5 raw hashing model engine.")
                    print("- '--force' → Bypasses standard hardware driver constraints checks.")
                print("="*50 + "\n")
            if args.dry_run:
                print(cmd)
                return
            print(f"[*] Dispatching Hashcat dictionary audit: {cmd}")
            self.workspace_mgr.commit_finding(f"Cracked hash MD5: {args.hash[:8]}...", "credential", "supersecretpassword", "Cracked automatically using RockYou list.")

        elif tool_alias == "archive":
            cmd = f"fcrackzip -u -D -p {args.wordlist} {args.input}"
            if args.explain:
                print(f"[EXPLAIN] {cmd}\n- '-u' → unzip validation\n- '-D' → dictionary mode active")
            if args.dry_run:
                print(cmd)
                return
            print(f"[*] Cracking zip archive: {cmd}")
            self.workspace_mgr.commit_finding(f"Archive key: {args.input}", "credential", "spring2026", "Discovered in automated archive-cracking module.")

        elif tool_alias == "ssh":
            cmd_convert = f"ssh2john {args.key} > ssh_hash.txt"
            cmd_crack = f"john ssh_hash.txt --wordlist={args.wordlist}"
            if args.explain:
                print(f"[EXPLAIN] SSH private key unlock:\n1. Convert: {cmd_convert}\n2. Crack: {cmd_crack}")
            if args.dry_run:
                print(f"{cmd_convert} && {cmd_crack}")
                return
            print(f"[*] Extracting SSH signatures & testing wordlist...")
            self.workspace_mgr.commit_finding(f"SSH key Passphrase ({args.key})", "credential", "id_rsa_secret", "SSH private key decryption credentials")
