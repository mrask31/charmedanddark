# Shop discovery review — September 15, 2026

## Mobile refinements and the Summerween survivor

Following the merchant's mobile screenshot review, Shop places mobile search and result count in normal page flow. Only the 68px category/sort row remains sticky below the header. Desktop controls keep their current layout. Carousels with more than six images show an accurate image counter; smaller galleries retain their dots. Four specifically identified dark homeware lifestyle images receive a subtle 12% display brightness lift, with no source asset or product-design changes.

The white floating up-arrow in the phone screenshots is absent from the repository and inspected preview DOM. It appears to be browser UI; no site control was moved or added to imitate a fix.

The merchant confirmed Bones & Brews stays year-round. Removed only `lifecycle:last-chance` from Shopify product 8650244882466, preserving ACTIVE status, all seven variants, and its Summerween origin. The Last Chance smart collection uses that tag. Preview classification also excludes this named survivor from retiring designs, including stale responses carrying its former tag. Its availability no longer keeps the 2026 archive open. Deceased features “The one that refused to die,” “Bones & Brews lives on,” and a direct product link. The archive photograph uses its original color/exposure. Homepage, Drops, Last Chance, and Summerween collection wording follow the corrected seasonal status; Summerween collection metadata overrides outdated retirement copy.

Build/browser verification is recorded in PR 51. Website changes remain in preview; the Shopify retirement-tag correction is applied to the active catalog.

## Return navigation, clothing variety and seasonal story

The merchant approved the Fall homepage feature and Deceased collection archive, and reported losing their place and filters after visiting a product. Shop now reads its category, search, collection, view and sort directly from the URL. Collection grids persist product type, size, color, availability and sort in the URL too. A product click records the current card position on that specific browser-history entry, replacing the old global scroll value. Returning to that entry restores the view and card position; a fresh navigation to Shop has no old position attached.

Featured Clothing uses a stable mix of tees, hoodies and tanks across Shop and the Clothing collection. Explicit price and newest sorting remain authoritative, unavailable products stay below available ones, and no products are removed. Regression tests cover complete browse-state reconstruction, view-specific positions, stable clothing variety, catalog preservation and seasonal status.

The homepage introduces Fall after the category cards, using the approved Autumn Mourning Society and Autumn Skull photography. `/collections/fall-2026` exposes the published Fall items. Drops uses "Fall has arrived. More is stirring." when Fall items are orderable. `/deceased`, linked from Drops and the footer, preserves public Summerween photography and points to existing drop announcements. It explains that the next Summerween collection will have new designs. The initial final-farewell state has been superseded by the merchant's year-round Bones & Brews correction above. No Shopify product status, sales-channel publication or fulfillment setting is changed by this work.

Candidate build and browser proof are recorded in PR 51. All work remains in preview pending merchant approval of production release.

## Integration with the approved homepage redesign

After a browser review, the merchant approved combining a simpler Shop experience with the existing homepage preview. The homepage keeps its hero, visual category entrances, signature products, and bookish feature. Shared cards now use concise, explicitly curated display names; Shopify product names, SEO metadata, alt text, variants, and cart labels remain unchanged.

Shop has one category control: desktop buttons and a native mobile selector. The duplicate category links are removed. Explore shows up to four items in each section, including the four current Smutty Good Girl products. Each section has a View all destination with its full family count. `/shop?view=all`, category filters, and search expose the full catalog. The shared footer completes the page. Product-link preservation checks now inspect the explicit full-catalog view as well as the curated landing page.

The browser confirmed 102 products and all four S.G.G. items in the preceding candidate after refreshing stale preview data. The integration adds regression coverage for section limits, full-catalog/search access, family totals including S.G.G., concise title distinctions, and unchanged canonical data. Candidate build and browser results are recorded in PR 51. The redesign still requires the merchant's explicit production release approval.

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
