import glob, os

for path in glob.glob('src/**/*.tsx', recursive=True):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    if 'framer-motion' in content and 'use client' not in content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write('"use client";\n' + content)
        print('Added use client to', path)
