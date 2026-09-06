# Commerce migration: customer, UI/UX and SEO release gates

The commerce migration must preserve a usable production storefront throughout. A passing build is necessary, but is not a release approval: the customer journeys, catalog parity and SEO checks below must also pass on the deployment that will be promoted. Keep the current production deployment serving traffic while the candidate is built and verified. Use additive data changes and retain the last working deployment and product identity mappings for rollback.

## Baseline observed on September 6, 2026

Production code baseline: `9221b11c13684e13d6d51894c12c41265cf93781` on **main**. The GitHub default branch `master` was not the production branch. Confirm the production SHA again before a release.

The public customer journey was checked in Chrome at a real viewport of **1363 × 936**. The browser available for this initial check did not expose viewport resizing or mobile emulation. **This is desktop evidence; it is not a mobile test.**

| Journey | Observed result |
| --- | --- |
| Home → Shop Best Sellers → Kiss Lock Bags | Navigation works; collection contains nine linked bags. |
| Celestial Kisslock Bag → next gallery image | Hero image changes; gallery thumbnails and controls render. |
| Physical bag → Add to Cart | One bag adds at $26.99. Increasing the quantity to two changes subtotal to $53.98. |
| Shop → Apparel | Filter switches to the apparel group and shows linked products. |
| Gothic Softstyle Tee → White → S → Add to Cart | Selected controls expose `aria-pressed`; mixed cart contains the tee at $24.99. |
| Reload → reopen saved cart | Two bags and one tee survive reload; subtotal remains $78.97. |
| Proceed to Checkout | Shopify opens with White / S tee quantity one at $24.99 and bag quantity two at $53.98; subtotal $78.97. |
| Checkout boundary | No contact, address or payment information entered. No payment or order submitted. Shipping, tax and fulfillment were not tested. |
| Console | No storefront-origin errors observed during these actions. Browser-extension metadata errors were present and excluded by origin. |

The initial HTTP check returned nine successful public pages, **107 unique shop product links**, **114 sitemap URLs**, and **389 Merchant feed items**. These are a dated snapshot, not permanent inventory or stock expectations. The complete JSON report preserves exact URLs and feed IDs for comparison.

### Existing defects, not acceptable target behavior

| Existing issue | Required target behavior |
| --- | --- |
| No canonical on home, shop, collections, Drops, Journal or sample product pages. | Every indexable page emits one canonical to its final production URL. Variant query parameters do not create competing product canonicals. |
| Both collection titles append `Charmed & Dark` twice. | One brand suffix, with distinct descriptive page titles. |
| White / M Softstyle Tee is visibly disabled as sold out. The Shopify audit found it sellable with untracked quantity zero. | Shopify `availableForSale` governs sellability. Quantity zero must not override a sellable untracked or continue-selling variant. |
| Cart omits selected color and size. | Each line visibly identifies its exact selected options, image, current unit price and quantity. |
| Cart claims the expired Autumn Haunting sale is automatic and describes stacking as certain. | Display only current Shopify-applied discounts and qualified eligibility. No expired campaign promise. |
| Cart advertises a $50 discounted-shipping milestone that has not been verified against Shopify. | Shipping promises reflect verified Shopify rules; otherwise communicate that shipping is calculated at checkout. |
| Owned physical bag says it ships from production partners. | Fulfillment copy matches the actual product or remains accurate without provider inference. |
| Cart snapshot has no dialog semantics. | Accessible name, modal semantics, keyboard focus containment, Escape close, and focus return. Verify actual behavior, not just markup. |

### Stable journey URLs

| Purpose | Path |
| --- | --- |
| Home | `/` |
| Shop | `/shop` |
| Physical collection | `/collections/kiss-lock-bags` |
| POD collection | `/collections/smutty-good-girl` |
| Physical product | `/shop/celestial-kisslock-bag-in-linen-blended-fabric` |
| Untracked sellable quantity-zero variant | `/shop/unisex-softstyle-t-shirt` |
| Provider quantity signal | `/shop/bones-and-brew-summer-unisex-tee-1` |
| Drops | `/drops` |
| Journal | `/journal` |
| Merchant feed | `/api/google-feed` |
| Sitemap | `/sitemap.xml` |

## Gate 1: candidate safety and continuity

- Work from the current deployed `main` SHA and record the last known good deployment ID. Do not move production aliases during implementation.
- Make migrations additive. Preserve all Shopify product/variant IDs, current physical inventory, legacy UUID mappings, order history, promotion references, Journal references and successful public URLs. Do not delete provider listings or identity rows during a source switch.
- Keep changes reviewable on a branch. Build and lint the candidate, review the complete diff, and test the candidate URL before merging or promotion. Record preexisting lint failures separately; do not silently waive new failures.
- If a candidate uses a source flag, verify both the chosen production setting and the rollback setting. A source flag is only useful if the previous path still works. Never reintroduce stale inventory as truth during rollback.
- No public listing may disappear because its Shopify collection, publication, category, pagination or ID bridge is incomplete. Reconcile the complete intended storefront publication before enabling the Shopify catalog path.
- Do not replace cart prices with invented prices during an API failure. Keep the basket visible, state that verification is unavailable, and provide a retry. Do not discard the customer's items or silently submit a partial basket.
- Keep Printify fulfillment operating until each replacement and its order/tracking flow have passed the separately approved cutover gates. Website source migration is not a provider cutover.

## Gate 2: read-only HTTP and SEO regression check

The repository includes a dependency-free Node script:

```bash
node scripts/verify-commerce.mjs --record --all-products --strict-seo --output /tmp/commerce-before.json
node scripts/verify-commerce.mjs --url https://CANDIDATE_DEPLOYMENT --preview --baseline /tmp/commerce-before.json --all-products --strict-seo --output /tmp/commerce-preview.json
node scripts/verify-commerce.mjs --baseline /tmp/commerce-before.json --all-products --strict-seo --output /tmp/commerce-production.json
```

Replace the candidate URL with the actual verified deployment URL. `--record` saves observed failures without claiming a pass; it is only for capturing a baseline. A release invocation must omit `--record`. A protected Vercel preview can use `COMMERCE_VERIFY_BYPASS` supplied securely through the environment; the script does not print it. Do not put secrets in a URL or command argument.

The script requests only public HTTP GET endpoints, with a timeout and concurrency of three. It checks public page status, title, description, H1, metadata indexability, canonical origin/path, duplicate title suffix, product JSON-LD offer structure, robots accessibility, sitemap origin, feed structure, feed ID preservation, sitemap product URL preservation and Shop product-link preservation. `--all-products` checks every product URL in the candidate and baseline sitemaps. It records timings to help investigate regressions, but those individual network measurements are not Core Web Vitals.

The script does **not** execute customer interactions, authenticate members, compare every value to Shopify, validate shipping, or prove mobile usability. Complete the remaining gates before release. `--preview` requires preview-wide `X-Robots-Tag: noindex` protection; this is also checked automatically for Vercel preview hostnames. A production noindex response is a failure. Public page metadata itself must remain indexable on both.

For intended product retirement or a deliberate URL migration, inspect every preservation failure and provide explicit evidence of the replacement or permanent redirect. Do not remove failures from the baseline to make the check pass. This commerce architecture change has no blanket product-retirement authorization.

Additional SEO checks requiring source-aware comparison:

- Existing successful handles resolve directly or through a single permanent redirect to the same Shopify product. Canonical, sitemap, Open Graph URL, JSON-LD URL, internal links and feed landing URLs agree.
- Product title, description, image, price/currency and offer availability reflect the published Shopify product and variants. Valid sold-out product pages remain informative and indexable; nonexistent/unpublished products return a genuine 404 as appropriate.
- Canonicals never point to a preview host. A missing product must not return an indexable 200 error page. Product structured data must not claim a display-only campaign discount applies at checkout.
- New native collections preserve current visual groupings and findability. All products remain discoverable even when a product type is blank or new. Journal product links and related items resolve through the ID bridge.
- Check representative image URLs load, describe their product with useful alt text, and do not cause avoidable layout shifts. Product hero images must not disappear when choosing a variant with no dedicated image.
- Sitemap contains current public products, collections and Journal pages; it does not advertise private account content or invented modification dates. Feed item IDs stay stable through provider and catalog changes.

## Gate 3: desktop, mobile and accessibility journeys

Run the same essential journey on desktop and on genuine narrow viewports (at least 390 px and 360 px wide). Record browser, viewport, candidate SHA, result and screenshots of home, shop, product options and cart. A cropped desktop screenshot does not count as a mobile test.

1. Open home, navigate through the main menu, browse a collection, filter and sort Shop, and reach a physical product. Check no horizontal overflow, overlapping menus, obscured prices, unreadable text or clipped actions. Preserve the gothic brand presentation.
2. Use product gallery controls and keyboard focus. Open the primary image, select thumbnails, then switch variants. Verify the image and alt text remain consistent with the selected product.
3. Add a default-title physical variant; change quantity in both product and cart. Check real stock limits, useful stock feedback, exact amounts, disabled/pending states, repeated-click protection and visible success feedback.
4. For an apparel product, require the real option combination, expose selected values, and add two different sizes as distinct lines. A nonexistent combination must not fall back to another variant. White / M Softstyle is the known quantity-zero sellability regression fixture while Shopify still marks it sellable.
5. Verify cart title, selected options, image, quantity, line amounts, subtotal and applicable discounts. Remove only a deliberate test line and confirm the other line survives. Close/reopen, reload, and navigate back/forward; the exact basket remains understandable.
6. Test an existing saved cart from the pre-migration schema. Resolve its exact Shopify variant IDs. Show an actionable notice for changed price, unavailable stock or missing variant; never choose the first variant or silently omit the line.
7. Use keyboard only: reach the menu, filters, options, quantity and Add to Cart; see focus throughout. Open the cart, confirm focus is inside, Tab stays within the modal, Escape closes it and focus returns to its trigger. Screen-reader labels must distinguish controls for different lines; error/status updates must be announced.
8. On mobile, verify the sticky purchase control mirrors the selected variant, price and availability, stays reachable, and does not cover page content or the cart checkout action. Touch targets, safe-area padding, scrolling and drawer close remain usable.
9. Reach Shopify checkout with a mixed physical/POD basket. Verify every expected line, variant and quantity, with no silent omissions and the same Shopify-quoted amounts. Stop before entering personal data or paying unless that specific test order is authorized. A checkout form alone does not verify shipping, taxes, payment or fulfillment.
10. Capture storefront-origin console/runtime errors and failed commerce requests. Resolve new errors; distinguish browser-extension or preview-tool noise by origin and evidence. No blank page or hydration failure is acceptable.

## Gate 4: commerce correctness and application compatibility

- Cross-check Shopify source values for default variants, multiple options, per-variant price differences, compare-at prices, tracked owned stock, untracked inventory, continue-selling variants, unavailable combinations and provider-controlled quantity signals. Include pagination beyond each query's first-page limits.
- Shopify cart cost and discount allocations govern payable prices. Verify no-promotion, active-promotion, future-promotion and expired-promotion cases. Preserve the promotion lifecycle fix and make read-time date rules agree. Validate eligible membership against the authenticated customer; confirm actual code applicability and stacking in Shopify.
- Test a catalog/cart network failure in an isolated environment. The UI must preserve the basket and offer recovery, without presenting stale data as a confirmed current quote. Confirm a later retry recovers cleanly.
- Check Mirror recommendations against allowed current Shopify products; inspect Journal product callouts and legacy slug tokens. Verify user history and UUID references survive, and existing RLS protections remain.
- Confirm the existing recovery-checkout redirect, attribution and signed order-webhook paths still work. The deployment must not create duplicate analytics or duplicate order records during retries.

## Gate 5: production promotion and immediate verification

Promote only the exact candidate that passed the preceding gates. Verify the deployed SHA and production alias, then repeat the HTTP/SEO check plus a small desktop/mobile customer journey against production. Inspect runtime errors and commerce endpoint responses. Treat wrong variants, incorrect totals, blocked checkout, lost products, blank pages, new 5xx errors, production noindex and broken established URLs as release blockers.

If a material production regression appears, return the alias to the recorded working deployment or disable the verified source flag promptly, then confirm customers can browse and check out. Do not restore stale stock snapshots over actual sales. Retain additive identity mappings; any Shopify content change that the old website cannot read requires explicit reconciliation before using that rollback path.

### Release evidence record

| Evidence | Required entry |
| --- | --- |
| Candidate and production SHAs | Exact commit and deployment ID |
| Baseline/preview/production reports | Paths or PR artifacts plus unwaived failures |
| Desktop and mobile journeys | Browser, viewport, screenshots, actual results |
| Variant and cart comparisons | Product/variant IDs, selected options, exact quoted totals |
| SEO parity | Preserved URLs, canonical/metadata/schema/feed results |
| Compatibility | Saved cart, history, Journal, Mirror, recovery, attribution |
| Production health | Public response checks and relevant runtime errors |
| Rollback | Verified last good deployment and any data constraints |

Initial baseline evidence is an observation record, not a completed release checklist. In particular, mobile, authenticated membership, shipping/tax, paid orders and Printful fulfillment were not verified by the September 6 baseline journey.
