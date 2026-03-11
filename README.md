# UTM Hub — Campaign Manager

> Organize and track your campaign parameters across countries and niches.

A modern SaaS-style dashboard for media buyers and performance marketers to manage UTM parameters across advertising platforms like Meta Ads and Google Adsense.

## Features

- **Dashboard** — Full table with search, filter by country/niche/platform/status, and sort
- **UTM Generator** — Smart auto-generator with format presets, duplicate checking, and history
- **Countries View** — Group and explore all UTMs by geographic location
- **Niches View** — Organize campaigns by niche with visual breakdowns
- **Duplicate Detection** — Real-time check when adding or editing UTM parameters
- **Dark/Light Mode** — Persistent theme toggle
- **CSV Export** — One-click export of filtered campaigns
- **Bulk Import** — JSON import for mass UTM onboarding
- **Copy to Clipboard** — Quick copy buttons on every UTM
- **Quick Duplicate** — Clone any campaign with one click

## Tech Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Storage**: localStorage (with Supabase PostgreSQL support)
- **Database**: Supabase (optional, see setup below)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Supabase Setup (Optional)

The app works out of the box with localStorage. To enable cloud sync with Supabase:

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL schema from the **Settings** page in the app
3. Copy `.env.local.example` to `.env.local` and fill in your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx          # Dashboard
│   ├── generator/        # UTM Generator
│   ├── countries/        # Countries view
│   ├── niches/           # Niches view
│   └── settings/         # Settings & data management
├── components/
│   ├── AppShell.tsx      # Main layout wrapper
│   ├── Sidebar.tsx       # Navigation sidebar
│   ├── Header.tsx        # Top header with actions
│   ├── CampaignTable.tsx # Main data table
│   ├── FilterBar.tsx     # Search + filters
│   ├── AddCampaignModal.tsx  # Add/Edit modal
│   ├── StatsCard.tsx     # Dashboard stat cards
│   └── StatusBadge.tsx   # Status/Platform badges
├── context/
│   └── CampaignContext.tsx  # Global state management
└── lib/
    ├── types.ts          # TypeScript types
    ├── utils.ts          # Utility functions
    ├── store.ts          # localStorage CRUD
    └── supabase.ts       # Supabase client
```

## UTM Format

Default generated format: `utmsourceX{COUNTRY}{NICHE}{BTN}`

Example: Niche=Finance, Country=Brazil, Button=BTN → `utmsourceXBRFINBTN`

Custom formats available with `{COUNTRY}`, `{NICHE}`, `{BTN}` tokens.

## Future Roadmap

- [ ] Meta Ads API integration (live metrics per UTM)
- [ ] Google Ads API integration
- [ ] Google Analytics tracking
- [ ] Per-UTM metrics: Clicks, Revenue, CPC, ROI
- [ ] Team collaboration & auth
- [ ] Webhook notifications
