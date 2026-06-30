import os
import re

TARGET_DIR = r"C:\Users\charl\nova sphere market\nova-sphere\src\domains\Experience\components\home"

REPLACEMENTS = {
    r'\bbg-black\b': 'bg-background',
    r'\btext-white\b': 'text-primary',
    r'\btext-nova-silver\b': 'text-muted',
    r'\bborder-white/10\b': 'border-border-default',
    r'\bborder-white/20\b': 'border-border-default',
    r'\bborder-white/5\b': 'border-border-subtle',
    r'\bbg-white/5\b': 'bg-surface-elevated',
    r'\bbg-white/10\b': 'bg-surface-elevated hover:bg-surface-sunken',
    r'\bglass-panel\b': 'backdrop-blur-md bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-sm',
    r'\btext-nova-blue\b': 'text-accent',
    r'\bbg-nova-blue\b': 'bg-accent',
    r'\btext-nova-emerald\b': 'text-success',
    r'\bbg-nova-emerald\b': 'bg-success',
    r'\btext-nova-amber\b': 'text-warning',
    r'\bbg-nova-amber\b': 'bg-warning',
    r'\bbg-nova-charcoal\b': 'bg-surface',
}

def migrate_tokens(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    for pattern, replacement in REPLACEMENTS.items():
        new_content = re.sub(pattern, replacement, new_content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Migrated tokens in {os.path.basename(file_path)}")

if __name__ == "__main__":
    for root, _, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith('.tsx'):
                migrate_tokens(os.path.join(root, file))
