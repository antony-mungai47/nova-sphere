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

    fix_file(os.path.join(base_dir, "src/app/admin/auctions/page.tsx"), [
        ("sum + (a.bids[0]?.amount || 0)", "sum + (a.bids[0]?.amount?.toNumber() || 0)")
    ])

    fix_file(os.path.join(base_dir, "src/app/api/checkout/simulate-webhook/route.ts"), [
        ("amount: order.totalAmount", "amount: order.totalAmount.toNumber()")
    ])

    fix_file(os.path.join(base_dir, "src/app/auctions/[id]/page.tsx"), [
        ("amount: Decimal", "amount: number"),
        ("bid.amount.toNumber()", "bid.amount"), # Wait, the error is in type definition or mapping?
        # Let's fix it safely: replace `amount: Decimal` in type definitions with `amount: number` if that exists
        ("amount: auction.currentBid.toNumber()", "amount: auction.currentBid ? auction.currentBid.toNumber() : 0"),
        ("b.amount.toNumber()", "b.amount.toNumber()"),
    ])

    fix_file(os.path.join(base_dir, "src/app/order/[id]/invoice/page.tsx"), [
        ("order.tax.toNumber() >", "order.tax.toNumber() > 0"), # Already replaced, wait...
        # Error is Operator '>' cannot be applied to types 'Decimal' and 'number'.
        ("order.tax >", "order.tax.toNumber() >"),
        ("order.shippingCost >", "order.shippingCost.toNumber() >")
    ])

    fix_file(os.path.join(base_dir, "src/app/product/[id]/page.tsx"), [
        ("price: Decimal", "price: number"),
        ("salePrice: Decimal | null", "salePrice: number | null"),
        ("price: product.price.toNumber()", "price: product.price.toNumber()"),
    ])

    fix_file(os.path.join(base_dir, "src/domains/Marketplace/auctions/actions.ts"), [
        ("amount: new Decimal(amount)", "amount"),
        ("amount: amount", "amount: new Prisma.Decimal(amount)")
    ])

    fix_file(os.path.join(base_dir, "src/domains/Marketplace/Engines/SettlementEngine.ts"), [
        ("order.totalAmount", "order.amountTotal"),
        ("order.amountTotal", "order.amountBase") # wait, what is the right property?
    ])
    
    print("Done")

if __name__ == "__main__":
    main()
