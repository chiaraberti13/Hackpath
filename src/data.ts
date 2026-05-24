import { HackpathTool } from "./types";

export const HACKPATH_TOOLS: HackpathTool[] = [
  {
    alias: "nmap",
    name: "nmap-helper",
    phase: "RECON",
    descriptionIt: "Port scan orientato alle CTF per rilevare porte aperte e servizi attivi.",
    descriptionEn: "CTF-oriented port scanning to detect open ports and active services.",
    underlyingTool: "Nmap (Network Mapper)",
    options: [
      { param: "--target", descIt: "IP o dominio del bersaglio", descEn: "Target IP or domain", required: true, defaultValue: "10.10.10.5" },
      { param: "--mode", descIt: "Velocità/Accuratezza: fast (primi 1000), scripts (scansione profonda), full (65535 porte)", descEn: "Speed/Accuracy: fast (top 1000), scripts (deep scan), full (all 65535 ports)", required: true, defaultValue: "fast" }
    ]
  },
  {
    alias: "web",
    name: "web-enum-helper",
    phase: "RECON",
    descriptionIt: "Enumerazione di directory e file web nascosti.",
    descriptionEn: "Web directory and hidden files enumeration.",
    underlyingTool: "Gobuster / Ffuf / Dirb",
    options: [
      { param: "--target", descIt: "URL del sito bersaglio (es. http://10.10.10.5)", descEn: "Target website URL (e.g. http://10.10.10.5)", required: true, defaultValue: "http://10.10.10.5" },
      { param: "--extensions", descIt: "Estensioni di file da cercare separate da virgola (es. php,html,txt)", descEn: "Comma-separated search file extensions (e.g. php,html,txt)", required: false, defaultValue: "php,html,txt" },
      { param: "--wordlist", descIt: "Wordlist personalizzata per brute-force (es. common.txt)", descEn: "Custom wordlist for brute-force (e.g. common.txt)", required: false, defaultValue: "/usr/share/wordlists/dirb/common.txt" }
    ]
  },
  {
    alias: "dns",
    name: "dns-helper",
    phase: "RECON",
    descriptionIt: "Enumerazione record DNS, tentativi di Zone Transfer e brute-force di sottodomini.",
    descriptionEn: "DNS record enumeration, Zone Transfer attempts, and subdomain brute-forcing.",
    underlyingTool: "Dig / Host / Dnsrecon",
    options: [
      { param: "--target", descIt: "Dominio target (es. example.thm)", descEn: "Target domain (e.g. example.thm)", required: true, defaultValue: "example.thm" },
      { param: "--mode", descIt: "Modalità di scansione: basic, subdomains, zone-transfer, all", descEn: "Scan mode: basic, subdomains, zone-transfer, all", required: false, defaultValue: "all" }
    ]
  },
  {
    alias: "smb",
    name: "smb-helper",
    phase: "RECON",
    descriptionIt: "Enumerazione di condivise SMB, permessi di lettura/scrittura e utenti anonimi.",
    descriptionEn: "SMB shares enumeration, read/write permissions check, and anonymous users.",
    underlyingTool: "Smbclient / CrackMapExec / Enum4linux",
    options: [
      { param: "--target", descIt: "IP o dominio del server SMB", descEn: "Target SMB server IP or domain", required: true, defaultValue: "10.10.10.5" },
      { param: "--mode", descIt: "Azione: shares (lista directory), users (utenti), enum (completa)", descEn: "Action: shares (list shares), users (users list), enum (complete enum)", required: false, defaultValue: "shares" }
    ]
  },
  {
    alias: "hash",
    name: "hash-cracker-helper",
    phase: "CRACK",
    descriptionIt: "Identificazione del tipo di hash e tentativo di decifrazione tramite wordlist.",
    descriptionEn: "Hash type identification and dictionary cracking using custom wordlists.",
    underlyingTool: "Hashcat / John the Ripper",
    options: [
      { param: "--hash", descIt: "Stringa dell'hash da craccare", descEn: "Hash string to crack", required: true, defaultValue: "5f4dcc3b5aa765d61d8327deb882cf99" },
      { param: "--wordlist", descIt: "Percorso della wordlist di dizionario", descEn: "Dictionary wordlist path", required: false, defaultValue: "rockyou.txt" }
    ]
  },
  {
    alias: "archive",
    name: "archive-cracker-helper",
    phase: "CRACK",
    descriptionIt: "Brute-force per forzare la password di archivi cifrati (ZIP, RAR, 7z).",
    descriptionEn: "Brute-force dictionary cracking for password-protected archives (ZIP, RAR, 7z).",
    underlyingTool: "Fcrackzip / John the Ripper",
    options: [
      { param: "--input", descIt: "File dell'archivio bloccato", descEn: "Locked archive file", required: true, defaultValue: "secret.zip" },
      { param: "--wordlist", descIt: "Dizionario per il cracking", descEn: "Cracking dictionary wordlist", required: false, defaultValue: "rockyou.txt" }
    ]
  },
  {
    alias: "ssh",
    name: "ssh-key-cracker-helper",
    phase: "CRACK",
    descriptionIt: "Forza la passphrase di una chiave RSA SSH privata crittografata.",
    descriptionEn: "Crack the passphrase of an encrypted private SSH RSA key.",
    underlyingTool: "Ssh2john / John the Ripper",
    options: [
      { param: "--key", descIt: "File della chiave privata SSH (es. id_rsa)", descEn: "SSH private key file (e.g. id_rsa)", required: true, defaultValue: "id_rsa" },
      { param: "--wordlist", descIt: "Dizionario Wordlist", descEn: "Wordlist dictionary", required: false, defaultValue: "rockyou.txt" }
    ]
  },
  {
    alias: "hydra",
    name: "hydra-command-builder",
    phase: "BRUTEFORCE",
    descriptionIt: "Automazione e calcolo di dizionari di login per servizi SSH, FTP, HTTP, ecc.",
    descriptionEn: "Login credentials brute-forcing engine for SSH, FTP, HTTP-Post-Form, etc.",
    underlyingTool: "Hydra",
    options: [
      { param: "--target", descIt: "IP o porta del target", descEn: "Target IP or port", required: true, defaultValue: "10.10.10.5" },
      { param: "--service", descIt: "Servizio bersaglio: ssh, ftp, http-get, http-post-form", descEn: "Target service: ssh, ftp, http-get, http-post-form", required: true, defaultValue: "ssh" },
      { param: "--username", descIt: "Nome utente bersaglio (o file)", descEn: "Single username or username file", required: true, defaultValue: "admin" },
      { param: "--wordlist", descIt: "Wordlist per le password", descEn: "Wordlist resource for passwords", required: true, defaultValue: "rockyou.txt" }
    ]
  },
  {
    alias: "ntlm",
    name: "responder-log-parser",
    phase: "POST-EXPLOIT",
    descriptionIt: "Analizzatore di log di Responder per estrarre hash NTLMv1/v2 catturati in rete.",
    descriptionEn: "Responder log analyzer to search and extract captured NTLMv1/v2 hashes.",
    underlyingTool: "Python string regex parser",
    options: [
      { param: "--input", descIt: "File dei log di log di Responder (es. Responder-Session.log)", descEn: "Responder Session log file", required: true, defaultValue: "Responder-Session.log" },
      { param: "--crack", descIt: "Se abilitato, lancia suggerimenti per il cracking automatico con hashcat", descEn: "If set, raises ready helper flags for automated hashcat commands", required: false, defaultValue: "false" }
    ]
  },
  {
    alias: "xor",
    name: "xor-helper",
    phase: "POST-EXPLOIT",
    descriptionIt: "Risoluzione ed elaborazione di file e testi cifrati in XOR singola o multibia.",
    descriptionEn: "XOR cipher decoder and encoder with brute-force key-lengths capability.",
    underlyingTool: "Python custom library",
    options: [
      { param: "--input", descIt: "Payload o testo da decifrare", descEn: "Input payload or string", required: true, defaultValue: "payload.bin" },
      { param: "--mode", descIt: "Modalità: encrypt, decrypt, brute (brute-force)", descEn: "Mode: encrypt, decrypt, brute (brute-force keys)", required: true, defaultValue: "brute" },
      { param: "--key-length", descIt: "Lunghezza presunta chiave per bruteforce (es. 1 o 2)", descEn: "XOR key length targeted (default: 1)", required: false, defaultValue: "2" }
    ]
  },
  {
    alias: "stego",
    name: "steganography-helper",
    phase: "POST-EXPLOIT",
    descriptionIt: "Rileva e analizza informazioni nascoste in immagini o audio.",
    descriptionEn: "Steganography scanner for files embedded in media and images.",
    underlyingTool: "Steghide / Exiftool / Binwalk",
    options: [
      { param: "--input", descIt: "Immagine o file multimediale (PNG, JPG, WAV)", descEn: "Image or multimedia file (PNG, JPG, WAV)", required: true, defaultValue: "image.png" },
      { param: "--mode", descIt: "Azione: analyze (metadati), extract (estrazione file)", descEn: "Action: analyze (meta metadata), extract (extract files)", required: true, defaultValue: "analyze" }
    ]
  },
  {
    alias: "pwd",
    name: "password-analyzer",
    phase: "POST-EXPLOIT",
    descriptionIt: "Misuratore di sicurezza ed entropia per mazzi di password da dizionari.",
    descriptionEn: "Password vocabulary entropy checker and dictionary analysis statistics.",
    underlyingTool: "Zxcvbn algorithm",
    options: [
      { param: "--input", descIt: "File con la lista di password da testare", descEn: "Wordlist with password entries to test", required: true, defaultValue: "passwords.txt" },
      { param: "--top", descIt: "Mostra solo le X password più deboli", descEn: "Show only top X weakest dictionary entries", required: false, defaultValue: "20" }
    ]
  },
  {
    alias: "report",
    name: "lab-report-generator",
    phase: "REPORT",
    descriptionIt: "Riepilogo finale dei ritrovamenti e note CTF formattate in Markdown strutturato.",
    descriptionEn: "Final documentation builder summarizing notes and output findings to neat markdown notes.",
    underlyingTool: "Lab reporting engine",
    options: [
      { param: "--title", descIt: "Titolo della macchina CTF", descEn: "CTF target name / platform label", required: true, defaultValue: "HTB-Machine-Analysis" },
      { param: "--template", descIt: "Template estetico: ctf, pentest, summary", descEn: "Aesthetic style template: ctf, pentest, summary", required: false, defaultValue: "ctf" },
      { param: "--format", descIt: "Estensione file di salvataggio (markdown o html)", descEn: "Save report format target (markdown or html)", required: false, defaultValue: "markdown" }
    ]
  }
];

export interface MockLogItem {
  id: string;
  name: string;
  tool: string;
  content: string;
}

export const MOCK_TERMINAL_LOGS: MockLogItem[] = [
  {
    id: "log1",
    name: "Nmap deep port scan output",
    tool: "nmap",
    content: `Starting Nmap 7.92 ( https://nmap.org ) at 2026-05-24 13:00 UTC
Nmap scan report for hackpath-target.thm (10.10.10.5)
Host is up (0.024s latency).
Not shown: 996 closed tcp ports
PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   4096 cd:ae:62:30:e7:be:62:0a:f0:83:8c:13 (RSA)
|_  256 ee:ee:b1:cf:ca:5c:21:f4 (ED25519)
80/tcp   open  http    Apache httpd 2.4.41 ((Ubuntu))
|_http-title: VulnCorp Internal Portal
|_http-server-header: Apache/2.4.41 (Ubuntu)
139/tcp  open  netbios-ssn Samba smbd 4.6.2
445/tcp  open  microsoft-ds Samba smbd 4.6.2 (workgroup: WORKGROUP)

Host script results:
|_smb2-security-mode: 2.02
| smb2-time: 
|_  date: 2026-05-24T13:04:01

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel
Nmap done: 1 IP address (1 host up) scanned in 12.33 seconds`
  },
  {
    id: "log2",
    name: "Gobuster Directory Brute-force Web logs",
    tool: "web",
    content: `===============================================================
Gobuster v3.1.0
by OJ Reeves (@TheColonial) & Christian Mehlmauer (@firefart)
===============================================================
[+] Url:                     http://10.10.10.5
[+] Method:                  GET
[+] Threads:                 10
[+] Wordlist:                /usr/share/wordlists/dirb/common.txt
[+] Negative Status:         404
[+] User Agent:              gobuster/3.1.0
===============================================================
2026/05/24 13:10:01 Starting gobuster in directory enumeration mode
===============================================================
/index.html           (Status: 200) [Size: 1224]
/images               (Status: 301) [Size: 312] --> redirect to http://10.10.10.5/images/
/assets               (Status: 301) [Size: 312]
/admin.php            (Status: 200) [Size: 8444]
/uploads              (Status: 301) [Size: 312]
/robots.txt           (Status: 200) [Size: 64]
/secret-key.txt       (Status: 200) [Size: 45]
===============================================================
2026/05/24 13:11:42 Finished
===============================================================`
  },
  {
    id: "log3",
    name: "John the Ripper (Hash Crack Results)",
    tool: "hash",
    content: `Using default input encoding: UTF-8
Loaded 1 password hash (md5crypt, crypt(3) $1$ [MD5 128/128 AVX 4x])
Will run 2 OpenMP threads
Press 'q' or Ctrl-C to abort, almost any key for status
supersecretpassword  (user1_adminhash_extracted)
1g 0:00:00:02 DONE (2026-05-24 13:12) 0.354g/s 45437p/s 45437c/s 45437C/s rockyou..rockyou88
Use the "--show" option to display all of the cracked passwords.
Session completed.`
  },
  {
    id: "log4",
    name: "Responder captured NTLM Hash Event",
    tool: "ntlm",
    content: `[+] [HTTP] Poisoned answer sent to 10.10.10.15 for name CAD-SERVER
[+] [HTTP] Captured credentials:
    Target Name   : WINDOWS-SERVER2
    User Name     : Administrator
    Domain Name   : CONTOSO
    NTLMv2-Hash   : Administrator::CONTOSO:1122334455667788:AABBCCDDEE001122:7b6072ccfce0d40236a234be1a7044a2:...
[+] Session finished safely.`
  }
];
