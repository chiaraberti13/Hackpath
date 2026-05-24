import React, { useState, useEffect } from "react";
import { Download, FileCode, Check, Copy, ArrowRight, Save, Terminal } from "lucide-react";

interface CliDownloaderProps {
  lang: "it" | "en";
}

export default function CliDownloader({ lang }: CliDownloaderProps) {
  const [sources, setSources] = useState<Record<string, string>>({});
  const [selectedFile, setSelectedFile] = useState<string>("hackpath.py");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/cli-sources")
      .then((res) => res.json())
      .then((data) => setSources(data))
      .catch((err) => console.error("Error loading CLI sources:", err));
  }, []);

  const handleCopyCode = () => {
    const code = sources[selectedFile];
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadAll = () => {
    // Generate a simple batch shell setup script or combine them for direct copy
    const installScript = `#!/usr/bin/env bash
mkdir -p hackpath_cli/core hackpath_cli/modules

cat << 'EOF' > hackpath_cli/hackpath.py
${sources["hackpath.py"]}
EOF

cat << 'EOF' > hackpath_cli/core/workspace.py
${sources["core/workspace.py"]}
EOF

cat << 'EOF' > hackpath_cli/core/__init__.py
# Init core
EOF

cat << 'EOF' > hackpath_cli/modules/__init__.py
# Init modules
EOF

cat << 'EOF' > hackpath_cli/modules/recon.py
${sources["modules/recon.py"]}
EOF

cat << 'EOF' > hackpath_cli/modules/crack.py
${sources["modules/crack.py"]}
EOF

echo "[+] Modular hackpath Python toolkit created successfully under hackpath_cli/"
chmod +x hackpath_cli/hackpath.py
`;
    const element = document.createElement("a");
    const file = new Blob([installScript], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "setup_hackpath.sh";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded p-5 shadow-xl font-sans" id="cli-sources-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            {lang === "it" ? "Codice Sorgente CLI Modular" : "Modular CLI Python Source Code"}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {lang === "it"
              ? "Scarica ed esplora l'architettura Python 3 originale per i tuoi laboratori offline CTF."
              : "Download and study the native Python 3 CLI components architecture for local CTF labs."}
          </p>
        </div>

        <button
          onClick={downloadAll}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 px-4 rounded text-xs flex items-center gap-1.5 transition cursor-pointer"
        >
          <Download className="w-4 h-4 text-slate-100" />
          {lang === "it" ? "Scarica setup_hackpath.sh" : "Download setup_hackpath.sh"}
        </button>
      </div>

      <div className="bg-[#0b111e] border border-slate-850 p-4 rounded mb-5 text-xs text-slate-400 leading-relaxed font-sans shadow-inner">
        <h4 className="font-semibold text-slate-200 mb-1.5 flex items-center gap-1">
          <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
          {lang === "it" ? "Istruzioni per l'avvio locale:" : "Running the CLI locally:"}
        </h4>
        <ol className="list-decimal list-inside flex flex-col gap-1 text-slate-350">
          <li>{lang === "it" ? "Scarica lo script ed eseguilo con bash setup_hackpath.sh" : "Download setup_hackpath.sh and execute with bash setup_hackpath.sh"}</li>
          <li>{lang === "it" ? "Verrà generata una cartellina pulita con la struttura moduli" : "This generates the directories structure and modular files"}</li>
          <li>{lang === "it" ? "Avvia: python3 hackpath.py run nmap --target 10.10.10.5" : "Run commands: python3 hackpath.py run nmap --target 10.10.10.5"}</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Navigation file tree */}
        <div className="lg:col-span-3 flex flex-col gap-1.5">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider font-mono">
            {lang === "it" ? "Albero dei File" : "Source File Tree"}
          </span>
          {Object.keys(sources).map((fileName) => (
            <button
              key={fileName}
              onClick={() => setSelectedFile(fileName)}
              className={`w-full text-left px-3 py-2 text-xs rounded font-mono flex items-center gap-2 transition ${
                selectedFile === fileName
                  ? "bg-indigo-500/10 border-l-2 border-indigo-500 text-slate-100"
                  : "hover:bg-slate-800/80 text-slate-400"
              }`}
            >
              <FileCode className="w-3.5 h-3.5 text-indigo-455 shrink-0" />
              <span className="truncate">{fileName}</span>
            </button>
          ))}
        </div>

        {/* Code display window */}
        <div className="lg:col-span-9 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] uppercase font-bold text-slate-500 tracking-wider font-mono">
            <span>{selectedFile}</span>
            <button
              onClick={handleCopyCode}
              className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1.2 transition cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? (lang === "it" ? "Copiato!" : "Copied!") : (lang === "it" ? "Copia Codice" : "Copy Code")}
            </button>
          </div>

          <textarea
            readOnly
            value={sources[selectedFile] || ""}
            rows={18}
            className="w-full bg-[#0f172a] border border-slate-850 text-slate-300 font-mono p-4 rounded text-xs leading-relaxed outline-none resize-none shadow-inner select-all"
          />
        </div>
      </div>
    </div>
  );
}
