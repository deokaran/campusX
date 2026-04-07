# CampusX Backend - Database Seeding System

Complete MongoDB database seeding solution for the CampusX educational portal.

## 🎯 Quick Start (30 seconds)

```bash
cd backend
npm run preflight     # ✅ Check environment
npm run seed:once     # 🌱 Seed database
npm run verify        # ✔️ Verify data
```

**Done!** Your database now has 43 users, 6 classes, 5 tests, and more. 🎉

---

## 📚 Documentation

| File                    | Purpose                                      |
|-------------------------|----------------------------------------------|
| **QUICK_START.md** ⚡   | Fast setup (Start here!)                     |
| **SEEDING_GUIDE.md** 📖 | Comprehensive step-by-step guide             |
| **DATA_REFERENCE.md** 📊| Complete data index & relationships          |
| **SETUP_SUMMARY.md** 📋 | Overview of what was created                 |

---

## 🗂️ Files Overview

### Data Files
- **`seed-data.json`** - Complete dummy data (95 documents)
- **`seed.ts`** - Seeder script (imports data to MongoDB)

### Scripts
- **`preflight-check.ts`** - Pre-seeding environment validation
- **`verify-seed.ts`** - Post-seeding data verification
- **`generate-password-hash.ts`** - Bcrypt hash generator

### Documentation
- **`QUICK_START.md`** - 3-command setup guide
- **`SEEDING_GUIDE.md`** - Detailed instructions
- **`DATA_REFERENCE.md`** - Complete data relationships
- **`SETUP_SUMMARY.md`** - What's included overview

---

## 📊 What Gets Seeded?

```
Database: campusx
Total Documents: 95

Collections:
├── users         (43) - Admins, Teachers, Students
├── classes       (6)  - Different departments & years
├── tests         (5)  - MCQ tests with questions
├── submissions   (11) - Student test submissions
├── results       (3)  - Semester results with SGPA/CGPA
├── receipts      (4)  - Fee payment records
├── events        (8)  - Campus events & notices
└── chatmessages  (12) - Class chat history
```

---

## 🔑 Login Credentials

All passwords: `password123`

| Role    | User ID | Email                 |
|---------|---------|------------------------|
| Admin   | A00001  | admin1@campusx.edu    |
| Teacher | T00001  | teacher1@campusx.edu  |
| Student | S00001  | student1@campusx.edu  |

*See DATA_REFERENCE.md for complete list of all 43 users*

---

## 🛠️ NPM Scripts

```bash
# Environment Check
npm run preflight       # Validate setup before seeding

# Database Operations
npm run seed:once       # Seed database (clears existing data)
npm run verify          # Verify seeded data

# Development
npm run dev             # Start backend server
npm run build           # Build for production
npm run start           # Start production server
```

---

## ✅ Pre-requisites

1. **MongoDB** - Running on localhost:27017
2. **Node.js** - v16+ installed
3. **Dependencies** - Run `npm install`
4. **Environment** - `.env` file with MONGO_URI

---

## 🚀 Typical Workflow

### First Time Setup
```bash
# 1. Install dependencies
npm install

# 2. Check environment
npm run preflight

# 3. Seed database
npm run seed:once

# 4. Verify data
npm run verify

# 5. Start server
npm run dev
```

### Daily Development
```bash
# Just start the server
npm run dev
```

### Reset Database
```bash
# Re-seed (clears all data)
npm run seed:once
npm run verify
```

---

## 🎓 Data Highlights

### Realistic Coverage
- ✅ Multiple departments (CS, EC, ME, CE)
- ✅ Different year levels (2nd, 3rd, 4th year)
- ✅ Mix of fee statuses (paid, pending)
- ✅ Active and closed tests
- ✅ Real-world class schedules
- ✅ Proper SGPA/CGPA calculations

### Complete Relationships
- ✅ Students linked to classes
- ✅ Teachers assigned to subjects
- ✅ Tests created by teachers
- ✅ Submissions tied to tests & students
- ✅ Results with proper grading
- ✅ Chat messages with senders

---

## 🔍 Example Queries

After seeding, try these in your application:

```javascript
// Find all students in CS-2022-A
const students = await User.find({ 
  'details.classId': 'CS-2022-A',
  role: 'S' 
});

// Get active tests
const activeTests = await Test.find({ status: 'active' });

// Get student with results
const student = await User.findById('S00001');
const results = await Result.find({ studentId: 'S00001' });

// Get class with timetable
const classData = await Class.findById('CS-2022-A');
```

---

## 🐛 Troubleshooting

### MongoDB Not Running
```bash
# Start MongoDB
sudo systemctl start mongod  # Linux
brew services start mongodb-community  # macOS
net start MongoDB  # Windows
```

### Port Conflicts
Check `.env` and change PORT if needed:
```env
PORT=5001
```

### Seed Fails
1. Run `npm run preflight` to diagnose
2. Check MongoDB connection
3. Verify seed-data.json is valid JSON

### Authentication Fails
Passwords in seed-data.json are placeholder hashes!  
Use `generate-password-hash.ts` to create real bcrypt hashes.

---

## 📁 Project Structure

```
backend/
├── seed-data.json              # All dummy data
├── seed.ts                     # Main seeder
├── verify-seed.ts              # Verification script
├── preflight-check.ts          # Environment checker
├── generate-password-hash.ts   # Hash generator
│
├── QUICK_START.md              # ⚡ Start here!
├── SEEDING_GUIDE.md            # 📖 Full guide
├── DATA_REFERENCE.md           # 📊 Data index
├── SETUP_SUMMARY.md            # 📋 Overview
│
├── src/
│   ├── models/                 # Mongoose models
│   ├── controllers/            # Business logic
│   ├── routes/                 # API routes
│   └── config/                 # Configuration
│
├── .env                        # Environment variables
├── package.json                # Dependencies & scripts
└── server.ts                   # Entry point
```

---

## 🎯 Next Steps

1. **Seed your database**
   ```bash
   npm run seed:once
   ```

2. **Start development**
   ```bash
   npm run dev
   ```

3. **Test features**
   - Login with sample credentials
   - Create tests as teacher
   - Submit tests as student
   - View results & attendance

4. **Customize data**
   - Edit `seed-data.json`
   - Re-run `npm run seed:once`

---

## 💡 Pro Tips

1. **Always run preflight before seeding**
   ```bash
   npm run preflight && npm run seed:once
   ```

2. **Chain commands for full cycle**
   ```bash
   npm run preflight && npm run seed:once && npm run verify
   ```

3. **Quick check data**
   ```bash
   npm run verify
   ```

4. **Backup before major changes**
   ```bash
   mongodump --db campusx --out ./backup
   ```

---

## 📞 Support

**Documentation**: Check the 4 guide files listed above  
**Issues**: Review troubleshooting section  
**MongoDB**: Verify it's running with `mongosh`

---

## ⚙️ Technical Details

- **Database**: MongoDB 5.0+
- **ODM**: Mongoose 9.3+
- **Runtime**: Node.js 16+
- **Language**: TypeScript
- **Total Documents**: 95
- **Data Size**: ~500KB

---

## 🌟 Features

✅ Complete dummy data for all collections  
✅ Realistic relationships between entities  
✅ Multiple user roles (Admin, Teacher, Student)  
✅ Various departments and years  
✅ Active and historical tests  
✅ Proper grading and SGPA/CGPA  
✅ Fee records with payment status  
✅ Campus events calendar  
✅ Class chat history  
✅ Pre-flight environment checks  
✅ Post-seed verification  
✅ Comprehensive documentation  

---

## 📄 License

ISC

---

## 🎊 Status

✅ **READY TO USE**

Run `npm run preflight` to get started!

---

**Created**: March 2025  
**Database**: CampusX Educational Portal  
**Version**: 1.0.0  
**Collections**: 8  
**Documents**: 95  

---

*For detailed setup instructions, see [QUICK_START.md](QUICK_START.md)*
