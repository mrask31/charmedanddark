# Inventory Source of Truth

How available inventory is determined across the Charmed & Dark storefront.

## Core Utility

`lib/inventory.js` provides two functions:

- `getAvailableInventory({ productQty, variantQuantityAvailable })` — returns available stock as a number, or `null` if the product is unlimited/POD.
- `calculateAddableQuantity({ requested, alreadyInCart, available })` — returns how many units can actually be added given inventory constraints.

## Decision Logic

```
1. If Shopify variant has quantityAvailable AND it's < 900 → use that
2. Else if Supabase product.qty is set AND < 900 → use that
3. Else (qty >= 900 OR qty is null with no Shopify data) → return null (no client-side cap)
```

The threshold of **900** marks the boundary between real on-hand stock and print-on-demand/made-to-order products (which use `qty = 999` in Supabase).

### Origin of the 999 Convention

In `app/api/admin/sync-products/route.js`, the Shopify product sync pipeline sets:

```js
const isMadeToOrder = isPrintify || sp.vendor === 'Charmed & Dark';
const stockQty = isMadeToOrder ? 999 : (sp.totalInventory ?? ...);
```

Any product with vendor "Printify" or "Charmed & Dark" is marked as made-to-order and synced with `qty = 999`. The `UNLIMITED_THRESHOLD = 900` in `lib/inventory.js` catches these products and treats them as unlimited — no inventory cap is applied.

### Null/Undefined qty Behavior

| Scenario | Current State | Behavior |
|----------|--------------|----------|
| `qty = null` in database | **0 products** currently have null qty | No client-side cap; Shopify enforces at checkout |
| `qty = null` AND no Shopify variant data | Hypothetical (manual DB entry) | No client-side cap; quantity selector hard-caps at 10; Shopify Storefront API rejects invalid quantities at cart creation |

**Why this is safe:**
- The sync pipeline always writes `qty` for every synced product (999 for POD, actual stock for physical)
- Currently 0 products have null qty (verified via database audit)
- Even if null-qty products existed, the quantity selector limits to 10, and Shopify rejects invalid cart lines at checkout
- The checkout guard only blocks items where `availableQty != null && quantity > availableQty` — null-qty items pass through to Shopify's own validation

**If this changes in the future:**
- If physical products are ever created manually without the sync pipeline, they should have `qty` set explicitly
- Consider adding a `NOT NULL DEFAULT 0` constraint to the `qty` column to enforce this at the database level

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

- **qty >= 900 (POD)**: Treated as unlimited. No capping, no blocking. Convention from sync pipeline.
- **qty = null/undefined**: No client-side cap applied. Quantity selector hard-caps at 10. Shopify enforces at checkout. Currently 0 products have null qty — all products go through sync pipeline which always writes qty.
- **null availableQty in cart**: Items stored with null availableQty are excluded from checkout guard checks — they pass through to Shopify validation.
- **Stale cart data**: If a user leaves items in cart overnight and stock depletes, the checkout guard catches it if `availableQty` was stored at add-time. Shopify also rejects at cart creation if truly oversold.
- **Variant price changes**: CartContext uses the price at time of add. Final price is recalculated by Shopify at checkout.
- **Manual DB products**: If a product is ever created directly in Supabase without the sync pipeline, ensure `qty` is set. Without qty, no client-side inventory cap will be applied.
