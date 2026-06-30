import os
import re

def fix_layout_syntax(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = re.sub(r'return\s*\(\s*<>\s*<MainLayout[^>]*>', r'return (', content)
    new_content = re.sub(r'</MainLayout>\s*</>', r'', new_content)

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

if __name__ == "__main__":
    for p in ['careers', 'contact', 'help', 'investors', 'press']:
        path = rf"C:\Users\charl\nova sphere market\nova-sphere\src\app\{p}\page.tsx"
        if os.path.exists(path):
            fix_layout_syntax(path)
            print(f"Fixed {path}")
