import React, { useState } from "react";
import { DiscoveredAsset, MentorResponse } from "../types";
import { Sparkles, Terminal, BookOpen, AlertCircle, HelpCircle, ArrowRight, CheckCircle, Loader } from "lucide-react";

interface WizardMentorProps {
  lang: "it" | "en";
  activeWorkspaceName: string;
  findings: DiscoveredAsset[];
  onAddFinding: (finding: { name: string; type: "port" | "directory" | "credential" | "hash" | "info"; value: string; notes: string }) => void;
}

export default function WizardMentor({ lang, activeWorkspaceName, findings, onAddFinding }: WizardMentorProps) {
  const [targetDescription, setTargetDescription] = useState<string>("HTB: Academy / VulnHub: SimpleCTF-1");
  const [currentPhase, setCurrentPhase] = useState<string>("RECON");
  const [mentorGuide, setMentorGuide] = useState<MentorResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [guidePrompt, setGuidePrompt] = useState<string>("");

  const handleFetchGuide = async () => {
    setLoading(true);
    setMentorGuide(null);
    try {
      const response = await fetch("/api/mentor-guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetDescription,
          findingsList: findings,
          currentPhase,
          lang: lang
        })
      });

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      const data = await response.json();
      setMentorGuide(data);
    } catch (err) {
      console.error(err);
      // Fallback response for offline sandbox / no OpenAI API key
      setMentorGuide({
        currentStatusEval: lang === "it"
          ? `Stai lavorando sulla macchina "${targetDescription}". Hai catalogato ${findings.length} indizi nel workspace.`
          : `You are working on "${targetDescription}" target. You have registered ${findings.length} findings in your workspace.`,
        strategy: lang === "it"
          ? "Inizia scansionando le prime 1000 porte principali usando l'helper nmap per capire la superficie d'attacco. Successivamente, se trovi servizi web, esegui Gobuster con l'helper web."
          : "Start by scanning the top 1000 ports using the nmap helper to map the attack surface. If web ports are discovered, follow up with path fuzzing using the web helper.",
        recommendedTools: [
          {
            toolAlias: "nmap",
            justification: lang === "it" ? "Fornisce la mappa iniziale dei servizi e porte attive del target." : "Generates the initial layout of running services on target.",
            command: `python3 hackpath.py run nmap --target 10.10.10.5 --mode fast`
          },
          {
            toolAlias: "web",
            justification: lang === "it" ? "Cerca cartelle e file di configurazione nascosti risalendo alle porte aperte." : "Fuzzes targets paths for credentials and files backups.",
            command: `python3 hackpath.py run web --target http://10.10.10.5 --extensions php,html`
          }
        ],
        learningPoints: [
          lang === "it" ? "L'enumerazione rappresenta l'80% di ogni attacco informatico." : "Enumeration constitutes 80% of any penetration testing engagement.",
          lang === "it" ? "I banner dei servizi ti svelano exploit pubblici (CVEs)." : "Services banners reveal public exploits (CVEs)."
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyCommandParam = (cmd: string) => {
    // Fill local state or inform with feedback
    alert(lang === "it"
      ? `Comando copiato negli appunti! Incollalo nel Command Builder:\n${cmd}`
      : `Command copied to clipboard! Paste it inside the Command Builder:\n${cmd}`
    );
    navigator.clipboard.writeText(cmd);
  };

  return (
    <div className="flex flex-col gap-6" id="wizard-mentor-tab">
      <div className="bg-[#111827] border border-slate-800 rounded p-5 shadow-xl">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-slate-100 font-sans">
            {lang === "it" ? "AI Guided Wizard & CTF Mentor" : "AI Guided Wizard & CTF Mentor"}
          </h2>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-4 font-sans">
          {lang === "it"
            ? "Inserisci il nome della macchina o una descrizione dello scenario e la tua fase attuale. L'AI analizzerà i ritrovamenti salvati nel tuo workspace attivo suggerendo la migliore strategia e i comandi hackpath da lanciare."
            : "Enter a target name, target context, and select your penetration testing phase. The AI will look at your active workspace data, proposing a custom exploitation route with exact helper commands."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-4">
          <div className="md:col-span-8 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 font-sans">
              {lang === "it" ? "Descrizione Macchina / Contesto target" : "Machine Name / Target Context"}
            </label>
            <input
              id="wizard-target-desc-input"
              type="text"
              value={targetDescription}
              onChange={(e) => setTargetDescription(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 focus:border-indigo-500/60 text-slate-200 px-3 py-2 rounded text-xs outline-none transition font-sans"
              placeholder="e.g. TryHackMe RootMe, SimpleCTF or IP 10.10.10.25"
            />
          </div>

          <div className="md:col-span-4 flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-300 font-sans">
              {lang === "it" ? "Fase di Penetrazione" : "Testing Phase"}
            </label>
            <select
              id="wizard-phase-select"
              value={currentPhase}
              onChange={(e) => setCurrentPhase(e.target.value)}
              className="bg-[#0f172a] border border-slate-800 focus:border-indigo-500/60 text-slate-200 px-3 py-2 rounded text-xs outline-none transition font-sans"
            >
              <option value="RECON">RECON / Scanning</option>
              <option value="CRACK">CRACK / Brute-force</option>
              <option value="EXPLOITATION">EXPLOITING / Access</option>
              <option value="POST-EXPLOIT">POST-EXPLOIT / Privilege Escalation</option>
            </select>
          </div>
        </div>

        {/* Current workspace overview in wizard */}
        <div className="bg-[#0f172a] border border-slate-800 rounded p-4 mb-5 flex items-center justify-between flex-wrap gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-200 font-semibold font-sans">
              {lang === "it" ? `Workspace di Riferimento: "${activeWorkspaceName}"` : `Active Workspace: "${activeWorkspaceName}"`}
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5">
              {lang === "it" ? `${findings.length} indizi importati nel contesto.` : `${findings.length} findings loaded to prompt context.`}
            </span>
          </div>
          <button
            id="btn-ask-mentor"
            onClick={handleFetchGuide}
            disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded flex items-center gap-1.5 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader className="w-3.5 h-3.5 animate-spin" />
                {lang === "it" ? "Interrogazione Mentor..." : "Querying Mentor..."}
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                {lang === "it" ? "Genera Roadmap Strategy" : "Generate Strategy Roadmap"}
              </>
            )}
          </button>
        </div>

        {/* Mentor evaluation Response */}
        {mentorGuide && (
          <div className="border border-slate-800 rounded p-5 bg-[#0f172a] flex flex-col gap-6 animate-fadeIn" id="mentor-roadmap-results">
            {/* Status & Strategy */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-indigo-450 font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
                <CheckCircle className="w-4 h-4 text-indigo-400" />
                <span>{lang === "it" ? "Valutazione della Situazione" : "Situation Assessment"}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans italic p-2 bg-[#111827]/40 rounded border border-slate-800/40">
                "{mentorGuide.currentStatusEval}"
              </p>
              <div className="bg-[#111827] border border-slate-800 rounded p-4 mt-1 border-l-4 border-l-indigo-500 shadow-md">
                <span className="text-slate-200 text-xs uppercase font-bold tracking-wider block mb-1 font-mono">
                  {lang === "it" ? "Strategia Consigliata" : "Proposed Exploitation Route"}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {mentorGuide.strategy}
                </p>
              </div>
            </div>

            {/* Suggested tools & commands */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
                <Terminal className="w-4 h-4" />
                <span>{lang === "it" ? "Comandi Consigliati" : "Recommended commands"}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mentorGuide.recommendedTools.map((t, idx) => (
                  <div key={idx} className="bg-[#111827] border border-slate-850 rounded p-4 flex flex-col gap-2 justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[11px] font-bold bg-[#0f172a] text-indigo-400 px-2 py-0.5 rounded border border-slate-800 uppercase">
                          {t.toolAlias}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">STEP {idx + 1}</span>
                      </div>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                        {t.justification}
                      </p>
                    </div>

                    <div className="mt-4">
                      <div className="bg-slate-950 p-2.5 rounded border border-slate-800/80 font-mono text-[10px] text-slate-400 break-all select-all flex items-center justify-between">
                        <span className="truncate">{t.command}</span>
                      </div>
                      <button
                        id={`btn-apply-cmd-${idx}`}
                        onClick={() => handleApplyCommandParam(t.command)}
                        className="w-full mt-2 bg-slate-800 border border-slate-755 hover:bg-slate-750 text-slate-300 font-semibold py-1.5 rounded text-[11px] font-sans flex items-center justify-center gap-1 transition"
                      >
                        <ArrowRight className="w-3 h-3 text-indigo-400" />
                        {lang === "it" ? "Copia negli Appunti" : "Copy to Clipboard"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic focus points */}
            {mentorGuide.learningPoints.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider border-b border-slate-800 pb-2 font-sans">
                  <BookOpen className="w-4 h-4" />
                  <span>{lang === "it" ? "Punti Chiave Didattici" : "Academic Focus Points"}</span>
                </div>
                <ul className="list-disc pl-5 flex flex-col gap-1.5 leading-relaxed text-xs text-slate-400 font-sans">
                  {mentorGuide.learningPoints.map((pt, idx) => (
                    <li key={idx}>{pt}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
