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
    # 1. validate-crud.ts
    validate_crud = r"C:\Users\charl\nova sphere market\nova-sphere\scripts\validate-crud.ts"
    if os.path.exists(validate_crud):
        fix_file(validate_crud, [
            ('action: "SYSTEM_START"', 'actionType: "SYSTEM_START"'),
            ('action: "SYSTEM_ERROR"', 'actionType: "SYSTEM_ERROR"')
        ])

    # 2. products-client.tsx (glow)
    products_client = r"C:\Users\charl\nova sphere market\nova-sphere\src\app\admin\products\products-client.tsx"
    if os.path.exists(products_client):
        fix_file(products_client, [
            (' glow', '')
        ])

    # 3. checkout simulate (AnimatedButton)
    simulate_page = r"C:\Users\charl\nova sphere market\nova-sphere\src\app\checkout\simulate\page.tsx"
    if os.path.exists(simulate_page):
        fix_file(simulate_page, [
            ('import { AnimatedButton } from "@/shared/components/ui/animated-button";', 'import { Button } from "@/shared/components/ui/button";'),
            ('<AnimatedButton', '<Button'),
            ('</AnimatedButton>', '</Button>')
        ])

    # 4. checkout success (glow)
    success_page = r"C:\Users\charl\nova sphere market\nova-sphere\src\app\checkout\success\page.tsx"
    if os.path.exists(success_page):
        fix_file(success_page, [
            (' glow', '')
        ])

    # 5. seller page (glow)
    seller_page = r"C:\Users\charl\nova sphere market\nova-sphere\src\app\seller\page.tsx"
    if os.path.exists(seller_page):
        fix_file(seller_page, [
            (' glow', '')
        ])

    # 6. MainLayout imports in placeholders
    for p in ['careers', 'contact', 'help', 'investors', 'press']:
        path = rf"C:\Users\charl\nova sphere market\nova-sphere\src\app\{p}\page.tsx"
        if os.path.exists(path):
            fix_file(path, [
                ('import { MainLayout } from "@/shared/components/layout/main-layout";\n', ''),
                ('import MainLayout from "@/shared/components/layout/main-layout";\n', '')
            ])

    # 7. layout.tsx Clerk appearance
    layout = r"C:\Users\charl\nova sphere market\nova-sphere\src\app\layout.tsx"
    if os.path.exists(layout):
        fix_file(layout, [
            ('const clerkAppearance = activeTheme.mode === "dark" ? { baseTheme: dark as any } : undefined;', 'const clerkAppearance = activeTheme.mode === "dark" ? { baseTheme: dark } as any : undefined;')
        ])

    # 8. navbar.tsx Sparkles
    navbar = r"C:\Users\charl\nova sphere market\nova-sphere\src\shared\components\layout\navbar.tsx"
    if os.path.exists(navbar):
        # Let's import Sparkles from lucide-react instead of @/shared/components/icons
        fix_file(navbar, [
            ('import { Menu, Search, ShoppingCart, User, Bell, Package, Check, X, LogOut, Settings } from "lucide-react";', 'import { Menu, Search, ShoppingCart, User, Bell, Package, Check, X, LogOut, Settings, Sparkles } from "lucide-react";')
        ])

    # 9. footer.tsx missing icons
    footer = r"C:\Users\charl\nova sphere market\nova-sphere\src\shared\components\layout\footer.tsx"
    if os.path.exists(footer):
        fix_file(footer, [
            ('import { Facebook, Twitter, Instagram, Linkedin } from "@/shared/components/icons";', 'import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";')
        ])

if __name__ == "__main__":
    fix_all()
