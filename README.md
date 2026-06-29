# 30-Day Cut Tracker — PWA

A fully offline-first fat-loss, macro, and workout tracker. Works offline with automatic cloud sync via Vercel KV. Install as a PWA on mobile.

## Features

✅ **Passcode-Protected** — Single-user access with httpOnly session cookie
✅ **Offline-First** — Works completely offline, syncs when back online
✅ **Cross-Device Sync** — Data persists and syncs across devices via Vercel KV
✅ **PWA Installable** — Install on mobile home screen (Android & iOS)
✅ **Progressive Enhancement** — Lightweight, no dependencies except Next.js & idb
✅ **TypeScript** — Fully typed, production-ready code

## Quick Start

### Local Development

```bash
npm install
npm run dev
```

Visit `http://localhost:3000`

### Production Deployment

See **VERCEL_DEPLOYMENT.md** for step-by-step Vercel deployment guide.

## What It Does

- **Log Daily Data**: Calories, protein, weight, waist, water, workouts
- **View Weekly Stats**: Average weight, workouts completed, days logged
- **Track Progress**: 30-day counter with visual streak indicators
- **Smart Goals**: Color-coded progress bars (green = on-track, amber/coral = warnings)
- **Offline Support**: Full app functionality without network connection
- **Cloud Backup**: Data automatically syncs to Vercel KV when online

## Tech Stack

- **Framework**: Next.js 14 (App Router, TypeScript)
- **Styling**: CSS Modules / Global CSS (no Tailwind)
- **Storage**: IndexedDB (offline) + Vercel KV (cloud)
- **Auth**: Simple passcode gate (env var)
- **PWA**: next-pwa with manifest + service worker
- **Fonts**: Google Fonts (Barlow Condensed, Inter, IBM Plex Mono)

## Project Structure

```
app/
├── layout.tsx              # Root layout with fonts & PWA metadata
├── page.tsx                # Main tracker (protected)
├── login/page.tsx          # Passcode entry
├── offline/page.tsx        # Offline fallback
├── globals.css             # Design tokens & grid background
└── api/
    ├── auth/route.ts       # Passcode validation
    └── kv/[key]/route.ts   # Vercel KV proxy

components/
├── TrackerApp.tsx          # Main orchestrator
├── Header.tsx              # Title & day counter
├── TodayProgress.tsx       # Calorie/protein bars
├── LogEntryForm.tsx        # Input form
├── WeekStats.tsx           # Weekly stats
└── LoginForm.tsx           # Passcode form

lib/
├── storage.ts              # IndexedDB + KV sync engine
├── types.ts                # TypeScript types
├── dates.ts                # Date utilities
└── workoutPlan.ts          # Weekday → workout mapping

middleware.ts              # Auth protection
public/
├── manifest.json           # PWA manifest
├── icon-192.png            # App icon (home screen)
└── icon-512.png            # App icon (splash)
```

## Deployment

### 1. Push to GitHub
```bash
git push origin main
```

### 2. Import into Vercel
- Go to https://vercel.com/dashboard
- Click "Add New" → "Project" → "Import Git Repository"
- Select your `cutline` repository

### 3. Set Environment Variables
In Vercel dashboard → Environment Variables:
```
APP_PASSCODE=your-secret-passcode
```

### 4. Attach Vercel KV Database
In Vercel dashboard → Storage → Create Database → KV
- Name: `fit-tracker-kv`
- This auto-populates `KV_REST_API_URL` and `KV_REST_API_TOKEN`

### 5. Deploy
Click "Deploy" — done! 🚀

## Testing

### Offline Mode
1. DevTools → Network → Set to "Offline"
2. Refresh page (should still load via service worker)
3. Log a day — data saves locally ("Saved ✓")
4. Go back online — data syncs to KV

### Cross-Device
1. Device A: Log Day 1
2. Device B: Open app, select Day 1
3. Should see Device A's data (KV sync)

### PWA Install
- **Android**: Menu → "Install app" or "Add to Home Screen"
- **iOS**: Share → "Add to Home Screen"

## Environment Variables

| Variable | Required | Source |
|----------|----------|--------|
| `APP_PASSCODE` | ✅ | You set in Vercel |
| `KV_REST_API_URL` | ✅ | Auto-populated by Vercel KV |
| `KV_REST_API_TOKEN` | ✅ | Auto-populated by Vercel KV |

## Data Model

```typescript
type Targets = {
  calories: number;
  protein: number;
  water: number;
  steps: number;
};

type DayLog = {
  calories: number;
  protein: number;
  weight: number;
  waist: number;
  water: number;
  workoutDone: boolean;
  notes: string;
};
```

## Storage Architecture

**Offline-First with Cloud Sync:**

1. User logs data → Immediately saved to IndexedDB
2. UI updates instantly (no network wait)
3. Background: Fire-and-forget PUT to `/api/kv/[key]`
4. If network fails, queued in IndexedDB pending table
5. On next load or online event, retry sync
6. Other devices: Fetch from KV, newest-wins by timestamp

**Why this works:**
- Instant feedback (no network latency)
- Works fully offline (IndexedDB always available)
- Data never lost (KV is durable backup)
- Cross-device sync (eventually consistent)

## Troubleshooting

### Build Fails
- Check `next.config.js` has `.default` export pattern
- Verify all dependencies in `package.json`
- Check TypeScript errors: `npm run build`

### Passcode Doesn't Work
- Confirm `APP_PASSCODE` is set in Vercel env vars
- Check session cookie exists (DevTools → Application → Cookies)
- Verify middleware.ts is in project root

### Data Not Syncing
- Check KV database is attached (Vercel Storage tab)
- Verify `KV_REST_API_URL` and `KV_REST_API_TOKEN` are set
- View Vercel function logs for API errors

### PWA Not Installing
- Check manifest.json is valid JSON
- Verify icons exist in `public/`
- Run Lighthouse PWA audit (DevTools → Lighthouse → PWA)
- Ensure site is HTTPS (Vercel provides this)

For detailed troubleshooting, see **VERCEL_DEPLOYMENT.md**.

## Development

### Scripts
```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run TypeScript & ESLint
```

### Adding Features
- Components: `components/*.tsx`
- API routes: `app/api/**/route.ts`
- Styles: `app/globals.css` (CSS variables available)
- Utils: `lib/*.ts`

All changes push to git will auto-deploy to Vercel.

## License

MIT

---

**Ready to deploy?** See **VERCEL_DEPLOYMENT.md** for complete step-by-step guide.
