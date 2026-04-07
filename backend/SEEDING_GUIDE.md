# CampusX Backend - Database Seeding Guide

## 📋 Overview

This guide will help you populate your MongoDB database with comprehensive dummy data for the CampusX application.

## 📦 What's Included

The seed data includes:
- **43 Users**: 3 Admins, 10 Teachers, 30 Students
- **6 Classes**: Different departments and years
- **5 Tests**: Various subjects with questions
- **11 Submissions**: Student test submissions
- **3 Results**: Semester results with grades
- **4 Receipts**: Fee payment receipts
- **8 Events**: Campus events and notices
- **12 Chat Messages**: Class chat history

## 🚀 Quick Start

### Method 1: Using npm script (Recommended)

```bash
# Navigate to backend directory
cd backend

# Run the seeder (one-time execution)
npm run seed:once
```

### Method 2: Using ts-node directly

```bash
cd backend
npx ts-node seed.ts
```

## ⚙️ Prerequisites

1. **MongoDB** must be running
2. **Environment variables** must be configured in `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/campusx
PORT=5000
```

## 📊 Sample Credentials

After seeding, you can login with these credentials:

### Admin
- **User ID**: `A00001`
- **Email**: `admin1@campusx.edu`
- **Password**: `password123`

### Teacher
- **User ID**: `T00001`
- **Email**: `teacher1@campusx.edu`
- **Password**: `password123`

### Student
- **User ID**: `S00001`
- **Email**: `student1@campusx.edu`
- **Password**: `password123`

## 🗂️ Database Structure

### Users Collection
```javascript
{
  _id: "S00001",
  name: "Arjun Mehta",
  email: "student1@campusx.edu",
  password: "$2a$10$...", // Hashed
  role: "S", // S = Student, T = Teacher, A = Admin
  details: {
    fullName: "Arjun Mehta",
    department: "Computer Science",
    degree: "B.Tech",
    yearSem: "3rd Year, Sem 5",
    batch: "2022-2026",
    mobile: "+91 9876543300",
    classId: "CS-2022-A",
    fees: {
      total: 120000,
      paid: 80000,
      due: 40000
    }
  }
}
```

### Classes Collection
```javascript
{
  _id: "CS-2022-A",
  name: "Computer Science - 3rd Year (2022 Batch)",
  teacherIds: ["T00001", "T00002", "T00003"],
  studentIds: ["S00001", "S00002", "S00003", "S00004", "S00005"],
  subjects: [...],
  timeTable: [...]
}
```

### Tests Collection
```javascript
{
  _id: "TEST001",
  title: "Data Structures Mid-Term",
  subject: "Data Structures & Algorithms",
  classId: "CS-2022-A",
  createdBy: "T00001",
  status: "closed", // active, closed
  resultsPublished: true,
  questions: [...]
}
```

## 🔄 Clearing and Reseeding

The seeder automatically:
1. **Clears all existing data** from all collections
2. **Imports fresh data** from `seed-data.json`

⚠️ **Warning**: This will delete ALL existing data in your database!

## 📝 Data Highlights

### Students Distribution
- **CS-2022-A**: 5 students (3rd Year)
- **CS-2023-A**: 5 students (2nd Year)
- **EC-2022-A**: 5 students (Electronics, 3rd Year)
- **ME-2022-A**: 5 students (Mechanical, 3rd Year)
- **CE-2022-A**: 5 students (Civil, 3rd Year)
- **CS-2021-A**: 5 students (4th Year)

### Tests Status
- **Closed with results published**: 3 tests
- **Active (ongoing)**: 2 tests

### Fee Status
- Students with **full payment**: 14
- Students with **pending dues**: 16

### Semester Results
- Includes SGPA/CGPA calculations
- Grade points and credit points
- Subject-wise internal and external marks

## 🛠️ Troubleshooting

### Error: MongoDB connection failed
```bash
# Check if MongoDB is running
sudo systemctl status mongod  # Linux
brew services list            # macOS
```

### Error: Cannot find module
```bash
# Install dependencies
npm install
```

### Error: Environment variables not found
```bash
# Create .env file in backend directory
touch .env

# Add MongoDB URI
echo "MONGODB_URI=mongodb://localhost:27017/campusx" >> .env
```

## 📚 Customizing Seed Data

To modify the seed data:
1. Edit `seed-data.json`
2. Run the seeder again: `npm run seed:once`

## 🔐 Password Hashing

Note: The passwords in the seed data are placeholder hashes. For production, ensure you:
1. Use bcrypt to hash passwords
2. Never commit real passwords to version control
3. Use environment variables for sensitive data

## 📞 Support

If you encounter any issues:
1. Check MongoDB connection
2. Verify `.env` configuration
3. Ensure all dependencies are installed
4. Check MongoDB logs for errors

---

Happy Coding! 🚀
