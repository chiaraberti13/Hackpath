import React, { useState } from "react";
import { Terminal, CheckCircle2, AlertTriangle, ArrowRight, Loader, Compass, Server, Cpu } from "lucide-react";

interface DoctorCheckProps {
  lang: "it" | "en";
}

interface DiagnosisItem {
  name: string;
  command: string;
  status: "OK" | "WARNING" | "MISSING";
  description: string;
  installDebian: string;
  installMac: string;
  installWin: string;
}

export default function DoctorCheck({ lang }: DoctorCheckProps) {
  const [running, setRunning] = useState<boolean>(false);
  const [diagnostics, setDiagnostics] = useState<DiagnosisItem[] | null>(null);

  const startCheck = () => {
    setRunning(true);
    setDiagnostics(null);

    const mockupItems: DiagnosisItem[] = [
      {
        name: "Python 3 Runtime Environment",
        command: "python3 --version",
        status: "OK",
        description: lang === "it" ? "Infrastruttura base e interprete principale per gli script hackpath." : "Base interpreter layer required to loop hackpath automation.",
        installDebian: "sudo apt update && sudo apt install -y python3 python3-pip",
        installMac: "brew install python",
        installWin: "winget install Python.Python.3"
      },
      {
        name: "Nmap Port Scanner",
        command: "nmap --version",
        status: "OK",
        description: lang === "it" ? "Motore di ricognizione host per identificare network sockets aperti." : "Host discovery and ports utility scanning engine.",
        installDebian: "sudo apt install -y nmap",
        installMac: "brew install nmap",
        installWin: "winget install Insecure.Nmap"
      },
      {
        name: "Gobuster Directory Fuzzer",
        command: "gobuster version",
        status: "WARNING",
        description: lang === "it" ? "File and directory brute-forcing per svelare directory e backup web nascosti." : "Web resources and backup fuzzing algorithm.",
        installDebian: "sudo apt install -y gobuster",
        installMac: "brew install gobuster",
        installWin: "Descritto in WSL Ubuntu."
      },
      {
        name: "Hydra Credentials Brute-forcer",
        command: "hydra -h",
        status: "MISSING",
        description: lang === "it" ? "Esecutore di brute-force automatico di password a dizionario su servizi di rete." : "Fast parallel login cracker engine.",
        installDebian: "sudo apt install -y hydra",
        installMac: "brew install hydra",
        installWin: "Install on WSL Ubuntu (sudo apt install -y hydra)"
      },
      {
        name: "John the Ripper / Hashcat",
        command: "john",
        status: "MISSING",
        description: lang === "it" ? "Motore di decifrazione offline per craccare hash crittografici, ZIP e SSH." : "Offline cryptography key cracking suite.",
        installDebian: "sudo apt install -y john hashcat",
        installMac: "brew install john-the-ripper",
        installWin: "Utilizzare WSL2 Kali o Ubuntu."
      }
    ];

    setTimeout(() => {
      setDiagnostics(mockupItems);
      setRunning(false);
    }, 1200);
  };

  return (
    <div className="bg-[#111827] border border-slate-800 rounded p-5 shadow-xl" id="doctor-check-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-100 flex items-center gap-2 font-sans">
            <Compass className="w-4 h-4 text-indigo-400" />
            {lang === "it" ? "System Doctor / Analisi Locale" : "System Doctor / Environment checks"}
          </h2>
          <p className="text-xs text-slate-400">
            {lang === "it" ? "Configurazione diagnostica del tuo computer o container di test" : "Review host security binaries installation dependencies"}
          </p>
        </div>

        <button
          id="btn-trigger-doctor"
          onClick={startCheck}
          disabled={running}
          className="bg-indigo-600 hover:bg-indigo-505 text-white font-semibold py-1.5 px-4 rounded text-xs flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer font-sans"
        >
          {running ? (
            <>
              <Loader className="w-3.5 h-3.5 animate-spin text-slate-100" />
              {lang === "it" ? "Verifica in corso..." : "Checking host..."}
            </>
          ) : (
            <>
              <Terminal className="w-3.5 h-3.5 text-slate-100" />
              {lang === "it" ? "Avvia Diagnostica Locale" : "Run Doctor Audit"}
            </>
          )}
        </button>
      </div>

      {diagnostics ? (
        <div className="flex flex-col gap-4 animate-fadeIn" id="doctor-diagnostics-results">
          {diagnostics.map((item, idx) => (
            <div key={idx} className="bg-[#0f172a] border border-slate-850 rounded p-4 flex flex-col gap-3 justify-between">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-200 font-sans">{item.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5">Test CMD: {item.command}</span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono flex items-center gap-1.5 uppercase ${
                  item.status === "OK" ? "bg-indigo-500/10 text-indigo-400" :
                  item.status === "WARNING" ? "bg-amber-500/10 text-amber-400" :
                  "bg-red-500/10 text-red-500"
                }`}>
                  {item.status === "OK" ? <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-1">
                {item.description}
              </p>

              {/* Install guides */}
              {item.status !== "OK" && (
                <div className="bg-[#0b111e] border border-slate-850 p-3 rounded flex flex-col gap-2 mt-2 shadow-inner">
                  <span className="text-[9.5px] uppercase font-semibold text-slate-500 font-sans tracking-wide">
                    {lang === "it" ? "Guida Installazione Consigliata" : "Recommended installation guides"}
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px]">
                    <div className="flex flex-col bg-[#070b13] p-2 rounded border border-slate-900/40">
                      <span className="text-cyan-400 font-bold font-mono">Linux (Ubuntu/Kali)</span>
                      <code className="text-[9.5px] text-slate-400 break-all select-all mt-1">{item.installDebian}</code>
                    </div>
                    <div className="flex flex-col bg-[#070b13] p-2 rounded border border-slate-900/40">
                      <span className="text-indigo-405 font-bold font-mono">macOS (Brew)</span>
                      <code className="text-[9.5px] text-slate-400 break-all select-all mt-1">{item.installMac}</code>
                    </div>
                    <div className="flex flex-col bg-[#070b13] p-2 rounded border border-slate-900/40">
                      <span className="text-blue-400 font-bold font-mono">Windows</span>
                      <code className="text-[9.5px] text-slate-400 break-all select-all mt-1">{item.installWin}</code>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-850 p-8 rounded flex flex-col items-center text-center justify-center min-h-[220px] shadow-inner">
          <span className="text-slate-600 block mb-2 font-mono text-2xl">🩺</span>
          <h4 className="text-slate-350 font-semibold text-sm font-sans mb-1">
            {lang === "it" ? "Ambiente non diagnosticato" : "Diagnostic scan recommended"}
          </h4>
          <p className="text-xs text-slate-550 max-w-sm leading-relaxed font-sans">
            {lang === "it"
              ? "Clicca 'Avvia Diagnostica Locale' per verificare la disponibilità dei pacchetti sul tuo sistema ospite."
              : "Click the trigger to audit missing penetration testing local binaries for hackpath wrappers."}
          </p>
        </div>
      )}
    </div>
  );
}
