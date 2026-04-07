# 🚀 Quick Start Guide - CampusX Database Seeding

## ⚡ Fast Track (3 Commands)

```bash
cd backend
npm run preflight    # Check if everything is ready
npm run seed:once    # Populate database
npm run verify       # Confirm data is correct
```

That's it! Your database is now ready. 🎉

---

## 📋 Step-by-Step Guide

### Step 1: Pre-flight Check ✈️

Before seeding, verify your environment is ready:

```bash
cd backend
npm run preflight
```

This checks:
- ✅ .env file exists with MONGO_URI
- ✅ seed-data.json is valid
- ✅ Dependencies are installed
- ✅ Model files are present
- ✅ MongoDB is running and accessible

**If you see:** `🎉 All pre-flight checks PASSED!`  
→ Proceed to Step 2

**If you see errors:**  
→ Fix the issues listed, then run `npm run preflight` again

---

### Step 2: Seed the Database 🌱

Once pre-flight checks pass:

```bash
npm run seed:once
```

You'll see:
```
✅ MongoDB connected successfully
🗑️  All collections cleared
📥 Importing users...
✅ Imported 43 users
📥 Importing classes...
✅ Imported 6 classes
... (continues for all collections)
✨ Database seeded successfully!
🎉 All done! Database is ready to use.
```

⚠️ **Warning:** This deletes ALL existing data in your database!

---

### Step 3: Verify the Data ✔️

Confirm everything was imported correctly:

```bash
npm run verify
```

You'll see:
```
✅ MongoDB connected successfully

🔍 Verifying database contents...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Collection Statistics:
   Users:        43 documents
   Classes:      6 documents
   Tests:        5 documents
   Submissions:  11 documents
   Results:      3 documents
   Receipts:     4 documents
   Events:       8 documents
   Chat Messages:12 documents
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔍 Checking sample data...

✅ Admin found: Dr. Rajesh Kumar (admin1@campusx.edu)
✅ Teacher found: Dr. Sarah Johnson (teacher1@campusx.edu)
✅ Student found: Arjun Mehta (student1@campusx.edu)
✅ Class found: Computer Science - 3rd Year (2022 Batch) (5 students)
✅ Test found: Data Structures Mid-Term (4 questions)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Database verification PASSED! All data is present and correct.

📋 Quick Login Credentials (password: password123):
   Admin:   A00001 / admin1@campusx.edu
   Teacher: T00001 / teacher1@campusx.edu
   Student: S00001 / student1@campusx.edu
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🎮 Test Your Application

### Start Backend
```bash
npm run dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: 127.0.0.1
```

### Start Frontend
Open a new terminal:
```bash
cd ../frontend
npm start
```

### Login and Test
Navigate to `http://localhost:4200` (or your Angular port)

Try these credentials:

**Admin Dashboard:**
- User ID: `A00001`
- Password: `password123`

**Teacher Dashboard:**
- User ID: `T00001`
- Password: `password123`

**Student Dashboard:**
- User ID: `S00001`
- Password: `password123`

---

## 🛠️ Available Scripts

| Command            | Description                                  |
|--------------------|----------------------------------------------|
| `npm run preflight`| Check if environment is ready for seeding    |
| `npm run seed:once`| Seed database (clears existing data)         |
| `npm run verify`   | Verify seeded data is correct                |
| `npm run dev`      | Start backend server (development mode)      |

---

## 🔧 Troubleshooting

### MongoDB Connection Failed

**Error:** `❌ MongoDB connection failed!`

**Solutions:**
1. Start MongoDB:
   ```bash
   # Linux
   sudo systemctl start mongod
   
   # macOS
   brew services start mongodb-community
   
   # Windows
   net start MongoDB
   ```

2. Check if MongoDB is running:
   ```bash
   mongosh
   ```

3. Verify MONGO_URI in `.env`:
   ```env
   MONGO_URI=mongodb://127.0.0.1:27017/campusx
   ```

### Dependencies Not Installed

**Error:** `❌ node_modules not found!`

**Solution:**
```bash
npm install
```

### Invalid Seed Data

**Error:** `❌ Invalid JSON in seed-data.json!`

**Solution:**
1. Check if `seed-data.json` exists
2. Validate JSON syntax (use online JSON validator)
3. Re-download the file if corrupted

### Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
1. Stop the process using port 5000:
   ```bash
   # Linux/macOS
   lsof -ti:5000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

2. Or change PORT in `.env`:
   ```env
   PORT=5001
   ```

---

## 📊 What Gets Seeded?

### Users (43 total)
- **3 Admins** - Principal, Vice Principal, Academic Coordinator
- **10 Teachers** - Various departments (CS, EC, ME, CE)
- **30 Students** - Distributed across 6 classes

### Classes (6 total)
- CS-2022-A (3rd Year)
- CS-2023-A (2nd Year)
- EC-2022-A (3rd Year Electronics)
- ME-2022-A (3rd Year Mechanical)
- CE-2022-A (3rd Year Civil)
- CS-2021-A (4th Year)

### Tests (5 total)
- 3 Closed with results published
- 2 Active (students can take them)

### Other Data
- 11 Test submissions
- 3 Semester results
- 4 Fee receipts
- 8 Campus events
- 12 Chat messages

---

## 🎯 Next Steps

After seeding:

1. **Test Authentication**
   - Login with different roles
   - Verify role-based access

2. **Explore Features**
   - Create tests as teacher
   - Submit tests as student
   - View results
   - Check attendance
   - Use chat feature

3. **Customize Data**
   - Edit `seed-data.json`
   - Run `npm run seed:once` again

4. **Develop Your Features**
   - Now you have realistic data to work with
   - Test your new features with proper data

---

## 💡 Pro Tips

1. **Always run preflight before seeding**
   ```bash
   npm run preflight && npm run seed:once && npm run verify
   ```

2. **Use verify to confirm successful seeding**
   ```bash
   npm run verify
   ```

3. **Keep seed-data.json backed up**
   - It's your source of truth for the database

4. **Document any custom changes**
   - If you modify seed-data.json, note the changes

---

## 🆘 Need More Help?

Check these files:
- `SEEDING_GUIDE.md` - Comprehensive guide
- `DATA_REFERENCE.md` - Complete data index
- `SETUP_SUMMARY.md` - Detailed overview

---

**Ready?** Run these three commands and you're done! ⚡

```bash
npm run preflight
npm run seed:once  
npm run verify
```

🎉 **Happy Coding!**
