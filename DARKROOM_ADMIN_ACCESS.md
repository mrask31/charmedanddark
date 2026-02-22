# Darkroom Admin Access Control

## Overview
The Darkroom (`/admin/darkroom`) is now protected and only accessible to authorized administrators.

## How It Works

### 1. Authentication Check
- User must be logged in via Supabase Auth
- If not logged in → redirected to `/threshold/enter`

### 2. Authorization Check
- User's email must be in `NEXT_PUBLIC_ADMIN_EMAILS` environment variable
- If not authorized → redirected to `/not-authorized`

### 3. Access Granted
- Only users who pass both checks can access the Darkroom

## Setup Instructions

### 1. Add Admin Emails to Environment Variables

**Local Development (.env.local):**
```env
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com,another-admin@example.com
```

**Vercel Production:**
1. Go to: https://vercel.com/mrask31/charmedanddark/settings/environment-variables
2. Add variable: `NEXT_PUBLIC_ADMIN_EMAILS`
3. Value: Comma-separated list of admin emails
4. Example: `admin@charmedanddark.com,ceo@charmedanddark.com`
5. Redeploy

### 2. Create Admin Account

If you don't have an account yet:
1. Go to `/threshold/enter`
2. Click "Need an account? Sign up"
3. Create account with email that matches `ADMIN_EMAILS`
4. Sign in
5. Navigate to `/admin/darkroom`

## Security Notes

### ✅ What's Protected
- Darkroom UI is client-side protected
- Redirects happen before page renders
- Admin emails checked on every page load

### ⚠️ Important
- `NEXT_PUBLIC_ADMIN_EMAILS` is visible in client-side code
- This is acceptable because:
  - Email list alone doesn't grant access
  - User must still authenticate with Supabase
  - Supabase handles password security
  - No sensitive tokens are exposed

### 🔒 What Remains Server-Only
- `SHOPIFY_ADMIN_ACCESS_TOKEN` - Never exposed to client
- `SUPABASE_SERVICE_ROLE_KEY` - Never exposed to client
- All Darkroom API processing happens server-side

## Testing Access Control

### Test 1: Not Logged In
1. Sign out (if logged in)
2. Navigate to `/admin/darkroom`
3. Should redirect to `/threshold/enter`

### Test 2: Logged In, Not Admin
1. Sign in with email NOT in `ADMIN_EMAILS`
2. Navigate to `/admin/darkroom`
3. Should redirect to `/not-authorized`

### Test 3: Logged In, Is Admin
1. Sign in with email IN `ADMIN_EMAILS`
2. Navigate to `/admin/darkroom`
3. Should see Darkroom interface

## Adding/Removing Admins

### Add Admin
1. Update `NEXT_PUBLIC_ADMIN_EMAILS` in Vercel
2. Add new email to comma-separated list
3. Redeploy (or wait for next deployment)
4. New admin can now access Darkroom

### Remove Admin
1. Update `NEXT_PUBLIC_ADMIN_EMAILS` in Vercel
2. Remove email from list
3. Redeploy
4. User will be redirected to `/not-authorized`

## Files Modified

### New Files
- `lib/auth/admin.ts` - Admin authorization utilities
- `app/not-authorized/page.tsx` - Access denied page
- `DARKROOM_ADMIN_ACCESS.md` - This documentation

### Modified Files
- `app/admin/darkroom/page.tsx` - Added auth checks
- `.env.example` - Added `NEXT_PUBLIC_ADMIN_EMAILS` documentation

## Troubleshooting

### "Access Denied" but I'm in ADMIN_EMAILS
- Check email spelling matches exactly (case-insensitive)
- Verify environment variable is set in Vercel
- Redeploy after changing environment variables
- Clear browser cache and sign in again

### Stuck on "Verifying access..."
- Check browser console for errors
- Verify Supabase credentials are correct
- Ensure user is logged in to Supabase

### Can't access after deployment
- Environment variables require redeployment to take effect
- Check Vercel deployment logs for errors
- Verify `NEXT_PUBLIC_ADMIN_EMAILS` is set in Vercel

## Future Enhancements

### Potential Improvements
- Database-based admin roles (more scalable)
- Admin management UI
- Audit logging for admin actions
- Session timeout configuration
- Two-factor authentication
