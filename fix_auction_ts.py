import os
import re

files_to_fix = {
    'prisma/seed-auctions.ts': [
        (r'status:\s*[\'"]ACTIVE[\'"]', 'status: "LIVE"')
    ],
    'src/app/admin/auctions/page.tsx': [
        (r'status === [\'"]ACTIVE[\'"]', 'status === "LIVE"')
    ],
    'src/app/auctions/[id]/page.tsx': [
        (r'\.startingBid', '.baseAmount')
    ],
    'src/app/auctions/page.tsx': [
        (r'status:\s*[\'"]ACTIVE[\'"]', 'status: "LIVE"'),
        (r'product:', 'include: { product: true },\n      product:'),
        (r'\.startingBid', '.baseAmount'),
        (r'include:\s*{\s*_count:\s*{\s*select:\s*{\s*bids:\s*true\s*}\s*}\s*}', 'include: { product: { include: { images: true } }, _count: { select: { bids: true } } }')
    ],
    'src/domains/Marketplace/auctions/actions.ts': [
        (r'status === [\'"]ACTIVE[\'"]', 'status === "LIVE"'),
        (r'\.startingBid', '.baseAmount')
    ],
    'src/domains/Marketplace/auctions/repositories/auction.repository.ts': [
        (r'status:\s*[\'"]ACTIVE[\'"]', 'status: "LIVE"')
    ]
}

def fix():
    for filepath, replacements in files_to_fix.items():
        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            for pattern, repl in replacements:
                content = re.sub(pattern, repl, content)
            
            # special fix for src/app/auctions/page.tsx product include
            if filepath == 'src/app/auctions/page.tsx' and 'include: {' not in content:
               content = content.replace('findMany({', 'findMany({\n    include: { product: { include: { images: true } }, _count: { select: { bids: true } } },') 
            
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Fixed {filepath}")
        else:
            print(f"Not found: {filepath}")

if __name__ == '__main__':
    fix()
