# Launch Checklist - Charmed & Dark

## Pre-Launch Verification

### Environment Variables ✅
Verify all required environment variables are set in Vercel:

**Required**:
- [ ] `NODE_ENV=production`
- [ ] `NEXT_PUBLIC_SITE_URL=https://charmedanddark.com` (or .vercel.app)
- [ ] `GOOGLE_GEMINI_API_KEY`
- [ ] `SHOPIFY_ADMIN_ACCESS_TOKEN`
- [ ] `NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN`
- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`

**Optional**:
- [ ] `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- [ ] `GOOGLE_FEED_DEFAULT_SHIPPING_USD`

### Code Quality ✅
- [x] All console.log/warn gated behind development flag
- [x] Debug routes return 404 in production
- [x] No TODO/FIXME/HACK comments
- [x] TypeScript diagnostics clean
- [x] Error handling in place

### Performance ✅
- [x] Curator note generation has 3-second timeout
- [x] Metafield caching implemented
- [x] Darkroom image prioritization with fallback
- [x] Graceful degradation for all AI features

### SEO ✅
- [x] Robots.txt configured (allows production, blocks preview)
- [x] Sitemap generated dynamically
- [x] JSON-LD schema on product pages
- [x] Canonical URLs configured
- [x] Open Graph tags configured
- [ ] Search Console verification (manual step)

## Launch Day Tasks

### 1. Deploy to Production
- [ ] Merge to main branch
- [ ] Verify Vercel deployment successful
- [ ] Check deployment logs for errors

### 2. Verify Core Functionality
- [ ] Homepage loads correctly
- [ ] Shop page displays products
- [ ] Product pages load with images
- [ ] Sanctuary signup works
- [ ] Sanctuary signin works
- [ ] Member pricing displays correctly
- [ ] Curator notes display (or gracefully absent)
- [ ] Cart functionality works
- [ ] Darkroom images load in shop

### 3. Verify SEO Configuration
- [ ] Visit `/robots.txt` - verify production rules
- [ ] Visit `/sitemap.xml` - verify products listed
- [ ] Visit `/api/merchant/feed` - verify XML feed
- [ ] Check page source for JSON-LD schema
- [ ] Check page source for canonical URLs

### 4. Search Console Setup
- [ ] Add property to Google Search Console
- [ ] Choose verification method (HTML tag recommended)
- [ ] If HTML tag: Add to `app/layout.tsx` metadata
- [ ] Click "Verify" in Search Console
- [ ] Submit sitemap: `https://charmedanddark.com/sitemap.xml`

### 5. Monitor Initial Performance
- [ ] Check Vercel logs for errors (first hour)
- [ ] Monitor Gemini API usage
- [ ] Check Supabase logs
- [ ] Verify no console.log spam in production logs
- [ ] Test page load speeds (< 2 seconds target)

## Week 1 Monitoring

### Daily Checks
- [ ] Review error logs in Vercel
- [ ] Check Gemini API usage and costs
- [ ] Monitor Supabase database performance
- [ ] Verify Sanctuary signups working
- [ ] Check Shopify customer sync success rate

### Performance Metrics
- [ ] Product page load time (target: < 2s)
- [ ] Shop page load time (target: < 2s)
- [ ] Curator note generation success rate (target: > 90%)
- [ ] Curator note timeout rate (target: < 10%)
- [ ] Darkroom image load success rate (target: > 95%)

### SEO Metrics (Search Console)
- [ ] Crawl rate (check after 3-5 days)
- [ ] Index coverage (check after 7 days)
- [ ] Sitemap submission status
- [ ] Any crawl errors

## Week 2-4 Optimization

### Content Quality
- [ ] Review curator notes for quality (spot check 20 products)
- [ ] Verify no marketing fluff in curator notes
- [ ] Check Darkroom background selection accuracy
- [ ] Review member pricing display

### Performance Optimization
- [ ] Analyze Core Web Vitals (LCP, FID, CLS)
- [ ] Optimize slow-loading pages
- [ ] Review Gemini API costs vs. value
- [ ] Consider batch curator note generation

### SEO Optimization
- [ ] Review indexed pages in Search Console
- [ ] Fix any crawl errors
- [ ] Monitor organic search traffic
- [ ] Optimize meta descriptions if needed

## Rollback Plan

### If Critical Issues Arise
1. **Immediate**: Revert to previous deployment in Vercel
2. **Identify**: Check logs to identify issue
3. **Fix**: Create hotfix branch
4. **Test**: Verify fix in preview deployment
5. **Deploy**: Merge hotfix and redeploy

### Common Issues & Solutions

**Issue**: Curator notes not generating
- **Check**: Gemini API key configured
- **Check**: Timeout not too aggressive (3s should be fine)
- **Fallback**: Product pages still work without curator notes

**Issue**: Darkroom images not loading
- **Check**: Supabase storage bucket permissions
- **Check**: Image URLs are public
- **Fallback**: Shopify images load automatically

**Issue**: Member pricing not showing
- **Check**: Supabase Auth configured
- **Check**: User metadata has sanctuary_member flag
- **Fallback**: Regular pricing still works

**Issue**: Shopify customer sync failing
- **Check**: Admin API token has correct scopes
- **Check**: Customer creation permissions
- **Fallback**: Users can still sign up (sync can be retried)

## Success Criteria

### Day 1
- [x] Site deployed and accessible
- [ ] No critical errors in logs
- [ ] Core functionality working (shop, products, cart)
- [ ] Sanctuary signup working
- [ ] Member pricing displaying

### Week 1
- [ ] Curator notes generating successfully (> 90% success rate)
- [ ] Darkroom images loading (> 95% success rate)
- [ ] Page load times acceptable (< 2s)
- [ ] No production log spam
- [ ] Search Console verified and sitemap submitted

### Week 4
- [ ] Organic search traffic starting
- [ ] Products indexed in Google
- [ ] Member signups occurring
- [ ] Curator notes providing value
- [ ] Performance metrics stable

## Post-Launch Enhancements

### Short-Term (1-2 months)
- [ ] Batch curator note generation for all products
- [ ] Member dashboard (order history, preferences)
- [ ] Early access products for members
- [ ] A/B test curator note styles

### Medium-Term (3-6 months)
- [ ] Expanded curator insights (care instructions, styling tips)
- [ ] Member-only collections
- [ ] Personalized product recommendations
- [ ] Enhanced Darkroom automation

### Long-Term (6-12 months)
- [ ] Multilingual curator notes
- [ ] Advanced member tiers
- [ ] Community features
- [ ] Mobile app

## Contact & Support

### Key Services
- **Hosting**: Vercel (vercel.com)
- **Database**: Supabase (supabase.com)
- **E-commerce**: Shopify (shopify.com)
- **AI**: Google Gemini (ai.google.dev)

### Monitoring Tools
- **Logs**: Vercel Dashboard
- **SEO**: Google Search Console
- **Analytics**: (to be configured)
- **Errors**: Vercel Error Tracking

## Notes

- All development logs are gated behind `NODE_ENV === 'development'`
- Debug routes return 404 in production automatically
- Curator notes have 3-second timeout for performance
- Darkroom images fall back to Shopify images gracefully
- Member pricing falls back to regular pricing if auth fails

---

**Status**: Ready for Launch ✅

**Last Updated**: 2026-02-23

**Prepared By**: Kiro AI Assistant
