# Hackpath

```
  ██╗  ██╗ █████╗  ██████╗██╗  ██╗██████╗  █████╗ ████████╗██╗  ██╗
  ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔══██╗╚══██╔══╝██║  ██║
  ███████║███████║██║     █████╔╝ ██████╔╝███████║   ██║   ███████║
  ██╔══██║██╔══██║██║     ██╔═██╗ ██╔═══╝ ██╔══██║   ██║   ██╔══██║
  ██║  ██║██║  ██║╚██████╗██║  ██╗██║     ██║  ██║   ██║   ██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
```

An educational cybersecurity wrapper toolkit, modular CLI framework, and interactive AI suite designed to simplify, automate, and explain penetration testing workflows for CTF players and ethical hacking students.

---

## ⚠️ DISCLAIMER — EDUCATIONAL USE ONLY

This toolkit and integrated web application are developed **exclusively** for academic purposes, cybersecurity training, and legal participation in **Capture The Flag (CTF)** challenges on machines where you have explicit written authorization. 

Unauthorized access of third-party platforms is completely **illegal** and criminally punishable. The developers and authors disclaim all legal responsibility or liability for any malicious actions, improper uses, or system damages caused by this toolkit.

---

# [ ENGLISH SECTION ]

## 📥 Installation & Local Setup

To launch the full interactive full-stack **hackpath** web application suite, follow the instructions below:

### 1. Requirements
Ensure you have the following packages installed on your system:
- **Node.js** (v18 or higher)
- **npm** (Node Package Manager)

### 2. Run Dependencies Installation
Clone or navigate to the project directory and run:
```bash
npm install
```

### 3. Configure the Environment Values
Create a `.env` file from the example blueprint:
```bash
cp .env.example .env
```
Inside your `.env` file, populate your server secret key:
```env
GEMINI_API_KEY="your_api_key_goes_here"
```
*(Note: Do not commit `.env` or API credentials to version control. The application proxies all AI prompts server-side safely to protect your API keys).*

### 4. Boot Development Server
Run the local hot-rebuilding server:
```bash
npm run dev
```
The server will start running on port **3000** (`http://localhost:3000`).

### 5. Compile & Run Production Build
To build the application for optimized container runtime or static hosting:
```bash
npm run build
npm run start
```

---

## 🛠️ App Description & Key Features

**hackpath** integrates a visual full-stack interface with a sleek obsidian-dark layout, custom-tailored for cybersecurity learners. The application is divided into six modular workspaces:

### 1. Interactive Command Builder & Terminal Simulator
- **Visual Prompting**: Forget complex commands. Pick a category (Recon, Crack, Bruteforce, Post-Exploit), select your tool of choice (e.g., `nmap`, `gobuster`, `hydra`, `hashcat`, etc.), and input your targets.
- **AI Explanation Engine**: Hit **"Explain Command (--explain)"** to request detailed server-side Gemini breakdowns illustrating the role of each argument, targets, risks, and educational pointers.
- **Interactive Terminal Emulator**: Execute a `--dry-run` or launch a realistic visual simulation. The terminal output is cleanly rendered, showing the actual expected CLI outcomes. Simulated victories automatically commit findings (e.g., opened ports, folders) directly into your active Workspace.

### 2. AI Interactive CTF Wizard & Mentor
- **Contextual Academic Advice**: Face a tricky CTF machine or subnet? Describe your host status and your current phase.
- **Strategic Steps & Commands**: The AI Mentor calculates step-by-step methodologies of next stages, details the logic of corresponding tools, and outputs ready-to-use commands matching your exact target IP.

### 3. Logs Analyzer & Intelligent Parser (AI-Powered)
- **Raw Log Ingestion**: Paste any raw console outputs or logs (e.g. detailed Nmap output, Gobuster HTTP scans, brute-force logs, or Responder captures).
- **Automated Traces Extraction**: Gemini scans, parses, categorizes, and isolates valuable artifacts into distinct badges (Open Ports, Directories, Captured Credentials, Cryptographic Hashes).
- **One-Click Persistence**: Click **"Commit Finding"** on any parsed asset to save it instantly into the workspace databases.

### 4. Multi-Workspace Findings Manager
- **Multi-Target Isolation**: Maintain independent workspaces for separate CTF machines or targets.
- **Discovery Log**: View, filter, and manually add customized traces (with name, category classification, flag status, and markdown context notes).
- **JSON Backup Exports**: Seamlessly download standard JSON workspace backup archives to backup or migrate data.

### 5. Academic Report Walkthrough Builder
- **Predefined Structuring**: Choose from specialized outline templates: academic CTF Walkthrough writeups, formal penetration testing reports, or quick tactical executive summaries.
- **Live Output Compiler**: The generator looks inside your active workspace and dynamically formats all captured findings into clean Markdown.
- **Direct Markdown (.md) Downloads**: Save and download your documentation inside one single document ready for your portfolio.

### 6. Modular CLI Python Toolkit (Saves Offline)
- **Native Architecture Viewer**: View and learn from the native python 3 source code modular modules hierarchy (`hackpath.py`, core managers, plugins for recon, cracking, brute-force, post-exploitation).
- **Local Download Bash Setup**: Download a unified `setup_hackpath.sh` shell script to generate the entire local, offline Python 3 directory architecture. E.g.:
  ```bash
  python3 hackpath.py run nmap --target 10.10.10.5 --mode fast --explain
  ```

### 7. Integrated Host Doctor Diagnostic
- Check for the availability of essential local hacking dependencies (`python3`, `nmap`, `gobuster`, `hydra`, `john`).
- Recommends quick copy-paste commands to install them on Debian/Ubuntu/Kali Linux, macOS (Homebrew), or Windows platforms.

---

# [ SEZIONE IN ITALIANO ]

## 📥 Installazione e Avvio Locale

Per avviare la suite web interattiva di **hackpath**, segui questi semplici passaggi:

### 1. Requisiti
Assicurati di avere installato sul sistema ospite:
- **Node.js** (v18 o superiore)
- **npm** (gestore di pacchetti Node)

### 2. Installazione delle Dipendenze
Apri la cartellina del progetto sul terminale ed esegui:
```bash
npm install
```

### 3. Configurazione dell'Ambiente
Genera un file `.env` copiando il blueprint di esempio:
```bash
cp .env.example .env
```
Inserisci la tua chiave API all'interno del file `.env` creato:
```env
GEMINI_API_KEY="LA_TUA_CHIAVE_API_DI_GEMINI"
```
*(Nota: la chiave API viene custodita e gestita in modo sicuro sul server Express, senza mai essere esposta nel browser dell'utente).*

### 4. Avvio in Modalità Sviluppo
Lancia il server locale con ricarica automatica dei file:
```bash
npm run dev
```
L'applicazione risponderà all'indirizzo `http://localhost:3000`.

### 5. Compilazione e Avvio di Produzione
Per preparare l'applicazione all'avvio in produzione:
```bash
npm run build
npm run start
```

---

## 🛠️ Descrizione dell'Applicazione e Funzionalità Chiave

**hackpath** è una suite didattica integrata con un design dark minimal ed elegante, progettata per razionalizzare l'apprendimento pratico della cybersecurity offensiva. L'app si articola in sei hub interattivi principali:

### 1. Costruttore di Comandi e Simulatore Terminale
- **Composizione Semplificata**: Scegli una categoria (Recon, Crack, Bruteforce, Post-Exploit) ed inserisci i target, automatizzando l'immissione della complessa sintassi CLI.
- **Spiegazioni AI in Tempo Reale**: Cliccando su **"Spiega Flag"**, Gemini analizza il comando compilato evidenziando il ruolo di ogni flag, i meccanismi sottostanti, l'impatto sul target ed indicazioni di mitigazione.
- **Terminale Interattivo**: Esegui prove e simulazioni di scansione. I risultati ottenuti vengono visualizzati nel terminale virtuale e registrati nel database dell'area di lavoro corrente.

### 2. Mentore e Assistente AI CTF
- **Struttura Didattica**: Se stai studiando una macchina vulnerabile, indica la situazione corrente e la fase di penetrazione in cui ti trovi.
- **Piani di Attacco**: Il Mentore AI stila una strategia dettagliata passo-passo che ti insegna i giusti concetti operativi e ti illustra con quali comandi proseguire la scansione.

### 3. Analizzatore Log Inteligente con AI
- Incolla i log grezzi della console (scansioni Nmap fitte, percorsi Gobuster, credenziali Hydra o Responder).
- L'AI li esamina in tempo reale isolando porte, percorsi scoperti, hash e credenziali, mostrandoti badge intelligenti che puoi salvare all'istante con un semplice clic.

### 4. Gestore dei Workspace Integrato
- Crea e mantieni spazi di lavoro separati per macchine e sistemi target differenti.
- Gestisci la cronologia dei ritrovamenti, modifica note di laboratorio, o esporta dati in comodi file JSON di backup.

### 5. Generatore Automatico di Documentazione e Report
- Scegli un'impostazione (CTF Walkthrough accademico, Report Tecnico informale, Executive Summary strutturato).
- Compila istantaneamente tutte le indagini e i risultati memorizzati nel Workspace prescelto convertendoli in un documento Markdown (.md) leggibile, elegante e pronto per il download.

### 6. Downloader e Visualizzatore dell'Architettura CLI Python
- Esplora interamente la struttura originale in Python 3 per l'uso locale e offline del toolkit.
- Scarica lo script `setup_hackpath.sh` per generare all'istante la gerarchia pulita dei file del toolkit CLI sul tuo sistema.

### 7. Diagnostica Host System Doctor
- Misura la disponibilità dei tool difensivi sul tuo PC (Python, Nmap, Gobuster, Hydra, John) fornendoti i comandi precisi ed immediati per l'installazione su Linux, macOS e Windows.

---

*hackpath — built for learners, by learners. Practice legally, study safely.*
