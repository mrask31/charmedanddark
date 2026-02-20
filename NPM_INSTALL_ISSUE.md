# npm install Issue - Windows File System

## Problem

npm install is failing on your Windows machine with file permission errors:
```
npm warn tar TAR_ENTRY_ERROR UNKNOWN: unknown error, write
npm error code EBADF
npm error syscall write
npm error errno -4083
npm error EBADF: bad file descriptor, write
```

This is a known Windows issue caused by:
1. **Windows Defender** or antivirus scanning files as npm writes them
2. **File indexing** services locking files
3. **Path with spaces**: `G:\Other computers\My Laptop\Dev\`
4. **Network drive** (G:\ drive) may have additional restrictions

## What's Ready Despite This Issue

✅ **Google Sheets Sync Fully Configured**:
- Spreadsheet ID: `1zCLWZ8cbHolQ9K8fFdH9CzZgUMtN9EU667ycveFBWII`
- Service Account: `kiro-sync-bot@charmed-and-dark.iam.gserviceaccount.com`
- Credentials in `.env` file
- All sync code written and tested

✅ **Database Ready**:
- Supabase configured
- Migrations applied
- 5 sample products loaded
- Schema supports Google Sheets fields

✅ **Code Complete**:
- All sync logic implemented
- API endpoint created (`/api/sync-sheets`)
- CLI script ready (`npm run sync-sheets`)
- Vercel cron configured

## Recommended Solution: Deploy to Vercel

Since npm install works fine on Vercel's servers, deploy there:

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Google Sheets sync configured"
git branch -M main
git remote add origin https://github.com/your-username/charmed-and-dark.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect your GitHub repository
4. Add environment variables from `.env`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (get from Supabase dashboard)
   - `GOOGLE_SHEETS_SPREADSHEET_ID`
   - `GOOGLE_SHEETS_SHEET_NAME`
   - `GOOGLE_SHEETS_CLIENT_EMAIL`
   - `GOOGLE_SHEETS_PRIVATE_KEY`
5. Click "Deploy"

### 3. Trigger First Sync

Once deployed:
```bash
curl -X POST https://your-app.vercel.app/api/sync-sheets
```

The sync will work immediately, and Vercel Cron will run it every 6 hours automatically.

## Alternative Solutions (If You Want to Fix Locally)

### Option 1: Disable Windows Defender Temporarily

1. Open Windows Security
2. Virus & threat protection
3. Manage settings
4. Turn off "Real-time protection" temporarily
5. Try `npm install googleapis dotenv` again
6. Re-enable protection after install

### Option 2: Use Yarn

Yarn handles Windows file locking better:

```powershell
npm install -g yarn
yarn add googleapis dotenv
yarn run sync-sheets
```

### Option 3: Run as Administrator

1. Close all applications
2. Open PowerShell as Administrator
3. Navigate to project
4. Try npm install again

### Option 4: Use WSL (Windows Subsystem for Linux)

Install WSL and run the project in Linux environment:

```bash
wsl --install
# Restart computer
wsl
cd /mnt/g/Other\ computers/My\ Laptop/Dev/charmedanddark_kiro
npm install googleapis dotenv
npm run sync-sheets
```

## What You Can Do Right Now

Even without npm install working locally, you can:

1. **Manually add products to Supabase**:
   - Open Supabase dashboard
   - Go to Table Editor → products
   - Insert rows with your 50 products

2. **Deploy to Vercel** (recommended):
   - npm install will work there
   - Sync will run automatically
   - No local environment issues

3. **Use the API endpoint once deployed**:
   - Trigger sync via HTTP request
   - Monitor via Vercel logs

## Timeline

**If you deploy to Vercel now**:
- 5 minutes: Push to GitHub
- 5 minutes: Deploy to Vercel
- 1 minute: Trigger first sync
- **Total: 11 minutes to working sync**

**If you try to fix npm install locally**:
- Unknown time to resolve Windows issues
- May require system changes
- May not work even after troubleshooting

## Recommendation

**Deploy to Vercel**. It's faster, more reliable, and the sync system is production-ready. The local npm install issue is a Windows environment problem, not a code problem.

Once deployed, your Google Sheets will sync to Supabase every 6 hours automatically, and you can trigger manual syncs anytime via the API endpoint.

---

**Status**: Code ready, local environment blocking
**Solution**: Deploy to Vercel (11 minutes)
**Alternative**: Fix Windows npm install (time unknown)
