# Catalog discovery and seasonal merchandising release

## Purpose

Give the complete catalog clear shopping destinations and retain the existing Drops URL for new releases and upcoming collections. Add Last Chance for deliberately retiring designs. Summerween is made to order; its theme returns with new designs next summer. No stock scarcity, launch date, retirement date, or discount is invented.

## Production baseline

- Branch: main; commit: 3552e4e267e9a318ab78120054c4daec1e04694d.
- Deployment: dpl_Arza3KZ1NLoCCjQq5UFz4uhNdL7e.
- Read-only baseline: 4,222 assertions passed, zero failures; 116 pages, 128 sitemap URLs, 591 feed items.
- Catalog audit: 145 products; 110 active and 35 draft. The sample-only product is excluded from cleanup.
- The previous production continues serving until interactive release gates pass.

## Shopify changes

132 existing products receive targeted organization corrections: 94 product types, 128 standard category assignments/corrections, 27 tag sets, and SEO updates where empty. Shopify can store a null SEO title when it equals the product title; the effective title is verified using that fallback. Existing category:* tags remain because the current storefront uses them. No mutation includes product status, handle, price, variant, inventory, fulfillment service, or product publication changes.

A before-image of the affected fields and the approved correction inputs is retained in Charmed-Dark-Catalog-Backup-2026-09-11.zip. Rollback must restore only changed organization fields, never commerce values or stock snapshots. Newly created collections can remain when rolling back the website; the previous site tolerates them.

Seven automated Shopify collections: gothic-clothing, gothic-home-decor, candles-ritual, drinkware, accessories, wall-art, last-chance. Existing kiss-lock-bags, smutty-good-girl, summerween and homepage curation memberships remain intact. Collection SEO is maintained in Shopify and consumed by the collection pages.

## Storefront behavior

- Existing bag and S.G.G. layouts and URLs retained. Seven new category/theme landing routes use the shared collection page.
- Category links on home and Shop; desktop Shop menu and mobile Last Chance entry.
- Collection filters combine size/color/availability on the same variant. Stock quantity never overrides Shopify sellability.
- Drops: available fall items, coming-soon fall announcement, S.G.G. spotlight, Summerween farewell and existing drop-alert form. Drafts remain excluded by the Storefront API.
- Last Chance includes only available published products tagged lifecycle:last-chance. A future Summerween product does not qualify simply through collection membership.
- Summerween 2026 membership uses season:summerween, design-year:2026, fulfillment:made-to-order and lifecycle:last-chance tags.
- Native Shopify related recommendations are used when available, with a 2.5-second timeout and an available-products fallback ranked by shared theme/type/category.
- Sitemap adds public collections and Last Chance, excluding internal homepage collections. Feed mapping covers new product types and retains variant identifiers, URLs, prices, and sellability.

## Required seasonal decisions and follow-up

1. Confirm Summerween's final ordering date/time and fall launch timing. Neither is configured or automated by this change.
2. At the confirmed cutoff, remove the retiring products from the relevant sales channels using Shopify's publication controls, including direct checkout paths. A website countdown alone must never enforce retirement. Keep product/variant IDs for orders and provider fulfillment. Verify existing carts and product URLs at cutoff.
3. Keep /collections/summerween between seasons with the closed-season message and future-drop signup. Introduce next summer's new products with the new design year; do not copy lifecycle:last-chance from old listings.
4. Physical inventory can receive lifecycle:last-chance only when the merchant identifies items to discontinue. This release does not infer physical fulfillment from quantity or vendor.
5. General drop-alert signup is existing functionality; it does not promise automatic year-specific campaigns. Review delivery and segmentation before sending marketing.
6. Further phase: Search & Discovery search/synonym integration, merchant-owned structured product facts, Knowledge Base/Agentic eligibility, and Flow workflows. No paid app or AI channel is activated here.

## Validation and release gate

### Homepage refinement after merchant review

The merchant approved an everyday gothic boutique direction. The homepage now leads with the brand and actual published product photography, followed by four visual category entrances, four available signature pieces, one featured bookish collection, a brief brand introduction and shopping help, then Drops/signup and a compact footer. Retiring designs stay discoverable in Last Chance and their collections; they are excluded from the evergreen homepage selection. The Halloween/vendor opening and repeated homepage membership pitches are removed.

The mobile navigation has five labeled icon buttons plus an explicit header menu for all categories, seasonal collections and secondary destinations. The fixed navigation and page bottom spacing account for the device safe area. The Mirror is preserved at /mirror, linked from the menu and footer; membership and Journal retain their existing pages. Product cards retain Shopify prices, sale calculations and availability without repeating membership marketing text. Loaded brand fonts are applied through the existing CSS variables, and base link resets no longer override explicit button colors and underlines.

This revision changes the isolated website candidate only. No Shopify product, inventory, price, publication, retirement date, fulfillment, paid app or marketing-send changes are included. Signup reuses the existing subscription endpoint; email delivery is not newly verified. The white floating arrow visible in the supplied phone captures has no corresponding control in the repository; no third-party/browser overlay is assumed to be site code.

55 commerce/discovery tests pass. Touched-file ESLint and diff whitespace checks pass. Storefront recommendation query validates against Shopify's schema.

Local production build is blocked by Google Fonts network access in this runtime; use the Vercel preview build as the compilation gate. The browser connection times out on tab discovery, so interactive desktop/mobile checks are outstanding. Follow docs/commerce-release-gates.md before merging. Do not interpret HTTP checks as cart interaction, mobile, email-delivery, or payment validation.
