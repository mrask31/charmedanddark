# Install Shopify App and Get Access Token

The new Shopify Dev Dashboard (post-Jan 2026) requires a different approach than the old custom apps.

## Option 1: Install via Shopify Admin (Recommended)

### Step 1: Install Your App
1. Go to your Shopify Admin: https://admin.shopify.com/store/charmedanddark
2. Click **Settings** (bottom left)
3. Click **Apps and sales channels**
4. Click **Develop apps** (top right)
5. Find your "Darkroom (internal)" app
6. Click **Install app**
7. Review permissions and click **Install**

### Step 2: Get Access Token
After installation:
1. You should see an **API credentials** tab
2. Click **Reveal token once** under "Admin API access token"
3. Copy the token (starts with `shpat_`)
4. Save it immediately - you can only see it once!

### Step 3: Add to Vercel
1. Go to: https://vercel.com/mrask31/charmedanddark/settings/environment-variables
2. Add variable:
   - Name: `SHOPIFY_ADMIN_ACCESS_TOKEN`
   - Value: `shpat_...` (your token)
3. Save and redeploy

---

## Option 2: Create API Route for Installation

If the above doesn't work, we can create an OAuth installation flow in your Next.js app.

This requires:
1. Creating `/api/auth/shopify/install` route
2. Creating `/api/auth/shopify/callback` route
3. Visiting the install URL to authorize
4. Storing the token in environment variables

Let me know if you need Option 2 and I'll create the routes.

---

## Troubleshooting

**"Install app" button is grayed out:**
- Make sure you've saved your app configuration
- Ensure Admin API scopes are selected
- Try refreshing the page

**Can't find "API credentials" tab:**
- The app must be installed first
- Look for tabs: Configuration | API credentials | Extensions

**Token doesn't start with `shpat_`:**
- Make sure you're copying the "Admin API access token"
- Not the "API key" or "API secret key"
