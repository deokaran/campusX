# 🔐 CampusX Admin Login Credentials

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║              CAMPUSX ADMIN LOGIN CREDENTIALS              ║
║                                                           ║
║  ┌─────────────────────────────────────────────────────┐  ║
║  │  USER ID:   A00001                                  │  ║
║  │  EMAIL:     admin1@campusx.edu                      │  ║
║  │  PASSWORD:  password123                             │  ║
║  └─────────────────────────────────────────────────────┘  ║
║                                                           ║
║  Access Admin Dashboard:                                  ║
║  http://localhost:4200/login                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
```

## All Login Credentials

### 👑 Admin Accounts (3)
| User ID | Email                | Name             | Password     |
|---------|----------------------|------------------|--------------|
| A00001  | admin1@campusx.edu   | Dr. Rajesh Kumar | password123  |
| A00002  | admin2@campusx.edu   | Ms. Priya Sharma | password123  |
| A00003  | admin3@campusx.edu   | Mr. Amit Patel   | password123  |

### 👨‍🏫 Teacher Accounts (10)
| User ID | Email                 | Name                 | Password    |
|---------|-----------------------|----------------------|-------------|
| T00001  | teacher1@campusx.edu  | Dr. Sarah Johnson    | password123 |
| T00002  | teacher2@campusx.edu  | Prof. Michael Chen   | password123 |
| T00003  | teacher3@campusx.edu  | Dr. Anita Desai      | password123 |
| T00004  | teacher4@campusx.edu  | Prof. Robert Williams| password123 |
| T00005  | teacher5@campusx.edu  | Dr. Meera Reddy      | password123 |
| T00006  | teacher6@campusx.edu  | Prof. David Brown    | password123 |
| T00007  | teacher7@campusx.edu  | Dr. Kavita Nair      | password123 |
| T00008  | teacher8@campusx.edu  | Prof. James Anderson | password123 |
| T00009  | teacher9@campusx.edu  | Dr. Sneha Kapoor     | password123 |
| T00010  | teacher10@campusx.edu | Prof. Daniel Martinez| password123 |

### 🎓 Student Accounts (30)
| User ID | Email                 | Name          | Class      | Password    |
|---------|-----------------------|---------------|------------|-------------|
| S00001  | student1@campusx.edu  | Arjun Mehta   | CS-2022-A  | password123 |
| S00002  | student2@campusx.edu  | Priya Singh   | CS-2022-A  | password123 |
| S00003  | student3@campusx.edu  | Rahul Verma   | CS-2022-A  | password123 |
| S00004  | student4@campusx.edu  | Sneha Patel   | CS-2022-A  | password123 |
| S00005  | student5@campusx.edu  | Vivek Kumar   | CS-2022-A  | password123 |
| ...     | ...                   | ...           | ...        | password123 |

*All 30 students have the same password: **password123***

---

## 🚀 Quick Start

### 1. Start Backend
```bash
cd backend
npm run seed:once    # First time only
npm run dev
```

### 2. Start Frontend
```bash
cd frontend
npm start
```

### 3. Login
- Open: `http://localhost:4200/login`
- User ID: `A00001`
- Password: `password123`
- Click "Login"

---

## 🎯 What You Can Do as Admin

After logging in as admin (A00001), you can:

✅ **Manage Teachers**
- View all teachers
- Add new teachers
- Edit teacher details
- Delete teachers

✅ **Manage Students**
- View all students
- Add new students
- Edit student details
- Delete students
- Assign to classes

✅ **Manage Classes**
- View all classes
- Create new classes
- Edit class details
- Assign teachers
- Assign students
- Set timetables

✅ **Manage Departments**
- View departments
- Create departments
- Edit department details
- Assign HODs

✅ **Manage Fees**
- View fee records
- Add fee receipts
- Track payments
- View dues

✅ **Manage Results**
- Upload semester results
- View student results
- Edit results

✅ **Manage Notices**
- Create campus notices
- Edit notices
- Delete notices
- Set event dates

---

## ⚠️ Important Notes

1. **All passwords are:** `password123`
2. **Backend must be running** on port 5000
3. **Database must be seeded** first time
4. **Data is real** - comes from MongoDB
5. **Changes persist** - saved to database

---

## 🔄 Reset Instructions

If you need to reset everything:

```bash
cd backend
npm run seed:once    # Re-seed database
npm run verify       # Verify data
npm run dev          # Restart server
```

All credentials will be reset to default.

---

## 📞 Support

**Backend not starting?**
- Check MongoDB is running
- Check `.env` file has MONGO_URI

**Can't login?**
- Verify backend is running
- Check console for errors
- Clear browser localStorage

**No data showing?**
- Run `npm run seed:once` in backend
- Run `npm run verify` to check database

---

**Remember:** User ID is `A00001`, not the email!

Use the **User ID** field, not email for login.
