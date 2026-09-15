# Shop discovery review — September 15, 2026

The existing production branch is main at 8dba471efb63f0a306411c8d812cb96154f9dc03. The redesign stays on feat/catalog-discovery-seasonal (PR 51); the merchant has not approved production release.

## Missing products

Live Admin API audit: 102 active products. The existing preview rendered 99 unique product links. Exactly three active products had no sales-channel publications:
- 8636169617442 — S.G.G. Secret Society Gothic Water Bottle — 32 oz
- 8636230434850 — Smutty Good Girl Reading Fuel Gothic Mug — 15 oz
- 8636250652706 — S.G.G. Enchanted Reads Gothic Water Bottle — 32 oz

All were already members of the manual smutty-good-girl collection, alongside the active tote (8650220109858) and four legacy draft products. Restored only the three missing publications to Online Store (281203048482), the same channel as the tote. All mutation userErrors were empty. No prices, variants, images, inventory, designs, or draft statuses changed.

## Organization and layout

Old Shop groups depended on exact legacy category tags. Those tags placed teacups, a pillow, a tray, and an ornament among ritual goods; hats among clothing; wall ornaments among home décor. The preview's separate category menu used different rules. Its Bags entrance contained only kisslocks.

Keep The Atelier atmosphere and the leading S.G.G. collection row. Use a shorter hero, then five clear category entrances: Bags, Clothing, Home & Décor, Candles & Ritual, Drinkware. Secondary links retain Jewelry & Hats, Wall Art, seasonal collections, Drops, and Last Chance.

Product type now governs both Shop filters and family landing pages. Legacy category tags remain as a fallback for unfamiliar/blank types. Unknown items remain visible under More to Discover. The new /collections/bags includes book totes and kisslocks; the existing /collections/kiss-lock-bags URL stays intact.

Default browsing groups each visible product once, with S.G.G. together first. Selecting a family also includes its S.G.G. items. Search and explicit price/newest sorting use one results grid across all groups.

| Family | Active products |
| --- | ---: |
| Bags | 10 |
| Clothing | 29 |
| Home & Décor | 24 |
| Candles & Ritual | 19 |
| Drinkware | 7 |
| Jewelry & Hats | 7 |
| Wall Art | 6 |

All 102 active products classify into a family. The S.G.G. row contains four products drawn from Bags and Drinkware; it does not add duplicate default-grid cards.

## Carry-forward fixes and validation

The preview incorporates the two newer main commits, retaining the mobile product-gallery improvement and Sanctuary price/access fixes. The approved preview typography remains; compact Sanctuary amounts are visible on cards.

Five regression tests cover the four replacements, type precedence, complete/unique rendering including unknown and sold-out products, tote/kisslock discovery, and cross-category search/sorting. Pure functions passed against all 102 current Admin catalog records. Vercel must run the complete commerce test suite before building this candidate.

Interactive desktop/mobile journeys remain a release gate. HTTP/catalog checks are not proof of touch, keyboard, hydration, mixed-cart, or checkout behavior. Do not merge or promote the preview without merchant approval.
