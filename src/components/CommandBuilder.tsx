import React, { useState, useEffect } from "react";
import { HACKPATH_TOOLS } from "../data";
import { HackpathTool, ExplainResponse } from "../types";
import { Terminal, Shield, HelpCircle, Code, Play, CheckCircle, ArrowRight, Loader } from "lucide-react";

interface CommandBuilderProps {
  lang: "it" | "en";
  activeWorkspaceName: string;
  onAddFinding: (finding: { name: string; type: "port" | "directory" | "credential" | "hash" | "info"; value: string; notes: string }) => void;
}

export default function CommandBuilder({ lang, activeWorkspaceName, onAddFinding }: CommandBuilderProps) {
  const [selectedTool, setSelectedTool] = useState<HackpathTool>(HACKPATH_TOOLS[0]);
  const [params, setParams] = useState<Record<string, string>>({});
  const [explainResult, setExplainResult] = useState<ExplainResponse | null>(null);
  const [loadingExplain, setLoadingExplain] = useState<boolean>(false);
  const [simulatingTerminal, setSimulatingTerminal] = useState<boolean>(false);
  const [simulationOutput, setSimulationOutput] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [importedStatus, setImportedStatus] = useState<string>("");

  // Initialize parameters when tool changes
  useEffect(() => {
    const defaultParams: Record<string, string> = {};
    selectedTool.options.forEach((opt) => {
      defaultParams[opt.param] = opt.defaultValue || "";
    });
    setParams(defaultParams);
    setExplainResult(null);
    setSimulationOutput([]);
    setCurrentStep(-1);
    setImportedStatus("");
  }, [selectedTool]);

  const handleParamChange = (param: string, val: string) => {
    setParams((prev) => ({ ...prev, [param]: val }));
  };

  // Compile full command string
  const compileCommand = (): string => {
    let cmd = `python3 hackpath.py run ${selectedTool.alias}`;
    selectedTool.options.forEach((opt) => {
      const val = params[opt.param];
      if (val) {
        cmd += ` ${opt.param} "${val}"`;
      }
    });
    return cmd;
  };

  // Get explanation from Gemini Endpoint
  const handleExplain = async () => {
    setLoadingExplain(true);
    setExplainResult(null);
    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          command: compileCommand(),
          toolName: selectedTool.name,
          lang: lang
        })
      });

      if (!response.ok) {
        throw new Error("HTTP error " + response.status);
      }
      const data = await response.json();
      setExplainResult(data);
    } catch (err) {
      console.error(err);
      // Fallback in case of offline / no API key configured
      setExplainResult({
        summary: lang === "it" 
          ? `Visualizzazione fall-back: Elaborazione comando ${selectedTool.name}.`
          : `Fall-back display: Elaborating command ${selectedTool.name}.`,
          dangerLevel: "LOW",
          dangerExplanation: lang === "it" ? "In assenza di chiave API, viene mostrato un fallback didattico." : "Without an API key, fallback explanations are served.",
          flags: selectedTool.options.map(o => ({
            flag: o.param,
            meaning: lang === "it" ? o.descIt : o.descEn,
            educationalTip: lang === "it" ? "Configura questo parametro in base al tuo sistema di test." : "Configure this parameter based on target infrastructure."
          })),
          nextSteps: [lang === "it" ? "Verifica il network ping prima di procedere." : "Verify target ping reply before scanning."]
      });
    } finally {
      setLoadingExplain(false);
    }
  };

  // Simulate execution of CLI tool
  const handleSimulateRun = () => {
    setSimulatingTerminal(true);
    setSimulationOutput([]);
    setCurrentStep(0);
    setImportedStatus("");

    const targetVal = params["--target"] || params["--input"] || params["--hash"] || "10.10.10.5";
    const modeVal = params["--mode"] || params["--service"] || "standard";

    let logs: string[] = [];
    if (selectedTool.alias === "nmap") {
      logs = [
        `[hackpath] Initializing nmap ports scan wrapper on ${targetVal}...`,
        `[hackpath] Checking under-boundary prerequisites... OK`,
        `$ nmap -sC -sV ${modeVal === "full" ? "-p-" : ""} ${targetVal}`,
        `Scanning target ${targetVal} for open sockets...`,
        `[+] PORT 22/tcp  - OPEN  - SSH (OpenSSH 8.2p1 Ubuntu)`,
        `[+] PORT 80/tcp  - OPEN  - HTTP (Apache/2.4.41 Ubuntu)`,
        `[+] PORT 445/tcp - OPEN  - SMB (Samba smbd 4.6.2)`,
        `[hackpath] Scan completed successfully. Save findings to workspace below.`,
      ];
    } else if (selectedTool.alias === "web") {
      logs = [
        `[hackpath] Initializing web directory fuzzer on URL ${targetVal}...`,
        `$ gobuster dir -u ${targetVal} -w common.txt -x php,html,txt`,
        `Scanning routes...`,
        `[+] /index.html (Status: 200) - SIZE: 1224`,
        `[+] /admin.php  (Status: 200) - SIZE: 8444 [ALERT: Admin login found]`,
        `[+] /robots.txt (Status: 200) - SIZE: 64`,
        `[+] /uploads/   (Status: 301) - Directory access restricted`,
        `[hackpath] Directory fuzz complete. Web findings generated!`
      ];
    } else if (selectedTool.alias === "hash") {
      logs = [
        `[hackpath] Analyzing hash entropy: ${targetVal}`,
        `[+] Hash length detected: 32 chars. Signature: MD5 / MD5Crypt`,
        `$ john hash.txt --wordlist=rockyou.txt --format=raw-md5`,
        `Looping dictionary inputs...`,
        `[SUCCESS] Hash matched: "supersecretpassword"`,
        `[hackpath] Crack operation successful.`
      ];
    } else {
      logs = [
        `[hackpath] Launching wrapper for ${selectedTool.name}...`,
        `$ python3 hackpath.py run ${selectedTool.alias} with target: ${targetVal}`,
        `Executing underlying tool components mock-up...`,
        `[+] Extraction/Analysis complete for target input: ${targetVal}`,
        `[+] Status: successfully finalized. Details collected in live workspace.`,
        `[hackpath] Completed helper sequence.`
      ];
    }

    let progress = 0;
    const interval = setInterval(() => {
      if (progress < logs.length) {
        setSimulationOutput((prev) => [...prev, logs[progress]]);
        progress++;
        setCurrentStep(progress);
      } else {
        clearInterval(interval);
        setSimulatingTerminal(false);
      }
    }, 600);
  };

  // Quick helper to auto-add findings from simulated results
  const handleImportFindings = () => {
    const targetVal = params["--target"] || params["--input"] || params["--hash"] || "10.10.10.5";
    if (selectedTool.alias === "nmap") {
      onAddFinding({ name: "Port 22 SSH", type: "port", value: "Open (OpenSSH 8.2p1)", notes: `Scansione eseguita sul target ${targetVal}` });
      onAddFinding({ name: "Port 80 HTTP", type: "port", value: "Open (Apache 2.4.41)", notes: `Trovato server web sul target ${targetVal}` });
      onAddFinding({ name: "Port 445 SMB", type: "port", value: "Open (Samba smbd)", notes: `Condivisione SMB rilevata sul target ${targetVal}` });
    } else if (selectedTool.alias === "web") {
      onAddFinding({ name: "/admin.php", type: "directory", value: "Status 200", notes: "Portals Amministrazione individuata con Gobuster" });
      onAddFinding({ name: "/robots.txt", type: "directory", value: "Status 200", notes: "Note robots con flag potenziali" });
    } else if (selectedTool.alias === "hash") {
      onAddFinding({ name: `Hash cracked: ${targetVal.substring(0,6)}...`, type: "credential", value: "supersecretpassword", notes: "Decifrato tramite dizionario di brute" });
    } else {
      onAddFinding({ name: `${selectedTool.name} scan`, type: "info", value: targetVal, notes: "Ritrovamento importato dalla simulazione CLI." });
    }
    setImportedStatus(lang === "it" ? "Risultati importati!" : "Findings Imported!");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="command-builder-panel">
      {/* Sidebar Tool Picker */}
      <div className="lg:col-span-4 bg-[#111827] border border-slate-800 rounded p-4 flex flex-col gap-3">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-indigo-400" />
          {lang === "it" ? "Fase & Tool" : "Phase & Tools"}
        </h3>
        <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[450px] pr-1">
          {HACKPATH_TOOLS.map((t) => (
            <button
              key={t.alias}
              id={`tool-btn-${t.alias}`}
              onClick={() => setSelectedTool(t)}
              className={`w-full text-left px-3 py-2 text-sm rounded flex items-center justify-between transition-all ${
                selectedTool.alias === t.alias
                  ? "bg-indigo-500/10 border-l-2 border-indigo-500 text-slate-100"
                  : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              <div className="flex flex-col truncate">
                <span className="font-mono font-semibold truncate text-[13px]">{t.alias}</span>
                <span className="text-xs text-slate-500 truncate">
                  {lang === "it" ? t.descriptionIt : t.descriptionEn}
                </span>
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 ${
                t.phase === "RECON" ? "bg-cyan-500/10 text-cyan-400" :
                t.phase === "CRACK" ? "bg-amber-500/10 text-amber-400" :
                t.phase === "BRUTEFORCE" ? "bg-red-500/10 text-red-400" :
                t.phase === "POST-EXPLOIT" ? "bg-purple-500/10 text-purple-400" :
                "bg-slate-500/10 text-slate-400"
              }`}>
                {t.phase}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Builder Console */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="bg-[#111827] border border-slate-800 rounded p-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-slate-100">{selectedTool.name}</h2>
                <span className="font-mono bg-slate-800 text-indigo-300 px-2 py-0.5 rounded text-xs select-all border border-slate-705">
                  {selectedTool.alias}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {lang === "it" ? `${selectedTool.underlyingTool} - wrapper intelligente` : `${selectedTool.underlyingTool} - smart wrapper`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                id="btn-explain-command"
                onClick={handleExplain}
                disabled={loadingExplain}
                className="bg-slate-800 text-indigo-400 border border-slate-700 hover:bg-slate-700 px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                {loadingExplain ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    {lang === "it" ? "Spiegazione in corso..." : "Explaining..."}
                  </>
                ) : (
                  <>
                    <HelpCircle className="w-3.5 h-3.5" />
                    {lang === "it" ? "Spiega Flag (--explain)" : "Explain flags (--explain)"}
                  </>
                )}
              </button>
              <button
                id="btn-simulate-command"
                onClick={handleSimulateRun}
                disabled={simulatingTerminal}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {lang === "it" ? "Esegui Simulazione" : "Run Simulation"}
              </button>
            </div>
          </div>

          {/* Dynamic Option Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {selectedTool.options.map((option) => (
              <div key={option.param} className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-350 flex items-center justify-between">
                  <span className="font-mono text-indigo-400">{option.param}</span>
                  {option.required && (
                    <span className="text-[10px] bg-red-400/10 text-red-400 px-1.5 py-0.2 rounded font-mono">
                      {lang === "it" ? "richiesto" : "required"}
                    </span>
                  )}
                </label>
                <input
                  id={`param-input-${option.param}`}
                  type="text"
                  value={params[option.param] || ""}
                  onChange={(e) => handleParamChange(option.param, e.target.value)}
                  className="bg-[#0f172a] border border-slate-800 focus:border-indigo-500/60 text-slate-200 px-3 py-2 rounded text-xs font-mono outline-none transition"
                  placeholder={option.defaultValue}
                />
                <span className="text-[10px] text-slate-500 leading-snug">
                  {lang === "it" ? option.descIt : option.descEn}
                </span>
              </div>
            ))}
          </div>

          {/* Rendered Command */}
          <div className="bg-[#0f172a] border border-slate-850 rounded p-3">
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
              {lang === "it" ? "Comando generato" : "Generated CLI Command"}
            </span>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-300 break-all select-all">
              <span className="text-indigo-400 shrink-0 select-none">$</span>
              <span className="text-slate-100 font-semibold">{compileCommand()}</span>
            </div>
          </div>
        </div>

        {/* Gemini Explanation result drawer / panel */}
        {explainResult && (
          <div className="bg-[#111827] border border-slate-800 rounded p-5 border-l-4 border-l-indigo-500 animate-fadeIn shadow-xl" id="explain-results-card">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm mb-3">
              <Shield className="w-4 h-4" />
              <span>{lang === "it" ? "Analisi Didattica di Gemini AI" : "Gemini AI Educational Breakdown"}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ml-auto ${
                explainResult.dangerLevel === "HIGH" ? "bg-red-500/20 text-red-400" :
                explainResult.dangerLevel === "MEDIUM" ? "bg-amber-500/20 text-amber-400" :
                "bg-indigo-500/20 text-indigo-400"
              }`}>
                {explainResult.dangerLevel} RISK
              </span>
            </div>

            <p className="text-sm font-medium text-slate-200 mb-2 leading-relaxed">
              {explainResult.summary}
            </p>
            <p className="text-xs text-slate-400 bg-slate-955 px-3 py-2 rounded mb-4 font-mono leading-relaxed border border-slate-800/80">
              <span className="text-indigo-400 font-semibold uppercase tracking-wider text-[10px] mr-1 block mb-1">Impact Evaluation:</span>
              {explainResult.dangerExplanation}
            </p>

            <h4 className="text-xs font-semibold text-slate-350 uppercase tracking-widest mb-2 font-mono border-b border-slate-800 pb-1">
              {lang === "it" ? "Significato dei Parametri" : "Parameters Explanation"}
            </h4>
            <div className="flex flex-col gap-3.5 mb-4">
              {explainResult.flags.map((item, idx) => (
                <div key={idx} className="bg-[#0f172a] p-2.5 rounded border border-slate-800">
                  <span className="font-mono text-xs text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10 font-bold block w-fit mb-1.5">
                    {item.flag}
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">{item.meaning}</p>
                  {item.educationalTip && (
                    <p className="text-[10px] text-slate-400 mt-1 font-sans italic border-l-2 border-indigo-500/30 pl-2">
                       {item.educationalTip}
                     </p>
                  )}
                </div>
              ))}
            </div>

            <h4 className="text-xs font-semibold text-slate-350 uppercase tracking-widest mb-1 font-mono">
              {lang === "it" ? "Passi Successivi Suggeriti" : "Suggested Next Steps"}
            </h4>
            <ul className="list-none flex flex-col gap-1.5">
              {explainResult.nextSteps.map((step, idx) => (
                <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5 font-sans">
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Terminal Live Output simulator */}
        {simulationOutput.length > 0 && (
          <div className="bg-slate-950 border border-slate-800 rounded p-5 font-mono text-xs shadow-xl" id="simulation-output-terminal">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center gap-2 text-slate-400">
                <Terminal className="w-4 h-4 text-indigo-450 animate-pulse" />
                <span>stdout - {selectedTool.alias}_helper_run</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[300px] leading-relaxed text-slate-300">
              {simulationOutput.map((line, idx) => (
                <div
                  key={idx}
                  className={`border-l-2 pl-3 ${
                    line.startsWith("[+]") ? "border-indigo-500 text-indigo-400 bg-indigo-500/5" :
                    line.startsWith("[SUCCESS]") ? "border-amber-400 text-amber-300 bg-amber-400/5 font-semibold" :
                    line.startsWith("[hackpath]") ? "border-slate-800 text-slate-300 italic" : "border-slate-800/80 text-slate-400"
                  }`}
                >
                  {line}
                </div>
              ))}
              {simulatingTerminal && (
                <span className="inline-block w-2.5 h-4 bg-indigo-400 animate-blink ml-1 align-middle" />
              )}
            </div>

            {!simulatingTerminal && (
              <div className="border-t border-slate-800/80 mt-5 pt-3.5 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-[10px] text-slate-455 leading-snug">
                  {lang === "it"
                    ? `I risultati simulati mostrano porte e percorsi didattici. Desideri aggiungerli all'area "${activeWorkspaceName}"?`
                    : `Simulated logs contain educational flags keys. Import them directly to standard "${activeWorkspaceName}" findings?`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-import-terminal"
                    onClick={handleImportFindings}
                    className="bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 text-indigo-450 px-3.5 py-1.5 rounded text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {lang === "it" ? "Importa nel Workspace" : "Import to Workspace"}
                  </button>
                  {importedStatus && (
                    <span className="text-xs text-slate-400 font-semibold animate-fadeIn">{importedStatus}</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
