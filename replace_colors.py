import sys

filepath = 'src/pages/QuizPage.jsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    '#f8f9fa': 'var(--surface-2)',
    '#ffffff': 'var(--surface)',
    '#eaeaea': 'var(--line-2)',
    '#e0e0e0': 'var(--line-2)',
    '#ccc': 'var(--line-2)',
    '#222': 'var(--ink)',
    '#111': 'var(--ink)',
    '#333': 'var(--ink)',
    '#555': 'var(--muted)',
    '#777': 'var(--muted)',
    '#888': 'var(--muted)',
    '#999': 'var(--muted)',
    '#1a7a3b': 'var(--teal)',
    '#eaf5ec': 'var(--teal-soft)',
    '#f0f7f2': 'var(--teal-soft)',
    '#145e2d': 'color-mix(in srgb, var(--teal) 80%, #000)',
    '#d32f2f': 'var(--crimson)',
    '#fdeaea': 'var(--crimson-soft)',
    '#fafafa': 'var(--surface-2)',
    '#f0f0f0': 'var(--surface-2)',
    '#eee': 'var(--line-2)',
    'stroke="#333"': 'stroke="currentColor"',
    "stroke='#333'": "stroke='currentColor'"
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
