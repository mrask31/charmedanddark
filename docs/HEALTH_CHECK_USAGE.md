# Curator Health Check - Usage Guide

## Overview
The curator health check tests curator note generation for the first 10 products to ensure the AI generation and Shopify metafield saving is working correctly.

## How to Run

### Option 1: API Route (Recommended - Works Everywhere)

**URL**: `/api/health-check/curator`

**Production**: `https://charmedanddark.com/api/health-check/curator`  
**Preview**: `https://charmedanddark.vercel.app/api/health-check/curator`

**Methods**:
1. **Browser**: Simply visit the URL in your browser (easiest)
2. **curl**: `curl https://charmedanddark.com/api/health-check/curator`
3. **PowerShell**: `Invoke-WebRequest https://charmedanddark.vercel.app/api/health-check/curator | Select-Object -Expand Content`
4. **Postman/Insomnia**: GET request to the URL

**Why This is Recommended**:
- No local dependencies required
- Works on any platform (Windows, Mac, Linux)
- Tests the actual production environment
- No PATH or npm script issues

### Option 2: npm Script (Local Testing Only)

```bash
npm run health-check:curator
```

**Windows Users**: If you get `'ts-node' is not recognized`, use:
```bash
npx ts-node scripts/health-check-curator.ts
```

**Note**: The API route (Option 1) is strongly recommended. It tests the actual deployed environment and doesn't require local setup.

## Response Format

```json
{
  "success": true,
  "passed": true,
  "summary": {
    "totalProducts": 10,
    "successCount": 9,
    "failureCount": 0,
    "timeoutCount": 1,
    "successRate": "90%",
    "totalDuration": "15234ms"
  },
  "performance": {
    "avgDuration": 1456,
    "minDuration": 987,
    "maxDuration": 2134
  },
  "noteStats": {
    "avgLength": 148,
    "minLength": 132,
    "maxLength": 167
  },
  "results": [
    {
      "handle": "gothic-candle",
      "status": "success",
      "duration": 1234,
      "noteLength": 156,
      "note": "Heavy wax forms architectural shadows..."
    }
  ]
}
```

## Success Criteria

### Overall Health
- **passed**: `true` (failure rate <20%)
- **successRate**: >80%

### Performance
- **avgDuration**: <2000ms
- **maxDuration**: <3000ms (timeout threshold)

### Note Quality
- **avgLength**: 100-200 chars (approximately 2 sentences)
- **minLength**: >50 chars
- **maxLength**: <300 chars

## Interpreting Results

### Status Values
- **success**: Curator note generated and saved successfully
- **failure**: Generation failed (error occurred)
- **timeout**: Generation exceeded 3-second timeout

### What to Check

**High Success Rate (>90%)**: ✅ Excellent
- System is working as expected
- Gemini API is responsive
- Metafield saving is working

**Moderate Success Rate (80-90%)**: ⚠️ Acceptable
- System is mostly working
- Some products may have issues
- Monitor for patterns

**Low Success Rate (<80%)**: ❌ Action Required
- Check Gemini API key configured
- Verify API quota not exceeded
- Review error messages in results
- Check network connectivity

### Performance Analysis

**Fast Average (<1500ms)**: ✅ Excellent
- Gemini API is responsive
- Network latency is low

**Moderate Average (1500-2000ms)**: ⚠️ Acceptable
- Within acceptable range
- Monitor for degradation

**Slow Average (>2000ms)**: ❌ Action Required
- Consider increasing timeout
- Check Gemini API performance
- Verify network latency

### Timeout Analysis

**Low Timeout Rate (<10%)**: ✅ Excellent
- 3-second timeout is appropriate
- System is responsive

**Moderate Timeout Rate (10-20%)**: ⚠️ Monitor
- Some generations are slow
- Consider investigating slow products

**High Timeout Rate (>20%)**: ❌ Action Required
- Timeout may be too aggressive
- Check Gemini API performance
- Consider increasing timeout to 5s

## Troubleshooting

### All Failures
**Symptoms**: successCount = 0, all results show "failure"

**Possible Causes**:
1. Gemini API key not configured
2. Gemini API quota exceeded
3. Network connectivity issues
4. Supabase connection issues

**Solutions**:
1. Verify `GOOGLE_GEMINI_API_KEY` in environment variables
2. Check Gemini API quota in Google Cloud Console
3. Test network connectivity
4. Verify Supabase credentials

### High Timeout Rate
**Symptoms**: Many results show "timeout", duration ≥3000ms

**Possible Causes**:
1. Gemini API slow response
2. Network latency
3. Timeout too aggressive

**Solutions**:
1. Check Gemini API status
2. Test from different network
3. Consider increasing timeout in `lib/curator/generator.ts`

### Metafield Save Failures
**Symptoms**: Notes generated but not appearing on subsequent checks

**Possible Causes**:
1. Shopify Admin API token missing
2. Insufficient API permissions
3. Metafield definition not created

**Solutions**:
1. Verify `SHOPIFY_ADMIN_ACCESS_TOKEN` configured
2. Check token has `write_products` scope
3. Create metafield definition in Shopify admin

### Poor Note Quality
**Symptoms**: Notes too short, too long, or contain marketing fluff

**Possible Causes**:
1. Prompt needs tuning
2. Product data quality issues
3. Model selection incorrect

**Solutions**:
1. Review prompt in `lib/curator/generator.ts`
2. Check product titles and descriptions
3. Verify using correct Gemini model (1.5 Flash)

## Manual Verification

After running the health check, manually verify a few products:

1. Visit a product page: `/product/[handle]`
2. Look for "Curator's Note" section
3. Verify note quality:
   - 2 sentences
   - Focuses on texture, shadows, architectural presence
   - No marketing fluff ("stunning", "must-have")
   - Brutalist tone

## Monitoring Schedule

### Pre-Launch
- Run once before deploying to production
- Verify >80% success rate
- Spot check note quality

### Day 1
- Run immediately after launch
- Run again after 6 hours
- Monitor for any degradation

### Week 1
- Run daily
- Track success rate trends
- Monitor performance metrics

### Ongoing
- Run weekly
- Run after any Gemini API changes
- Run after any curator prompt updates

## API Endpoint Details

**Route**: `app/api/health-check/curator/route.ts`

**Method**: GET

**Authentication**: None (public endpoint)

**Rate Limiting**: None (but Gemini API has rate limits)

**Timeout**: None (but individual curator generations timeout at 3s)

**Caching**: None (always runs fresh check)

## Security Considerations

### Public Endpoint
The health check endpoint is public and doesn't require authentication. This is intentional for easy monitoring.

**What's Exposed**:
- Product handles (public information)
- Curator note previews (public information)
- Performance metrics (non-sensitive)

**What's NOT Exposed**:
- API keys
- Full product data
- Customer information
- Internal system details

### Rate Limiting
Consider adding rate limiting if the endpoint is abused:
- Limit to 10 requests per IP per hour
- Add authentication for production use
- Monitor for unusual traffic patterns

## Future Enhancements

### Planned Improvements
1. **Batch Testing**: Test all products, not just first 10
2. **Historical Tracking**: Store results over time
3. **Alerting**: Send alerts if success rate drops below threshold
4. **Quality Scoring**: Automated note quality assessment
5. **Comparison**: Compare notes before/after prompt changes

### Integration Ideas
1. **CI/CD**: Run health check in deployment pipeline
2. **Monitoring**: Integrate with monitoring service (Datadog, New Relic)
3. **Dashboard**: Create admin dashboard showing health metrics
4. **Slack Notifications**: Send alerts to Slack channel

## Status

✅ **READY** - Health check API is live and ready to use

## Quick Start

1. Visit: `https://charmedanddark.vercel.app/api/health-check/curator`
2. Check `passed: true`
3. Verify `successRate` >80%
4. Review any failures in `results` array
5. Spot check note quality manually

---

**Last Updated**: 2026-02-23  
**Endpoint**: `/api/health-check/curator`
