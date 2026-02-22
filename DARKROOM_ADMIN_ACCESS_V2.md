# Darkroom Admin Access Control V2 - Bulletproof Edition

## Overview

Darkroom now has **dual-layer admin protection**:
1. **Server-side middleware** - Enforces access at the route level (cannot be bypassed)
2. **Client-side checks** - Provides immediate feedback and debug info

## Features

### 1. Bulletproof Email Normalization
- Trims whitespace from all emails
- Converts to lowercase for comparison
- Prevents casing/spacing issues

### 2. Dual Environment Variable Support
- **Preferred**: `NEXT_PUBLIC_ADMIN_EMAILS`
- **Fallback**: `ADMIN_EMAILS`
- Automatically uses whichever is configured

### 3. Self-Diagnosing Debug Panel
- Shows logged-in email
- Shows admin whitelist
- Shows which env var was used
- Shows access status (admin or not)
- Only visible in development or to admin users

### 4. Friendly Error Messages
- Clear error if env var is missing
- Instructions on how to fix
- Examples for single and multiple admins

### 5. Server-Side Route Protection
- Next.js middleware enforces access
- Cannot be bypassed via URL manipulation
- Redirects happen server-side before page loads

## Architecture

### Server-Side Protection (Primary)
**File**: `middleware.ts`


- Runs on every request to `/admin/darkroom`
- Checks Supabase session server-side
- Validates email against whitelist
- Redirects before page loads:
  - Not authenticated → `/threshold/enter`
  - Not admin → `/not-authorized`
- **Cannot be bypassed** by client-side manipulation

### Client-Side Protection (Secondary)
**File**: `app/admin/darkroom/page.tsx`

- Provides immediate feedback
- Shows loading state
- Displays friendly error messages
- Includes debug panel for troubleshooting
- Redundant check (middleware already enforced)

### Admin Utilities
**File**: `lib/auth/admin.ts`

Functions:
- `getAdminWhitelist()` - Loads and normalizes whitelist
- `checkAdminAccess()` - Validates user is admin
- `checkAuthenticated()` - Validates user is logged in
- `getAdminDebugInfo()` - Returns debug information

## Environment Variables

### Option 1: NEXT_PUBLIC_ADMIN_EMAILS (Recommended)
```bash
NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

### Option 2: ADMIN_EMAILS (Fallback)
```bash
ADMIN_EMAILS=admin@example.com
```

### Multiple Admins
```bash
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com,admin3@example.com
```

### Normalization Examples
All of these will work correctly:
```bash
# With spaces (will be trimmed)
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com, admin2@example.com

# Mixed casing (will be lowercased)
NEXT_PUBLIC_ADMIN_EMAILS=Admin@Example.com,USER@DOMAIN.COM

# Extra whitespace (will be cleaned)
NEXT_PUBLIC_ADMIN_EMAILS=  admin@example.com  ,  user@domain.com  
```

## Debug Panel

### When Visible
- Always visible in development (`NODE_ENV !== 'production'`)
- Visible to admin users in production

### Information Shown
1. **Logged in as**: Current user email
2. **Admin status**: ✓ Admin or ✗ Not Admin
3. **Env var used**: Which variable was loaded
4. **Admin whitelist**: List of authorized emails
5. **Raw env value**: Exact value from environment

### Example Output
```
Admin Debug Info

Logged in as:        admin@example.com
Admin status:        ✓ Admin
Env var used:        NEXT_PUBLIC_ADMIN_EMAILS
Admin whitelist:     admin@example.com, user@example.com
Raw env value:       admin@example.com, user@example.com
```

## Error Messages

### Missing Environment Variable
```
Access Configuration Error

Admin access is not configured. Please set NEXT_PUBLIC_ADMIN_EMAILS 
or ADMIN_EMAILS environment variable.

To fix this, add the following environment variable in Vercel:
NEXT_PUBLIC_ADMIN_EMAILS=your-email@example.com

For multiple admins, use comma-separated emails:
NEXT_PUBLIC_ADMIN_EMAILS=admin1@example.com,admin2@example.com
```

### Empty Whitelist
```
Access Configuration Error

Admin whitelist is empty. Please add at least one email to 
NEXT_PUBLIC_ADMIN_EMAILS or ADMIN_EMAILS.
```

## Security Features

### 1. Server-Side Enforcement
- Middleware runs before page loads
- Cannot be bypassed by disabling JavaScript
- Cannot be bypassed by modifying client code
- Cannot be bypassed by direct URL access

### 2. Session Validation
- Uses Supabase Auth session cookies
- Validates session server-side
- No token exposure to client

### 3. Whitelist Validation
- Email must exactly match (after normalization)
- Case-insensitive comparison
- Whitespace-insensitive comparison

### 4. No Secret Exposure
- Shopify Admin token stays server-only
- Admin whitelist is public (NEXT_PUBLIC_*) but harmless
- No sensitive data in debug panel

## Testing

### Test 1: Not Logged In
1. Clear cookies/logout
2. Navigate to `/admin/darkroom`
3. **Expected**: Redirect to `/threshold/enter` (server-side)

### Test 2: Logged In, Not Admin
1. Log in with email NOT in whitelist
2. Navigate to `/admin/darkroom`
3. **Expected**: Redirect to `/not-authorized` (server-side)

### Test 3: Logged In, Admin
1. Log in with email in whitelist
2. Navigate to `/admin/darkroom`
3. **Expected**: Page loads, debug panel shows admin status

### Test 4: Email Normalization
1. Set env var: `NEXT_PUBLIC_ADMIN_EMAILS=Admin@Example.COM`
2. Log in as: `admin@example.com`
3. **Expected**: Access granted (normalized match)

### Test 5: Whitespace Handling
1. Set env var: `NEXT_PUBLIC_ADMIN_EMAILS=  admin@example.com  ,  user@example.com  `
2. Log in as: `admin@example.com`
3. **Expected**: Access granted (whitespace trimmed)

### Test 6: Fallback Env Var
1. Remove `NEXT_PUBLIC_ADMIN_EMAILS`
2. Set `ADMIN_EMAILS=admin@example.com`
3. Log in as: `admin@example.com`
4. **Expected**: Access granted, debug shows "ADMIN_EMAILS" as source

### Test 7: Missing Env Var
1. Remove both env vars
2. Navigate to `/admin/darkroom`
3. **Expected**: Error message with instructions

### Test 8: Debug Panel Visibility
1. In development: Debug panel always visible
2. In production (admin): Debug panel visible
3. In production (non-admin): Cannot access page (redirected)

## Troubleshooting

### Issue: "Access Configuration Error"
**Cause**: Environment variable not set or empty
**Solution**: Set `NEXT_PUBLIC_ADMIN_EMAILS` in Vercel dashboard

### Issue: Redirect loop
**Cause**: Email not in whitelist or whitelist malformed
**Solution**: Check debug panel, verify email matches whitelist exactly

### Issue: Debug panel not showing
**Cause**: In production and not admin
**Solution**: This is expected - debug only shows to admins in production

### Issue: Access denied despite correct email
**Cause**: Casing or whitespace mismatch
**Solution**: Check debug panel "Raw env value" - normalization should handle this

### Issue: Middleware not running
**Cause**: Middleware config may be incorrect
**Solution**: Verify `middleware.ts` exists at project root with correct matcher

## Deployment Checklist

- [ ] Set `NEXT_PUBLIC_ADMIN_EMAILS` in Vercel
- [ ] Verify email addresses are correct
- [ ] Test login with admin email
- [ ] Test login with non-admin email
- [ ] Verify server-side redirects work
- [ ] Check debug panel shows correct info
- [ ] Confirm Shopify tokens stay server-only
- [ ] Test direct URL access (should redirect)

## Comparison: V1 vs V2

| Feature | V1 | V2 |
|---------|----|----|
| Client-side checks | ✓ | ✓ |
| Server-side enforcement | ✗ | ✓ |
| Email normalization | Partial | Full |
| Dual env var support | ✗ | ✓ |
| Debug panel | ✗ | ✓ |
| Friendly error messages | ✗ | ✓ |
| Bypass protection | Vulnerable | Protected |

## Files Modified

1. `lib/auth/admin.ts` - Enhanced with normalization and debug
2. `app/admin/darkroom/page.tsx` - Added debug panel and error handling
3. `middleware.ts` - NEW - Server-side route protection
4. `app/admin/darkroom/middleware.ts` - NEW - Helper functions

## Next Steps

1. Deploy to Vercel
2. Test all scenarios
3. Verify debug panel in development
4. Confirm redirects work in production
5. Monitor for any access issues

---

**Status**: ✅ Bulletproof admin access control implemented
**Last Updated**: Prompt 1-3 Implementation
