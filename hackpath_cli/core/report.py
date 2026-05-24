# -*- coding: utf-8 -*-
import json
from pathlib import Path

class ReportGenerator:
    """Consolidates intelligence accumulated in a workspace into a readable outline document."""
    
    def assemble(self, workspace: str, findings: list, title: str, template_style: str, out_format: str, lang: str = "en") -> Path:
        output_dir = Path(__file__).parent.parent / "reports"
        output_dir.mkdir(parents=True, exist_ok=True)

        if out_format == "json":
            out_file = output_dir / f"{workspace}_report.json"
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump({"title": title, "style": template_style, "findings": findings}, f, indent=4)
            return out_file

        title_lbl = title if title else f"CTF Hackpath Report: {workspace}"
        
        # Build Markdown content
        md_lines = []
        md_lines.append(f"# {title_lbl}")
        md_lines.append("")
        if lang == "it":
            md_lines.append(f"- **Area Workspace**: `{workspace}`")
            md_lines.append(f"- **Template Estetico**: `{template_style}`")
            md_lines.append("- **Firma**: Generato automaticamente tramite *hackpath CLI*")
        else:
            md_lines.append(f"- **Active Workspace**: `{workspace}`")
            md_lines.append(f"- **Dossier Template**: `{template_style}`")
            md_lines.append("- **Generator**: Compiled automatically via *hackpath CLI*")
        
        md_lines.append("\n---\n")
        
        if not findings:
            if lang == "it":
                md_lines.append("## Nessun indizio o vulnerabilità censita nel database.")
            else:
                md_lines.append("## No active findings stored in this target workspace archive.")
        else:
            if lang == "it":
                md_lines.append(f"## Indizi registrati ({len(findings)})")
            else:
                md_lines.append(f"## Registered Lab Evidence ({len(findings)})")
                
            md_lines.append("")
            for idx, item in enumerate(findings, 1):
                f_name = item.get("name", "Unknown-Trace")
                f_type = item.get("type", "info").upper()
                f_val = item.get("value", "N/A")
                f_note = item.get("notes", "")

                md_lines.append(f"### {idx}. [{f_type}] {f_name}")
                md_lines.append(f"- **Value/Symptom**: `{f_val}`")
                if f_note:
                    md_lines.append(f"- **Details/Learning Notes**: *{f_note}*")
                md_lines.append("")

        md_content = "\n".join(md_lines)

        if out_format == "markdown" or out_format == "md":
            out_file = output_dir / f"{workspace}_report.md"
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(md_content)
            return out_file

        # HTML generation
        if out_format == "html":
            out_file = output_dir / f"{workspace}_report.html"
            html_template = f"""<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{title_lbl}</title>
    <style>
        body {{ font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #0f172a; color: #cbd5e1; padding: 2.5rem; max-width: 800px; margin: 0 auto; line-height: 1.6; }}
        h1 {{ border-bottom: 2px solid #6366f1; padding-bottom: 0.5rem; color: #f8fafc; font-size: 2rem; }}
        h2 {{ color: #a5b4fc; font-size: 1.3rem; margin-top: 2rem; border-left: 4px solid #4f46e5; padding-left: 0.5rem; }}
        h3 {{ color: #e2e8f0; font-size: 1.15rem; margin-top: 1.5rem; font-family: monospace; }}
        code {{ background-color: #1e293b; padding: 0.2rem 0.4rem; border-radius: 4px; color: #818cf8; font-family: monospace; }}
        ul {{ padding-left: 1.25rem; }}
        .item-box {{ padding: 1rem; background-color: #111827; border: 1px solid #1f2937; border-radius: 6px; margin-bottom: 1rem; }}
    </style>
</head>
<body>
    <h1>{title_lbl}</h1>
    <p><strong>Workspace:</strong> <code>{workspace}</code></p>
    <p><strong>Theme:</strong> <code>{template_style}</code></p>
    <hr style="border: 1px solid #1f2937; margin: 2rem 0;">
    
    <h2>{"Ritrovamenti estratti" if lang == "it" else "Extracted Findings log"}</h2>
    {"".join(f'''
    <div class="item-box">
        <h3>[{f.get("type", "info").upper()}] {f.get("name", "Unknown-Trace")}</h3>
        <p><strong>Value:</strong> <code>{f.get("value", "N/A")}</code></p>
        <p><em>{f.get("notes", "")}</em></p>
    </div>
    ''' for f in findings)}
</body>
</html>
"""
            with open(out_file, "w", encoding="utf-8") as f:
                f.write(html_template)
            return out_file

        return Path()
