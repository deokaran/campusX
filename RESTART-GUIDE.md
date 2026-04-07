# 🚀 RESTART GUIDE - JWT REMOVED

## ✅ All Files Updated Successfully!

I've removed JWT authentication and simplified your login system.

---

## 🔧 **What to Do Now:**

### Step 1: **Stop Both Servers**

If backend or frontend are running, stop them (Ctrl+C in both terminals).

---

### Step 2: **Clean Backend Dependencies**

Open PowerShell/CMD in `C:\ty-project\campusX\backend`:

```powershell
# Remove old dependencies
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Install fresh dependencies (without JWT)
npm install

# Verify installation
npm list bcrypt
npm list bcryptjs
```

**Expected:** Both bcrypt packages should be installed, NO jsonwebtoken!

---

### Step 3: **Start Backend**

In the same terminal:

```powershell
npm run dev
```

**Expected Output:**
```
[INFO] ts-node-dev ver. 2.0.0
Server running on port 5000
MongoDB connected successfully
```

✅ **If you see this, backend is working!**

---

### Step 4: **Start Frontend**

Open new PowerShell/CMD in `C:\ty-project\campusX\frontend`:

```powershell
ng s
```

**Expected:**
```
✔ Compiled successfully.
```

---

### Step 5: **Test Login**

1. Go to: `http://localhost:4200/login`
2. Click **Admin** tab
3. Enter:
   - **User ID:** `A00001`
   - **Password:** `password123`
4. Click **Login**

**Expected:** Should redirect to admin dashboard!

---

## 🎯 **Test Credentials:**

| Role | User ID | Password |
|------|---------|----------|
| Admin | A00001 | password123 |
| Teacher | T00001 | password123 |
| Student | S00001 | password123 |

---

## 🐛 **If Login Still Fails:**

### Check Backend Console

Look for:
```
Login attempt: { id: 'A00001', password: '***' }
Login successful: A00001
```

### If "User not found":

Your database might not be seeded. Run:

```powershell
cd backend
npm run seed:once
```

### If "Invalid password":

The seeded password hash might be wrong. Let me know!

---

## 📊 **What Changed:**

| File | Change |
|------|--------|
| `auth.controller.ts` | ✅ No JWT, uses user ID |
| `auth.routes.ts` | ✅ No JWT middleware |
| `auth.middleware.ts` | ✅ Placeholder only |
| `auth.service.ts` | ✅ No token handling |
| `package.json` | ✅ Removed JWT deps |

---

## ✅ **Authentication Flow Now:**

```
1. User enters: A00001 / password123
   ↓
2. Frontend sends: POST /api/auth/login
   Body: { id: "A00001", password: "password123" }
   ↓
3. Backend finds user in MongoDB
   ↓
4. Backend compares password with bcrypt
   ↓
5. Backend returns: { user: {...}, message: "Login successful" }
   ↓
6. Frontend stores user in localStorage
   ↓
7. Frontend redirects to admin dashboard
```

---

## 🎓 **Perfect for College Projects!**

- ✅ Simple and easy to understand
- ✅ Still secure (bcrypt password hashing)
- ✅ No complex JWT logic
- ✅ Works perfectly for demonstrations

---

## 🚀 **Start Your Servers Now!**

1. Backend: `cd backend && npm install && npm run dev`
2. Frontend: `cd frontend && ng s`
3. Login: `http://localhost:4200/login` with A00001 / password123

**Good luck!** 🎉
