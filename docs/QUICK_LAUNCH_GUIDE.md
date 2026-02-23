# Quick Launch Guide

**3 Steps to Production**

---

## Step 1: Run Health Check

**URL**: `https://charmedanddark.vercel.app/api/health-check/curator`

**What to Check**:
- `passed: true`
- `successRate` >80%

**If Failed**: See `docs/HEALTH_CHECK_USAGE.md` for troubleshooting

---

## Step 2: Deploy to Production

```bash
git push origin reset/google-revenue-engine
```

**Verify Deployment**:
- Visit `https://charmedanddark.com`
- Check `/returns` page exists
- Visit `/sanctuary` - verify toast appears

---

## Step 3: Submit Sitemap

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select `charmedanddark.com`
3. Click "Sitemaps"
4. Enter: `sitemap.xml`
5. Click "Submit"

**Done!** Google will start crawling within 24-48 hours.

---

## Quick Verification

**Sitemap**: `https://charmedanddark.com/sitemap.xml`  
**Health Check**: `https://charmedanddark.com/api/health-check/curator`  
**Returns Page**: `https://charmedanddark.com/returns`  
**Sanctuary Toast**: `https://charmedanddark.com/sanctuary`

---

**Full Documentation**: `docs/SEO_HANDSHAKE_COMPLETE.md`
