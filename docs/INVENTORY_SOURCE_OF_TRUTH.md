# Inventory Source of Truth

How available inventory is determined across the Charmed & Dark storefront.

## Core Utility

`lib/inventory.js` provides two functions:

- `getAvailableInventory({ productQty, variantQuantityAvailable })` — returns available stock as a number, or `null` if the product is unlimited/POD.
- `calculateAddableQuantity({ requested, alreadyInCart, available })` — returns how many units can actually be added given inventory constraints.

## Decision Logic

```
1. If Shopify variant has quantityAvailable AND it's < 900 → use that
2. Else if Supabase product.qty is < 900 → use that
3. Else → treat as unlimited (return null, don't cap)
```

The threshold of **900** marks the boundary between real on-hand stock and print-on-demand/made-to-order products (which use `qty = 999` in Supabase).

## Data Sources

| Source | Field | Used When |
|--------|-------|-----------|
| Supabase `products` table | `qty` | Product-level stock for non-variant items (candles, trays, bags) |
| Supabase `product_variants` table | `stock_quantity` | Variant-level stock (earring colors, sheet sizes) |
| Shopify Storefront API | `variant.quantityAvailable` | Shopify-managed inventory for apparel/POD variants |

## Product Types

| Type | Vendor | qty Value | Behavior |
|------|--------|-----------|----------|
| On-hand physical goods | Charmed & Dark | 0–50 typical | Capped at actual qty |
| Print-on-demand apparel | Printify | 999 | Unlimited — no cap applied |
| Shopify-managed variants | Various | Ignored if Shopify data present | Uses Shopify quantityAvailable |

## Where Inventory is Enforced

| Location | File | Logic |
|----------|------|-------|
| Product card (grid) | `components/shop/ProductCard.js` | `product.qty <= 0` shows OUT OF STOCK overlay |
| Homepage product section | `components/homepage-product-section.js` | `product.qty <= 0` shows overlay + hides price |
| Product detail — quantity selector | `app/shop/[slug]/AddToCart.js` | + button respects `getAvailableInventory()` minus cart quantity |
| Product detail — add to cart | `app/shop/[slug]/AddToCart.js` | `calculateAddableQuantity()` caps before adding |
| Cart drawer — quantity controls | `components/SlideOutCart.js` | + button checks `item.availableQty`, blocks at max |
| Cart drawer — checkout guard | `components/SlideOutCart.js` | Pre-checkout validation blocks if any line exceeds stock |

## How availableQty Flows Through the System

1. **Add to Cart** computes `available` via `getAvailableInventory()` and passes it as `product.availableQty` to `addItem()`
2. **CartContext** stores `availableQty` per cart line item in localStorage-persisted state
3. **SlideOutCart** reads `item.availableQty` for both increment capping and checkout guard

## PostHog Events

| Event | Fired When |
|-------|-----------|
| `inventory_quantity_limited` | User attempts to add/increment beyond available stock (product page or cart) |
| `checkout_blocked_inventory` | User attempts checkout with cart lines exceeding stock |
| `add_to_cart` | Successful add (includes quantity added) |
| `checkout_started` | Checkout proceeds after guard passes |

## Edge Cases

- **null availableQty**: Treated as unlimited. No capping, no blocking.
- **Stale cart data**: If a user leaves items in cart overnight and stock depletes, the checkout guard catches it. Shopify also rejects at cart creation if truly oversold.
- **Variant price changes**: CartContext uses the price at time of add. Final price is recalculated by Shopify at checkout.
