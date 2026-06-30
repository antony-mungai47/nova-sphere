import os
import re

def wrap_with_fragment(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The file has something like:
    # return (
    #   
    #     <div>
    # ...
    #   
    # );
    
    # We can just replace `return (` with `return (<>` and `);` with `</>);`
    new_content = re.sub(r'return\s*\(\s*', r'return (<>', content, count=1)
    new_content = re.sub(r'\s*\);\s*$', r'</>);\n', new_content)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

def fix_trending(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace `=true}` which was `glow=true}`
    new_content = content.replace("={true}", "")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

if __name__ == "__main__":
    for p in ['careers', 'contact', 'help', 'investors', 'press']:
        path = rf"C:\Users\charl\nova sphere market\nova-sphere\src\app\{p}\page.tsx"
        if os.path.exists(path):
            wrap_with_fragment(path)
            print(f"Fixed {path}")
            
    trending = r"C:\Users\charl\nova sphere market\nova-sphere\src\domains\Experience\components\home\trending-products.tsx"
    if os.path.exists(trending):
        fix_trending(trending)
        print("Fixed trending-products.tsx")
