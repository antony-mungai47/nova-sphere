import os
import re

TARGET_DIRS = [
    r"C:\Users\charl\nova sphere market\nova-sphere\src\domains\Commerce\checkout\components\cart\cart-sidebar.tsx",
    r"C:\Users\charl\nova sphere market\nova-sphere\src\app\checkout\page.tsx"
]

REPLACEMENTS = {
    r'\bbg-black\b': 'bg-background',
    r'\btext-white\b': 'text-primary',
    r'\btext-nova-silver\b': 'text-muted',
    r'\bborder-white/10\b': 'border-border-default',
    r'\bborder-white/20\b': 'border-border-default',
    r'\bborder-white/5\b': 'border-border-subtle',
    r'\bborder-white/50\b': 'border-primary',
    r'\bbg-white/5\b': 'bg-surface-elevated',
    r'\bbg-white/10\b': 'bg-surface-elevated hover:bg-surface-sunken',
    r'\bglass-panel\b': 'backdrop-blur-md bg-surface-elevated border border-border-subtle shadow-sm',
    r'\btext-nova-blue\b': 'text-accent',
    r'\bbg-nova-blue\b': 'bg-accent',
    r'\bborder-nova-blue\b': 'border-accent',
    r'\bfill-nova-amber\b': 'fill-warning',
    r'\btext-nova-amber\b': 'text-warning',
    r'\bbg-nova-amber\b': 'bg-warning',
    r'\bborder-nova-amber\b': 'border-warning',
    r'\btext-nova-emerald\b': 'text-success',
    r'\bbg-nova-emerald\b': 'bg-success',
    r'\bbg-nova-charcoal\b': 'bg-surface',
    r'\btext-nova-charcoal\b': 'text-foreground',
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
    for target in TARGET_DIRS:
        if os.path.isfile(target):
            if target.endswith('.tsx'):
                migrate_tokens(target)
        else:
            for root, _, files in os.walk(target):
                for file in files:
                    if file.endswith('.tsx'):
                        migrate_tokens(os.path.join(root, file))
