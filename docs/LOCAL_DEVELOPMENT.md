# Local Development Setup

This guide helps you run the SOASA election system on your computer for testing and development.

---

## 📋 **Prerequisites**

- **Node.js** 18+ installed ([download here](https://nodejs.org/))
- **Git** installed
- **Code editor** (VS Code recommended)
- **Supabase account** (free tier is fine)

---

## 🚀 **Quick Start**

### 1. Clone & Install Dependencies

```bash
# Navigate to your project folder
cd "C:\Users\kosne\OneDrive\Desktop\of all"

# Install dependencies
npm install
```

### 2. Set Up Environment Variables

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your actual values
# Use VS Code, Notepad, or any text editor
```

**Required variables in `.env.local`:**

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
JWT_SECRET=generate-with-openssl-rand-base64-32
ADMIN_SECRET=your-admin-secret-here
EC_DASHBOARD_PASSWORD=your-ec-password-here
```

**How to generate secrets:**

```bash
# For JWT_SECRET and ADMIN_SECRET
openssl rand -base64 32

# Or use an online generator:
# https://www.random.org/strings/
```

### 3. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) → Create New Project
2. Wait for provisioning (~2 mins)
3. Go to **SQL Editor** → New Query
4. Copy and paste contents of `supabase/schema.sql`
5. Click **Run** ▶️
6. Copy and paste contents of `supabase/storage.sql`
7. Click **Run** ▶️

### 4. Get Supabase Credentials

- Go to **Settings** → **API**
- Copy **Project URL** → paste in `.env.local` as `SUPABASE_URL`
- Copy **service_role** key → paste as `SUPABASE_SERVICE_ROLE_KEY`

### 5. Start Development Server

```bash
# Start Vercel dev server
npm run dev

# Or if you have Vercel CLI installed:
npx vercel dev
```

Server will start at: **http://localhost:3000**

---

## 🧪 **Testing Locally**

### Test With Database

1. Import test students via admin dashboard:
   - Go to: `http://localhost:3000/electoral-commissioner.html`
   - Login with your `ADMIN_SECRET`
   - Go to **Voter Roll** tab
   - Copy a few rows from `data/l100-students.csv`
   - Paste and click **Import**

2. Test voting:
   - Go to: `http://localhost:3000/vote.html`
   - Login with any imported student
   - Index: `SS/BSS/25/0001`
   - Password: `Soasa2026!`
   - Cast a test vote

3. Check results:
   - Go back to electoral commissioner dashboard
   - Click **Dashboard** tab → **Refresh**
   - You should see 1 vote counted

---

## 📁 **Project Structure**

```
of all/
├── api/                    # Vercel serverless functions (backend)
│   ├── admin/             # Admin-only endpoints
│   ├── auth/              # Login/logout
│   ├── ballot.js          # Get ballot for student
│   └── vote.js            # Submit vote
├── data/                   # Student CSVs (ready to import)
│   ├── l100-students.csv  # Level 100 (255 students)
│   ├── l200-students.csv  # Level 200 (286 students)
│   ├── l300-students.csv  # Level 300 (189 students)
│   └── l400-students.csv  # Level 400 (159 students)
├── docs/                   # Documentation
├── js/                     # Frontend JavaScript
│   ├── vote.js            # Voting page logic
│   └── electoral-commissioner.js  # Dashboard
├── css/                    # Stylesheets
├── supabase/              # Database migrations
│   ├── schema.sql         # Tables & functions
│   └── storage.sql        # Photo bucket
├── lib/                    # Shared backend utilities
├── .env.example           # Environment template
├── .env.local             # YOUR secrets (gitignored)
└── vercel.json            # Vercel config
```

---

## 🛠️ **Common Development Tasks**

### Add a New Student Manually

Use Supabase Dashboard → Table Editor → `students` → Insert Row:

```json
{
  "index_number": "SS/BSS/25/9999",
  "full_name": "Test Student",
  "level": "100",
  "password_hash": "$2a$10$hash-here",
  "has_voted": false
}
```

Or use the admin dashboard import feature (easier).

### Clear All Votes (Reset Election)

In Supabase SQL Editor:

```sql
-- WARNING: This deletes all votes!
DELETE FROM votes;

-- Reset all students to "not voted"
UPDATE students SET has_voted = false, voted_at = null;
```

### View Database Tables

Supabase Dashboard → Table Editor:
- `students` - Voter roll
- `candidates` - People running for office
- `positions` - Offices (President, Secretary, etc.)
- `votes` - Secret ballots
- `election_config` - Schedule & settings

### Check Logs

```bash
# Terminal where you ran "npm run dev"
# Logs appear in real-time when APIs are called
```

Or Vercel Dashboard → Deployments → Functions → View logs

---

## 🐛 **Troubleshooting**

### "Module not found" errors
```bash
npm install
```

### "EADDRINUSE: address already in use"
Port 3000 is taken. Kill the process or use a different port:
```bash
npx vercel dev --listen 3001
```

### API returns 500 errors
- Check `.env.local` has correct Supabase credentials
- Check Supabase project is running (not paused)
- Check terminal logs for actual error message

### Can't login as student
- Check password is exactly: `Soasa2026!` (case-sensitive)
- Check student exists: Supabase → Table Editor → `students`
- Check election window: Table Editor → `election_config`

### Photos not uploading
- Check `storage.sql` was run
- Check Storage → Buckets → `election-photos` exists
- Check file is under 5MB and JPEG/PNG/WebP format

---

## 📚 **Useful Resources**

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Project Documentation**: See `docs/VOTING_SETUP.md`
- **Deployment Guide**: See `docs/DEPLOYMENT_CHECKLIST.md`

---

## 🔄 **Making Changes**

### Change Student Password Default

Edit `data/*.csv` files:
```csv
index_number,full_name,level,password
SS/BSS/25/0001,Student Name,100,YourNewPassword
```

Then re-import via admin dashboard.

### Add a New Position

In Supabase SQL Editor:
```sql
INSERT INTO positions (slug, title, sort_order)
VALUES ('your-slug', 'Your Position Title', 100);
```

### Change Election Dates

Use the admin dashboard → Settings tab.

Or directly in Supabase → `election_config` table.

---

## ✅ **Ready to Deploy?**

Follow the deployment checklist: `docs/DEPLOYMENT_CHECKLIST.md`

---

**Happy coding!** 🚀
