import json
import re
import urllib.parse
import os
import glob

files_to_recover = [
    r"c:\Users\bhave\cgpsc-quiz\functions\utils\auth.js",
    r"c:\Users\bhave\cgpsc-quiz\functions\api\_middleware.js",
    r"c:\Users\bhave\cgpsc-quiz\functions\api\[table].js",
    r"c:\Users\bhave\cgpsc-quiz\functions\api\quiz\[id]\submit.js",
    r"c:\Users\bhave\cgpsc-quiz\functions\api\user\revision\submit.js",
    r"c:\Users\bhave\cgpsc-quiz\functions\api\user\revision\stats.js",
    r"c:\Users\bhave\cgpsc-quiz\functions\api\user\revision\index.js",
    r"c:\Users\bhave\cgpsc-quiz\functions\utils\rebuild.js",
    r"c:\Users\bhave\cgpsc-quiz\src\supabase.js",
    r"c:\Users\bhave\cgpsc-quiz\src\pages\RevisionPage.jsx",
    r"c:\Users\bhave\cgpsc-quiz\src\revision\revision-controller.js",
    r"c:\Users\bhave\cgpsc-quiz\src\api\revision.js",
    r"c:\Users\bhave\cgpsc-quiz\src\pages\ResultPage.jsx",
    r"c:\Users\bhave\cgpsc-quiz\src\pages\QuizPage.jsx",
    r"c:\Users\bhave\cgpsc-quiz\src\pages\SubjectPage.jsx",
    r"c:\Users\bhave\cgpsc-quiz\src\pages\LoginPage.jsx",
    r"c:\Users\bhave\cgpsc-quiz\src\App.jsx"
]

logs_to_search = glob.glob(r"C:\Users\bhave\.gemini\antigravity\brain\*\.system_generated\logs\transcript_full.jsonl")

# Sort logs by creation time so we get the EARLIEST views (before any modifications)
logs_to_search.sort(key=os.path.getctime)

recovered_lines = {f: {} for f in files_to_recover}

for log_file in logs_to_search:
    # Skip logs where files were modified
    modified = False
    with open(log_file, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                if data.get('type') == 'PLANNER_RESPONSE' and 'tool_calls' in data:
                    for tc in data['tool_calls']:
                        if tc['name'].split(':')[-1] in ['multi_replace_file_content', 'replace_file_content', 'write_to_file', 'run_command']:
                            args = str(tc.get('args', tc.get('arguments', {})))
                            if any(os.path.basename(f) in args for f in files_to_recover):
                                modified = True
            except Exception:
                pass
                
    if modified:
        continue # Skip logs that made edits

    with open(log_file, 'r', encoding='utf-8') as f:
        for line in f:
            try:
                data = json.loads(line)
                if data.get('type') == 'VIEW_FILE':
                    c = urllib.parse.unquote(data.get('content', '')).replace('\\', '/')
                    m_path = re.search(r'File Path: `file:///(.*?)`', c)
                    if not m_path:
                        continue
                    
                    actual_path = m_path.group(1).lower()
                    
                    for target_file in files_to_recover:
                        target_comp = target_file.replace('\\', '/').lower()
                        if target_comp.endswith(actual_path) or actual_path.endswith(target_comp):
                            started = False
                            for l in data['content'].split('\n'):
                                l = l.strip('\r')
                                if l.startswith('The following code has been modified'):
                                    started = True
                                    continue
                                if l.startswith('The above content does NOT show') or l.startswith('Tool call returned error'):
                                    break
                                if started:
                                    m = re.match(r'^(\d+):\s(.*)$', l)
                                    if m:
                                        recovered_lines[target_file][int(m.group(1))] = m.group(2)
                                    else:
                                        m2 = re.match(r'^(\d+):$', l)
                                        if m2:
                                            recovered_lines[target_file][int(m2.group(1))] = ""
            except Exception:
                pass

for target_file, lines_dict in recovered_lines.items():
    if lines_dict:
        max_line = max(lines_dict.keys())
        print(f"Recovered {target_file} up to line {max_line}")
        os.makedirs(os.path.dirname(target_file), exist_ok=True)
        with open(target_file, "w", encoding="utf-8", newline='\n') as out:
            for i in range(1, max_line + 1):
                out.write(lines_dict.get(i, "") + '\n')
    else:
        print(f"Failed to find any lines for {target_file}")
