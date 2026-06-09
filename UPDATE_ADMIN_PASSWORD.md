# 🔑 Update Electoral Commissioner Password

## New Password: `SoasaEc2026`

The Electoral Commissioner dashboard password is stored in the `ADMIN_SECRET` environment variable on Vercel. You need to update it there.

---

## 📋 How to Update

### Step 1: Go to Vercel Dashboard

1. Visit https://vercel.com
2. Log in to your account
3. Select your project: **sociology-anthropology-ucc**

### Step 2: Update Environment Variable

1. Click **Settings** (in the top menu)
2. Click **Environment Variables** (in the left sidebar)
3. Find the variable: `ADMIN_SECRET`
4. Click the **three dots** (•••) on the right
5. Click **Edit**
6. Change the value to: `SoasaEc2026`
7. Make sure it's enabled for:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
8. Click **Save**

### Step 3: Redeploy

**Option A - Automatic (Recommended):**
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **Redeploy** button
4. Wait ~2 minutes for deployment to complete

**Option B - Via Git Push:**
```bash
# Make a small change to trigger redeploy
git commit --allow-empty -m "Trigger redeploy with new admin password"
git push origin main
```

---

## ✅ Verify It Works

After redeployment completes:

### Test 1: Use Debug Tool
1. Go to: `https://your-site.vercel.app/debug-login.html`
2. Click "Test Backend API"
3. Should show ✅ green success

### Test 2: Login to Electoral Commissioner
1. Go to: `https://your-site.vercel.app/electoral-commissioner.html`
2. Enter password: `SoasaEc2026`
3. Click "Unlock dashboard"
4. Should see the dashboard with tabs

### Test 3: Check Vercel Logs (if issues)
1. Go to Vercel → Deployments → Click latest
2. Click "Functions" tab
3. Look for any errors related to `ADMIN_SECRET`

---

## 🔒 Security Notes

### Keep This Password Secret!

**Share ONLY with:**
- ✅ Electoral Commissioner
- ✅ Deputy Electoral Commissioner
- ✅ Faculty advisor (if needed)

**DO NOT share with:**
- ❌ Students
- ❌ General public
- ❌ Social media
- ❌ Group chats

### Password Best Practices

- Store securely (password manager)
- Change after election if needed
- Don't include in screenshots
- Don't commit to public code repositories

---

## 🆘 Troubleshooting

### "Incorrect commissioner password" after updating

**Cause**: Environment variable not applied yet or deployment not complete

**Solution**:
1. Wait 2-3 minutes after clicking Redeploy
2. Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
3. Try in incognito/private window
4. Check Vercel deployment shows "Ready"

### Can't find ADMIN_SECRET in Vercel

**Cause**: Variable not created yet

**Solution**:
1. Go to Settings → Environment Variables
2. Click **Add New**
3. Name: `ADMIN_SECRET`
4. Value: `SoasaEc2026`
5. Enable for Production, Preview, Development
6. Click Save
7. Redeploy

### Multiple environment variables with same name

**Cause**: Duplicate variables created

**Solution**:
1. Keep only ONE `ADMIN_SECRET`
2. Delete duplicates (click ••• → Delete)
3. Make sure the remaining one has correct value
4. Redeploy

---

## 📝 Current Configuration

After updating, your environment should have:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-32-character-secret-for-session-tokens
ADMIN_SECRET=SoasaEc2026
```

**All 4 variables are required** for the system to work!

---

## ✅ Success Checklist

After updating and redeploying:

- [ ] Visited Vercel dashboard
- [ ] Updated `ADMIN_SECRET` to `SoasaEc2026`
- [ ] Clicked Save
- [ ] Redeployed the site
- [ ] Waited for "Ready" status
- [ ] Tested login with new password
- [ ] Dashboard loads successfully
- [ ] Can see tabs: Dashboard, Candidates, Voters, Settings

---

## 🎯 What's Next

Once password is updated and working:

1. **Import student data** (889 voters)
2. **Register candidates** with photos
3. **Set election schedule** (dates/times)
4. **Test the full flow** with debug tool
5. **Go live** for actual voting!

---

**Updated**: June 9, 2026  
**New Password**: `SoasaEc2026`  
**Where to Set**: Vercel → Settings → Environment Variables → `ADMIN_SECRET`
