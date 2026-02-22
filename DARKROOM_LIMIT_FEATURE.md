# Darkroom Limit Feature - Implementation Summary

## What Was Added

### UI Enhancements (app/admin/darkroom/page.tsx)

#### 1. GraphQL Query Display Box
Shows the exact query being used before running:
```
GraphQL Search Query:
tag:img:needs-brand AND tag:source:faire AND tag:dept:objects

Endpoint: /admin/api/2024-01/graphql.json
```

#### 2. Limit Input Control
- **Number input**: Manual entry (1-50)
- **Preset buttons**:
  - Test (1) - For testing single product
  - Normal (20) - Default batch size
  - Max (50) - Maximum allowed
- **Default**: 1 (safe for testing)
- **Client-side validation**: Enforces 1-50 range
- **Disabled during processing**: Prevents changes mid-run

#### 3. Dynamic Button Text
Button shows: `Run Darkroom (X product[s])`
- Updates based on selected limit
- Shows "1 product" or "X products" (plural)

### Backend Enforcement (app/api/darkroom/run/route.ts)

#### Hard Cap Implementation
```typescript
const requestedLimit = body.limit || 20;
const limit = Math.min(Math.max(1, requestedLimit), 50);
```

**Protection**:
- Minimum: 1 product
- Maximum: 50 products (hard cap)
- Even if UI is tampered with, backend enforces limit
- Logs both requested and actual limit

### Visual Design

**Query Box**:
- Light gray background (#f9f9f9)
- Dark terminal-style code display
- Green text for query (terminal aesthetic)
- Metadata shows endpoint

**Limit Controls**:
- Clean input with +/- controls
- Preset buttons with active state
- Active button: dark background
- Disabled state: 40% opacity

**Layout**:
```
┌─────────────────────────────────────────┐
│ Shopify Integration                     │
│                                         │
│ Automatically processes products...     │
│                                         │
│ ┌─────────────────────────────────────┐ │
│ │ GraphQL Search Query:               │ │
│ │ tag:img:needs-brand AND ...         │ │
│ │ Endpoint: /admin/api/...            │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Batch Limit: [  1  ]                   │
│ [Test (1)] [Normal (20)] [Max (50)]    │
│ Start with 1 to test...                │
│                                         │
│ [Run Darkroom (1 product)]             │
└─────────────────────────────────────────┘
```

## Usage

### Testing Workflow
1. **Start with Test (1)**:
   - Click "Test (1)" preset
   - Click "Run Darkroom (1 product)"
   - Verify single product processes correctly

2. **Scale to Normal (20)**:
   - After successful test, click "Normal (20)"
   - Click "Run Darkroom (20 products)"
   - Monitor progress

3. **Max Batch (50)**:
   - For large batches, click "Max (50)"
   - Click "Run Darkroom (50 products)"
   - Watch for rate limits

### Manual Entry
- Type any number 1-50 in input
- Client automatically clamps to valid range
- Backend enforces limit even if client bypassed

## Security

### Client-Side Validation
```typescript
onChange={(e) => setLimit(Math.min(50, Math.max(1, parseInt(e.target.value) || 1)))}
```
- Clamps input to 1-50 range
- Handles invalid input (defaults to 1)

### Server-Side Enforcement
```typescript
const limit = Math.min(Math.max(1, requestedLimit), 50);
```
- Hard cap at 50 products
- Cannot be bypassed by modifying client
- Logs requested vs actual limit

## Benefits

### Transparency
- Users see exact GraphQL query being used
- No mystery about what's being selected
- Clear endpoint information

### Safety
- Default to 1 product (safe testing)
- Easy presets for common scenarios
- Hard cap prevents runaway batches

### User Experience
- Quick presets for common limits
- Manual input for custom amounts
- Dynamic button text shows what will run
- Disabled during processing

## Testing Checklist

- [ ] Default limit is 1
- [ ] Preset buttons work (1, 20, 50)
- [ ] Manual input accepts 1-50
- [ ] Manual input rejects <1 (clamps to 1)
- [ ] Manual input rejects >50 (clamps to 50)
- [ ] Button text updates with limit
- [ ] Controls disabled during processing
- [ ] Backend enforces 50 max even if client bypassed
- [ ] GraphQL query box displays correctly
- [ ] Endpoint information shows correctly

## Example Scenarios

### Scenario 1: First Time User
1. Opens Darkroom
2. Sees "Test (1)" is recommended
3. Sees exact query that will be used
4. Clicks "Test (1)" → "Run Darkroom (1 product)"
5. Watches single product process
6. Verifies success before scaling up

### Scenario 2: Regular Use
1. Opens Darkroom
2. Clicks "Normal (20)"
3. Clicks "Run Darkroom (20 products)"
4. Monitors batch processing

### Scenario 3: Large Batch
1. Opens Darkroom
2. Clicks "Max (50)"
3. Clicks "Run Darkroom (50 products)"
4. Watches for rate limits

### Scenario 4: Custom Amount
1. Opens Darkroom
2. Types "5" in input
3. Clicks "Run Darkroom (5 products)"
4. Processes custom batch

### Scenario 5: Attempted Bypass
1. User opens DevTools
2. User modifies client to send limit: 1000
3. Backend receives request
4. Backend clamps to 50
5. Logs: "requested: 1000, actual: 50"
6. Processes 50 products (not 1000)

## Code Changes Summary

### Files Modified
1. `app/admin/darkroom/page.tsx`:
   - Added `limit` state (default: 1)
   - Added GraphQL query display box
   - Added limit input with presets
   - Added dynamic button text
   - Added styles for new components

2. `app/api/darkroom/run/route.ts`:
   - Enhanced limit validation
   - Added logging for requested vs actual
   - Enforced hard cap at 50

### Lines Added
- UI: ~100 lines (query box, limit controls, styles)
- Backend: ~5 lines (enhanced validation)

### Breaking Changes
- None (backward compatible)
- Default changed from 20 to 1 (safer)

## Future Enhancements

### Possible Additions
1. **Query Preview**: Show actual GraphQL query with variables
2. **Product Count**: Show how many products match before running
3. **Dry Run**: Preview what would be processed without running
4. **History**: Show previous runs with limits used
5. **Recommendations**: Suggest optimal batch size based on history

---

**Status**: ✅ Implemented and ready for testing
**Default Limit**: 1 (safe for testing)
**Maximum Limit**: 50 (hard cap enforced)
**Ready to Run**: Yes, start with limit=1
