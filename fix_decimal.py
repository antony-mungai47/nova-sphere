import os
import re

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
    
    # 1. src/app/admin/analytics/page.tsx
    fix_file(os.path.join(base_dir, "src/app/admin/analytics/page.tsx"), [
        ("sum + o.totalAmount", "sum + o.totalAmount.toNumber()"),
    ])

    # 2. src/app/admin/auctions/page.tsx
    fix_file(os.path.join(base_dir, "src/app/admin/auctions/page.tsx"), [
        ("sum + a.currentBid", "sum + (a.currentBid ? a.currentBid.toNumber() : 0)"),
        ("sum + a.currentBid.toNumber()", "sum + (a.currentBid ? a.currentBid.toNumber() : 0)"), 
        # wait, let me just replace some specific ones
        ("auction.currentBid >", "auction.currentBid.toNumber() >")
    ])

    # 3. src/app/admin/financials/page.tsx
    fix_file(os.path.join(base_dir, "src/app/admin/financials/page.tsx"), [
        ("sum + o.totalAmount", "sum + o.totalAmount.toNumber()"),
        ("sum + p.amount", "sum + p.amount.toNumber()")
    ])

    # 4. src/app/admin/page.tsx
    fix_file(os.path.join(base_dir, "src/app/admin/page.tsx"), [
        ("sum + o.totalAmount", "sum + o.totalAmount.toNumber()")
    ])

    # 5. src/app/admin/products/page.tsx
    fix_file(os.path.join(base_dir, "src/app/admin/products/page.tsx"), [
        ("price: p.price,", "price: p.price.toNumber(),")
    ])

    # 6. src/app/admin/settings/settings-form.tsx
    fix_file(os.path.join(base_dir, "src/app/admin/settings/settings-form.tsx"), [
        ("value={setting.value}", "value={typeof setting.value === 'object' && setting.value !== null && 'toNumber' in setting.value ? (setting.value as any).toNumber() : setting.value}")
    ])

    # 7. src/app/api/checkout/simulate-webhook/route.ts
    fix_file(os.path.join(base_dir, "src/app/api/checkout/simulate-webhook/route.ts"), [
        ("amount: order.totalAmount,", "amount: order.totalAmount.toNumber(),")
    ])

    # 8. src/app/auctions/[id]/page.tsx
    fix_file(os.path.join(base_dir, "src/app/auctions/[id]/page.tsx"), [
        ("amount: bid.amount,", "amount: bid.amount.toNumber(),"),
        ("amount: auction.currentBid,", "amount: auction.currentBid ? auction.currentBid.toNumber() : 0,"),
        ("amount: auction.startingPrice,", "amount: auction.startingPrice.toNumber(),"),
        ("currentBidAmount >=", "currentBidAmount >="),
        ("Number(newBid) <= auction.currentBid", "Number(newBid) <= auction.currentBid.toNumber()")
    ])

    # 9. src/app/auctions/page.tsx
    fix_file(os.path.join(base_dir, "src/app/auctions/page.tsx"), [
        ("auction.currentBid >", "auction.currentBid.toNumber() >"),
        ("a.currentBid || a.startingPrice", "a.currentBid?.toNumber() || a.startingPrice.toNumber()"),
        ("a.currentBid -", "a.currentBid.toNumber() -")
    ])

    # 10. src/app/checkout/simulate/page.tsx
    fix_file(os.path.join(base_dir, "src/app/checkout/simulate/page.tsx"), [
        ("item.price *", "item.price.toNumber() *")
    ])

    # 11. src/app/order/[id]/invoice/page.tsx
    fix_file(os.path.join(base_dir, "src/app/order/[id]/invoice/page.tsx"), [
        ("item.price *", "item.price.toNumber() *"),
        ("order.tax >", "order.tax.toNumber() >"),
        ("order.shippingCost >", "order.shippingCost.toNumber() >")
    ])

    # 12. src/app/orders/page.tsx
    fix_file(os.path.join(base_dir, "src/app/orders/page.tsx"), [
        ("item.price *", "item.price.toNumber() *")
    ])

    # 13. src/app/page.tsx
    fix_file(os.path.join(base_dir, "src/app/page.tsx"), [
        ("price: p.price,", "price: p.price.toNumber(),"),
        ("salePrice: p.salePrice,", "salePrice: p.salePrice ? p.salePrice.toNumber() : null,")
    ])

    # 14. src/app/product/[id]/page.tsx
    fix_file(os.path.join(base_dir, "src/app/product/[id]/page.tsx"), [
        ("price: product.price,", "price: product.price.toNumber(),"),
        ("salePrice: product.salePrice,", "salePrice: product.salePrice ? product.salePrice.toNumber() : null,"),
        ("price: p.price,", "price: p.price.toNumber(),"),
        ("salePrice: p.salePrice,", "salePrice: p.salePrice ? p.salePrice.toNumber() : null,")
    ])

    # 15. src/app/recommended/page.tsx
    fix_file(os.path.join(base_dir, "src/app/recommended/page.tsx"), [
        ("price: p.price,", "price: p.price.toNumber(),"),
        ("salePrice: p.salePrice,", "salePrice: p.salePrice ? p.salePrice.toNumber() : null,")
    ])

    # 16. src/app/store/page.tsx
    fix_file(os.path.join(base_dir, "src/app/store/page.tsx"), [
        ("price: p.price,", "price: p.price.toNumber(),"),
        ("salePrice: p.salePrice,", "salePrice: p.salePrice ? p.salePrice.toNumber() : null,")
    ])

    # 17. src/domains/Marketplace/auctions/actions.ts
    fix_file(os.path.join(base_dir, "src/domains/Marketplace/auctions/actions.ts"), [
        ("amount: amount", "amount: new Decimal(amount)"),
        ("amount +", "amount +"),
        ("amount <=", "amount <="),
        ("amount <= (auction.currentBid || auction.startingPrice)", "amount <= (auction.currentBid?.toNumber() || auction.startingPrice.toNumber())"),
        ("auction.currentBid +", "auction.currentBid.toNumber() +")
    ])

    # 18. src/domains/Marketplace/Engines/SettlementEngine.ts
    fix_file(os.path.join(base_dir, "src/domains/Marketplace/Engines/SettlementEngine.ts"), [
        ("order.total", "order.totalAmount")
    ])

    # 19. src/domains/Marketplace/Engines/WalletEngine.ts
    fix_file(os.path.join(base_dir, "src/domains/Marketplace/Engines/WalletEngine.ts"), [
        ("wallet.balance <=", "wallet.balance.toNumber() <=")
    ])

    print("Done fixes.")

if __name__ == "__main__":
    main()
