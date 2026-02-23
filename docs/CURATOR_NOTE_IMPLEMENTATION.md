# Curator's Note Implementation

## Overview
The Curator's Note feature provides AI-generated, high-end brutalist product descriptions that focus on texture, shadows, and architectural presence. This creates an "invisible AI" experience where the AI-generated content feels like it was written by a human curator.

## Architecture

### 1. Curator Note Generator (`lib/curator/generator.ts`)
- Uses Gemini 1.5 Flash model (via `getGeminiModel('darkroom')`)
- Generates 2-sentence descriptions focused on material qualities
- Prompt tuned for brutalist aesthetic (no marketing fluff)
- Returns cleaned text (removes quotes, extra whitespace)

### 2. Server Actions (`app/product/[handle]/actions.ts`)
- `getCuratorNote()` - Main entry point for fetching/generating notes
- `fetchCuratorNoteMetafield()` - Checks Shopify for existing `custom.curator_note` metafield
- `saveCuratorNoteMetafield()` - Saves generated note to Shopify for future use
- Uses Admin GraphQL API for metafield operations

### 3. Product Page Integration (`app/product/[handle]/page.tsx`)
- Server-side rendering (SSR)
- Fetches curator note during page generation
- Passes note to ProductClient as prop
- Falls back gracefully if generation fails

### 4. UI Display (`app/product/[handle]/ProductClient.tsx`)
- Displays curator note in dedicated section
- Positioned below product description, above "Add to Cart"
- Monospace font (JetBrains Mono fallback to Courier New)
- Subtle gray background with 1px border
- "Curator's Note" label in uppercase, tracked

## Data Flow

```
Product Page Load
    ↓
getCuratorNote(productId, title, type, description)
    ↓
Check Shopify Metafield (custom.curator_note)
    ↓
    ├─ Found → Return existing note
    └─ Not Found → Generate with Gemini
        ↓
        Generate with AI (2 sentences, brutalist style)
        ↓
        Save to Shopify Metafield (for future use)
        ↓
        Return generated note
    ↓
Display in ProductClient
```

## Prompt Engineering

The curator prompt is tuned for:
- **Brutalist aesthetic**: Direct, minimal, architectural language
- **Material focus**: Texture, shadows, physical presence
- **No marketing fluff**: Avoids words like "stunning", "must-have", "perfect"
- **2-sentence constraint**: Forces concise, impactful descriptions

Example prompt:
```
Act as a high-end brutalist curator. Write a 2-sentence description of this product 
that focuses on texture, shadows, and architectural presence. Avoid marketing fluff 
like "stunning" or "must-have." Be direct, minimal, and focused on material qualities.

Product Title: Gothic Hoodie
Product Type: Apparel
Product Description: Premium black hoodie with gothic design

Write only the 2-sentence curator's note. No preamble, no explanation.
```

## UI Styling

```typescript
curatorNote: {
  padding: '1rem',
  backgroundColor: '#fafafa',
  border: '1px solid #e8e8e3',
  marginTop: '0.5rem',
}

curatorLabel: {
  fontSize: '0.65rem',
  color: '#404040',
  textTransform: 'uppercase',
  letterSpacing: '0.15em',
  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
  marginBottom: '0.5rem',
}

curatorText: {
  fontSize: '0.875rem',
  lineHeight: 1.6,
  color: '#2d2d2d',
  fontFamily: "'JetBrains Mono', 'Courier New', monospace",
  letterSpacing: '0.01em',
}
```

## Shopify Metafield Configuration

**Namespace**: `custom`  
**Key**: `curator_note`  
**Type**: `multi_line_text_field`

This metafield stores the generated curator note for future page loads, avoiding redundant AI generation.

## Error Handling

- **Metafield fetch fails**: Falls back to AI generation
- **AI generation fails**: Returns null, curator note section not displayed
- **Metafield save fails**: Logs error but doesn't block page render
- **Empty AI response**: Returns null, logs warning

## Performance Considerations

1. **Server-Side Generation**: Curator notes are generated during SSR, not client-side
2. **Caching via Metafields**: Once generated, notes are stored in Shopify
3. **Graceful Degradation**: If generation fails, product page still renders
4. **No Blocking**: AI generation doesn't block page render (async)

## Testing Checklist

- [ ] Verify curator note displays on product pages
- [ ] Check monospace font rendering (JetBrains Mono)
- [ ] Confirm 2-sentence constraint is respected
- [ ] Test metafield caching (second load should use cached note)
- [ ] Verify graceful fallback when AI fails
- [ ] Check brutalist aesthetic (no marketing fluff)
- [ ] Test on products with/without descriptions
- [ ] Verify Shopify metafield is saved correctly

## Future Enhancements

1. **Batch Generation**: Generate curator notes for all products via admin panel
2. **Manual Override**: Allow manual editing of curator notes in Shopify admin
3. **Style Variations**: Different curator styles for different product types
4. **Multilingual Support**: Generate notes in multiple languages
5. **A/B Testing**: Test different prompt styles for conversion optimization

## Environment Variables

**Required**:
- `GOOGLE_GEMINI_API_KEY` - For AI generation
- `SHOPIFY_ADMIN_ACCESS_TOKEN` - For metafield operations
- `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN` - Store domain

## Files Modified

- `lib/curator/generator.ts` - NEW: AI generation logic
- `app/product/[handle]/actions.ts` - NEW: Server actions for metafield operations
- `app/product/[handle]/page.tsx` - UPDATED: Fetch curator note server-side
- `app/product/[handle]/ProductClient.tsx` - UPDATED: Display curator note UI
- `app/shop/page.tsx` - UPDATED: Enhanced Darkroom image prioritization with error handling

## Darkroom Image Prioritization (Shop Page)

The shop page now includes:
- **Darkroom Priority**: Checks Supabase `darkroom` bucket for branded images first
- **Graceful Fallback**: Falls back to Shopify images if Darkroom image missing
- **Error Handling**: Logs warnings but doesn't break grid layout
- **Missing Image Placeholder**: Shows "No Image" placeholder if both sources fail
- **Logging**: Logs which image source is used for debugging

## Status

✅ **COMPLETE** - Curator's Note feature fully implemented and ready for testing
