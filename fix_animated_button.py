import os
import re

TARGET_DIR = r"C:\Users\charl\nova sphere market\nova-sphere\src"

def fix_animated_button(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # Replace import
    new_content = re.sub(r'import\s+{\s*AnimatedButton\s*}\s+from\s+"@/shared/components/ui/animated-button";?', r'import { Button } from "@/shared/components/ui/button";', new_content)
    
    # Replace JSX component
    new_content = re.sub(r'<AnimatedButton\b', r'<Button', new_content)
    new_content = re.sub(r'</AnimatedButton>', r'</Button>', new_content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed AnimatedButton in {os.path.basename(file_path)}")

if __name__ == "__main__":
    for root, _, files in os.walk(TARGET_DIR):
        for file in files:
            if file.endswith('.tsx'):
                fix_animated_button(os.path.join(root, file))
