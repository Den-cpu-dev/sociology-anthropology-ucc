# SOASA Executive Positions & Candidate Management

Complete guide for managing executive positions and registering candidates in the admin dashboard.

---

## 📋 **Executive Positions Structure**

### **9 Total Positions:**

| # | Position | How It Works | Notes |
|---|----------|--------------|-------|
| 1 | **President & Vice President** | **Voted as ONE ticket** | Enter both names together (e.g., "John Doe & Jane Smith") |
| 2 | Secretary | Individual position | One candidate selected |
| 3 | Treasurer / Financial Secretary | Individual position | One candidate selected |
| 4 | Public Relations Officer (Main) | **Voted separately** | Main PRO - voted on its own |
| 5 | Public Relations Officer (Deputy) | **Voted separately** | Deputy PRO - voted on its own |
| 6 | Organizer (Main) | **Voted separately** | Main Organizer - voted on its own |
| 7 | Organizer (Deputy) | **Voted separately** | Deputy Organizer - voted on its own |
| 8 | Welfare Chairperson | Individual position | One candidate selected |
| 9 | Electoral Commissioner | Individual position | One candidate selected |

---

## 🎯 **Important: President & Vice President Pairing**

### **How It Works:**
- President and VP are **ONE ticket** (one vote selects both)
- Students vote for **the pair**, not individuals
- Multiple tickets can run (e.g., Ticket A vs Ticket B vs Ticket C)

### **How to Register:**
When adding a presidential ticket in the admin dashboard:

1. Go to **Candidates** tab
2. Click **Add candidate**
3. Select position: **"President & Vice President"**
4. **Full name field**: Enter BOTH names with ` & ` separator
   - ✅ Correct: `Jonathan Etsey & Prince Aseidu Essien`
   - ✅ Correct: `Ama Mensah & Kwame Asante`
   - ❌ Wrong: `Jonathan Etsey` (missing VP)
   - ❌ Wrong: `Jonathan Etsey, Prince Aseidu` (use &, not comma)

5. **Photo**: Upload a photo (president's photo OR both together)
6. **Manifesto URL** (optional): Link to their campaign platform

### **Example:**
```
Position: President & Vice President
Full Name: Jonathan Etsey & Prince Aseidu Essien
Photo: [Upload presidential photo]
Manifesto: https://example.com/manifesto-ticket1
```

---

## 📸 **Adding Candidates with Photos**

### **Step-by-Step Process:**

1. **Navigate to Admin Dashboard**
   - URL: `https://your-site.vercel.app/electoral-commissioner.html`
   - Login with `ADMIN_SECRET` or `EC_DASHBOARD_PASSWORD`

2. **Go to Candidates Tab**
   - Click **"Candidates"** in the top navigation

3. **Fill in Candidate Form**
   - **Position**: Select from dropdown
   - **Candidate Name**: 
     - For President/VP: Both names with `&` (e.g., "John & Jane")
     - For others: Single full name (e.g., "Ama Mensah")
   - **Photo**: Click "Choose File" → select image from your gallery
     - ✅ Supported: JPEG, PNG, WebP
     - ✅ Max size: 5 MB
     - ✅ Recommended: Square photos (e.g., 500x500px)
     - ✅ Tip: Professional headshots work best
   - **Manifesto URL** (optional): Link to campaign materials

4. **Save**
   - Click **"Save candidate"**
   - Photo will be automatically uploaded to Supabase Storage
   - Candidate will appear in the list below

### **Photo Requirements:**
- Format: JPEG, PNG, or WebP
- Maximum file size: 5 MB
- Recommended dimensions: 400x400 to 800x800 pixels (square)
- Photo appears on ballot as circular thumbnail
- Ensure good lighting and clear face visibility

---

## 🗳️ **How Students See the Ballot**

### **President & Vice President Section:**
```
┌─────────────────────────────────────────────────┐
│ President & Vice President                       │
│                                                  │
│ Each option is a President and Vice President   │
│ pair — one vote selects both.                   │
│                                                  │
│ ⚪ Abstain                                       │
│    No preference for this office                 │
│                                                  │
│ ⚪ [Photo] Jonathan Etsey & Prince Aseidu Essien│
│           Read manifesto →                       │
│                                                  │
│ ⚪ [Photo] Ama Mensah & Kwame Asante            │
│           Read manifesto →                       │
└─────────────────────────────────────────────────┘
```

### **Individual Position (e.g., Secretary):**
```
┌─────────────────────────────────────────────────┐
│ Secretary                                        │
│                                                  │
│ ⚪ Abstain                                       │
│    No preference for this office                 │
│                                                  │
│ ⚪ [Photo] Marigold Naa Ayeley Colley           │
│           Read manifesto →                       │
│                                                  │
│ ⚪ [Photo] Daniel Koomson                        │
└─────────────────────────────────────────────────┘
```

---

## 📊 **Results & Live Dashboard**

### **What the Electoral Commissioner Sees:**

The dashboard shows **real-time** statistics:

#### **1. General Statistics**
- **Total ballots cast**: Live count
- **Turnout percentage**: Voted / Eligible × 100
- **Students who haven't voted yet**: Live count

#### **2. Per-Position Results**
For each position, you see:
- Number of votes per candidate
- Vote percentage per candidate
- Number of abstentions
- Automatic winner declaration (or tie flag)

#### **3. Example Dashboard View:**

```
═══════════════════════════════════════
TURNOUT: 234 of 889 students (26.3%)
═══════════════════════════════════════

PRESIDENT & VICE PRESIDENT
─────────────────────────────────────
✓ DECLARED WINNER
[Photo] Jonathan Etsey & Prince Aseidu Essien
        156 votes (68.7%)

[Photo] Ama Mensah & Kwame Asante
        71 votes (31.3%)

Abstentions: 7
─────────────────────────────────────

SECRETARY
─────────────────────────────────────
⚠️ TIE - RESOLUTION REQUIRED
[Photo] Marigold Naa Ayeley Colley
        98 votes (50.0%)

[Photo] Daniel Koomson
        98 votes (50.0%)

Abstentions: 38
─────────────────────────────────────

TREASURER / FINANCIAL SECRETARY
─────────────────────────────────────
✓ DECLARED WINNER
[Photo] Emmanuella Abban
        187 votes (84.2%)

[Photo] Isaac Tetteh
        35 votes (15.8%)

Abstentions: 12
─────────────────────────────────────
```

### **Live Updates:**
- Dashboard refreshes automatically
- Click **"Refresh"** button for manual update
- All statistics update in real-time during voting
- Winner declarations appear automatically when voting closes

---

## 🎨 **Image Upload from Gallery (Mobile & Desktop)**

### **On Desktop:**
1. Click **"Choose File"** button
2. Browse to your image folder
3. Select candidate photo
4. Click **"Open"**
5. Preview appears below
6. Click **"Save candidate"**

### **On Mobile:**
1. Tap **"Choose File"** button
2. Options appear:
   - 📸 **Take Photo** (use camera now)
   - 🖼️ **Photo Library** (select existing)
3. Select or take photo
4. Crop if needed
5. Confirm selection
6. Preview appears
7. Tap **"Save candidate"**

### **Photo Tips:**
- ✅ Use well-lit, clear headshots
- ✅ Plain background preferred
- ✅ Face should be centered
- ✅ Smile and professional attire
- ✅ Photos will be displayed as circles
- ❌ Avoid group photos (except President/VP)
- ❌ Avoid low resolution or blurry images

---

## ⚙️ **Admin Dashboard Features**

### **Candidates Tab:**
- ✅ Add new candidates
- ✅ Upload photos directly from gallery
- ✅ Add manifesto URLs
- ✅ Delete candidates
- ✅ See all registered candidates
- ✅ Preview how ballot will look

### **Dashboard Tab:**
- ✅ Real-time turnout tracking
- ✅ Vote counts per candidate
- ✅ Vote percentages
- ✅ Automatic winner declaration
- ✅ Tie detection and flagging
- ✅ Abstention tracking
- ✅ Refresh button for live updates
- ✅ Bar charts showing results

### **Voter Roll Tab:**
- ✅ Import students from CSV
- ✅ View total eligible voters
- ✅ Replace entire roll (before voting starts)

### **Settings Tab:**
- ✅ Set election title
- ✅ Configure voting window (opens/closes)
- ✅ Publish results toggle
- ✅ Time zone handling (Ghana time)

---

## 🔐 **Security Notes**

- **Photos are public** - Anyone can view them on the ballot
- **Photo URLs** are stored in Supabase Storage
- **Only admins** can upload/delete photos
- **Students cannot** upload or change photos
- **Electoral Commissioner** has full dashboard access
- **Results are private** until you click "Publish results"

---

## 📝 **Common Questions**

### **Q: Can I change a photo after uploading?**
A: Yes! Delete the candidate and re-add with new photo.

### **Q: What if I don't have a photo?**
A: Photos are optional. Candidate name will still appear on ballot.

### **Q: Can one person run for multiple positions?**
A: Technically yes, but follow SOASA constitution rules.

### **Q: How do I remove a candidate who withdrew?**
A: Go to Candidates tab → Find candidate → Click "Delete"

### **Q: Can students see live results?**
A: No, only Electoral Commissioner sees live results. Students see only after you publish.

### **Q: What happens with tied votes?**
A: Dashboard flags ties. Electoral Commissioner resolves per SOASA rules.

### **Q: Do deputy positions need separate candidates?**
A: Yes! Deputy PRO and Deputy Organizer are voted on separately from the main positions.

---

## ✅ **Candidate Registration Checklist**

Before election day:

- [ ] All positions have at least one candidate
- [ ] President/VP tickets use `&` separator
- [ ] All photos uploaded and displaying correctly
- [ ] No duplicate candidate entries
- [ ] Manifesto URLs tested (if provided)
- [ ] Preview ballot in dashboard looks correct
- [ ] Electoral Commissioner can access dashboard
- [ ] Voting window dates set correctly

---

**Need help?** Re-read this guide or check `DEPLOYMENT_CHECKLIST.md` for full setup instructions.

---

**Ready to add candidates?** Go to your dashboard now! 🗳️✨
