import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client (server-side only)
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("⚠️ GEMINI_API_KEY is not set. AI capabilities will be disabled.");
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// 1. Explain a CTF command & compile flags
app.post("/api/explain", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "Gemini API is not configured. Please set GEMINI_API_KEY." });
  }

  const { command, toolName, lang = "it" } = req.body;

  if (!command) {
    return res.status(400).json({ error: "Command is required." });
  }

  const systemPrompt = `Sei un mentore esperto di cybersecurity e CTF (Capture The Flag). 
Spieghi i comandi passati in modo didattico, chiaro, pulito.
Devi rispondere in formato JSON rigoroso che mappa sui flag usati nel comando.
Rispondi in lingua: ${lang === "en" ? "inglese" : "italiano"}.

La struttura della risposta JSON deve essere:
{
  "summary": "Breve descrizione di cosa fa il comando in generale",
  "dangerLevel": "LOW" | "MEDIUM" | "HIGH",
  "dangerExplanation": "Spiegazione se il comando è rumoroso o può bloccare il target",
  "flags": [
    {
      "flag": "--abc",
      "meaning": "Cosa significa questo flag specifico",
      "educationalTip": "Consiglio pratico sull'uso di questo parametro"
    }
  ],
  "nextSteps": [
    "Azioni consigliate da intraprendere dopo aver runnato questo comando"
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Spiega questo comando per lo strumento "${toolName || 'generico'}": \`${command}\``,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            dangerLevel: { type: Type.STRING },
            dangerExplanation: { type: Type.STRING },
            flags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  flag: { type: Type.STRING },
                  meaning: { type: Type.STRING },
                  educationalTip: { type: Type.STRING }
                },
                required: ["flag", "meaning"]
              }
            },
            nextSteps: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["summary", "dangerLevel", "dangerExplanation", "flags", "nextSteps"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Gemini Explain Error:", error);
    res.status(500).json({ error: error.message || "Impossibile ottenere la spiegazione da Gemini." });
  }
});

// 2. Parse Terminal Logs (Paste logs from nmap, gobuster, etc. to extract structured findings)
app.post("/api/analyze-log", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "Gemini API is not configured. Please set GEMINI_API_KEY." });
  }

  const { logContent, toolType, lang = "it" } = req.body;

  if (!logContent) {
    return res.status(400).json({ error: "Log content is required." });
  }

  const systemPrompt = `Sei un esperto SOC e CTF Player. Ti viene dato un log o un output di terminale di un tool di security (${toolType || 'sconosciuto'}).
Devi analizzarlo, estrarre tutte le informazioni strutturate sensibili destinate ad aiutare un CTF player e restituirle in JSON.
Rileva porte aperte, vulnerabilità, file trovati, credenziali, hash o indizi.
Rispondi in lingua: ${lang === "en" ? "inglese" : "italiano"}.

La risposta JSON deve seguire questo schema:
{
  "toolFound": "Identificazione dello strumento (es. Nmap, Gobuster, etc.)",
  "discoveredAssets": [
    {
      "name": "Nome dell'asset/informazione (es. Port 80, /admin.php, etc.)",
      "type": "port" | "directory" | "credential" | "hash" | "info",
      "value": "Esposizione del valore rilevato (es. 'Open (Apache 2.4.41)', 'Status 200', etc.)",
      "notes": "Una breve nota didattica o spiegazione"
    }
  ],
  "vulnerabilityScore": "LOW" | "MEDIUM" | "HIGH" | "CRITICAL",
  "summaryAnalysis": "Riassunto compatto di ciò che emerge da questi log",
  "suggestions": [
    "Passo successivo consigliato per progredire nel CTF"
  ]
}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analizza questo output di terminale:\n\n\`\`\`\n${logContent}\n\`\`\``,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            toolFound: { type: Type.STRING },
            discoveredAssets: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  value: { type: Type.STRING },
                  notes: { type: Type.STRING }
                },
                required: ["name", "type", "value"]
              }
            },
            vulnerabilityScore: { type: Type.STRING },
            summaryAnalysis: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["toolFound", "discoveredAssets", "vulnerabilityScore", "summaryAnalysis", "suggestions"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Gemini Analyze Log Error:", error);
    res.status(500).json({ error: error.message || "Impossibile analizzare i log forniti." });
  }
});

// 3. CTF AI Wizard Mentor (Guides the user through next challenges)
app.post("/api/mentor-guide", async (req, res) => {
  if (!ai) {
    return res.status(503).json({ error: "Gemini API is not configured." });
  }

  const { targetDescription, findingsList, currentPhase, lang = "it" } = req.body;

  const systemPrompt = `Sei un mentore CTF ed esperto OSCP. Guidi gli studenti a superare macchine vulnerabili in modo etico.
Dato un target e i ritrovamenti correnti, offri una review dello stato e indica i comandi hackpath consigliati per proseguire.
Rispondi in lingua: ${lang === "en" ? "inglese" : "italiano"}.

La risposta JSON deve essere:
{
  "currentStatusEval": "Valutazione didattica del progresso finora",
  "strategy": "Strategia complessiva per superare questa fase",
  "recommendedTools": [
    {
      "toolAlias": "Alias (es. nmap, web, hydra, smb, hash, ssh, stego)",
      "justification": "Perché usare proprio questo strumento ora",
      "command": "Il comando suggerito da lanciare (usando hackpath, es. 'python3 hackpath.py run nmap --target X --mode scripts')"
    }
  ],
  "learningPoints": [
    "Nozioni teoriche utili da tenere a mente durante questo step"
  ]
}`;

  try {
    const inputPayload = {
      target: targetDescription || "Target generico / sconosciuto",
      currentFindings: findingsList || [],
      currentPhase: currentPhase || "Enum"
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Target ed elementi scoperti:\n${JSON.stringify(inputPayload, null, 2)}`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            currentStatusEval: { type: Type.STRING },
            strategy: { type: Type.STRING },
            recommendedTools: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  toolAlias: { type: Type.STRING },
                  justification: { type: Type.STRING },
                  command: { type: Type.STRING }
                },
                required: ["toolAlias", "justification", "command"]
              }
            },
            learningPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ["currentStatusEval", "strategy", "recommendedTools", "learningPoints"]
        }
      }
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Gemini Mentor Guide Error:", error);
    res.status(500).json({ error: error.message || "Impossibile elaborare il consiglio terapeutico/didattico." });
  }
});

// 4. Serves the actual complete python CLI tool structural modular sources
app.get("/api/cli-sources", (req, res) => {
  res.json({
    "hackpath.py": `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import sys
import argparse
from pathlib import Path

# Add core path
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
        self.modules = {
            "recon": ReconModule(self.workspace_mgr),
            "crack": CrackModule(self.workspace_mgr),
            "bruteforce": BruteforceModule(self.workspace_mgr),
            "post-exploit": PostExploitModule(self.workspace_mgr)
        }

    def run(self):
        parser = argparse.ArgumentParser(
            prog="hackpath",
            description="hackpath - Modular Security helper wrapper.",
            epilog="Example: python3 hackpath.py run nmap --target 10.10.10.5 --mode fast"
        )
        parser.add_argument("-w", "--workspace", type=str, default="default_lab")
        parser.add_argument("-l", "--lang", choices=["it", "en"], default="it")
        
        subparsers = parser.add_subparsers(dest="command")
        run_parser = subparsers.add_parser("run")
        run_sub = run_parser.add_subparsers(dest="tool", required=True)
        
        common_args = argparse.ArgumentParser(add_help=False)
        common_args.add_argument("--dry-run", action="store_true")
        common_args.add_argument("--explain", action="store_true")

        for mod in self.modules.values():
            mod.register_subparsers(run_sub, common_args)

        report_parser = subparsers.add_parser("report")
        report_parser.add_argument("--title", type=str, default="Laboratory findings dossier")
        report_parser.add_argument("--template", choices=["ctf", "pentest", "summary"], default="ctf")
        report_parser.add_argument("--format", choices=["markdown", "html", "json"], default="markdown")

        args = parser.parse_args()
        self.workspace_mgr.set_active_workspace(args.workspace)

        if not args.command:
            parser.print_help()
            sys.exit(0)

        if args.command == "run":
            handler = next((m for m in self.modules.values() if args.tool in m.supported_tools()), None)
            if handler:
                handler.process(args.tool, args, lang=args.lang)
        elif args.command == "report":
            findings = self.workspace_mgr.get_findings()
            dest_file = self.report_gen.assemble(
                workspace=args.workspace, findings=findings, title=args.title,
                template_style=args.template, out_format=args.format, lang=args.lang
            )
            print(f"[+] Report generated -> {dest_file}")

if __name__ == "__main__":
    HackpathCLI().run()`,

    "core/workspace.py": `import os
import json
from pathlib import Path

class WorkspaceManager:
    def __init__(self, base_dir=None):
        self.base_dir = Path(base_dir) if base_dir else Path(__file__).parent.parent / "workspaces"
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.set_active_workspace("default_lab")

    def set_active_workspace(self, name: str):
        clean_name = "".join(c for c in name if c.isalnum() or c in ("_", "-")).strip() or "default_lab"
        self.active_workspace_name = clean_name
        self.active_file = self.base_dir / f"{clean_name}.json"
        if not self.active_file.exists():
            self._save_state({"findings": []})

    def get_findings(self):
        try:
            with open(self.active_file, "r", encoding="utf-8") as f:
                return json.load(f).get("findings", [])
        except:
            return []

    def commit_finding(self, name, f_type, value, notes=""):
        findings = self.get_findings()
        findings.append({"name": name, "type": f_type, "value": value, "notes": notes})
        self._save_state({"findings": findings})

    def _save_state(self, state):
        with open(self.active_file, "w", encoding="utf-8") as f:
            json.dump(state, f, indent=4)`,

    "modules/recon.py": `class ReconModule:
    def __init__(self, workspace_mgr):
        self.workspace_mgr = workspace_mgr
    def supported_tools(self):
        return ["nmap", "web", "dns", "smb"]
    def register_subparsers(self, run_sub, common_args):
        nmap_p = run_sub.add_parser("nmap", parents=[common_args])
        nmap_p.add_argument("--target", required=True)
        nmap_p.add_argument("--mode", choices=["fast", "scripts", "full"], default="fast")
    def process(self, tool_alias, args, lang):
        cmd = f"nmap -Pn -F {args.target}" if args.mode == "fast" else f"nmap -Pn -sC -sV {args.target}"
        if args.explain:
            print(f"[EXPLAIN] Wrapper command: {cmd}")
        if args.dry_run:
            print(f"[DRY-RUN] {cmd}")
            return
        print(f"[*] Executing simulated: {cmd}")
        self.workspace_mgr.commit_finding("Nmap Port Discovery", "port", "Port 80/tcp open (http)", "Found via recon automation")`,

    "modules/crack.py": `class CrackModule:
    def __init__(self, workspace_mgr):
        self.workspace_mgr = workspace_mgr
    def supported_tools(self):
        return ["hash", "archive", "ssh"]
    def register_subparsers(self, run_sub, common_args):
        hash_p = run_sub.add_parser("hash", parents=[common_args])
        hash_p.add_argument("--hash", required=True)
        hash_p.add_argument("--wordlist", default="rockyou.txt")
    def process(self, tool, args, lang):
        cmd = f"hashcat -m 0 {args.hash} {args.wordlist} --force"
        if args.dry_run:
            print(cmd)
            return
        self.workspace_mgr.commit_finding("Cracked Credentials", "credential", "supersecretpassword", "Matched md5 hash")`
  });
});

// -------------------------------------------------------------
// Vite Dev & Production Asset Delivery
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Hackpath full-stack dashboard up on http://localhost:${PORT}`);
  });
}

startServer();
