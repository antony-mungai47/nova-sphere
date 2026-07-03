import os

def fix_file(path, replacements):
    if not os.path.exists(path):
        return
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements:
        new_content = new_content.replace(old, new)
        
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed {path}")

def main():
    base_dir = r"C:\Users\charl\nova sphere market\nova-sphere"
    
    fix_file(os.path.join(base_dir, "scripts/db-audit.ts"), [
        ("audit.score <=", "audit.score.toNumber() <=")
    ])
    
    fix_file(os.path.join(base_dir, "src/app/admin/auctions/page.tsx"), [
        ("sum + a.currentBid", "sum + (a.currentBid ? a.currentBid.toNumber() : 0)")
    ])
    
    fix_file(os.path.join(base_dir, "src/app/admin/financials/page.tsx"), [
        ("sum + order.tax", "sum + order.tax.toNumber()"),
        ("sum + order.shippingCost", "sum + order.shippingCost.toNumber()"),
        ("sum + order.totalAmount", "sum + order.totalAmount.toNumber()")
    ])

    fix_file(os.path.join(base_dir, "src/app/admin/page.tsx"), [
        ("sum + order.totalAmount", "sum + order.totalAmount.toNumber()"),
        ("sum + o.totalAmount", "sum + o.totalAmount.toNumber()")
    ])

    fix_file(os.path.join(base_dir, "src/app/admin/settings/settings-form.tsx"), [
        ("value={setting.value}", "value={typeof setting.value === 'object' && setting.value !== null && 'toNumber' in setting.value ? (setting.value as any).toNumber() : setting.value}")
    ])
    
    fix_file(os.path.join(base_dir, "src/app/api/checkout/simulate-webhook/route.ts"), [
        ("amount: order.totalAmount,", "amount: order.totalAmount.toNumber(),")
    ])

    fix_file(os.path.join(base_dir, "src/app/auctions/[id]/page.tsx"), [
        ("amount: bid.amount,", "amount: bid.amount.toNumber(),"),
        ("amount: auction.currentBid,", "amount: auction.currentBid ? auction.currentBid.toNumber() : 0,"),
        ("amount: auction.startingPrice,", "amount: auction.startingPrice.toNumber(),"),
        ("amount: b.amount,", "amount: b.amount.toNumber(),")
    ])

    fix_file(os.path.join(base_dir, "src/app/order/[id]/invoice/page.tsx"), [
        ("order.tax >", "order.tax.toNumber() >"),
        ("order.shippingCost >", "order.shippingCost.toNumber() >"),
        ("order.tax > 0", "order.tax.toNumber() > 0"),
        ("order.shippingCost > 0", "order.shippingCost.toNumber() > 0")
    ])

    fix_file(os.path.join(base_dir, "src/app/product/[id]/page.tsx"), [
        ("price: p.price,", "price: p.price.toNumber(),"),
        ("salePrice: p.salePrice,", "salePrice: p.salePrice ? p.salePrice.toNumber() : null,")
    ])

    fix_file(os.path.join(base_dir, "src/domains/Marketplace/auctions/actions.ts"), [
        ("amount: amount,", "amount: new Decimal(amount),"),
        ("amount: amount", "amount: new Prisma.Decimal(amount)"), # depending on import, maybe Prisma.Decimal
        ("amount <=", "amount <=")
    ])

    fix_file(os.path.join(base_dir, "src/domains/Marketplace/Engines/SettlementEngine.ts"), [
        ("order.totalAmount", "order.amountTotal")
    ])

    fix_file(os.path.join(base_dir, "src/domains/Marketplace/Engines/WalletEngine.ts"), [
        ("wallet.balance <=", "wallet.balance.toNumber() <=")
    ])
    print("Done")

if __name__ == "__main__":
    main()
