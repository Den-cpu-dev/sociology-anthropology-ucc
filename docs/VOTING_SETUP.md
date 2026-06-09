# SOASA online voting setup (Option D)

Students sign in with **index number + password** from the voter roll you upload. After login, their **full name and level** appear on screen before they cast a secret ballot (one vote per student).

## Architecture

| Layer | Technology |
|-------|------------|
| Frontend | `vote.html`, `js/vote.js` |
| API | Vercel serverless functions in `/api` |
| Database | Supabase (Postgres) |
| Electoral Commissioner | `electoral-commissioner.html` (stats, winners, candidate photos) |

## 1. Create Supabase project

1. Go to [supabase.com](https://supabase.com) → New project.
2. Open **SQL Editor** → paste and run `supabase/schema.sql`.
3. Copy **Project URL** and **service_role** key (Settings → API).  
   ⚠️ Never put the service role key in frontend code or git.

## 2. Deploy on Vercel

1. Push this repo to GitHub and import in Vercel (or link existing project).
2. **Settings → Environment Variables** (Production + Preview):

   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `JWT_SECRET` (32+ random characters)
   - `ADMIN_SECRET` (long random string for electoral committee)

3. Redeploy after adding variables.
4. In Supabase SQL Editor, run `supabase/storage.sql` to create the **election-photos** bucket for candidate pictures.

Local dev:

```bash
npm install
cp .env.example .env.local
# fill .env.local, then:
npx vercel dev
```

Open `http://localhost:3000/vote.html`.

## 3. Load the voter roll

1. Open `data/students.template.csv` and build your list:

   ```csv
   index_number,full_name,level,password
   PS/ANT/24/0001,Ama Mensah,200,Soasa2026!
   ```

2. Distribute passwords securely (WhatsApp class reps, in-person handout, etc.).  
   Passwords are stored **hashed** in the database on import.

3. Go to `/election-admin.html` → enter `ADMIN_SECRET` → paste CSV → **Upload students**.

   - Use **Replace entire roll** only before anyone has voted.

## 4. Load candidates

1. Use `data/candidates.template.csv` with `position_slug` matching rows in `positions`.
2. **President & Vice President** are one ticket: use slug `president-ticket` and put both names in `full_name` (e.g. `Jane Doe & Kwame Asante`). Do not add a separate vice-president row.
3. Import via admin page.

## 5. Set voting window

In admin → **Election schedule**:

- **Opens** / **Closes** (Ghana local time in the datetime picker; stored as UTC in Supabase).
- Save schedule.

Students see “Voting unavailable” outside the window.

## 6. Electoral Commissioner dashboard

**From the website:** SOASA → Executives → click **Godwin J. Ankuvie** (Electoral Commissioner) photo.

**Passwords (Vercel env vars):**
- `EC_DASHBOARD_PASSWORD` — for the commissioner (photo portal)
- `ADMIN_SECRET` — backup for the full committee

- **Dashboard** — turnout, bar charts, and **automatic winner declaration** (highest votes; ties flagged).
- **Candidates** — upload photo, pick position, add ticket names for President & VP.


## 7. Election day

- Share link: `https://your-domain/vote.html` (and optionally a button on `soasa.html`).
- Monitor turnout in admin → **Results & turnout**.
- After close, export results JSON and announce winners per SOASA rules.

## Security notes

- Do not link `election-admin.html` from the public site.
- Use strong `ADMIN_SECRET` and `JWT_SECRET`.
- Tell voters to sign out on shared devices.
- Committee should keep a backup of the CSV and export results before clearing data for the next year.

## Troubleshooting

| Issue | Check |
|-------|--------|
| Login always fails | Index number format (spaces removed, uppercased); password matches CSV |
| “Voting unavailable” | `opens_at` / `closes_at` in admin config |
| API 500 | Vercel function logs; env vars set |
| “Already voted” | Expected after first ballot; one vote per index number |
