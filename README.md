# hackpath

```
  ██╗  ██╗ █████╗  ██████╗██╗  ██╗██████╗  █████╗ ████████╗██╗  ██╗
  ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██╔══██╗██╔══██╗╚══██╔══╝██║  ██║
  ███████║███████║██║     █████╔╝ ██████╔╝███████║   ██║   ███████║
  ██╔══██║██╔══██║██║     ██╔═██╗ ██╔═══╝ ██╔══██║   ██║   ██╔══██║
  ██║  ██║██║  ██║╚██████╗██║  ██╗██║     ██║  ██║   ██║   ██║  ██║
  ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝
```

> **CTF helper toolkit — didattico, bilingue, cross-platform**  
> **CTF helper toolkit — educational, bilingual, cross-platform**

[![CI](https://github.com/chiaraberti13/hackpath/actions/workflows/ci.yml/badge.svg)](https://github.com/chiaraberti13/hackpath/actions/workflows/ci.yml)
![Python](https://img.shields.io/badge/python-3.10%2B-blue)
![License](https://img.shields.io/badge/license-CC%20BY--NC--ND%204.0-lightgrey)

---

## ⚠️ DISCLAIMER — Leggere prima di usare / Read before use

> **SOLO USO DIDATTICO / FOR EDUCATIONAL USE ONLY**
>
> Questo toolkit è sviluppato **esclusivamente** per scopi didattici, ricerca sulla
> sicurezza informatica e partecipazione a competizioni **CTF (Capture The Flag)**
> su sistemi per cui si possiede **esplicita autorizzazione scritta**.
>
> L'uso non autorizzato su sistemi di terzi è **illegale** e penalmente perseguibile
> in Italia (art. 615-ter c.p.) e nella maggior parte dei paesi.
> Gli autori **declinano ogni responsabilità** per usi impropri o illeciti.
>
> ---
>
> This toolkit is developed **exclusively** for educational purposes, cybersecurity
> research, and participation in **CTF competitions** on systems for which you have
> **explicit written authorization**.
>
> Unauthorized use on third-party systems is **illegal** and criminally punishable.
> The authors **disclaim all liability** for improper or unlawful use.

---

## Cos'è hackpath / What is hackpath

**IT:** **hackpath** è un toolkit didattico avanzato per la sicurezza informatica offensiva. Non vuole sostituire strumenti eccezionali quali Nmap, Hydra o Metasploit — è invece un layer intellettuale che li **controlla**, **spiega** in tempo reale e **automatizza**.

Ora, hackpath si evolve integrando una **magnifica Dashboard Web interattiva** con intelligenza artificiale integrata (Gemini API server-side) per assisterti nello studio e nella documentazione dei laboratori!

**EN:** **hackpath** is an educational toolkit for offensive security training. It does not replace powerful utilities like Nmap, Hydra, or Metasploit — rather, it acts as an intelligent wrapper layer that **controls**, **explains** in real-time, and **automates** them.

This release level brings a **premium Interactive Web Dashboard** powered by server-side Gemini AI to guide you through scans, explain security flags, parse complex outputs, and organize your active CTF workspaces!

---

## Novità: La Dashboard Web Interattiva / Interactive Web Dashboard

Abbiamo creato un'applicazione completa con backend Node.js (Express) e frontend React + Vite per ricreare ed estendere visivamente l'esperienza dello script Python:

1. **Smart CLI Command Builder & Terminal Simulator**:
   - Seleziona un modulo helper di hackpath (nmap, web/gobuster, hydra, steganografia, ecc.) e configura i parametri in modo reattivo.
   - Genera istantaneamente il comando CLI corretto e avvia una **Simulazione di Esecuzione** didattica interattiva.
   - Fai clic su **"Spiega Flag (--explain)"** per interpellare l'AI del server e ricevere un'analisi dettagliata di ogni singolo flag, dei rischi d'impatto sul target e dei suggerimenti operativi.

2. **AI Interactive CTF Wizard & Mentor**:
   - Inserisci la descrizione della macchina vulnerabile (IP, macchina di TryHackMe, ecc.) e la tua fase attuale.
   - L'AI analizza gli elementi scoperti e stabilisce una **scaletta d'attacco didattica** spiegandoti la migliore strategia accademica e i comandi di hackpath da incollare.

3. **Log Solver & Parser (AI-Powered)**:
   - Hai un log fitto proveniente da Nmap, Gobuster o credenziali rubate? Incollalo nella console web.
   - Gemini lo analizzerà estraendo automaticamente le porte aperte, gli hash segreti, gli account o i percorsi web trovati, consentendoti di memorizzarli all'istante nel tuo Workspace.

4. **Multi-Workspace Manager**:
   - Crea e gestisci diverse aree di lavoro per organizzare le tue scoperte (IP, vulnerabilità, credential bloccate) senza perdere traccia di nessun dato.
   - Esporta l'intero workspace in file standard JSON.

5. **Markdown lab writeup Compiler (Report Generator)**:
   - Compila automaticamente la documentazione accademica dei tuoi test scegliendo tra template predefiniti (CTF Walkthrough, report formale di sicurezza, o tabelle riassuntive).
   - Copia o esporta il report Markdown (.md) in un clic per aggiungerlo al tuo portfolio!

6. **System Doctor Dashboard**:
   - Diagnosticare i requisiti locali esposti (python3, nmap, gobuster, hydra, john the ripper) con guide d'installazione dedicate e copy-paste per Linux, macOS e Windows.

---

## Installazione & Avvio / Installation & Setup

### Per avviare la Dashboard Web:

1. **Installa le dipendenze**:
   ```bash
   npm install
   ```

2. **Configura le chiavi API**:
   Copia il file `.env.example` in `.env` e inserisci la tua chiave API di Gemini (gestita in modo sicuro sul server Express):
   ```env
   GEMINI_API_KEY="LA_TUA_CHIAVE_API"
   ```

3. **Lancia in modalità Sviluppo**:
   ```bash
   npm run dev
   ```
   L'applicazione verrà avviata su host `0.0.0.0` e porta `3000` con ricarica automatica dei file.

4. **Compilazione per la Produzione**:
   ```bash
   npm run build
   ```
   Produce i file statici ottimizzati in `/dist` e raggruppa il server in un unico file ottimizzato `dist/server.cjs` pronto per l'esecuzione in container ad alte prestazioni.

---

## Installazione Script CLI Offline / CLI Script Installation

Se desideri utilizzare lo script Python originale direttamente da riga di comando sul tuo computer locale, segui i passaggi seguenti:

### Requisiti / Requirements

- Python 3.10+
- Git

### Linux (Debian / Ubuntu / Kali / Parrot)

```bash
git clone https://github.com/chiaraberti13/hackpath.git
cd hackpath
bash install.sh
```

### macOS

```bash
git clone https://github.com/chiaraberti13/hackpath.git
cd hackpath
bash install_macos.sh
```

Richiede [Homebrew](https://brew.sh). Se non presente, lo script lo installa automaticamente.

### Windows

```bat
git clone https://github.com/chiaraberti13/hackpath.git
cd hackpath
install.bat
```

> **Raccomandato su Windows:** installare [WSL2](https://aka.ms/wsl) e utilizzare Ubuntu o Kali Linux. La maggior parte degli strumenti supportati necessita di binari nativi Unix.

---

## Quick Start CLI / Avvio Rapido Riga di Comando

```bash
# 1. Verifica ambiente locale
python3 hackpath.py doctor

# 2. Elenca tutti i tool helper supportati
python3 hackpath.py list

# 3. Avvia la procedura guidata interattiva
python3 hackpath.py wizard

# 4. Esegui la scansione nmap dettagliata
python3 hackpath.py run nmap --target 10.10.10.5 --mode fast --explain

# 5. Output dei risultati in inglese
python3 hackpath.py --lang en list
```

---

## Docker Labs / Laboratori di Pratica

Per imparare a utilizzare hackpath in totale sicurezza senza rischiare danni, il progetto include container vulnerabili preconfigurati:

```bash
# Avvia tutti i laboratori pratici (DVWA, JuiceShop, Metasploitable)
cd docker-labs
python3 start_lab.py --lab all

# Verifica lo stato attuale
python3 start_lab.py --status

# Spegni il laboratorio
python3 start_lab.py --stop
```

Per maggiori dettagli, consulta la guida [`docker-labs/README_labs.md`](docker-labs/README_labs.md).

---

## Stack Tecnologico della Suite Web

| Layer | Tecnologie Utilizzate |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons |
| **Backend** | Node.js, Express, `google-genai` SDK |
| **AI Processing** | Gemini model `gemini-3.5-flash` (server-side per sicurezza) |
| **Storage e Cache** | State local-storage di sessione persistente |

---

## Licenza / License

**Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)**

- ✅ Utilizzabile liberamente per studio accademico, corsi e laboratori personali.
- ❌ Vietata la rivendita o la ridistribuzione a scopo commerciale.
- ❌ Vietata la generazione di strumenti offensivi o derivati abusivi.

---

*hackpath — built for learners, by learners. Practice legally, study safely.*
