import React, { useState, useEffect } from "react";
import { DiscoveredAsset } from "../types";
import { FileText, Copy, Download, RefreshCw, Check, Code, Award } from "lucide-react";

interface ReportBuilderProps {
  lang: "it" | "en";
  activeWorkspaceName: string;
  findings: DiscoveredAsset[];
}

export default function ReportBuilder({ lang, activeWorkspaceName, findings }: ReportBuilderProps) {
  const [template, setTemplate] = useState<"ctf" | "pentest" | "summary">("ctf");
  const [reportTitle, setReportTitle] = useState<string>("CTF machine: SimpleCTF-Writeup");
  const [reportAuthor, setReportAuthor] = useState<string>("Student-Hacker");
  const [reportContent, setReportContent] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);

  // Generate Report logic
  const handleCompileReport = () => {
    const dateStr = new Date().toISOString().split("T")[0];
    let md = "";

    if (template === "ctf") {
      md = `# ${reportTitle}
> **CTF Walkthrough Writeup**
> **Author:** ${reportAuthor}
> **Date:** ${dateStr}
> **Workspace Source:** ${activeWorkspaceName}

---

## 🏁 1. INTRODUZIONE / BRIEF OVERVIEW
Questo documento descrive la sequenza didattica di sfruttamento condotta sul target in questione, raccogliendo le evidenze catalogate nel toolkit **hackpath**.

---

## 🔍 2. RICOGNIZIONE & ENUMERAZIONE (Findings)
Durante la ricognizione, gli helper intelligenti di **hackpath** hanno identificato le seguenti porte, servizi e vulnerabilità esposte:

`;

      if (findings.length === 0) {
        md += `_Nessun indizio censito nel workspace. Avvia nmap o gobuster per registrare reperti._\n`;
      } else {
        findings.forEach((f) => {
          md += `### ✦ ${f.name} [Classificazione: ${f.type.toUpperCase()}]\n`;
          md += `- **Valori Estrapolati:** \`${f.value}\`\n`;
          if (f.notes) {
            md += `- **Evidenza di Dettaglio:** ${f.notes}\n`;
          }
          md += `\n`;
        });
      }

      md += `
---

## ☣️ 3. ANALISI DI EXPLOITATION & FLAG CONQUISTATE
1. **User Access:** Ottenuto analizzando i banner esposti e brute-forzando i form web scoperti.
2. **Root escalation:** Scalata dei privilegi effettuata tramite analisi dei permessi interni.

## 🎓 4. INSEGNAMENTI CHIAVE (Knowledge Learnt)
- L'utilizzo sistematico di tool wrapper automatizzati velocizza l'identificazione di entry points vulnerabili.
- La documentazione metodica impedisce la dispersione di hash o credenziali critiche.
- _Report compilato tramite modulo hackpath report generator._
`;

    } else if (template === "pentest") {
      md = `# REPORT FINALE DI PENETRATION TESTING
**Target Infrastructure Identification:** ${reportTitle}
**Auditor Lead:** ${reportAuthor}
**Assessment Date:** ${dateStr}
**Audit Session ID:** HP-${activeWorkspaceName.substring(0, 4).toUpperCase()}

---

## 1. EXECUTIVE SUMMARY
La presente valutazione descrive l'analisi di sicurezza informatica focalizzata sul sistema bersaglio. È stato impiegato il toolkit **hackpath** per coordinare le scansioni degli host, il brute-forcing e l'audit strutturato della superficie di rete.

## 2. METODOLOGIA DI SECURITY AUDITING
La scansione segue gli standard PTES (Penetration Testing Execution Standard):
- Reconnaissance attiva tramite porte e banner
- Directory fuzzing automatizzato per l'identificazione di assets web
- Vulnerability assessment e post-exploitation didattica

## 3. ASSETS E RITROVAMENTI SCOPERTI
Di seguito vengono riportati gli indicatori di compromissione riscontrati:

`;

      if (findings.length === 0) {
        md += `*Nessuna vulnerabilità registrata nel workspace corporeo.*\n`;
      } else {
        findings.forEach((f) => {
          md += `### 🛑 ASSET ID: ${f.name}
- **Tipo Risorsa:** \`${f.type.toUpperCase()}\`
- **Valore/Banner:** \`${f.value}\`
- **Descrizione Tecnica:** ${f.notes || "Nessun commento aggiuntivo."}
\n`;
        });
      }

      md += `
## 4. CONTROMISURE TECNICHE RACCOMANDATE
1. **Sanitizzazione Input:** Disattivare l'esposizione di file o credenziali all'interno di robots o file txt pubblici.
2. **Hardening Servizi:** Aggiornare gli applicativi web obsoleti e patchare gli SSH non aggiornati.
`;
    } else {
      // Summary brief template
      md = `# HACKPATH WORKSPACE CONCISE REPORT: ${activeWorkspaceName.toUpperCase()}
**Target Identifier:** ${reportTitle}
**Compiled At:** ${dateStr}

## 📊 RIEPILOGO ASSETS SCOPERTI (Traces count: ${findings.length})

| Nome Indicator | Tipo | Valore Riconosciuto | Note correlative |
|---|---|---|---|
`;
      if (findings.length === 0) {
        md += `| - | - | - | - |\n`;
      } else {
        findings.forEach((f) => {
          md += `| **${f.name}** | \`${f.type}\` | \`${f.value}\` | ${f.notes || "-"} |\n`;
        });
      }
      md += `\n_Report generato automaticamente con hackpath didattico._\n`;
    }

    setReportContent(md);
  };

  useEffect(() => {
    handleCompileReport();
  }, [template, reportTitle, reportAuthor, findings]);

  const handleCopyClipboard = () => {
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadFile = () => {
    const blob = new Blob([reportContent], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hackpath_${template}_report.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="report-builder-panel">
      {/* Template selector settings */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded p-5 shadow-xl">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2 font-sans">
            <FileText className="w-4 h-4 text-indigo-400" />
            {lang === "it" ? "Configura Report" : "Report Settings"}
          </h3>

          <div className="flex flex-col gap-4">
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium font-sans">
                {lang === "it" ? "Titolo Report / Target" : "Report Title / Target"}
              </label>
              <input
                id="report-target-title-input"
                type="text"
                value={reportTitle}
                onChange={(e) => setReportTitle(e.target.value)}
                className="bg-[#0f172a] border border-slate-800 focus:border-indigo-500/60 text-slate-200 px-3 py-2 rounded text-xs outline-none transition font-mono"
              />
            </div>

            {/* Author */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium font-sans">
                {lang === "it" ? "Autore / Auditor" : "Author / Auditor"}
              </label>
              <input
                id="report-author-input"
                type="text"
                value={reportAuthor}
                onChange={(e) => setReportAuthor(e.target.value)}
                className="bg-[#0f172a] border border-slate-800 focus:border-indigo-500/60 text-slate-200 px-3 py-2 rounded text-xs outline-none transition font-mono"
              />
            </div>

            {/* Template select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-slate-400 font-medium font-sans">
                {lang === "it" ? "Template di scrittura" : "Report Outline Template"}
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { value: "ctf", nameIt: "CTF Walkthrough / Write-up", nameEn: "CTF Walkthrough Writeup" },
                  { value: "pentest", nameIt: "Report di Penetration Testing", nameEn: "Penetration Testing Report" },
                  { value: "summary", nameIt: "Tabella Riassuntiva Compatta", nameEn: "Concise Summary Table" }
                ].map((t) => (
                  <button
                    key={t.value}
                    id={`report-template-btn-${t.value}`}
                    type="button"
                    onClick={() => setTemplate(t.value as any)}
                    className={`text-left px-3 py-2.5 rounded border text-xs font-mono transition ${
                      template === t.value
                        ? "bg-indigo-500/10 border-indigo-500/35 text-slate-100 font-semibold"
                        : "bg-[#0f172a] border-slate-800 hover:border-slate-705 text-slate-400"
                    }`}
                  >
                    {lang === "it" ? t.nameIt : t.nameEn}
                  </button>
                ))}
              </div>
            </div>

            <button
              id="btn-recompile-report"
              onClick={handleCompileReport}
              className="mt-2 bg-slate-800 border border-slate-850 hover:bg-slate-755 text-slate-300 rounded py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition font-sans cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              {lang === "it" ? "Ricompila Report" : "Refresh Compiler"}
            </button>
          </div>
        </div>

        {/* Info panel */}
        <div className="bg-[#111827] border border-slate-800 rounded p-4 flex gap-3 text-indigo-400/80 items-start shadow-md">
          <Award className="w-5 h-5 mt-0.5 shrink-0 text-indigo-455" />
          <div className="flex flex-col text-[10px] text-slate-400 leading-relaxed font-sans">
            <span className="font-bold text-slate-200">Export in Standard Markdown</span>
            <span>
              Il file generato segue le direttive formali dei laboratori universitari e delle piattaforme come HackTheBox e TryHackMe. Caricalo nel tuo repo GitHub per arricchire il tuo portfolio CTF!
            </span>
          </div>
        </div>
      </div>

      {/* Compiled markdown output result */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
              <Code className="w-4 h-4 text-indigo-400" />
              {lang === "it" ? "Markdown Generato" : "Compiled Markdown Output"}
            </span>

            <div className="flex gap-2">
              <button
                id="btn-copy-report"
                onClick={handleCopyClipboard}
                className="bg-slate-800 text-slate-350 hover:bg-slate-750 border border-slate-720 px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? (lang === "it" ? "Copiato!" : "Copied!") : (lang === "it" ? "Copia negli appunti" : "Copy markdown")}
              </button>

              <button
                id="btn-download-report"
                onClick={handleDownloadFile}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer font-sans"
              >
                <Download className="w-3.5 h-3.5" />
                {lang === "it" ? "Scarica .md" : "Download .md"}
              </button>
            </div>
          </div>

          <textarea
            id="compiled-report-textarea"
            readOnly
            value={reportContent}
            rows={18}
            className="w-full bg-[#0f172a] border border-slate-800 text-slate-350 font-mono p-4 rounded text-xs leading-relaxed outline-none resize-none select-all shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}
