# Vercel Deployment Checklist

## Pre-Deployment

- [x] Code committed to git (main branch)
- [x] next.config.js fixed (`.default` import pattern)
- [ ] GitHub repository synced (`git push origin main`)

## Vercel Setup Steps

### 1. Import GitHub Repository
1. Visit https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Click **Import Git Repository**
4. Select **GitHub** and search for `cutline`
5. Click **Import**

### 2. Set Environment Variables
In the **Environment Variables** section, add:

| Key | Value | Notes |
|-----|-------|-------|
| `APP_PASSCODE` | `<your-secret>` | Never commit this! |

Note: `KV_REST_API_URL` and `KV_REST_API_TOKEN` will auto-populate when you attach KV in the next step.

### 3. Attach Vercel KV Database
1. Go to **Storage** tab (in the project settings)
2. Click **Create Database → KV**
3. Name: `fit-tracker-kv`
4. Region: Choose your region
5. Click **Create**
6. Vercel auto-populates the KV env vars

### 4. Deploy
1. Click **Deploy**
2. Wait for build to complete
3. Get your production URL

## Post-Deployment Testing

### Test 1: Authentication
- [ ] Visit the URL → redirects to /login
- [ ] Enter wrong passcode → error message
- [ ] Enter correct passcode → login successful
- [ ] Page persists after refresh (session cookie works)

### Test 2: Offline Functionality
- [ ] Open DevTools → Network → set to Offline
- [ ] Refresh page → app still loads (service worker cache)
- [ ] Log a day → saves locally ("Saved ✓" message)
- [ ] Go back Online → check console for sync logs

### Test 3: Cross-Device Sync
- [ ] Device A: Log Day 1 data
- [ ] Device B: Open app, select Day 1
- [ ] Verify data from Device A appears (KV sync)

### Test 4: PWA Installation
**On Mobile (Android Chrome):**
- [ ] Open app in browser
- [ ] Menu → "Install app" or "Add to Home Screen"
- [ ] Icon appears on home screen
- [ ] App launches in standalone mode

**On iOS:**
- [ ] Open app in Safari
- [ ] Share → Add to Home Screen
- [ ] Icon appears on home screen
- [ ] App launches without browser UI

### Test 5: PWA Features
- [ ] Run Lighthouse audit (DevTools → Lighthouse → PWA)
- [ ] Check "Installable" and "PWA Optimized" pass
- [ ] Verify service worker registered (DevTools → Application → Service Workers)

## Troubleshooting

### Build Fails
- Check TypeScript errors in build logs
- Verify all dependencies are installed
- Check that `APP_PASSCODE` env var is set

### Data Not Syncing
- Confirm KV database is attached (check env vars in Vercel dashboard)
- Check `KV_REST_API_URL` and `KV_REST_API_TOKEN` are populated
- View function logs in Vercel dashboard to see API errors

### PWA Not Installing
- Ensure site is HTTPS (Vercel provides this automatically)
- Check manifest.json is valid JSON
- Verify icons exist in `public/icon-*.png`
- Run Lighthouse PWA audit to identify issues

### Login Keeps Redirecting
- Check session cookie is set (DevTools → Application → Cookies)
- Verify middleware.ts is working (check Vercel logs)
- Ensure `APP_PASSCODE` matches what you entered

## Quick Reference

**Project Structure:**
- `app/` — Next.js pages and API routes
- `components/` — React components
- `lib/` — Utility functions (storage, dates, types)
- `public/` — PWA manifest and icons
- `middleware.ts` — Auth protection

**Key Files for Debugging:**
- `.vercel/output/logs/build.log` — Build errors (download from Vercel)
- Browser Console → Application tab → Service Workers → see offline status
- Vercel Dashboard → Logs → Function logs (for `/api/kv/` errors)

**Environment Variables:**
- `APP_PASSCODE` — Required (you set)
- `KV_REST_API_URL` — Auto-populated by Vercel KV
- `KV_REST_API_TOKEN` — Auto-populated by Vercel KV
- `NODE_ENV` — Auto-set by Vercel (production/development)

---

Happy deploying! 🚀
