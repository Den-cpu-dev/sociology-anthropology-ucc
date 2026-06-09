# 🔧 Login Troubleshooting Guide

## Quick Fixes Applied

### ✅ Issue 1: Autofill Suggestions Fixed
**Problem**: Browser was suggesting/autofilling your index number  
**Solution**: Changed `autocomplete="username"` to `autocomplete="off"` in `vote.html`

**Result**: Browser will no longer suggest or autofill index numbers or passwords.

### ✅ Issue 2: Enhanced Login Debugging
**Added**:
- Console logging for login attempts
- Better error messages
- Debug tool page

---

## 🔍 Use the Debug Tool

Open this page in your browser to test your login:

```
https://your-site.vercel.app/debug-login.html
```

**The debug tool will help you:**
1. ✅ Check if backend is working
2. ✅ Verify election configuration
3. ✅ Test student login with detailed error messages
4. ✅ See how your index number gets normalized

---

## Common Login Issues & Solutions

### Issue 1: "Invalid credentials" Error

**Possible Causes:**

#### A. Student not in database
**Check**: Go to Electoral Commissioner dashboard → Voter Roll tab  
**Solution**: Import the student via CSV

#### B. Password mismatch
**Check**: The password in database vs what you're typing  
**Solution**: 
- Default password from CSV: `Soasa2026!`
- Make sure caps are correct (capital S, no spaces)
- Check for invisible characters if copy-pasting

#### C. Index number format mismatch
**Check**: System normalizes to uppercase, no spaces  
Example: `ss/bss/25/0001` becomes `SS/BSS/25/0001`

**Test with debug tool**: Enter your index in Step 4 to see normalized version

---

### Issue 2: "Cannot reach the server"

**Possible Causes:**

#### A. Backend not deployed
**Check**: Visit `https://your-site.vercel.app/api/election/status`  
**Should see**: JSON response with election data  
**Solution**: Deploy to Vercel (see DEPLOYMENT_CHECKLIST.md)

#### B. Environment variables missing
**Check**: Vercel dashboard → Settings → Environment Variables  
**Required**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` (32+ characters)
- `ADMIN_SECRET`

**Solution**: Add missing variables and redeploy

#### C. Supabase connection issue
**Check**: Supabase dashboard → Project settings → API  
**Verify**: URL and service role key are correct  
**Solution**: Update environment variables with correct values

---

### Issue 3: Students were imported but still can't login

**Check these things:**

#### 1. Password is hashed correctly
**When importing**: Passwords should be plain text in CSV  
**System handles**: Automatic bcrypt hashing during import

**Verify import**:
```sql
-- Run in Supabase SQL Editor
SELECT index_number, full_name, 
       LENGTH(password_hash) as hash_length,
       SUBSTRING(password_hash, 1, 7) as hash_start
FROM students 
WHERE index_number = 'SS/BSS/25/0001';
```

**Expected**:
- `hash_length`: Should be 60
- `hash_start`: Should be `$2a$10$` or `$2b$10$`

**If hash looks wrong**: Re-import students with correct CSV format

#### 2. Index numbers match exactly
**Format in database**: Must be uppercase, no extra spaces

**Check in Supabase**:
```sql
SELECT index_number, full_name 
FROM students 
WHERE index_number LIKE 'SS/BSS/25/%'
LIMIT 10;
```

#### 3. Election is configured
**Check**: Electoral Commissioner → Settings tab  
**Verify**: 
- Election title is set
- Opening date/time is in the past (for testing)
- Closing date/time is in the future

---

### Issue 4: Login works but ballot doesn't show

**Possible Causes:**

#### A. No candidates registered
**Check**: Electoral Commissioner → Candidates tab  
**Solution**: Register at least one candidate per position

#### B. No positions in database
**Check**: Run in Supabase SQL Editor:
```sql
SELECT slug, title, display_order 
FROM positions 
ORDER BY display_order;
```

**Expected**: Should see 9 positions (president-vp, secretary, etc.)  
**Solution**: If empty, run `supabase/schema.sql` again

#### C. Election not open
**Check**: Electoral Commissioner → Settings  
**Verify**: 
- `opens_at` is in the past
- `closes_at` is in the future
- Current time is between these dates

---

## Step-by-Step Debugging Process

### Step 1: Test Backend Connection
1. Open `debug-login.html`
2. Click "Test Backend API"
3. **Success**: See green ✅ with election data
4. **Failure**: See red ❌ with error details

**If failed**: Check deployment and environment variables

### Step 2: Check Election Status
1. Click "Check Election Config"
2. **Should see**:
   - Status: `open` (or `not_open`/`closed`)
   - Opens/Closes dates
   - Turnout: `X/Y students`

**If wrong**: Update via Electoral Commissioner → Settings

### Step 3: Test Login
1. Enter a student's index number (e.g., `SS/BSS/25/0001`)
2. Enter password (e.g., `Soasa2026!`)
3. Click "Test Login"

**Success**: See student name, level, voted status  
**Failure**: See specific error with troubleshooting hints

### Step 4: Check Console Logs
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Try logging in again
4. Look for errors in red

**Common errors**:
- `401`: Wrong credentials
- `404`: API endpoint not found (deployment issue)
- `500`: Server error (check Vercel logs)
- `Network error`: Cannot reach server

---

## Manual Database Verification

### Check if student exists:
```sql
SELECT * FROM students 
WHERE index_number = 'SS/BSS/25/0001';
```

### Check password hash:
```sql
SELECT index_number, 
       LEFT(password_hash, 10) as hash_preview,
       LENGTH(password_hash) as hash_length
FROM students 
WHERE index_number = 'SS/BSS/25/0001';
```

### Test password manually in Supabase:
```sql
SELECT index_number, full_name,
       crypt('Soasa2026!', password_hash) = password_hash as password_matches
FROM students 
WHERE index_number = 'SS/BSS/25/0001';
```

**Expected**: `password_matches` should be `true`

---

## Still Having Issues?

### Check Vercel Deployment Logs

1. Go to https://vercel.com/your-project
2. Click on latest deployment
3. Click "Functions" tab
4. Look for `/api/auth/login` errors
5. Expand to see full error details

### Common Backend Errors:

**"JWT_SECRET must be at least 32 characters"**  
→ Solution: Update `JWT_SECRET` to be longer

**"Cannot connect to Supabase"**  
→ Solution: Check `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

**"password_hash is null"**  
→ Solution: Students imported incorrectly, re-import with correct CSV

---

## Quick Checklist

Before students can vote, verify ALL of these:

- [ ] Backend deployed to Vercel
- [ ] All 4 environment variables set in Vercel
- [ ] Supabase database tables created (`schema.sql` run)
- [ ] Storage bucket created (`storage.sql` run)
- [ ] Students imported via Electoral Commissioner dashboard
- [ ] At least one candidate registered per position
- [ ] Election schedule configured (opens in past, closes in future)
- [ ] Test login with `debug-login.html` succeeds
- [ ] Browser console shows no errors on vote.html

---

## Need More Help?

1. **Run debug tool**: `debug-login.html`
2. **Check console logs**: F12 → Console tab
3. **Check Vercel logs**: For backend errors
4. **Check Supabase SQL**: Run manual queries above
5. **Review deployment docs**: `DEPLOYMENT_CHECKLIST.md`

**Contact**: [Add your support contact here]

---

**Updated**: June 9, 2026  
**Version**: 1.0 (Production-ready, no demo mode)
