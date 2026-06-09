# SOASA Election System - Deployment Checklist

Use this checklist to deploy your voting system from scratch.

---

## ✅ **Phase 1: Pre-Deployment Setup**

### 1.1 Create Supabase Project
- [ ] Go to [supabase.com](https://supabase.com) and create a new project
- [ ] Choose a project name: `soasa-elections` (or your choice)
- [ ] Choose a database password (save it securely!)
- [ ] Select a region (closest to Ghana: Europe West recommended)
- [ ] Wait for project to provision (~2 minutes)

### 1.2 Set Up Database
- [ ] Open Supabase Dashboard → SQL Editor
- [ ] Create a new query
- [ ] Copy entire contents of `supabase/schema.sql`
- [ ] Paste and click **Run**
- [ ] Verify: You should see "Success. No rows returned"
- [ ] Run `supabase/storage.sql` the same way
- [ ] Verify storage bucket: Go to Storage tab → see `election-photos` bucket

### 1.3 Get API Credentials
- [ ] Go to Supabase Dashboard → Settings → API
- [ ] Copy **Project URL** (starts with `https://`)
- [ ] Copy **service_role** key (under "Project API keys" - NOT the anon key!)
- [ ] ⚠️ **Keep these secret!** Don't share or commit to git

---

## ✅ **Phase 2: Deploy to Vercel**

### 2.1 Prepare Repository
- [ ] Push your code to GitHub (if not already done)
- [ ] Make sure `.env.local` is in `.gitignore` (it is!)
- [ ] Verify no secrets are committed in git history

### 2.2 Connect to Vercel
- [ ] Go to [vercel.com](https://vercel.com) and sign in
- [ ] Click **Add New** → **Project**
- [ ] Import your GitHub repository
- [ ] Project name: `soasa-elections` (or your choice)

### 2.3 Configure Environment Variables
In Vercel dashboard → Settings → Environment Variables, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | From Supabase Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGc...` | Long key from Supabase (service_role) |
| `JWT_SECRET` | Generate with: `openssl rand -base64 32` | Random 32+ chars |
| `ADMIN_SECRET` | Generate with: `openssl rand -base64 32` | Different from JWT_SECRET |
| `EC_DASHBOARD_PASSWORD` | Your secure password | Memorable but strong |

**Apply variables to:** Production, Preview, Development (select all)

### 2.4 Deploy
- [ ] Click **Deploy**
- [ ] Wait for build to complete (~2 minutes)
- [ ] Visit your site: `https://your-project.vercel.app`


---

## ✅ **Phase 3: Load Election Data**

### 3.1 Import Student Voter Roll
You have 4 CSV files ready in `data/`:
- `l100-students.csv` (255 students)
- `l200-students.csv` (286 students)
- `l300-students.csv` (189 students)
- `l400-students.csv` (159 students)

**Option A: Via Admin Dashboard (Recommended)**
- [ ] Go to `https://your-site.vercel.app/electoral-commissioner.html`
- [ ] Enter `ADMIN_SECRET` password
- [ ] Go to **Voter Roll** tab
- [ ] Copy contents of each CSV file
- [ ] Paste into text area
- [ ] Click **Import students**
- [ ] Repeat for all 4 levels

**Option B: Merge and Import Once**
- [ ] Merge all 4 CSV files into one (keep header once)
- [ ] Import the combined file via admin dashboard
- [ ] Check: "Replace entire roll" (only before voting starts!)

### 3.2 Register Candidates
For each candidate running:
- [ ] Go to **Candidates** tab in admin dashboard
- [ ] Select position (President & VP, Secretary, etc.)
- [ ] Enter full name (or ticket: "John Doe & Jane Smith" for Pres/VP)
- [ ] Upload photo (optional but recommended)
- [ ] Add manifesto URL (optional)
- [ ] Click **Save candidate**

### 3.3 Configure Election Schedule
- [ ] Go to **Settings** tab
- [ ] Set **Election title**: "SOASA Executive Elections 2026/2027"
- [ ] Set **Opens**: Date and time voting starts (Ghana time)
- [ ] Set **Closes**: Date and time voting ends
- [ ] Uncheck "Publish results" (keep private until you're ready)
- [ ] Click **Save settings**

---

## ✅ **Phase 4: Testing**

### 4.1 Test Voting Flow
- [ ] Open `https://your-site.vercel.app/vote.html`
- [ ] Pick a test student from your CSV (e.g., first L100 student)
- [ ] Login with: Index number + password `Soasa2026!`
- [ ] Verify: Student name appears correctly
- [ ] Select candidates for each position (or abstain)
- [ ] Click **Review & submit ballot**
- [ ] Verify: Confirmation dialog shows your selections
- [ ] Click **Submit vote**
- [ ] Verify: "Thank you" message appears
- [ ] Try logging in again with same student
- [ ] Verify: Should see "You have already voted"

### 4.2 Test Admin Dashboard
- [ ] Go to `https://your-site.vercel.app/electoral-commissioner.html`
- [ ] Login with `EC_DASHBOARD_PASSWORD`
- [ ] Check **Dashboard** tab
- [ ] Verify: Turnout shows 1 vote
- [ ] Verify: Winner declarations appear (or "Awaiting votes")
- [ ] Test: Click **Refresh** button

### 4.3 Test Edge Cases
- [ ] Try voting before election opens (should see "not open yet")
- [ ] Try voting after election closes (should see "voting has ended")
- [ ] Try wrong password (should see "incorrect credentials")
- [ ] Try voting from mobile device (should be responsive)

---

## ✅ **Phase 5: Go Live**

### 5.1 Distribute Passwords
- [ ] Inform students their passwords are: `Soasa2026!`
- [ ] Send via: WhatsApp class reps, notice board, email, SMS
- [ ] Emphasize: Sign out on shared devices

### 5.2 Share Voting Link
- [ ] Main link: `https://your-site.vercel.app/vote.html`
- [ ] Optionally add button to `soasa.html` page
- [ ] Share on: WhatsApp groups, Facebook, Instagram, notice boards
- [ ] Set expectation: Voting window hours

### 5.3 Monitor in Real-Time
- [ ] Keep dashboard open during voting hours
- [ ] Click **Refresh** every 15-30 minutes
- [ ] Watch turnout percentage
- [ ] Be ready to help students with login issues

### 5.4 Close Election
- [ ] At closing time, verify in Settings that election is closed
- [ ] Export results (Dashboard → copy/screenshot)
- [ ] Back up: Download data from Supabase (SQL Editor → export)

### 5.5 Announce Results
- [ ] Review winners in Dashboard
- [ ] Resolve any ties (follow SOASA constitution)
- [ ] Go to Settings → Check "Publish results"
- [ ] Announce via official channels
- [ ] Optionally: Create a public results page

---

## 🆘 **Troubleshooting**

### Students Can't Login
- **Check**: Index number format (no spaces, correct format)
- **Check**: Password is exactly `Soasa2026!` (case-sensitive, with exclamation)
- **Check**: Student is in the correct level CSV file
- **Check**: Election has started (opens_at in Settings)

### "Network Error" or 500 Errors
- **Check**: Vercel environment variables are set correctly
- **Check**: Supabase project is running (not paused)
- **Check**: Service role key is correct (not anon key)
- **Check**: Vercel function logs (Dashboard → Deployments → Functions)

### Photos Not Uploading
- **Check**: `storage.sql` was run in Supabase
- **Check**: Bucket `election-photos` exists (Storage tab)
- **Check**: File is under 5MB and is JPEG/PNG/WebP
- **Check**: Service role key in Vercel env vars

### Dashboard Shows Wrong Results
- **Check**: Click **Refresh** button
- **Check**: Check Supabase → Table Editor → votes table
- **Check**: Run query: `SELECT COUNT(*) FROM votes;`

---

## 📞 **Support & Backup**

- [ ] Save all environment variables in a password manager
- [ ] Export voter roll CSV (backup)
- [ ] Export results after election (backup)
- [ ] Document any custom changes you made
- [ ] Keep Electoral Commissioner contact ready for students

---

## ✅ **Post-Election**

- [ ] Download final results from dashboard
- [ ] Export all data from Supabase (SQL Editor → backup)
- [ ] Archive: Save CSV backups, screenshots, announcements
- [ ] Review: What worked well? What to improve next year?
- [ ] Optional: Keep system live for transparency (read-only)
- [ ] For next election: Clear old votes, update voter roll, update positions

---

**Good luck with your election!** 🗳️✨
