import React, { useState, useEffect } from "react";
import { DiscoveredAsset } from "./types";
import CommandBuilder from "./components/CommandBuilder";
import WizardMentor from "./components/WizardMentor";
import LogAnalyzer from "./components/LogAnalyzer";
import WorkspaceManager from "./components/WorkspaceManager";
import ReportBuilder from "./components/ReportBuilder";
import DoctorCheck from "./components/DoctorCheck";
import CliDownloader from "./components/CliDownloader";
import PayloadHelper from "./components/PayloadHelper";
import { Terminal, Shield, Sparkles, FolderCode, FileText, HeartPulse, Globe, Menu, ShieldAlert, Code, Cpu } from "lucide-react";

export default function App() {
  const [lang, setLang] = useState<"it" | "en">("it");
  const [activeTab, setActiveTab] = useState<string>("builder");

  // Multi-workspace management
  const [workspaces, setWorkspaces] = useState<string[]>(["simplectf", "vulnlabs"]);
  const [activeWorkspace, setActiveWorkspace] = useState<string>("simplectf");
  const [findingsByWorkspace, setFindingsByWorkspace] = useState<Record<string, DiscoveredAsset[]>>({
    simplectf: [
      { name: "Port 22 SSH", type: "port", value: "Open (OpenSSH 8.2)", notes: "Servizio sicuro" },
      { name: "Port 80 HTTP", type: "port", value: "Open (Apache 2.4)", notes: "Sito web vulnerabile esposto" },
      { name: "Admin Entry", type: "directory", value: "/admin.php", notes: "Form di login amministratore trovato" }
    ],
    vulnlabs: []
  });

  // Load from localstorage if available
  useEffect(() => {
    const cachedWorkspaces = localStorage.getItem("hackpath_ws_list");
    const cachedActive = localStorage.getItem("hackpath_ws_active");
    const cachedFindings = localStorage.getItem("hackpath_ws_findings");

    if (cachedWorkspaces) setWorkspaces(JSON.parse(cachedWorkspaces));
    if (cachedActive) setActiveWorkspace(cachedActive);
    if (cachedFindings) setFindingsByWorkspace(JSON.parse(cachedFindings));
  }, []);

  const saveWorkspaceState = (newWS: string[], newActive: string, newFindings: Record<string, DiscoveredAsset[]>) => {
    setWorkspaces(newWS);
    setActiveWorkspace(newActive);
    setFindingsByWorkspace(newFindings);

    localStorage.setItem("hackpath_ws_list", JSON.stringify(newWS));
    localStorage.setItem("hackpath_ws_active", newActive);
    localStorage.setItem("hackpath_ws_findings", JSON.stringify(newFindings));
  };

  const handleCreateWorkspace = (name: string) => {
    if (workspaces.includes(name)) return;
    const updatedWS = [...workspaces, name];
    const updatedFindings = { ...findingsByWorkspace, [name]: [] };
    saveWorkspaceState(updatedWS, name, updatedFindings);
  };

  const handleDeleteWorkspace = (name: string) => {
    if (workspaces.length <= 1) return;
    const updatedWS = workspaces.filter(w => w !== name);
    const updatedFindings = { ...findingsByWorkspace };
    delete updatedFindings[name];
    const nextActive = updatedWS[0];
    saveWorkspaceState(updatedWS, nextActive, updatedFindings);
  };

  const handleSwitchWorkspace = (name: string) => {
    if (!workspaces.includes(name)) return;
    saveWorkspaceState(workspaces, name, findingsByWorkspace);
  };

  const handleAddFinding = (finding: { name: string; type: "port" | "directory" | "credential" | "hash" | "info"; value: string; notes: string }) => {
    const currentList = findingsByWorkspace[activeWorkspace] || [];
    // Check if finding already exists by name
    if (currentList.some((f) => f.name === finding.name && f.value === finding.value)) return;

    const updatedList = [...currentList, finding];
    const updatedFindings = { ...findingsByWorkspace, [activeWorkspace]: updatedList };
    saveWorkspaceState(workspaces, activeWorkspace, updatedFindings);
  };

  const handleDeleteFinding = (idx: number) => {
    const currentList = findingsByWorkspace[activeWorkspace] || [];
    const updatedList = currentList.filter((_, i) => i !== idx);
    const updatedFindings = { ...findingsByWorkspace, [activeWorkspace]: updatedList };
    saveWorkspaceState(workspaces, activeWorkspace, updatedFindings);
  };

  const activeFindings = findingsByWorkspace[activeWorkspace] || [];

  return (
    <div className="min-h-screen bg-[#0f172a] font-sans text-slate-200 selection:bg-indigo-500/30 selection:text-indigo-300">
      {/* Upper Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#111827]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 p-2 rounded">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-bold tracking-tight text-slate-100 uppercase">
                  hackpath
                </span>
                <span className="text-[10px] bg-indigo-500/10 text-indigo-400 font-mono font-bold px-2 py-0.5 rounded border border-indigo-500/20">
                  WEB PANEL v1.2
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide font-normal">
                CTF Helper Toolkit — didattico, bilingue, cross-platform
              </p>
            </div>
          </div>

          {/* Language Toggle and Indicator */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-900/80 border border-slate-800 rounded p-1 flex">
              <button
                id="lang-it-btn"
                onClick={() => setLang("it")}
                className={`px-3 py-1 rounded text-[10.5px] font-semibold uppercase transition flex items-center gap-1 ${
                  lang === "it" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-250 hover:bg-slate-800/55"
                }`}
              >
                🇮🇹 IT
              </button>
              <button
                id="lang-en-btn"
                onClick={() => setLang("en")}
                className={`px-3 py-1 rounded text-[10.5px] font-semibold uppercase transition flex items-center gap-1 ${
                  lang === "en" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-250 hover:bg-slate-800/55"
                }`}
              >
                🇬🇧 EN
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Wrapper */}
      <main className="max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
        
        {/* Academic Warning/Disclaimer Disclaimer */}
        <div className="bg-amber-500/5 border border-amber-500/15 text-amber-500/90 rounded p-4 flex gap-3.5 items-start shadow-sm font-sans">
          <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0 text-amber-500" />
          <div className="flex flex-col text-[11.5px] leading-relaxed max-w-5xl font-sans">
            <span className="font-semibold uppercase tracking-wider text-[11px] mb-0.5">
              {lang === "it" ? "⚠️ ATTENZIONE — SOLO USO DIDATTICO" : "⚠️ WARNING — EDUCATIONAL USE ONLY"}
            </span>
            <span>
              {lang === "it"
                ? "Questo toolkit e la sua controparte web sono progettati esclusivamente per scopi di studio accademico, certificazioni e competizioni CTF autorizzate. Qualsiasi utilizzo offensivo non concordato su server di terzi è severamente vietato e perseguibile legalmente."
                : "This toolkit and its web companion are designed exclusively for academic studies, authorized cyber tests, and CTF training. Unauthorized hacking on third-party domains is strictly illegal and subject to criminal prosecution."}
            </span>
          </div>
        </div>

        {/* Big styled Welcome Header Banner */}
        <div className="bg-[#111827] border border-slate-800 rounded p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="relative z-10 w-full md:max-w-xl">
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest font-mono">
              {lang === "it" ? "Interfaccia Integrata" : "Integrated Suite Workspace"}
            </span>
            <h1 className="text-xl font-semibold tracking-tight text-slate-100 font-sans mt-0.5">
              {lang === "it" ? "Organizza ed analizza i tuoi laboratori cyber" : "Organize & analyze authorized security audits"}
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
              {lang === "it" 
                ? "Semplifica la tua curva di apprendimento. hackpath incapsula i comandi di nmap, gobuster e john, li spiega opzione per opzione e sincronizza i reperti in report finali formattati."
                : "Simplify your learning curve. hackpath takes complex security parameters from nmap, gobuster and john, explains them and saves evidence into neat lab dossiers."}
            </p>
          </div>

          <div className="shrink-0 font-mono text-[11px] bg-[#0f172a] border border-slate-800 rounded p-4 flex flex-col gap-1 z-10 md:w-56">
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">{lang === "it" ? "Area Attiva:" : "Workspace:"}</span>
              <span className="text-indigo-400 font-medium font-mono">"{activeWorkspace}"</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">{lang === "it" ? "Indizi totali:" : "Evidences:"}</span>
              <span className="text-slate-300 font-medium font-mono">{activeFindings.length}</span>
            </div>
            <div className="flex justify-between items-center py-0.5">
              <span className="text-slate-500">Locale:</span>
              <span className="text-slate-400 font-medium font-mono uppercase">{lang}</span>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-0 pointer-events-none" />
        </div>

        {/* Tab Selection */}
        <div className="flex gap-1 overflow-x-auto border-b border-slate-800 pb-1 shrink-0 scrollbar-none" id="dashboard-tabs">
          {[
            { id: "builder", labelIt: "Command Builder", labelEn: "Command Builder", icon: <Terminal className="w-4 h-4" /> },
            { id: "wizard", labelIt: "AI Wizard", labelEn: "AI Wizard Mentor", icon: <Sparkles className="w-4 h-4" /> },
            { id: "logs", labelIt: "Risolutore Log (AI)", labelEn: "Logs solver (AI)", icon: <FolderCode className="w-4 h-4" /> },
            { id: "payload", labelIt: "Payload & Evasione", labelEn: "Payload & Evasion", icon: <Cpu className="w-4 h-4" /> },
            { id: "workspace", labelIt: "Workspace Findings", labelEn: "Workspace findings", icon: <Shield className="w-4 h-4" /> },
            { id: "report", labelIt: "Report Walkthrough", labelEn: "Report Walkthrough", icon: <FileText className="w-4 h-4" /> },
            { id: "cli", labelIt: "Modular CLI Toolkit", labelEn: "Modular CLI Toolkit", icon: <Code className="w-4 h-4" /> },
            { id: "doctor", labelIt: "System Doctor", labelEn: "System Doctor", icon: <HeartPulse className="w-4 h-4" /> }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-button-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-t text-xs font-semibold flex items-center gap-2 transition shrink-0 border-t border-x uppercase font-sans tracking-wide cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[#111827] border-slate-800 text-indigo-400 border-b-transparent shadow-sm"
                  : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.icon}
              <span>{lang === "it" ? tab.labelIt : tab.labelEn}</span>
            </button>
          ))}
        </div>

        {/* Render Selected View */}
        <div className="flex flex-col gap-6 min-h-[400px]" id="dashboard-active-view-container">
          {activeTab === "builder" && (
            <CommandBuilder
              lang={lang}
              activeWorkspaceName={activeWorkspace}
              onAddFinding={handleAddFinding}
            />
          )}

          {activeTab === "wizard" && (
            <WizardMentor
              lang={lang}
              activeWorkspaceName={activeWorkspace}
              findings={activeFindings}
              onAddFinding={handleAddFinding}
            />
          )}

          {activeTab === "logs" && (
            <LogAnalyzer
              lang={lang}
              activeWorkspaceName={activeWorkspace}
              onAddFinding={handleAddFinding}
            />
          )}

          {activeTab === "payload" && (
            <PayloadHelper lang={lang} />
          )}

          {activeTab === "workspace" && (
            <WorkspaceManager
              lang={lang}
              workspaces={workspaces}
              activeWorkspace={activeWorkspace}
              findings={activeFindings}
              onCreateWorkspace={handleCreateWorkspace}
              onDeleteWorkspace={handleDeleteWorkspace}
              onSwitchWorkspace={handleSwitchWorkspace}
              onAddFinding={handleAddFinding}
              onDeleteFinding={handleDeleteFinding}
            />
          )}

          {activeTab === "report" && (
            <ReportBuilder
              lang={lang}
              activeWorkspaceName={activeWorkspace}
              findings={activeFindings}
            />
          )}

          {activeTab === "cli" && (
            <CliDownloader lang={lang} />
          )}

          {activeTab === "doctor" && (
            <DoctorCheck lang={lang} />
          )}
        </div>
      </main>

      {/* Footer Details */}
      <footer className="border-t border-slate-800 bg-[#0f172a] mt-16 px-6 py-8 text-center text-[11px] text-slate-500 font-mono">
        <p className="max-w-2xl mx-auto leading-relaxed">
          hackpath è licenziato sotto Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International.
          <br />
          Sviluppato esclusivamente per scopi accademici e di ricerca etica.
        </p>
        <p className="mt-2 text-slate-600">
          © 2026 hackpath Project. All rights reserved. Built with Gemini AI.
        </p>
      </footer>
    </div>
  );
}
