# Setup Checklist - Charmed & Dark

Use this checklist to track your setup progress.

## Phase 1: Database Setup ✅

- [x] Supabase project created
- [x] Database migrations applied
- [x] Products table created
- [x] Orders table created
- [x] RLS policies enabled
- [x] 5 sample products loaded

**Status**: Complete

## Phase 2: Google Sheets Sync

### Google Cloud Setup

- [ ] Google Cloud project created
- [ ] Google Sheets API enabled
- [ ] Service account created
- [ ] Service account JSON key downloaded
- [ ] Service account email copied

### Google Sheet Setup

- [ ] Google Sheet created
- [ ] Sheet named "Charmed & Dark - Physical Inventory"
- [ ] Column headers added (A-K)
- [ ] Test product added
- [ ] Sheet shared with service account email
- [ ] Spreadsheet ID copied from URL

### Environment Configuration

- [ ] `.env` file exists
- [ ] `GOOGLE_SHEETS_SPREADSHEET_ID` set
- [ ] `GOOGLE_SHEETS_SHEET_NAME` set
- [ ] `GOOGLE_SHEETS_CLIENT_EMAIL` set
- [ ] `GOOGLE_SHEETS_PRIVATE_KEY` set (with `\n` characters)
- [ ] Supabase variables verified

### Dependencies

- [ ] `npm install` completed successfully
- [ ] `googleapis` package installed
- [ ] `dotenv` package installed

### First Sync

- [ ] `npm run sync-sheets` runs without errors
- [ ] Products appear in Supabase
- [ ] Sync results show: Created: 1, Updated: 0, Errors: 0

### Full Inventory

- [ ] All 50 products added to Google Sheet
- [ ] Handles are unique and lowercase
- [ ] Prices formatted correctly (no $ symbol)
- [ ] Stock quantities are whole numbers
- [ ] Categories match standard list
- [ ] Options/Metadata are valid JSON (if used)
- [ ] Full sync completed: `npm run sync-sheets`

## Phase 3: Product Images

### Image Organization

- [ ] `/public/products/` folder exists
- [ ] Folder created for each product handle
- [ ] Hero images added (required)
- [ ] Front images added (optional)
- [ ] Hover images added (optional)
- [ ] Color variant images added (if applicable)
- [ ] `npm run check-images` shows no missing required images

### Image Checklist (First 10 Products)

- [ ] Product 1: hero.jpg
- [ ] Product 2: hero.jpg
- [ ] Product 3: hero.jpg
- [ ] Product 4: hero.jpg
- [ ] Product 5: hero.jpg
- [ ] Product 6: hero.jpg
- [ ] Product 7: hero.jpg
- [ ] Product 8: hero.jpg
- [ ] Product 9: hero.jpg
- [ ] Product 10: hero.jpg

## Phase 4: Shopify Integration (Optional)

### Shopify Setup

- [ ] Shopify store created
- [ ] 15 apparel products added
- [ ] Printify connected
- [ ] Storefront API access token created
- [ ] Admin API access token created

### Environment Configuration

- [ ] `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` set
- [ ] `NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN` set
- [ ] `SHOPIFY_ADMIN_ACCESS_TOKEN` set
- [ ] `SHOPIFY_WEBHOOK_SECRET` set

### Verification

- [ ] Shopify products load on frontend
- [ ] Product images display from Shopify CDN
- [ ] Pricing displays correctly
- [ ] Hybrid grid shows both Supabase and Shopify products

## Phase 5: Development Testing

### Local Development

- [ ] `npm run dev` starts without errors
- [ ] Home page loads at `http://localhost:3000`
- [ ] Products display in grid
- [ ] Product cards show hover states
- [ ] Product detail pages load
- [ ] Images display or fallback gracefully

### Authentication

- [ ] "Enter the House" link visible in header
- [ ] Sign up page loads
- [ ] New account creation works
- [ ] Sign in page loads
- [ ] Existing account login works
- [ ] Header shows "Recognized" when logged in
- [ ] Sign out works

### Pricing

- [ ] Not logged in: Both prices display
- [ ] Not logged in: Standard and House labels visible
- [ ] Logged in: Only House price displays
- [ ] Logged in: No Standard/House labels
- [ ] Prices update immediately on login/logout

### Product Details

- [ ] Product detail pages load
- [ ] Three-line descriptions display correctly
- [ ] Images display
- [ ] Pricing displays
- [ ] Category displays
- [ ] Stock status displays
- [ ] "Add to Cart" button visible (if in stock)
- [ ] "Out of Stock" message visible (if no stock)

## Phase 6: Automated Sync

### Vercel Cron Setup

- [ ] `vercel.json` exists in project root
- [ ] Cron configuration set to 6 hours
- [ ] Project deployed to Vercel
- [ ] Environment variables added in Vercel dashboard
- [ ] First automated sync completed successfully

### Monitoring

- [ ] Check sync logs in Vercel
- [ ] Verify products update after sync
- [ ] Confirm `last_synced_at` timestamps update

## Phase 7: Production Deployment

### Pre-Deployment

- [ ] All environment variables documented
- [ ] `.env` not committed to git
- [ ] `.gitignore` includes `.env`
- [ ] All tests passing
- [ ] No console errors in development
- [ ] Images optimized

### Vercel Deployment

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Repository connected
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Production URL accessible

### Post-Deployment

- [ ] Production site loads
- [ ] Products display correctly
- [ ] Authentication works
- [ ] Images load
- [ ] Pricing displays correctly
- [ ] Google Sheets sync works
- [ ] Cron job runs automatically

## Phase 8: Final Verification

### Functionality

- [ ] All 50 products visible
- [ ] All product images display
- [ ] Search works (if implemented)
- [ ] Filtering works (if implemented)
- [ ] Mobile responsive
- [ ] Desktop responsive
- [ ] No console errors
- [ ] No broken links

### Performance

- [ ] Page load time < 3 seconds
- [ ] Images optimized
- [ ] No layout shifts
- [ ] Smooth hover transitions
- [ ] Fast navigation

### Security

- [ ] Environment variables secure
- [ ] API tokens not exposed
- [ ] RLS policies active
- [ ] Auth working correctly
- [ ] HTTPS enabled

## Troubleshooting Reference

If you encounter issues, check:

1. **Google Sheets Sync**: `GOOGLE_SHEETS_SYNC.md`
2. **Environment Setup**: `QUICK_START_SPRINT_2.md`
3. **General Issues**: `START_HERE.md`
4. **Architecture**: `ARCHITECTURE.md`

## Quick Commands

```bash
# Sync inventory
npm run sync-sheets

# Check missing images
npm run check-images

# Verify setup
npm run verify-setup

# Start dev server
npm run dev

# Build for production
npm run build
```

## Progress Summary

**Completed**: _____ / 100+ items
**Blocked**: _____
**In Progress**: _____

## Notes

Use this space for notes, issues, or reminders:

---

---

---

## Next Steps

Once all items are checked:
1. Review `SPRINT_2_COMPLETE.md` for what's been built
2. Start Phase 3: Cart & Checkout
3. Plan Phase 4: Sanctuary AI features

---

**Last Updated**: Sprint 2 Complete
**Status**: Ready for Google Sheets configuration
