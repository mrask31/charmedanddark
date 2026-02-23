# PR #1: Safe Repo Cleanup (Phase 1)

## Branch
`reset/google-revenue-engine`

## Objective
Safe cleanup of cruft with zero behavior changes. This is Phase 1 of the repository audit and cleanup plan.

## Changes Made

### Files Deleted ✅
- [x] `scripts/test-shopify-connection.js` - One-off test script
- [x] `test-narrative-api.js` - One-off test script

### Files Added ✅
- [x] `docs/REPO_AUDIT_AND_CLEANUP_PLAN.md` - Comprehensive repository audit document

### Files Not Found (Already Cleaned Up)
The following files from the cleanup plan were not found in the repository:
- `middleware copy.ts`
- `temp-test-shopify.js`
- `test-replicate.js`
- `scripts/migrate-products.js`
- `scripts/sync-google-sheets.js`
- `scripts/update-product-images.js`
- `scripts/fix-image-urls.js`

### .gitignore Status ✅
- Coverage directory already properly ignored (`/coverage`)

## Verification

### Build Status
⚠️ Unable to verify build due to npm install issues with file path containing spaces. However:
- No code changes were made
- Only test scripts were deleted
- No imports or dependencies affected

### Safety Checklist
- [x] No production code modified
- [x] No API routes changed
- [x] No library files touched
- [x] No component files modified
- [x] Only test/temp scripts removed
- [x] Audit document added for reference

## Impact
- **Risk Level**: None (zero behavior change)
- **Files Removed**: 2
- **Files Added**: 1 (documentation)
- **Breaking Changes**: None

## Next Steps (Future PRs)
As documented in `docs/REPO_AUDIT_AND_CLEANUP_PLAN.md`:

**Phase 2**: Review Before Delete
- Legacy Darkroom CSV pipeline
- Debug endpoints
- Duplicate storefront client
- Duplicate product image directories

**Phase 3**: Consolidations
- Shopify clients (3 → 1)
- Gemini clients (2 → 1)
- Documentation reorganization

## Audit Summary
See `docs/REPO_AUDIT_AND_CLEANUP_PLAN.md` for complete details:
- **Top 10 Cruft Candidates** identified
- **Top 5 Duplicates** to consolidate
- **Proposed target structure** documented
- **Estimated cleanup impact**: 50-60 files to remove/relocate

## PR Link
https://github.com/mrask31/charmedanddark/pull/new/reset/google-revenue-engine
