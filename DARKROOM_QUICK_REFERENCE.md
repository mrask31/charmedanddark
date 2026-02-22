# Darkroom Quick Reference

## 🚀 Quick Start

1. **Access Darkroom**: Navigate to `/admin/darkroom` (admin-only)
2. **Click**: "Run Darkroom on Tagged Products"
3. **Watch**: Real-time progress as products process
4. **Done**: Branded images uploaded to Shopify, tags updated

## 📋 Required Shopify Tags

Products must have ALL three tags:
- `img:needs-brand` ✓
- `source:faire` ✓
- `dept:objects` ✓

## 🏷️ Tag Changes After Processing

**Added**:
- `img:branded`
- `bg:stone` or `bg:candle` or `bg:glass`

**Removed**:
- `img:needs-brand`

## 🔐 Environment Variables

```bash
# Shopify (Required)
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_xxxxx
NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=charmedanddark.myshopify.com

# AI Services (Required)
GEMINI_API_KEY=AIzaSyxxxxx
REPLICATE_API_TOKEN=r8_xxxxx

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Admin Access (Required - use either one)
NEXT_PUBLIC_ADMIN_EMAILS=email1@example.com,email2@example.com
# OR
ADMIN_EMAILS=email1@example.com,email2@example.com
```

**Note**: Emails are automatically normalized (trimmed, lowercased)

## 💰 Cost Per Image

- Background removal: ~$0.003
- Background generation: ~$0.005
- **Total**: ~$0.008 per image

## ⏱️ Processing Time

- Per product (3 images): 30-60 seconds
- Batch of 20 products: 10-20 minutes

## 🎨 Background Types

| Type | Best For | Prompt |
|------|----------|--------|
| **stone** | Heavy objects, furniture, structural items | Dark brutalist concrete wall |
| **candle** | Candles, ritual items, intimate objects | Warm candlelit atmosphere |
| **glass** | Glassware, delicate items, transparent objects | Reflective glass surface |

## 🔒 Safety Features

- ✅ **Server-side middleware** - Cannot bypass via URL
- ✅ **Client-side checks** - Immediate feedback
- ✅ **Email normalization** - Handles casing/spacing
- ✅ **Dual env var support** - Flexible configuration
- ✅ **Debug panel** - Self-diagnosing (dev only)
- ❌ Never processes `source:printify`
- ❌ Never processes `dept:wardrobe`
- ✅ Requires exact tag combination
- ✅ Batch limit: 20 products (max 50)
- ✅ Rate limiting: 3s between products

## 📁 Key Files

```
middleware.ts                        # Server-side route protection
app/admin/darkroom/page.tsx          # UI with debug panel
app/api/darkroom/run/route.ts        # API endpoint
lib/auth/admin.ts                    # Admin utilities (enhanced)
lib/shopify/darkroom.ts              # Shopify integration
lib/darkroom/shopify-pipeline.ts     # Pipeline orchestrator
lib/darkroom/background-selector.ts  # AI background selection
lib/darkroom/background-generation.ts # SDXL Lightning
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| No products found | Check Shopify tags are exact |
| Admin access denied | Add email to `NEXT_PUBLIC_ADMIN_EMAILS` |
| Access config error | Set `NEXT_PUBLIC_ADMIN_EMAILS` env var |
| Email not matching | Check debug panel - normalization handles this |
| Background timeout | Check `REPLICATE_API_TOKEN` |
| Upload failed | Verify Shopify API write permissions |
| Cost spike | Verify `num_inference_steps: 4` |
| Debug panel not showing | Only visible in dev or to admins |

## 📊 Success Indicators

✅ Progress counter increments
✅ Success count increases
✅ Branded images appear in Shopify
✅ Tags update correctly
✅ Cost stays under $0.01/image

## 🔄 Workflow

```
Tag products in Shopify
    ↓
Run Darkroom
    ↓
AI selects background
    ↓
Generate background (once)
    ↓
Process each image:
  - Remove background
  - Composite
  - Upload to Shopify
    ↓
Reorder media
    ↓
Update tags
    ↓
Done!
```

## 🎯 Next Actions

1. **Test**: Follow `DARKROOM_TESTING_GUIDE.md`
2. **Deploy**: Push to Vercel production
3. **Monitor**: Check Replicate costs
4. **Scale**: Process real Faire inventory

## 📚 Documentation

- `DARKROOM_ARCHITECTURE.md` - Complete system architecture
- `DARKROOM_ADMIN_ACCESS_V2.md` - Bulletproof admin security (NEW)
- `DARKROOM_TESTING_GUIDE.md` - Step-by-step testing
- `DARKROOM_COST_EMERGENCY.md` - Cost optimization history
- `DARKROOM_ADMIN_ACCESS.md` - Admin access control (V1)

---

**Status**: ✅ Ready for production testing with bulletproof security
**Last Updated**: Admin Access V2 Implementation
