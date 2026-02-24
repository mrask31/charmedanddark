# Fix Supabase RLS Issue

**Problem**: Sync failing with "row-level security policy" errors  
**Cause**: Using anon key which has RLS restrictions  
**Solution**: Add service role key for admin operations

---

## What You Need to Do

### Step 1: Get Supabase Service Role Key (2 minutes)

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Settings** (gear icon in sidebar)
4. Click **API** in the settings menu
5. Scroll down to **Project API keys**
6. Find **service_role** key (NOT the anon key)
7. Click **Reveal** and copy it

**Important**: This key bypasses RLS - keep it secret!

---

### Step 2: Add to Vercel Environment Variables (2 minutes)

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Settings** tab
4. Click **Environment Variables**
5. Click **Add New**
6. Enter:
   - **Key**: `SUPABASE_SERVICE_ROLE_KEY`
   - **Value**: (paste the service role key you copied)
   - **Environments**: Select Production, Preview, Development
7. Click **Save**

---

### Step 3: Redeploy (1 minute)

1. Go to **Deployments** tab in Vercel
2. Click ⋯ on the latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for deployment to complete

---

### Step 4: Re-Run Sync (1 minute)

Once deployment completes:

**URL**: `https://charmedanddark.vercel.app/api/admin/sync-products`

**Expected**:
```json
{
  "success": true,
  "summary": {
    "totalProducts": 62,
    "inserted": 0,
    "updated": 62,
    "errors": 0
  }
}
```

All 62 products should update successfully now!

---

### Step 5: Re-Test Curator Notes

**URL**: `https://charmedanddark.vercel.app/api/admin/test-curator`

This should also work better now.

---

## Why This Happened

**Anon Key** (what we were using):
- Public, safe to expose to browser
- Has Row Level Security (RLS) restrictions
- Can only read/write data user has permission for

**Service Role Key** (what we need):
- Private, server-side only
- Bypasses ALL RLS policies
- Full admin access to database

For admin operations like syncing products, we need the service role key.

---

## Security Note

The service role key is only used in:
- Server-side API routes (`app/api/admin/*`)
- Never exposed to browser
- Never in client-side code

This is safe and standard practice for admin operations.

---

## Quick Checklist

- [ ] Get service role key from Supabase Dashboard
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel
- [ ] Select all environments (Production, Preview, Development)
- [ ] Save
- [ ] Redeploy in Vercel
- [ ] Wait 2-3 minutes
- [ ] Re-run sync
- [ ] Verify 62 products updated with 0 errors

---

**Status**: Waiting for service role key  
**ETA**: 5 minutes to fix  
**Next**: Add key → Redeploy → Re-sync
