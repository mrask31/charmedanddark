# Vercel Deployment - Ready to Deploy ✅

## Status: Code Pushed to GitHub

✅ All code committed and pushed to: `https://github.com/mrask31/charmedanddark.git`
✅ Branch: `main`
✅ Commit: Sprint 2 Complete with Google Sheets Sync

## What's Included in This Deployment

### Core Features
- ✅ Google Sheets sync system (50 physical products)
- ✅ Hybrid inventory (Shopify + Supabase)
- ✅ Dual pricing logic (Base + House prices)
- ✅ Authentication ("Enter the House")
- ✅ Three-line "Restrained" descriptions
- ✅ Unified product grid
- ✅ Product detail pages
- ✅ Modern Minimalist Gothic design

### API Endpoints
- ✅ `/api/sync-sheets` - Google Sheets sync
- ✅ `/api/cart` - Cart operations
- ✅ `/api/generate-token` - Token generation
- ✅ `/api/webhooks/orders-create` - Shopify webhooks

### Automated Tasks
- ✅ Vercel Cron: Syncs Google Sheets every 6 hours

## Vercel Configuration

### Environment Variables (Already Added ✅)

You've already added these to Vercel:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://ewsztwchfbjclbjsqhnd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=1zCLWZ8cbHolQ9K8fFdH9CzZgUMtN9EU667ycveFBWII
GOOGLE_SHEETS_SHEET_NAME=Physical Inventory
GOOGLE_SHEETS_CLIENT_EMAIL=kiro-sync-bot@charmed-and-dark.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Shopify (Optional - add when ready)
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token
SHOPIFY_ADMIN_ACCESS_TOKEN=your_admin_token
SHOPIFY_WEBHOOK_SECRET=your_webhook_secret

# Security (Optional)
APP_SECRET=your_random_32_character_secret
SYNC_API_TOKEN=your_sync_token
```

### Build Settings

Vercel should auto-detect these, but verify:

- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `next dev`

## Deployment Steps

### 1. Trigger Deployment

In Vercel dashboard:
1. Go to your project
2. Click "Deployments"
3. Click "Redeploy" or wait for automatic deployment from GitHub push

### 2. Monitor Build

Watch the build logs for:
- ✅ Dependencies installing (googleapis, dotenv, etc.)
- ✅ Next.js build completing
- ✅ No errors in build output

### 3. Verify Deployment

Once deployed, check:
- [ ] Site loads at your Vercel URL
- [ ] Home page displays
- [ ] No console errors in browser
- [ ] Environment variables are set (check Vercel dashboard)

### 4. Test Google Sheets Sync

Trigger the first sync:

```bash
curl -X POST https://your-app.vercel.app/api/sync-sheets
```

Expected response:
```json
{
  "success": true,
  "results": {
    "created": 50,
    "updated": 0,
    "errors": 0
  },
  "timestamp": "2026-02-19T..."
}
```

### 5. Verify Products in Supabase

Check Supabase dashboard:

```sql
SELECT COUNT(*) FROM products WHERE sync_source = 'google_sheets';
-- Should return 50

SELECT handle, title, base_price, house_price, stock_quantity
FROM products
WHERE sync_source = 'google_sheets'
LIMIT 5;
```

### 6. Test Frontend

Visit your Vercel URL and verify:
- [ ] Products display in grid
- [ ] Product images load or fallback
- [ ] "Enter the House" link works
- [ ] Sign up/Sign in works
- [ ] Pricing changes when authenticated
- [ ] Product detail pages load

## Automated Sync

The Vercel Cron job will automatically run every 6 hours:
- Configured in `vercel.json`
- Endpoint: `/api/sync-sheets`
- Schedule: `0 */6 * * *` (every 6 hours)

Check cron logs in Vercel dashboard under "Cron Jobs" tab.

## Post-Deployment Tasks

### Immediate
1. ✅ Verify deployment successful
2. ✅ Test Google Sheets sync
3. ✅ Verify products in Supabase
4. ✅ Test authentication
5. ✅ Check pricing display

### Next Steps
1. Add your 50 products to Google Sheet
2. Trigger sync to populate Supabase
3. Organize product images in `/public/products/[handle]/`
4. Add Shopify credentials (when ready)
5. Test with real product data

## Troubleshooting

### Build Fails

**Check**:
- Environment variables are set correctly
- No syntax errors in code
- Dependencies in package.json are correct

**Solution**:
- Review build logs in Vercel
- Check for missing environment variables
- Verify Node.js version compatibility

### Sync Fails

**Check**:
- Google Sheets credentials are correct
- Spreadsheet ID is correct
- Service account has access to sheet
- Private key includes `\n` characters

**Solution**:
- Test credentials locally first
- Verify sheet is shared with service account
- Check Vercel function logs

### Products Don't Display

**Check**:
- Sync completed successfully
- Products exist in Supabase
- No console errors in browser
- Images exist or fallback works

**Solution**:
- Run sync manually
- Check Supabase table
- Verify image paths

## Success Criteria

Deployment is successful when:
- ✅ Site loads without errors
- ✅ Google Sheets sync works
- ✅ 50 products appear in Supabase
- ✅ Products display on frontend
- ✅ Authentication works
- ✅ Pricing displays correctly
- ✅ Cron job runs automatically

## Support

### Documentation
- `START_HERE.md` - Main guide
- `GOOGLE_SHEETS_SYNC.md` - Sync documentation
- `SPRINT_2_COMPLETE.md` - Features overview
- `ARCHITECTURE.md` - System design

### Logs
- **Vercel Build Logs**: Vercel dashboard → Deployments → [deployment] → Build Logs
- **Function Logs**: Vercel dashboard → Functions → [function] → Logs
- **Cron Logs**: Vercel dashboard → Cron Jobs

### Quick Commands

```bash
# Trigger manual sync
curl -X POST https://your-app.vercel.app/api/sync-sheets

# Check deployment status
vercel ls

# View logs
vercel logs your-app.vercel.app
```

---

**Status**: Ready to deploy
**Repository**: https://github.com/mrask31/charmedanddark.git
**Branch**: main
**Next**: Deploy in Vercel dashboard
