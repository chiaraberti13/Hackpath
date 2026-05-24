import React, { useState } from "react";
import { MOCK_TERMINAL_LOGS } from "../data";
import { AnalyzeResponse, DiscoveredAsset } from "../types";
import { Copy, Terminal, Database, UploadCloud, CheckCircle, ShieldAlert, ArrowRight, Loader, Plus } from "lucide-react";

interface LogAnalyzerProps {
  lang: "it" | "en";
  activeWorkspaceName: string;
  onAddFinding: (finding: { name: string; type: "port" | "directory" | "credential" | "hash" | "info"; value: string; notes: string }) => void;
}

export default function LogAnalyzer({ lang, activeWorkspaceName, onAddFinding }: LogAnalyzerProps) {
  const [logContent, setLogContent] = useState<string>(MOCK_TERMINAL_LOGS[0].content);
  const [selectedPresetId, setSelectedPresetId] = useState<string>(MOCK_TERMINAL_LOGS[0].id);
  const [analysisResult, setAnalysisResult] = useState<AnalyzeResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [importCount, setImportCount] = useState<number>(0);

  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
    const preset = MOCK_TERMINAL_LOGS.find((p) => p.id === id);
    if (preset) {
      setLogContent(preset.content);
    }
    setAnalysisResult(null);
    setImportCount(0);
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysisResult(null);
    setImportCount(0);
    try {
      const response = await fetch("/api/analyze-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logContent,
          toolType: "auto-detect",
          lang: lang
        })
      });

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }
      const data = await response.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
      // Fallback fallback results
      setAnalysisResult({
        toolFound: "Detected Security Scanner Output",
        discoveredAssets: [
          { name: "Port 22 SSH", type: "port", value: "Open", notes: "Banner grabbing: OpenSSH" },
          { name: "Port 80 HTTP", type: "port", value: "Open (Apache server)", notes: "Web application exposed" },
          { name: "Admin Portal", type: "directory", value: "/admin.php", notes: "Identified web index path" }
        ],
        vulnerabilityScore: "CRITICAL",
        summaryAnalysis: lang === "it"
          ? "Fall-back: analizzato log didattico in assenza di connessione API Gemini."
          : "Fall-back: analyzed logs in the absence of a live Gemini API connection.",
        suggestions: [
          lang === "it" ? "Fai brute-force sulla cartella /admin.php" : "Perform path fuzzing or credential brute-forcing on /admin.php",
          lang === "it" ? "Cerca credenziali deboli" : "Scan for default or weak credentials"
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportAsset = (asset: DiscoveredAsset) => {
    onAddFinding({
      name: asset.name,
      type: asset.type,
      value: asset.value,
      notes: asset.notes || `${lang === "it" ? "Estratto tramite AI dai log" : "AI extracted log entry"}`
    });
    setImportCount((prev) => prev + 1);
  };

  const handleImportAll = () => {
    if (!analysisResult) return;
    analysisResult.discoveredAssets.forEach((asset) => {
      onAddFinding({
        name: asset.name,
        type: asset.type,
        value: asset.value,
        notes: asset.notes || `${lang === "it" ? "Estratto tramite AI con hackpath" : "AI auto-parsed log discovery"}`
      });
    });
    setImportCount(analysisResult.discoveredAssets.length);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="log-analyzer-tab">
      {/* Presets and Editor */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded p-5 shadow-xl">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2 font-sans">
            <Terminal className="w-4 h-4 text-indigo-400" />
            {lang === "it" ? "Carica Log di Scansione" : "Load Scanning Output"}
          </h3>

          <div className="flex flex-wrap gap-2 mb-4">
            {MOCK_TERMINAL_LOGS.map((p) => (
              <button
                key={p.id}
                id={`preset-btn-${p.id}`}
                onClick={() => handleSelectPreset(p.id)}
                className={`text-[11px] px-3 py-1.5 rounded border font-mono transition ${
                  selectedPresetId === p.id
                    ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400"
                    : "bg-[#0f172a] border-slate-800 hover:border-slate-700 text-slate-400"
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1.5 font-mono">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
              {lang === "it" ? "INCOLLA LOG TERMINALE (NMAP / GOBUSTER / JOHN / RESPONDER / ECC)" : "PASTE TERMINAL LOG (NMAP / GOBUSTER / JOHN / RESPONDER / ETC)"}
            </span>
            <textarea
              id="raw-log-input"
              value={logContent}
              onChange={(e) => {
                setLogContent(e.target.value);
                setSelectedPresetId("");
                setAnalysisResult(null);
                setImportCount(0);
              }}
              rows={12}
              className="w-full bg-[#0f172a] border border-slate-800 focus:border-indigo-500/60 text-slate-300 p-3.5 rounded text-xs leading-relaxed outline-none resize-y font-mono"
              placeholder={lang === "it" ? "Incolla qui l'output del tuo terminale di scansione..." : "Paste your scanning terminal output stdout..."}
            />
          </div>

          <button
            id="btn-trigger-analyzer"
            onClick={handleAnalyze}
            disabled={loading || !logContent.trim()}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 rounded text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 font-sans cursor-pointer"
          >
            {loading ? (
              <>
                <Loader className="w-3.5 h-3.5 animate-spin" />
                {lang === "it" ? "Analisi Geometrie / Log..." : "Analyzing Log Logs..."}
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5" />
                {lang === "it" ? "Analizza con Gemini AI" : "Parse and Analyze with Gemini AI"}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        {analysisResult ? (
          <div className="bg-[#111827] border border-slate-800 rounded p-5 flex flex-col gap-5 animate-fadeIn shadow-xl" id="log-analysis-results-card">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-[12.5px] font-semibold text-slate-200 font-mono">
                  {lang === "it" ? `Tool rilevato: ${analysisResult.toolFound}` : `Parsed Tool: ${analysisResult.toolFound}`}
                </h3>
                <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Gemini AI Parser</span>
              </div>
              <span className={`text-[10.5px] font-bold px-2 py-0.5 rounded font-mono ${
                analysisResult.vulnerabilityScore === "CRITICAL" ? "bg-red-500/20 text-red-400 animate-pulse" :
                analysisResult.vulnerabilityScore === "HIGH" ? "bg-orange-500/20 text-orange-400" :
                analysisResult.vulnerabilityScore === "MEDIUM" ? "bg-amber-500/20 text-amber-400" :
                "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400"
              }`}>
                {analysisResult.vulnerabilityScore} INDEX
              </span>
            </div>

            {/* AI Summary */}
            <div className="bg-[#0f172a] border border-slate-800 rounded p-4 border-l-2 border-l-indigo-500 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                {lang === "it" ? "Sintesi Riscontri" : "Extracted Summary Statement"}
              </span>
              <p className="text-xs text-slate-350 leading-relaxed font-sans">
                {analysisResult.summaryAnalysis}
              </p>
            </div>

            {/* Extracted Assets list */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                  {lang === "it" ? "Asset & Indizi Rilevati" : "Discovered Assets & Flags"}
                </span>
                <button
                  id="btn-import-all"
                  onClick={handleImportAll}
                  className="text-[10.5px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold hover:underline"
                >
                  <Copy className="w-3 h-3" />
                  {lang === "it" ? "Importa tutti nel workspace" : "Import all findings"}
                </button>
              </div>

              <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
                {analysisResult.discoveredAssets.map((asset, idx) => (
                  <div key={idx} className="bg-[#0f172a] border border-slate-850 hover:border-slate-800 rounded p-2.5 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-slate-200 truncate font-mono">
                          {asset.name}
                        </span>
                        <span className={`text-[9px] font-mono font-bold px-1 rounded uppercase shrink-0 ${
                          asset.type === "port" ? "bg-cyan-500/10 text-cyan-400" :
                          asset.type === "directory" ? "bg-indigo-500/10 text-indigo-400" :
                          asset.type === "credential" ? "bg-amber-500/10 text-amber-400" :
                          asset.type === "hash" ? "bg-purple-500/10 text-purple-400" :
                          "bg-slate-500/10 text-slate-400"
                        }`}>
                          {asset.type}
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-455 font-mono truncate mt-0.5">{asset.value}</span>
                      <span className="text-[10px] text-slate-500 mt-1 leading-snug">{asset.notes}</span>
                    </div>

                    <button
                      id={`btn-import-asset-${idx}`}
                      onClick={() => handleImportAsset(asset)}
                      className="bg-slate-900 border border-slate-800 hover:border-slate-705 hover:bg-slate-800 text-slate-350 p-1.5 rounded shrink-0 transition"
                      title={lang === "it" ? "Aggiungi al workspace" : "Add to workspace"}
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-450" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggestions */}
            <div className="bg-[#0f172a] p-4 border border-slate-850 rounded">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 font-mono tracking-wider">
                {lang === "it" ? "Suggerimenti d'attacco didattici" : "Attack suggestions / instructions"}
              </span>
              <ul className="list-none flex flex-col gap-2">
                {analysisResult.suggestions.map((s, idx) => (
                  <li key={idx} className="text-xs text-slate-400 flex items-start gap-1.5 font-sans leading-relaxed">
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Import feedback status */}
            {importCount > 0 && (
              <div className="bg-indigo-500/10 border border-indigo-500/25 text-indigo-455 p-3 rounded text-xs font-semibold flex items-center justify-between" id="asset-import-notify-badge">
                <span className="flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-indigo-400" />
                  {lang === "it"
                    ? `${importCount} indizi importati con successo nell'area "${activeWorkspaceName}"!`
                    : `${importCount} data assets successfully committed to active "${activeWorkspaceName}"!`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#111827] border border-slate-800 rounded p-8 flex flex-col items-center justify-center text-center h-full min-h-[350px] shadow-sm">
            <div className="bg-[#0f172a] p-4 rounded border border-slate-800 mb-4 text-slate-650 shadow-md">
              <Database className="w-8 h-8 text-indigo-400" />
            </div>
            <h4 className="text-slate-300 font-semibold mb-1 text-sm font-sans">
              {lang === "it" ? "In attesa di analisi log" : "Awaiting scan logs review"}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed font-sans">
              {lang === "it"
                ? "Scegli o incolla un log di scansione a sinistra e clicca 'Analizza' per attivare l'elaborazione artificiale di Gemini."
                : "Select or edit logs details on the left, then click analyze to trigger extraction."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
