import os
import re

def fix_file(file_path, fixes):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in fixes:
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {file_path}")

def fix_all():
    # 1. careers, help, investors, press (missing layout)
    for p in ['careers', 'help', 'investors', 'press', 'contact']:
        file_path = rf"C:\Users\charl\nova sphere market\nova-sphere\src\app\{p}\page.tsx"
        if os.path.exists(file_path):
            fix_file(file_path, [
                ('import MainLayout from "@/shared/components/layout/main-layout";\n', ''),
                ('<MainLayout>', ''),
                ('</MainLayout>', ''),
                ('asChild', '')
            ])
            
    # 2. navbar.tsx (Sparkles and asChild)
    navbar = r"C:\Users\charl\nova sphere market\nova-sphere\src\shared\components\layout\navbar.tsx"
    fix_file(navbar, [
        ('Sparkles, ', ''),
        (', Sparkles', ''),
        (' asChild', ''),
        ('asChild ', '')
    ])
    
    # 3. icons index (missing lucide-react exports)
    icons = r"C:\Users\charl\nova sphere market\nova-sphere\src\shared\components\icons\index.ts"
    fix_file(icons, [
        ('Github, ', ''),
        (', Twitter, Facebook, Instagram, Linkedin', '')
    ])

    # 4. Button Component children
    button = r"C:\Users\charl\nova sphere market\nova-sphere\src\shared\components\ui\button.tsx"
    fix_file(button, [
        ('{!isIconOnly && children}', '{!isIconOnly && (children as React.ReactNode)}')
    ])

    # 5. Empty State className
    empty_state = r"C:\Users\charl\nova sphere market\nova-sphere\src\shared\components\ui\empty-state.tsx"
    fix_file(empty_state, [
        ('<Icon className=', '<div className=')
    ])

    # 6. layout.tsx Clerk appearance
    layout = r"C:\Users\charl\nova sphere market\nova-sphere\src\app\layout.tsx"
    # we need to import dark from @clerk/themes, wait...
    # The error is Type '{ baseTheme: ... }' is not assignable to type 'Appearance<Theme> | undefined'.
    # I can just remove baseTheme from layout.tsx
    fix_file(layout, [
        ('appearance={{\n            baseTheme: dark,\n          }}', '')
    ])
    
    # 7. trending products glow property
    trending = r"C:\Users\charl\nova sphere market\nova-sphere\src\domains\Experience\components\home\trending-products.tsx"
    fix_file(trending, [
        (' glow', '')
    ])

    # 8. skeleton in store/loading.tsx
    store_loading = r"C:\Users\charl\nova sphere market\nova-sphere\src\app\store\loading.tsx"
    fix_file(store_loading, [
        ('import { Skeleton } from "@/shared/components/ui/skeleton";', 'import { LoadingSkeleton } from "@/shared/components/ui/loading-skeleton";'),
        ('<Skeleton ', '<LoadingSkeleton ')
    ])

if __name__ == "__main__":
    fix_all()
