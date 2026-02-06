# Post-Purchase Ritual Specification

**Version**: 1.0  
**Status**: Locked  
**Last Updated**: February 5, 2026

---

## 1. Purpose

The post-purchase ritual exists to provide closure after a transaction is complete. It protects trust, preserves brand integrity, and respects the customer's decision as final.

The ritual must never:
- Attempt to sell additional items
- Optimize for conversion or engagement
- Manipulate emotion to drive behavior
- Pressure membership or continued interaction
- Interpret customer intent or emotion

The transaction is complete. The relationship begins after.

---

## 2. Ritual Principles

### Completion

The purchase is finished. No further action is required or requested. The customer has what they came for.

### Stillness

No urgency, no timers, no pressure. The moment after purchase is calm. The customer may leave or stay without consequence.

### Gratitude Without Obligation

Acknowledgment is permitted. Gratitude is permitted. Neither may imply expectation, debt, or future action.

### Optional Continuation

The Sanctuary may be mentioned as an option. It must never be framed as necessary, beneficial, or time-sensitive.

### Neutrality

Order details are presented without commentary, interpretation, or emotional framing. The object is the object. The price is the price.

### No Optimization

Post-purchase touchpoints are not conversion opportunities. Metrics like engagement, click-through, or upsell rate are irrelevant and must not influence design.

---

## 3. Order Confirmation Page

### What Is Shown

1. **Acknowledgment** (one sentence, neutral tone)
   - Example: "Your order is confirmed."
   - No exclamation points
   - No emotional language

2. **Order Details** (neutral presentation)
   - Order number
   - Items purchased (name, quantity, price)
   - Shipping address
   - Estimated delivery date
   - Total amount charged

3. **Navigation** (optional, non-prominent)
   - Link to order history
   - Link to home page
   - No calls to action

### What Is Explicitly Not Shown

- Upsells or cross-sells
- "You may also like" sections
- Discounts or promotions
- Countdown timers
- Membership prompts with benefits listed
- Social sharing buttons
- Review requests
- Referral incentives
- Email signup forms (if not already a member)

### Tone Constraints

- Calm, factual, restrained
- No marketing voice
- No poetic language
- No emotional manipulation
- No questions directed at the customer

### Placement Rules

- Order details appear first
- Acknowledgment appears above order details
- Navigation appears last, if at all
- No sidebar content
- No footer upsells
- No pop-ups or overlays

### Layout Constraints

- Single column, centered
- Maximum width: 700px
- Minimal decoration
- No product images beyond order confirmation
- No animated elements

---

## 4. Post-Purchase Email

### Timing

Email is sent within 5 minutes of order confirmation. No follow-up emails unless order status changes (shipped, delivered).

### Tone

Calm, restrained, factual. The email confirms the transaction and provides necessary information. It does not engage, persuade, or prompt.

### Copy Constraints

The email may include:
- Subject line: "Order Confirmed – [Order Number]"
- One sentence acknowledgment
- Order details (items, total, shipping address)
- Estimated delivery date
- Link to order status page

The email must not include:
- Questions directed at the customer
- Requests for reviews or feedback
- Suggestions for additional purchases
- Discounts or promotions
- Social media links
- Referral prompts
- Membership benefits or urgency

### Structure

```
Subject: Order Confirmed – #[ORDER_NUMBER]

Your order is confirmed.

Order Number: [ORDER_NUMBER]
Order Date: [DATE]

Items:
- [ITEM_NAME] × [QTY] – $[PRICE]
- [ITEM_NAME] × [QTY] – $[PRICE]

Subtotal: $[AMOUNT]
Shipping: $[AMOUNT]
Total: $[AMOUNT]

Shipping Address:
[ADDRESS]

Estimated Delivery: [DATE]

View order status: [LINK]

---

Charmed & Dark
```

### Prohibited Elements

- Exclamation points
- Emojis
- Animated GIFs
- Product recommendations
- "Shop more" links
- Countdown timers
- Urgency language
- Emotional appeals

---

## 5. Sanctuary Invitation (Optional)

### Rules

The Sanctuary may be mentioned once, at the end of the confirmation page or email. The invitation must be:
- Non-urgent (no time limit)
- Non-incentivized (no benefits listed)
- Clearly optional (no implication of necessity)
- Neutral in tone (no emotional framing)

### Placement

- Appears last on confirmation page, if at all
- Appears at end of confirmation email, if at all
- Separated from order details by whitespace
- Visually de-emphasized (smaller text, muted color)

### Framing Constraints

The invitation must not:
- List benefits or features
- Imply the purchase is incomplete without membership
- Suggest the customer "should" or "needs to" join
- Use urgency language ("now", "today", "don't miss")
- Use emotional language ("you deserve", "treat yourself")

### Example Framing (Not Hardcoded)

Acceptable:
- "The Sanctuary is available to those who wish to enter."
- "Some choose to enter the Sanctuary. Others do not. Both are complete."
- "Membership is optional and costs nothing."

Not Acceptable:
- "Join the Sanctuary to unlock exclusive benefits!"
- "You deserve access to the Sanctuary."
- "Complete your experience by joining today."
- "Don't miss out on Sanctuary pricing."

### Link Behavior

- Plain text link or subtle button
- No bright colors or accent styling
- No hover effects that demand attention
- Links to `/join` with no query parameters or tracking

---

## 6. Never-Change Rules

The following rules must never be violated by future contributors:

1. **No Selling After Purchase**
   - Post-purchase touchpoints must never attempt to sell additional items
   - No upsells, cross-sells, or product recommendations
   - No discounts or promotions

2. **No Emotional Leverage**
   - No language that manipulates emotion to drive behavior
   - No "you deserve", "you need", "treat yourself" framing
   - No urgency or scarcity tactics

3. **No AI Expansion**
   - No personalization based on purchase history
   - No interpretation of customer intent or emotion
   - No dynamic content based on user data

4. **No Optimization Language**
   - Post-purchase is not a conversion opportunity
   - Metrics like engagement or click-through are irrelevant
   - Design decisions must not be driven by optimization goals

5. **Completion Is Final**
   - The transaction is complete
   - No further action is required or requested
   - The customer may leave without consequence

6. **Sanctuary Invitation Is Optional**
   - Membership may be mentioned once, neutrally
   - No benefits listed, no urgency, no pressure
   - Clearly optional, never necessary

7. **Tone Is Neutral**
   - Calm, factual, restrained
   - No marketing voice, no poetic language
   - No questions, no prompts, no engagement tactics

8. **No Follow-Up Campaigns**
   - No post-purchase email sequences
   - No review requests
   - No feedback surveys
   - No re-engagement emails

---

## Enforcement

This specification is locked. Any proposed change that violates these rules must be rejected.

If post-purchase behavior is unclear, default to silence.

If a feature requires selling, persuading, or optimizing, it does not belong in the post-purchase ritual.

The transaction is complete. The relationship begins after.

---

**End of Specification**
