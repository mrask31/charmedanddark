# Darkroom Security Flow Diagram

## Request Flow with Dual-Layer Protection

```
User navigates to /admin/darkroom
            ↓
┌───────────────────────────────────────────────────────────┐
│  LAYER 1: SERVER-SIDE MIDDLEWARE (middleware.ts)          │
│  ✓ Cannot be bypassed                                     │
│  ✓ Runs before page loads                                 │
│  ✓ Enforced by Next.js                                    │
└───────────────────────────────────────────────────────────┘
            ↓
    Check Supabase session
            ↓
    ┌─────────────────┐
    │ Not logged in?  │ ──YES──→ Redirect to /threshold/enter
    └─────────────────┘
            │ NO
            ↓
    Load admin whitelist
    (NEXT_PUBLIC_ADMIN_EMAILS or ADMIN_EMAILS)
            ↓
    Normalize user email (trim + lowercase)
    Normalize whitelist (trim + lowercase)
            ↓
    ┌─────────────────┐
    │ Email in list?  │ ──NO──→ Redirect to /not-authorized
    └─────────────────┘
            │ YES
            ↓
    ✓ Access granted - Continue to page
            ↓
┌───────────────────────────────────────────────────────────┐
│  LAYER 2: CLIENT-SIDE CHECKS (page.tsx)                   │
│  ✓ Provides immediate feedback                            │
│  ✓ Shows debug information                                │
│  ✓ Displays friendly errors                               │
└───────────────────────────────────────────────────────────┘
            ↓
    Load admin debug info
            ↓
    ┌─────────────────┐
    │ Env var set?    │ ──NO──→ Show error with instructions
    └─────────────────┘
            │ YES
            ↓
    ┌─────────────────┐
    │ Whitelist empty?│ ──YES──→ Show error with instructions
    └─────────────────┘
            │ NO
            ↓
    Check authentication (redundant)
            ↓
    Check admin access (redundant)
            ↓
    ✓ Show Darkroom UI
            ↓
    ┌─────────────────────────────────────────┐
    │ Show debug panel (if dev or admin)      │
    │ - Logged in as: user@example.com        │
    │ - Admin status: ✓ Admin                 │
    │ - Env var used: NEXT_PUBLIC_ADMIN_EMAILS│
    │ - Whitelist: admin@example.com, ...     │
    └─────────────────────────────────────────┘
```

## Email Normalization Flow

```
Environment Variable:
NEXT_PUBLIC_ADMIN_EMAILS="  Admin@Example.COM  ,  USER@domain.com  "
            ↓
    Split by comma
            ↓
    ["  Admin@Example.COM  ", "  USER@domain.com  "]
            ↓
    Trim whitespace
            ↓
    ["Admin@Example.COM", "USER@domain.com"]
            ↓
    Convert to lowercase
            ↓
    ["admin@example.com", "user@domain.com"]
            ↓
    Filter empty strings
            ↓
    ✓ Normalized whitelist: ["admin@example.com", "user@domain.com"]

User logs in as: "admin@EXAMPLE.com"
            ↓
    Trim whitespace
            ↓
    "admin@EXAMPLE.com"
            ↓
    Convert to lowercase
            ↓
    "admin@example.com"
            ↓
    ✓ Normalized user email: "admin@example.com"

Compare:
    "admin@example.com" === "admin@example.com"
            ↓
    ✓ MATCH - Access granted
```

## Dual Environment Variable Priority

```
Check for NEXT_PUBLIC_ADMIN_EMAILS
            ↓
    ┌─────────────────┐
    │ Is it set?      │ ──YES──→ Use NEXT_PUBLIC_ADMIN_EMAILS
    └─────────────────┘          (Debug shows: "NEXT_PUBLIC_ADMIN_EMAILS")
            │ NO
            ↓
Check for ADMIN_EMAILS
            ↓
    ┌─────────────────┐
    │ Is it set?      │ ──YES──→ Use ADMIN_EMAILS
    └─────────────────┘          (Debug shows: "ADMIN_EMAILS")
            │ NO
            ↓
    No env var configured
    (Debug shows: "NONE")
            ↓
    Show error: "Admin access is not configured"
```

## Security Comparison: Before vs After

### BEFORE (V1) - Client-Side Only
```
User navigates to /admin/darkroom
            ↓
    Page loads immediately
            ↓
    Client-side JavaScript runs
            ↓
    Check authentication
            ↓
    Check admin whitelist
            ↓
    ┌─────────────────┐
    │ Not admin?      │ ──YES──→ Redirect (client-side)
    └─────────────────┘
            │ NO
            ↓
    Show Darkroom UI

VULNERABILITY: User can bypass by:
- Disabling JavaScript
- Modifying client code
- Intercepting redirect
```

### AFTER (V2) - Server-Side + Client-Side
```
User navigates to /admin/darkroom
            ↓
    SERVER-SIDE MIDDLEWARE RUNS FIRST
            ↓
    Check authentication (server)
            ↓
    Check admin whitelist (server)
            ↓
    ┌─────────────────┐
    │ Not admin?      │ ──YES──→ Redirect (server-side)
    └─────────────────┘          BEFORE page loads
            │ NO                  CANNOT BE BYPASSED
            ↓
    Page loads (only if admin)
            ↓
    Client-side checks (redundant, for UX)
            ↓
    Show Darkroom UI + Debug panel

SECURE: Cannot bypass because:
✓ Middleware runs server-side
✓ Redirect happens before page loads
✓ No client code can interfere
✓ JavaScript disabled? Still protected
```

## Attack Scenarios and Protection

### Scenario 1: Direct URL Access
```
Attacker types: https://charmedanddark.vercel.app/admin/darkroom
            ↓
    Middleware intercepts
            ↓
    Not logged in
            ↓
    ✓ Redirected to /threshold/enter (server-side)
    ✗ Never sees Darkroom page
```

### Scenario 2: JavaScript Disabled
```
User disables JavaScript
            ↓
User navigates to /admin/darkroom
            ↓
    Middleware intercepts (runs server-side, no JS needed)
            ↓
    Not admin
            ↓
    ✓ Redirected to /not-authorized (server-side)
    ✗ Client-side checks never run (don't need to)
```

### Scenario 3: Modified Client Code
```
Attacker modifies client-side JavaScript
            ↓
Attacker bypasses client-side checks
            ↓
    BUT: Middleware already enforced access server-side
            ↓
    ✓ Page only loads if middleware allowed it
    ✗ Cannot bypass server-side enforcement
```

### Scenario 4: Session Hijacking
```
Attacker steals session cookie
            ↓
Attacker tries to access /admin/darkroom
            ↓
    Middleware checks session (valid)
            ↓
    Middleware checks email against whitelist
            ↓
    Stolen session email NOT in whitelist
            ↓
    ✓ Redirected to /not-authorized
    ✗ Session alone is not enough
```

## Debug Panel Information Flow

```
Admin user accesses /admin/darkroom
            ↓
    Middleware allows access
            ↓
    Page loads
            ↓
    Call getAdminDebugInfo()
            ↓
    ┌─────────────────────────────────────────┐
    │ Collect information:                     │
    │ - Current user email from Supabase       │
    │ - Admin whitelist from env var           │
    │ - Which env var was used                 │
    │ - Whether user is admin                  │
    │ - Raw env var value                      │
    └─────────────────────────────────────────┘
            ↓
    ┌─────────────────┐
    │ NODE_ENV === dev│ ──YES──→ Show debug panel
    └─────────────────┘
            │ NO
            ↓
    ┌─────────────────┐
    │ User is admin?  │ ──YES──→ Show debug panel
    └─────────────────┘
            │ NO
            ↓
    Hide debug panel
```

## Error Handling Flow

```
User navigates to /admin/darkroom
            ↓
    Middleware allows (user is admin)
            ↓
    Page loads
            ↓
    Check env var configuration
            ↓
    ┌─────────────────────────────────────────┐
    │ NEXT_PUBLIC_ADMIN_EMAILS not set?       │ ──YES──→ Show error:
    │ AND ADMIN_EMAILS not set?               │          "Admin access not configured"
    └─────────────────────────────────────────┘          + Instructions
            │ NO
            ↓
    ┌─────────────────────────────────────────┐
    │ Whitelist is empty?                      │ ──YES──→ Show error:
    └─────────────────────────────────────────┘          "Admin whitelist is empty"
            │ NO                                           + Instructions
            ↓
    ✓ Configuration valid
            ↓
    Show Darkroom UI
```

---

**Visual Guide**: This diagram shows the complete security flow
**Protection Level**: Bulletproof (server-side enforcement)
**Cannot Bypass**: Middleware runs before any client code
