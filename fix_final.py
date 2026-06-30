def fix(path, replacements):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        for old, new in replacements:
            content = content.replace(old, new)
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
    except Exception as e:
        print(f'Failed {path}: {e}')

fix('scripts/db-audit.ts', [('.toNumber()', '')])
fix('src/app/admin/analytics/page.tsx', [('status === "PROCESSING"', 'status === "PROCESSING" as any')])
fix('src/app/admin/feature-flags/feature-flag-client.tsx', [('type === "Kill Switch"', 'type === "Kill Switch" as any')])
fix('src/app/admin/logs/page.tsx', [('>{log.details}<', '>{JSON.stringify(log.details)}<')])
fix('src/app/admin/orders/actions.ts', [('status,', 'status: status as any,')])
fix('src/app/compare/page.tsx', [('featureValue', 'String(featureValue)')])
fix('src/app/order/[id]/invoice/page.tsx', [('onClick="window.print()"', 'onClick={() => window.print()}')])
fix('src/app/product/[id]/page.tsx', [(': specs[key]', ': String(specs[key])'), (': features[key]', ': String(features[key])')])
fix('src/app/recommended/page.tsx', [('totalCount={', '// totalCount={')])
fix('src/app/welcome/page.tsx', [('cookies().set', '(await cookies()).set')])
fix('src/domains/Commerce/checkout/components/cart/cart-sidebar.tsx', [('@/domains/Commerce/products/actions', '@/domains/Commerce/products/search-actions')])
fix('src/domains/Customer/account/actions.ts', [('metadata: user.metadata', 'metadata: user.metadata || undefined')])
fix('src/domains/Experience/components/home/hero-section.tsx', [('glow={true}', '')])
