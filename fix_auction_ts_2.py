import os
import re

files_to_fix = {
    'prisma/seed-auctions.ts': [
        (r'startingBid:', 'baseAmount:')
    ],
    'src/app/auctions/page.tsx': [
        (r'include:\s*{\s*product:', 'include: {\n        product:')
    ],
    'src/domains/Marketplace/auctions/actions.ts': [
        (r'status === [\'"]ACTIVE[\'"]', 'status === "LIVE"')
    ]
}

def fix():
    for filepath, replacements in files_to_fix.items():
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            for pattern, repl in replacements:
                content = re.sub(pattern, repl, content)
            
            # special fix for src/app/auctions/page.tsx
            if filepath == 'src/app/auctions/page.tsx':
                # ensure include is inside findMany correctly
                content = content.replace("findMany({\n    include: { product: { include: { images: true } }, _count: { select: { bids: true } } },", "findMany(")
                content = content.replace("orderBy:", "include: { product: { include: { images: true } }, _count: { select: { bids: true } } },\n      orderBy:")

            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {filepath}")
        else:
            print(f"Not found: {filepath}")

if __name__ == '__main__':
    fix()
