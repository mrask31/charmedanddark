# Printful pilot readiness

Status: **preparation only; no fulfillment cutover or paid test authorized by this checklist.** The storefront must keep serving customers while the commerce release is validated. Printify remains operational until a completed pilot proves the replacement. This document records the next bounded step rather than repeating the architecture audit.

## Verified position

Read-only Shopify checks on **2026-09-06 at approximately 17:52 UTC** reconfirmed all four locations below. The location query was complete (`hasNextPage=false`); Printful's inventory-level connection was empty and complete. No inventory, provider setting, order, shipping profile or payment was changed in this check.

| Location | Shopify location ID | Active inventory | Next-step implication |
| --- | --- | --- | --- |
| Main owned stock, 9051 Watson Road | `110641840162` | Yes | Keep physical stock and fulfillment here. |
| Haunted America Booth -Alton 2026 | `113692147746` | Yes | Preserve separately; do not assume event stock is available for migration. |
| Printify | `110642036770` | Yes | Existing POD service remains in use. |
| Printful | `116212662306` | No; zero inventory-level entries | Existing connection needs verification and product mapping, not a second installation. |

All four locations reported no unfulfilled orders at this instant. Recheck immediately before any handoff; this is not permission to disable a service. The physical Celestial Kisslock Bag (`8247949623330`, SKU `82313CN`, inventory item `46943923634210`) still had two available/on-hand units and zero committed at the main location. This is a control sample, not a complete physical-stock reconciliation.

The earlier audit counted 31 products whose **vendor** was Printify. That count does not identify every Printify variant: routing must be verified from inventory locations, fulfillment assignments and provider sync records. Provider values such as 9999 are availability signals, not owned stock; never overwrite them merely to make quantities look realistic. [1]

## Proposed pilot and known Shopify identity ledger

**Candidate for preparation:** Bones and Brew Summer Unisex Tee, Shopify product `gid://shopify/Product/8408700747810`, current URL `/shop/bones-and-brew-summer-unisex-tee-1`. Its one color and seven known sizes provide a bounded comparison. This is not an approved substitute blank or confirmed Printful product. If the exact garment, artwork or size range cannot be matched acceptably, choose a different pilot before touching live routing.

A fresh product and inventory lookup verified these existing identities. Every row is currently at Printify location `110642036770`, with provider availability 9999 and zero committed. Retain these product/variant IDs, SKUs and the current URL. Numeric variant and inventory-item IDs below are the suffixes of `gid://shopify/ProductVariant/` and `gid://shopify/InventoryItem/` respectively.

| Existing option | Shopify variant ID | Inventory item ID | Existing SKU |
| --- | --- | --- | --- |
| Black / XS | `45351742537762` | `47439196913698` | `35581568227528418942` |
| Black / S | `45351742570530` | `47439196946466` | `23210115116060760754` |
| Black / M | `45351742603298` | `47439196979234` | `26560539199742531801` |
| Black / L | `45351742636066` | `47439197012002` | `31956404159775875035` |
| Black / XL | `45351742668834` | `47439197044770` | `13986145661411574834` |
| Black / 2XL | `45351742701602` | `47439197077538` | `63389496848262847940` |
| Black / 3XL | `45351742734370` | `47439197110306` | `15472175205183833268` |

Retail price was USD 24.99 for every row. It is not the production cost or test budget. Existing storefront images are references for visual comparison; they have not been verified as printable master artwork.

## Complete this mapping before any sync

Every `PENDING` field is an unresolved blocker. Enter exact values and evidence, not title-based guesses. Printful supports manually matching an existing listing to a catalog product/design/placement; confirm every size and color rather than assuming one selection correctly maps the entire product. [2]

| Item to record | Required value / evidence | Current state |
| --- | --- | --- |
| Account and store | Verified Printful account, connected store ID and `charmed-dark.myshopify.com`; existing connection ownership | PENDING authenticated dashboard inspection |
| Existing Printify source | Provider product/blueprint/print-provider IDs; actual garment brand/model and print method | PENDING provider record |
| Exact Printful blank | Catalog product ID, garment brand/model, fabric/fit, print method and available selling region; approval for any difference | PENDING; no equivalent assumed |
| Master artwork | Original file reference and checksum/revision; pixel dimensions, transparency and resolution suitable for each actual print area | PENDING; storefront mockups are not approved masters |
| Print placements | Front/back/sleeve/label as applicable; exact file and revision per placement, physical dimensions, offsets and approved preview | PENDING; no print sides inferred |
| Billing and import settings | Current payment method readiness; auto/manual confirmation, unsynced-product/order import and stock-sync settings for this existing store | PENDING; record current settings before proposing changes |
| Shipping | Pilot profile/origin assignment; supported destinations, item/additional-item rates, retail charge and provider charge | PENDING destination-specific quotes |
| Test budget | Chosen exact variant, quantity, shipping destination/service, product cost, shipping, tax, payment fees and maximum total charge in currency | PENDING explicit approval of concrete total |

Complete one mapping record for **each** source row; do not fill down guessed provider IDs:

| Existing option | Printful catalog variant ID, exact color and size | Artwork revision + placement approval | Printful sync variant ID + shipping approval |
| --- | --- | --- | --- |
| Black / XS | PENDING | PENDING | PENDING |
| Black / S | PENDING | PENDING | PENDING |
| Black / M | PENDING | PENDING | PENDING |
| Black / L | PENDING | PENDING | PENDING |
| Black / XL | PENDING | PENDING | PENDING |
| Black / 2XL | PENDING | PENDING | PENDING |
| Black / 3XL | PENDING | PENDING | PENDING |

## Ordered gates

1. **Keep production usable.** Complete the commerce preview/release gates in `docs/commerce-release-gates.md` first. Product URLs, media, option controls, availability, exact basket, checkout and SEO must pass. Prepare provider templates and review evidence without changing customer routing.
2. **Verify the existing provider connection.** Fill the account/settings records above. Prepare a manual-confirmation pilot so an imported order cannot enter production before review. Record effects on other imported orders; a store-wide setting needs an explicit operational plan. Unsynced-product import can include owned stock and products from other providers, so classify and ignore nonpilot products deliberately. Do not delete live listings from Printful to clean up imports: this can delete their storefront listings. [3]
3. **Approve the mapping and cost.** Complete all seven rows, inspect previews and blank differences, and obtain the exact test-cost approval. There is currently no approved amount and no paid order has been created. Keep physical SKUs outside the mapping.
4. **Prove a safe handoff before writing.** Capture current per-variant location/profile/provider settings and open order/transfer state. Establish the provider-supported sequence that preserves existing Shopify IDs and leaves exactly one intended provider accepting each new order. If the only proposed route deletes/recreates listings or leaves orders ambiguously owned, stop and resolve it first. Apply only the approved pilot; leave all other Printify variants in service.
5. **Verify shipping before a charge.** Compare physical-only, pilot-only, two pilot items and mixed physical/POD baskets for the intended destination. Confirm all items have valid rates, combined shipping is understandable, and retail shipping covers the reviewed provider costs. Do not replace General or existing Printify profiles in bulk.
6. **Run the approved real lifecycle test.** Use the approved exact variant and amount with manual provider confirmation. Verify the paid, unfulfilled Shopify order imports once into the intended provider, then review design/size/color before production. Verify shipment, tracking and fulfillment updates return to the original Shopify order. Do not turn on Shopify payment test mode on the live store; it prevents customers placing real orders. A preview checkout or unpaid draft does not prove manufacturing or tracking. [1, 3, 4]
7. **Expand only on evidence.** Record the result, tracking and any actual cost difference; compare pilot URL/variant IDs and physical-stock controls again. Move one product at a time after its mapping passes. Printify retirement requires a full remaining-variant, open-order, cancellation/return and shipping-dependency reconciliation, beyond this pilot.

## Stop and recover

Stop expansion on a wrong garment/design/size, duplicate provider import, missing or misleading shipping, unavailable previously sellable variant, changed Shopify identity/URL, or customer checkout failure. Keep unaffected products and the current storefront serving traffic. Review already imported orders before restoring pilot routing; do not replay them into another provider or assume production can be cancelled. Restore only recorded pilot configuration where safe. Never restore stale physical quantities over actual sales, delete customer orders, or uninstall either provider as a rollback shortcut.

## Evidence and remaining access

The next concrete input is authenticated access to the **existing Printful store/dashboard** plus original artwork and the existing Printify blank/product records. These will determine whether the proposed pilot is suitable and produce a reviewable total cost. No credentials, card details or customer address should be placed in this repository.

Sources reviewed September 6, 2026; source-specific guidance is paraphrased:

1. [Printful: Shopify order processing and fulfillment](https://help.printful.com/hc/en-us/articles/6148086204316-How-do-I-manage-order-processing-and-fulfillment-in-Shopify)
2. [Printful: manually sync existing products](https://help.printful.com/hc/en-us/articles/11818539480348-How-do-I-manually-sync-products-to-my-store)
3. [Printful: import and order-confirmation settings](https://help.printful.com/hc/en-us/articles/360014066619-How-do-the-import-order-settings-for-my-integration-work)
4. [Shopify: placing a test order](https://help.shopify.com/en/manual/checkout-settings/test-orders)
5. [Shopify: Location inventory model](https://shopify.dev/docs/api/admin-graphql/2026-07/objects/Location)

Shipping-profile details remain the earlier audit baseline until refreshed at the pilot gate. No authenticated Printful/Printify dashboard, exact print-file mapping, destination-specific quote, paid import, manufacturing or shipment has been verified by this preparation.
