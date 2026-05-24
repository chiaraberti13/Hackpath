# -*- coding: utf-8 -*-
import os
import json
from pathlib import Path

class WorkspaceManager:
    """Modulates isolated workspace partitions storing security insights, commands run and traces."""
    def __init__(self, base_dir=None):
        if base_dir is None:
            self.base_dir = Path(__file__).parent.parent / "workspaces"
        else:
            self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self.active_workspace_name = "default_lab"
        self.active_file = self.base_dir / f"{self.active_workspace_name}.json"

    def set_active_workspace(self, name: str):
        # sanitize name
        clean_name = "".join(c for c in name if c.isalnum() or c in ("_", "-")).strip()
        if not clean_name:
            clean_name = "default_lab"
        self.active_workspace_name = clean_name
        self.active_file = self.base_dir / f"{clean_name}.json"
        
        # Create empty tracking db file if nonexistent
        if not self.active_file.exists():
            self._save_state({"findings": []})

    def get_findings(self) -> list:
        if not self.active_file.exists():
            return []
        try:
            with open(self.active_file, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("findings", [])
        except Exception:
            return []

    def commit_finding(self, name: str, f_type: str, value: str, notes: str = ""):
        findings = self.get_findings()
        # Prevent exact duplicates
        for f in findings:
            if f.get("name") == name and f.get("type") == f_type and f.get("value") == value:
                return # Already registered

        new_finding = {
            "name": name,
            "type": f_type,
            "value": value,
            "notes": notes,
            "timestamp": os.getlogin() if hasattr(os, "getlogin") else "system"
        }
        findings.append(new_finding)
        self._save_state({"findings": findings})

    def _save_state(self, state: dict):
        try:
            with open(self.active_file, "w", encoding="utf-8") as f:
                json.dump(state, f, indent=4, ensure_ascii=False)
        except Exception as e:
            print(f"[!] System error writing to workspace state database: {e}")
