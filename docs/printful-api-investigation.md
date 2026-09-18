# Printful API connection investigation

Prepared September 9, 2026 for Charmed & Dark.

## Result

The Printful API connection is verified independently of the failing cloud browser. The replacement single-store token grants only `sync_products/read`. All five live checks passed: configuration, minimal read scopes, Charmed & Dark Shopify store selection, store identity confirmation, and the known S.G.G. Secret Society draft. That product has one synced variant, one artwork file with status `ok`, and one preview file. This establishes the tested read access; it does not establish physical print quality, placement correctness or permission to create/migrate products.

The first test uses a separate GitHub Actions environment and requires a read-only private Printful token. It reads store identity and one already synced S.G.G. product. It cannot create products, change print files, submit orders, charge a payment method, publish to Shopify, or disable Printify.

## Latest executed check

- GitHub Actions run: [34298256443](https://github.com/mrask31/charmedanddark/actions/runs/34298256443), successful rerun job `102302294531`.
- Tested code commit: `c9e99416f53517aef101d8b14d4b6b77fa925fa3`.
- All 67 tests passed; all five real API checks passed.
- Result: `status: verified`, `mode: read_only`, `store_verified: true`, `known_product_verified: true`.
- Granted permission: `sync_products/read` only. No optional store-list scope or explicit store-ID environment variable was needed for the verified calls.
- Known S.G.G. draft: one variant, one synced variant, zero unsynced variants; one ready artwork reference and one preview; zero processing, failed or unknown artwork references.
- The diagnostic reports only fixed public permission labels and aggregate counts. Unknown upstream labels, display names, tokens and raw payloads remain hidden.
- The first token had additional product/file/order/webhook permissions and was refused. The user replaced the secret with the narrow token; no allowlist or request boundary was relaxed.
- No Printful or Shopify product, order, inventory, publishing or fulfillment settings changed.
- Next work is a read-only catalog reconciliation and source/placement review before preparing any separate draft-writing operation. This probe and token cannot perform a migration.

## Existing infrastructure checked

- Repository: `mrask31/charmedanddark` (public).
- Application branch: `main`, verified at `3552e4e267e9a318ab78120054c4daec1e04694d`.
- The repository's default `master` branch is stale; the investigation branch starts from `main`.
- Vercel project: `charmedanddark`, existing production deployment READY at investigation time.
- Existing Commerce Admin has private authentication and server-side Shopify access, but no Printful API client or token configuration.
- Adding a Printful secret to Vercel alone would not give this assistant an authenticated caller path. GitHub Actions is proposed because this session can inspect jobs and rerun a failed job through the GitHub connection.
- Branch: `crew/printful-api-probe`. No storefront/runtime code is changed. Vercel may create its normal automatic preview for the feature branch; no production release is requested.

## Secure first-test setup

1. Visit [Printful Developers](https://developers.printful.com/tokens/add-new-token), using the existing Printful account.
2. Create a private token named `Charmed Dark read-only connection test`, with a short expiry such as 30 days.
3. Choose **a single store**, specifically the existing Charmed & Dark Shopify store. Do not create another store.
4. Grant `sync_products/read` and `stores_list/read` if that option is displayed. `file_library/read` is the only optional extra this probe accepts. The human-readable labels may differ. If store-list permission is absent, share a screenshot of the permission choices before creating the token; do not broaden access to compensate.
5. In [repository environments](https://github.com/mrask31/charmedanddark/settings/environments), open or create `printful-api-probe`.
6. Under deployment branches and tags, choose selected branches and add the exact branch `crew/printful-api-probe`.
7. Add an **environment secret** named `PRINTFUL_API_TOKEN`, entering its value directly into GitHub. Never paste it into chat, an issue, a commit, a normal variable, or a screenshot.
8. Tell the assistant only that the environment secret has been added. The assistant can rerun the probe's failed job, if the initial GitHub run was created successfully.

The optional nonsecret environment variable `PRINTFUL_STORE_ID` can pin an already known numeric store ID. It is not required when the token exposes exactly one matching Shopify store. Do not guess an ID from Shopify's store or location identifiers.

A GitHub environment is used to store a secret for this task. The job itself does not deploy an application. The repository and its Actions logs are public, so the script emits only a deliberately limited diagnostic summary and never raw API responses or file URLs.

## What the test reads

| Endpoint | Purpose |
| --- | --- |
| `GET /oauth/scopes` | Check that the token only has the narrowly allowed read scopes. |
| `GET /stores` | Require a single matching Charmed & Dark Shopify store. |
| `GET /stores/{observed-id}` | Reconfirm the selected store's ID, type and name. |
| `GET /sync/products/@8636169617442` | Verify the known S.G.G. Secret Society Shopify draft and its synced variant/file counts. |

The script uses only the fixed `https://api.printful.com` origin, refuses redirects, limits response size and request duration, sanitizes failures, and never accepts an arbitrary URL or HTTP method. A wrong store, unexpected token scope, mismatched external product ID, unsynced variant or failed file status fails the test. A successful test establishes account/catalog read access only, not physical print quality or fulfillment readiness.

## The later migration route

Printful's Ecommerce Platform Sync API supports assigning catalog variants and print files to products already present in an integrated Shopify store. The intended order is:

1. Read and reconcile the existing Printful catalog and saved templates against the migration ledger.
2. Prepare one separate Shopify draft with the exact approved blank, sizes, colors and artwork.
3. Verify that this draft is imported into the existing Printful store. The documented `Import not synced products from Shopify` switch is a dashboard setting; no public endpoint to change it was verified.
4. Prove the exact file/placement mapping on that draft before adding write permission or expanding.
5. Attach the prepared brand gallery, titles, descriptions, tags and SEO to the matched Shopify draft.
6. Keep new items in draft for the user's review. Live fulfillment cutover and Printify retirement are separate steps.

`POST /store/products` is for Manual/API stores and is not the product-creation route for the existing Shopify integration. Use the stable v1 Ecommerce Sync contract for investigation; preview-only v2 product operations are not a basis for this migration.

### Placement limitation to resolve

The documented v1 position examples cover orders and mockup generation. That does not establish that the same `position` object is accepted when updating an integrated store's sync variant. Check the final print-area dimensions and a source-grounded preview before any print-file assignment. The canvas print files still need final resolution and wrap validation. Generated marketing photos are not production print files.

## Boundaries retained

The repository's `docs/printful-pilot-readiness.md` is the baseline for the eventual live cutover. Physical booth/owned stock, existing product identifiers and URLs, other providers, existing orders and the protected sample are not changed by this probe. All 138 newly prepared marketing images remain saved; this test does not upload or regenerate them.

## Official sources

- [Printful API documentation](https://developers.printful.com/docs/): private tokens, scopes, stores and Ecommerce Platform Sync API.
- [Printful Embedded Design Maker documentation](https://developers.printful.com/docs/edm/): store-scoped token setup and `stores_list/read` for store discovery.
- [Printful v2-beta documentation](https://developers.printful.com/docs/v2-beta/): current scope and limitations.
- [Printful manual sync](https://help.printful.com/hc/en-us/articles/11818539480348-How-do-I-manually-sync-products-to-my-store): importing and mapping existing Shopify listings.
- [GitHub environment secrets](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments): environment secrets and branch restrictions.
- [GitHub rerunning jobs](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/re-run-workflows-and-jobs): rerun the same reviewed job after the secret is added.
