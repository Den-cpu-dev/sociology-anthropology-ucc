# SOASA Executive Elections - Online Voting System

A secure, production-ready online voting system for the Sociology & Anthropology Students Association (SOASA) at the University of Cape Coast.

---

## 🎯 **Features**

✅ **Secure Authentication** - Students login with index number + password  
✅ **Secret Ballot** - Anonymous voting with one vote per student  
✅ **Real-time Results** - Live turnout tracking and automatic winner declaration  
✅ **Electoral Commissioner Dashboard** - Manage candidates, voters, and view results  
✅ **Mobile Responsive** - Works on phones, tablets, and desktops  
✅ **Photo Support** - Upload candidate photos  
✅ **Tie Detection** - Flags ties for manual resolution  
✅ **President/VP Ticket** - Vote for president and VP as a single ticket  

---

## 📊 **Current Status**

| Component | Status | Count |
|-----------|--------|-------|
| **Student Data** | ✅ Complete | 889 eligible voters |
| ├─ Level 100 | ✅ Ready | 255 students |
| ├─ Level 200 | ✅ Ready | 286 students |
| ├─ Level 300 | ✅ Ready | 189 students |
| └─ Level 400 | ✅ Ready | 159 students |
| **Frontend Pages** | ✅ Complete | 4 pages |
| **API Endpoints** | ✅ Complete | 13 endpoints |
| **Database Schema** | ✅ Complete | 5 tables + views |
| **Documentation** | ✅ Complete | 5 guides |
| **Configuration Files** | ✅ Complete | All required files |

---

## 🚀 **Quick Start**

🔴 **Important**: This system is now **production-only**. Demo mode has been removed for security and reliability.

### 🚀 Production Deployment
Follow the **[Production Ready Guide](docs/PRODUCTION_READY.md)** for complete setup instructions.

### 🛠️ Local Development
See **[Local Development Guide](docs/LOCAL_DEVELOPMENT.md)** to run locally (requires backend setup).

### 📋 Deployment Checklist
Use the **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** for step-by-step deployment.

---

## 📁 **Project Structure**

```
├── api/                      # Backend (Vercel serverless functions)
│   ├── admin/               # Admin-only endpoints
│   ├── auth/                # Authentication (login/logout)
│   ├── ballot.js            # Fetch ballot
│   └── vote.js              # Submit vote
├── data/                     # Student CSV files (ready to import)
│   ├── l100-students.csv    # 255 students
│   ├── l200-students.csv    # 286 students
│   ├── l300-students.csv    # 189 students
│   └── l400-students.csv    # 159 students
├── docs/                     # Documentation
│   ├── VOTING_SETUP.md      # Original setup guide
│   ├── DEPLOYMENT_CHECKLIST.md  # Step-by-step deployment
│   └── LOCAL_DEVELOPMENT.md # Local dev setup
├── js/                       # Frontend JavaScript
│   ├── vote.js              # Main voting logic
│   └── electoral-commissioner.js  # Admin dashboard
├── css/                      # Stylesheets
├── supabase/                # Database migrations
│   ├── schema.sql           # Tables, functions, views
│   └── storage.sql          # Photo storage bucket
├── lib/                      # Shared backend utilities
├── .env.example             # Environment template
└── vercel.json              # Deployment configuration
```

---

## 🎓 **Executive Positions**

The system supports voting for these 9 positions:

1. **President & Vice President** - Voted as ONE ticket (both names together)
2. **Secretary** - Individual position
3. **Treasurer / Financial Secretary** - Individual position
4. **Public Relations Officer (Main)** - Voted separately from deputy
5. **Public Relations Officer (Deputy)** - Voted separately from main
6. **Organizer (Main)** - Voted separately from deputy  
7. **Organizer (Deputy)** - Voted separately from main
8. **Welfare Chairperson** - Individual position
9. **Electoral Commissioner** - Individual position

**Important:** President & VP must be registered together using format: `Name1 & Name2`

See **[Positions & Candidates Guide](docs/POSITIONS_AND_CANDIDATES.md)** for detailed instructions on adding candidates with photos.

---

## 🔒 **Security Features**

- ✅ **Password hashing** with bcrypt
- ✅ **JWT session tokens** with httpOnly cookies
- ✅ **Row-level security** on all database tables
- ✅ **Service role authentication** for admin APIs
- ✅ **One vote per student** enforced at database level
- ✅ **Atomic transactions** prevent double voting
- ✅ **Secret ballots** - no link between student and vote
- ✅ **Environment variable protection** - no secrets in code

---

## 🛠️ **Tech Stack**

| Layer | Technology |
|-------|------------|
| **Frontend** | HTML, CSS, JavaScript (vanilla) |
| **Backend** | Vercel Serverless Functions |
| **Database** | Supabase (PostgreSQL) |
| **Authentication** | JWT + bcrypt |
| **Storage** | Supabase Storage (photos) |
| **Deployment** | Vercel |

---

## 📖 **Documentation**

- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Complete deployment guide
- **[Positions & Candidates](docs/POSITIONS_AND_CANDIDATES.md)** - How to add candidates with photos
- **[Local Development](docs/LOCAL_DEVELOPMENT.md)** - Run locally for testing
- **[Voting Setup](docs/VOTING_SETUP.md)** - Original technical documentation

---

## 🎯 **Next Steps**

### Before Deployment
1. ✅ Review `.env.example` - understand required variables
2. ✅ Read `DEPLOYMENT_CHECKLIST.md` - deployment plan
3. ⏳ Create Supabase project
4. ⏳ Deploy to Vercel
5. ⏳ Import student data
6. ⏳ Register candidates
7. ⏳ Set election schedule
8. ⏳ Test thoroughly
9. ⏳ Go live!

### During Election
- Monitor turnout via dashboard
- Help students with login issues
- Keep admin credentials secure
- Export results after closing

### After Election
- Download and backup results
- Announce winners
- Archive election data
- Plan improvements for next year

---

## 🆘 **Support**

### Common Issues

**Students can't login:**
- Check index number format (no spaces)
- Verify password is exactly: `Soasa2026!`
- Ensure election window is open

**Admin dashboard not working:**
- Verify environment variables in Vercel
- Check Supabase project is running
- Review function logs in Vercel dashboard

**Photos not uploading:**
- Confirm `storage.sql` was executed
- Check bucket exists in Supabase Storage
- Verify file size (max 5MB) and format (JPEG/PNG/WebP)

---

## 📊 **System Statistics**

- **889 eligible voters** across 4 levels
- **9 executive positions** to be filled
- **13 API endpoints** for secure operations
- **5 database tables** + views and functions
- **Zero dependencies** on frontend (vanilla JS)
- **100% responsive** design

---

## 🏆 **Credits**

Built for the Sociology & Anthropology Students Association (SOASA)  
University of Cape Coast, Ghana  
Academic Year: 2026/2027

---

## 📝 **License**

This project is built for SOASA's internal use. All rights reserved.

---

## 🎉 **Ready to Deploy?**

Follow the **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** to get started!

Good luck with your election! 🗳️✨
