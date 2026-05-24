import React, { useState } from "react";
import { DiscoveredAsset } from "../types";
import { Folder, FolderPlus, Trash2, Plus, Download, Key, Link, Shield, Info, Database } from "lucide-react";

interface WorkspaceManagerProps {
  lang: "it" | "en";
  workspaces: string[];
  activeWorkspace: string;
  findings: DiscoveredAsset[];
  onCreateWorkspace: (name: string) => void;
  onDeleteWorkspace: (name: string) => void;
  onSwitchWorkspace: (name: string) => void;
  onAddFinding: (finding: { name: string; type: "port" | "directory" | "credential" | "hash" | "info"; value: string; notes: string }) => void;
  onDeleteFinding: (idx: number) => void;
}

export default function WorkspaceManager({
  lang,
  workspaces,
  activeWorkspace,
  findings,
  onCreateWorkspace,
  onDeleteWorkspace,
  onSwitchWorkspace,
  onAddFinding,
  onDeleteFinding
}: WorkspaceManagerProps) {
  const [newWorkspaceName, setNewWorkspaceName] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Form states for manual finding input
  const [fName, setFName] = useState<string>("");
  const [fType, setFType] = useState<"port" | "directory" | "credential" | "hash" | "info">("port");
  const [fValue, setFValue] = useState<string>("");
  const [fNotes, setFNotes] = useState<string>("");

  const handleCreateWS = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newWorkspaceName.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (trimmed && !workspaces.includes(trimmed)) {
      onCreateWorkspace(trimmed);
      setNewWorkspaceName("");
    }
  };

  const handleSubmitFinding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fName.trim() || !fValue.trim()) return;
    onAddFinding({
      name: fName.trim(),
      type: fType,
      value: fValue.trim(),
      notes: fNotes.trim()
    });
    // Reset form
    setFName("");
    setFValue("");
    setFNotes("");
    setShowAddForm(false);
  };

  const handleDownloadBackup = () => {
    const backupData = {
      workspace: activeWorkspace,
      exportedAt: new Date().toISOString(),
      findings: findings
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hackpath_workspace_${activeWorkspace}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="workspace-manager-panel">
      {/* Sidebar Workspaces Directory */}
      <div className="lg:col-span-4 flex flex-col gap-4">
        {/* Workspace Creator panel */}
        <div className="bg-[#111827] border border-slate-800 rounded p-4 flex flex-col gap-3 shadow-xl">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-sans">
            <Folder className="w-4 h-4 text-indigo-400" />
            {lang === "it" ? "I tuoi Workspace" : "Your Workspaces"}
          </h3>

          <form onSubmit={handleCreateWS} className="flex gap-2">
            <input
              id="new-workspace-name-input"
              type="text"
              required
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder={lang === "it" ? "es. mylab" : "e.g. active_lab"}
              className="flex-1 bg-[#0f172a] border border-slate-800 focus:border-indigo-500/60 text-slate-200 px-2.5 py-1.5 rounded text-xs outline-none transition font-sans"
            />
            <button
              id="workspace-add-submit-btn"
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded p-1.5 font-semibold text-xs flex items-center justify-center transition shrink-0 cursor-pointer"
              title={lang === "it" ? "Crea Area" : "Create Area"}
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </form>

          <div className="flex flex-col gap-1.5 mt-2">
            {workspaces.map((ws) => (
              <div
                key={ws}
                className={`flex items-center justify-between px-3 py-2 rounded text-xs border font-mono transition ${
                  activeWorkspace === ws
                    ? "bg-indigo-500/10 border-indigo-500/35 text-slate-100"
                    : "bg-[#0f172a] border-slate-800 hover:border-slate-705 text-slate-400 cursor-pointer"
                }`}
                onClick={() => onSwitchWorkspace(ws)}
              >
                <span>{ws}</span>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  {workspaces.length > 1 && (
                    <button
                      id={`delete-workspace-btn-${ws}`}
                      onClick={() => onDeleteWorkspace(ws)}
                      className="text-slate-500 hover:text-red-500 transition cursor-pointer"
                      title={lang === "it" ? "Cancella" : "Delete"}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Backup export card */}
        <div className="bg-[#111827] border border-slate-800 rounded p-4 flex flex-col gap-2 shadow-lg">
          <span className="text-xs font-semibold text-slate-300 font-sans">
            {lang === "it" ? "Esporta Backup" : "Export Backup"}
          </span>
          <p className="text-[10.5px] text-slate-500 leading-snug">
            {lang === "it"
              ? "Scarica un file JSON con l'intera lista dei ritrovamenti correnti per ricaricarlo in un altro lab."
              : "Download all workspace variables state into a JSON archive backup bundle."}
          </p>
          <button
            id="download-workspace-backup-btn"
            onClick={handleDownloadBackup}
            className="w-full mt-1 bg-slate-800 border border-slate-850 hover:bg-slate-755 text-slate-350 rounded py-1.5 text-xs font-semibold font-sans flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-indigo-400" />
            {lang === "it" ? "Scarica Workspace" : "Export Workspace"}
          </button>
        </div>
      </div>

      {/* Main Table / Grid of Active Findings */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        <div className="bg-[#111827] border border-slate-800 rounded p-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2 flex-wrap">
            <div>
              <h2 className="text-sm font-semibold text-slate-150 flex items-center gap-2 font-sans">
                <Database className="w-4 h-4 text-indigo-400" />
                {lang === "it" ? `Ritrovamenti in "${activeWorkspace}"` : `Findings inside "${activeWorkspace}"`}
              </h2>
              <p className="text-[11px] text-slate-500 font-sans">
                {lang === "it" ? `${findings.length} indizi salvati nel registro` : `${findings.length} registered traces stored`}
              </p>
            </div>

            <button
              id="workspace-add-form-toggle-btn"
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-indigo-600 hover:bg-indigo-505 text-white font-semibold py-1.5 px-3 rounded text-xs flex items-center gap-1.5 transition cursor-pointer font-sans"
            >
              <Plus className="w-3.5 h-3.5 text-slate-100" />
              {lang === "it" ? "Aggiungi Manualmente" : "Manual Finding"}
            </button>
          </div>

          {/* Quick manual input form */}
          {showAddForm && (
            <form onSubmit={handleSubmitFinding} className="bg-[#0f172a] border border-slate-800 rounded p-4 mb-5 flex flex-col gap-4 animate-fadeIn shadow-inner" id="manual-finding-form">
              <span className="text-xs font-semibold text-slate-350 uppercase tracking-wider font-sans">
                {lang === "it" ? "Nuovo indizio" : "Add custom finding"}
              </span>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5 font-sans">
                  <label className="text-[11px] text-slate-400 font-medium">{lang === "it" ? "Etichetta (es. Web Admin)" : "Label (e.g. Web Admin)"}</label>
                  <input
                    id="manual-finding-name"
                    type="text"
                    required
                    value={fName}
                    onChange={(e) => setFName(e.target.value)}
                    className="bg-[#0b111e] border border-slate-800 text-slate-250 p-2 text-xs rounded outline-none focus:border-indigo-505/65 font-mono"
                    placeholder="SSH Port, User admin..."
                  />
                </div>

                <div className="flex flex-col gap-1.5 font-sans">
                  <label className="text-[11px] text-slate-400 font-medium">{lang === "it" ? "Classificazione" : "Type"}</label>
                  <select
                    id="manual-finding-type"
                    value={fType}
                    onChange={(e) => setFType(e.target.value as any)}
                    className="bg-[#0b111e] border border-slate-800 text-[#cbd5e1] p-2 text-xs rounded outline-none focus:border-indigo-505/65 font-sans"
                  >
                    <option value="port">PORT</option>
                    <option value="directory">DIRECTORY</option>
                    <option value="credential">CREDENTIAL</option>
                    <option value="hash">HASH</option>
                    <option value="info">INFO / LOG</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 font-sans">
                  <label className="text-[11px] text-slate-400 font-medium">{lang === "it" ? "Valore (es. Open (22))" : "Value (e.g. Open (22))"}</label>
                  <input
                    id="manual-finding-val"
                    type="text"
                    required
                    value={fValue}
                    onChange={(e) => setFValue(e.target.value)}
                    className="bg-[#0b111e] border border-slate-800 text-slate-200 p-2 text-xs rounded outline-none focus:border-indigo-505/65 font-mono"
                    placeholder="22/tcp, status 200..."
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 font-sans">
                <label className="text-[11px] text-slate-400 font-medium">{lang === "it" ? "Note & Dettagli" : "Notes & Details"}</label>
                <textarea
                  id="manual-finding-notes"
                  value={fNotes}
                  onChange={(e) => setFNotes(e.target.value)}
                  className="bg-[#0b111e] border border-slate-800 text-[#f1f5f9] p-2 text-xs rounded outline-none h-16 resize-none focus:border-indigo-505/65 font-sans"
                  placeholder={lang === "it" ? "Indica vulnerabilità correlate o credenziali..." : "Document associated service flaws or context details..."}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  id="manual-finding-cancel"
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-slate-800 text-slate-400 px-3 py-1.5 rounded text-xs transition hover:bg-slate-700 font-sans cursor-pointer"
                >
                  {lang === "it" ? "Annulla" : "Cancel"}
                </button>
                <button
                  id="manual-finding-submit"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-xs font-semibold font-sans transition cursor-pointer"
                >
                  {lang === "it" ? "Salva indizio" : "Commit finding"}
                </button>
              </div>
            </form>
          )}
          {/* Active list table */}
          {findings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {findings.map((f, idx) => (
                <div
                  key={idx}
                  id={`finding-card-${idx}`}
                  className="bg-[#0f172a] border border-slate-850 rounded p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-slate-800 shadow-sm"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-1">
                      {f.type === "port" ? <Shield className="w-4 h-4 text-cyan-400" /> :
                       f.type === "directory" ? <Link className="w-4 h-4 text-indigo-400" /> :
                       f.type === "credential" || f.type === "hash" ? <Key className="w-4 h-4 text-amber-400" /> :
                       <Info className="w-4 h-4 text-slate-400" />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-slate-200 font-mono truncate">{f.name}</span>
                        <span className={`text-[9px] font-bold font-mono px-1 rounded uppercase ${
                          f.type === "port" ? "bg-cyan-500/10 text-cyan-400" :
                          f.type === "directory" ? "bg-indigo-500/10 text-indigo-400" :
                          f.type === "credential" ? "bg-amber-500/10 text-amber-400" :
                          f.type === "hash" ? "bg-purple-500/10 text-purple-400" :
                          "bg-slate-500/10 text-slate-400"
                        }`}>
                          {f.type}
                        </span>
                      </div>
                      <span className="text-xs font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded mt-1.5 inline-block border border-slate-800 max-w-full truncate">
                        {f.value}
                      </span>
                      {f.notes && (
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
                          {f.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    id={`delete-finding-btn-${idx}`}
                    onClick={() => onDeleteFinding(idx)}
                    className="text-slate-500 hover:text-red-500 p-1.5 bg-slate-900 border border-slate-800 hover:border-slate-720 rounded transition self-end md:self-center shrink-0 cursor-pointer"
                    title={lang === "it" ? "Elimina indizio" : "Delete finding"}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#0f172a] border border-slate-850 rounded p-8 flex flex-col items-center justify-center text-center shadow-inner">
              <span className="text-slate-700 block mb-2 font-mono text-3xl">📭</span>
              <h4 className="text-slate-300 font-semibold text-sm font-sans mb-1">
                {lang === "it" ? "Nessun indizio salvato" : "Workspace is empty"}
              </h4>
              <p className="text-xs text-slate-500 max-w-xs leading-relaxed font-sans">
                {lang === "it"
                  ? "Avvia le simulazioni di scansione nel Command Builder, oppure analizza log testuali per popolarlo."
                  : "Start scanning simulated utilities in the command builder or paste console logs to populate findings."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
