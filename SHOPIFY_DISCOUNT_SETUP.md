# Shopify Discount Code Setup

## Required Discount Code

**Code:** `HOUSE10`

**Purpose:** Enforce 10% House pricing for all storefront transactions

## Setup Instructions

1. Log into your Shopify Admin Dashboard
2. Navigate to **Discounts** in the left sidebar
3. Click **Create discount** → **Discount code**
4. Configure the discount:
   - **Discount code:** `HOUSE10`
   - **Type:** Percentage
   - **Value:** 10%
   - **Applies to:** All products (or specific collections if needed)
   - **Minimum requirements:** None
   - **Customer eligibility:** Everyone
   - **Usage limits:** None (unlimited uses)
   - **Active dates:** No end date
5. Click **Save discount**

## How It Works

- When a customer adds an item to cart, the storefront automatically applies the `HOUSE10` discount code
- The CartSummary UI displays:
  - Original subtotal (crossed out)
  - House Discount line showing `-10%`
  - Final total with discount applied
- The discount is applied via Shopify's `cartDiscountCodesUpdate` mutation
- The discount persists through checkout

## Technical Implementation

- **Function:** `applyHouseDiscount()` in `lib/cart/shopify.ts`
- **Applied:** Automatically after adding items to cart
- **Applied:** On cart load if not already present
- **UI Display:** `CartSummary.tsx` shows discount breakdown

## Verification

After creating the discount code in Shopify Admin:
1. Add an item to cart on the storefront
2. Check browser console for: `[Cart] House discount applied successfully`
3. Verify CartSummary shows the discount breakdown
4. Proceed to checkout and confirm discount is applied
