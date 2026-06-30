import os

files = [
    'src/app/auctions/[id]/page.tsx',
    'src/app/error.tsx',
    'src/app/seller/page.tsx'
]

for file in files:
    if os.path.exists(file):
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        if 'import Link from \"next/link\"' not in content and 'import Link from \'next/link\'' not in content:
            if 'import ' in content:
                content = content.replace('import ', 'import Link from \"next/link\";\nimport ', 1)
            else:
                content = 'import Link from \"next/link\";\n' + content

        content = content.replace('<a href=\"/sign-in/\">', '<Link href=\"/sign-in/\">').replace('</a>', '</Link>')
        content = content.replace('<a href=\"/\">', '<Link href=\"/\">')

        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
