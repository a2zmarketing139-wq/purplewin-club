# 🟣 PurpleWin Club — Deployment Guide

## Quick Deploy to Railway.app (Free)

### Step 1: Upload to GitHub

1. Create a new GitHub repo (e.g., `purplewin-club`)
2. Upload all files from this folder to the repo
3. Make sure the following files are in the root:
   - `server.ts`
   - `custom-routes.ts`
   - `package.json`
   - `prisma/schema.prisma`
   - `vite.config.ts`
   - `tsconfig.json`
   - `Dockerfile`
   - `railway.json`

### Step 2: Create Railway Account

1. Go to **https://railway.app**
2. Sign up with GitHub (free account)
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Select your `purplewin-club` repo

### Step 3: Add PostgreSQL Database

1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Railway auto-creates the database and sets `DATABASE_URL`

### Step 4: Set Environment Variables

In Railway, go to your app → **"Variables"** tab and add:

```
DATABASE_URL=(auto-set by PostgreSQL)
JWT_SECRET=your-super-secret-key-123
ADMIN_PHONE=03052884177
ADMIN_PASSWORD=@ ZainabAbbas732
NODE_ENV=production
```

> `DATABASE_URL` is automatically linked from the PostgreSQL service.

### Step 5: Deploy!

1. Railway auto-deploys when you push to GitHub
2. Wait 2-3 minutes for build to finish
3. Your app is live at `https://your-project.up.railway.app`

### Step 6: Initialize Database

After first deploy, open the Railway console and run:

```bash
prisma db push
```

This creates all tables in PostgreSQL.

---

## Admin Login

- **Phone:** `03052884177`
- **Password:** `@ ZainabAbbas732`

---

## Game Features

| Game | Type | Description |
|---|---|---|
| Wingo | Lottery | Pick color/number, win up to 9x |
| Aviator | Crash | Cashout before plane flies away |
| Chicken Road | Step | Cross the road, avoid fire |
| + 12 Slots | Slots | Fortune Tiger, Mahjong Ways, etc. |

---

## Tech Stack

- **Frontend:** React 19 + Tailwind CSS + Vite
- **Backend:** Hono (Node.js) + Bun
- **Database:** PostgreSQL (Prisma 7 ORM)
- **Auth:** JWT + bcrypt password hashing
- **Games:** Real-time Aviator + Chicken Road + Wingo

---

## Local Development

```bash
# 1. Install dependencies
bun install

# 2. Set up database
cp .env.example .env
# Edit .env with your DATABASE_URL (or use SQLite for local)

# 3. Generate Prisma client
bun x prisma generate

# 4. Push database schema
bun x prisma db push

# 5. Build frontend
bun run build

# 6. Start server
bun run server.ts
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for JWT tokens |
| `ADMIN_PHONE` | ⚪ | Admin phone number |
| `ADMIN_PASSWORD` | ⚪ | Admin password |
| `PORT` | ⚪ | Server port (auto-set by Railway) |
| `NODE_ENV` | ⚪ | `production` for live |

---

## Files Included

```
purplewin-club/
├── server.ts              # Standalone Hono server
├── custom-routes.ts       # All API routes (auth, wallet, games, admin)
├── package.json           # Dependencies
├── Dockerfile             # Railway Docker build
├── railway.json           # Railway deployment config
├── .env.example           # Environment template
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite build config
├── index.html             # Frontend entry point
├── prisma/
│   └── schema.prisma      # Database schema (all models)
└── src/
    ├── App.tsx             # Main React app
    ├── main.tsx            # React entry point
    ├── index.css           # Tailwind CSS
    ├── lib/
    │   └── api.ts          # Frontend API client
    └── components/
        ├── Header.tsx
        ├── BottomNav.tsx
        ├── LoginPage.tsx
        ├── RegisterPage.tsx
        ├── WalletPage.tsx
        ├── WingoPage.tsx
        ├── AviatorPage.tsx
        ├── ChickenRoadPage.tsx
        ├── AdminPage.tsx
        ├── AccountPage.tsx
        ├── ActivityPage.tsx
        ├── LeaderboardPage.tsx
        ├── VipPage.tsx
        ├── LiveChat.tsx
        ├── NotificationBell.tsx
        ├── PaymentInfoPage.tsx
        ├── GameThumbnail.tsx
        ├── GameBanner.tsx
        ├── CategoryIcons.tsx
        ├── PopularGames.tsx
        ├── SlotGames.tsx
        ├── MarqueeBar.tsx
        └── ui/ (shadcn components)
```

---

## Troubleshooting

**Build fails on Railway?**
- Check Railway build logs
- Make sure PostgreSQL service is linked

**Tables not created?**
- Run `prisma db push` in Railway console

**Can't login as admin?**
- Check `ADMIN_PHONE` and `ADMIN_PASSWORD` env vars
- Default: `03052884177` / `@ ZainabAbbas732`

---

Made with ❤️ for PurpleWin Club
