# PostHog cart and product event enrichment

Instrumentation branch validation note.

Commit: f5827ec5916ae69aa674b77535e21387870f674f

Scope:
- Enrich product_viewed
- Enrich add_to_cart
- Add cart_opened
- Enrich checkout_started
- Reuse existing attribution storage

Out of scope:
- Checkout creation logic
- Cart behavior
- HOUSE10
- GA4
- Google Ads
- Sanctuary/auth flows
