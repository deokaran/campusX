# 📧 Email Configuration Guide for CampusX

This guide explains how to set up email functionality for OTP-based password reset in CampusX.

## 📋 Overview

CampusX uses **Nodemailer** with Gmail to send OTP (One-Time Password) emails for password reset functionality.

---

## 🚀 Quick Setup (Gmail)

### Step 1: Create a Gmail Account (if needed)

Create a dedicated Gmail account for CampusX:
- Email: `campusx.demo@gmail.com` (or any name you prefer)
- This will be used only for sending automated emails

### Step 2: Enable 2-Factor Authentication

1. Go to your Google Account: https://myaccount.google.com
2. Navigate to **Security** → **2-Step Verification**
3. Enable 2-Step Verification (required for app passwords)

### Step 3: Generate an App Password

1. Go to: https://myaccount.google.com/apppasswords
2. Select:
   - **App**: Mail
   - **Device**: Other (Custom name) → Type "CampusX Backend"
3. Click **Generate**
4. Google will show you a 16-character password like: `abcd efgh ijkl mnop`
5. **Copy this password** (you won't be able to see it again)

### Step 4: Update .env File

Open `backend/.env` and update these values:

```env
# 📧 EMAIL CONFIGURATION
EMAIL_USER=campusx.demo@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Important**: 
- Use the **App Password** (not your regular Gmail password)
- Remove spaces from the app password if you're having issues

---

## 🧪 Testing Email Configuration

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Test Email Service

Create a test file `test-email.ts`:

```typescript
import { sendOTPEmail, verifyEmailConfig } from './src/email.service';

async function testEmail() {
  // Verify config
  const configValid = await verifyEmailConfig();
  if (!configValid) {
    console.error('Email configuration is invalid!');
    return;
  }

  // Send test OTP
  const testOTP = '123456';
  const success = await sendOTPEmail(
    'your.personal.email@gmail.com',  // Replace with your email
    testOTP,
    'Test User'
  );

  if (success) {
    console.log('✅ Test email sent successfully!');
  } else {
    console.error('❌ Failed to send test email');
  }
}

testEmail();
```

Run the test:
```bash
npx ts-node test-email.ts
```

---

## 🔐 How Password Reset Works

### User Flow:

1. **User clicks "Forgot Password"**
   - Enters their email address
   - Clicks "Send OTP"

2. **Backend generates 6-digit OTP**
   - OTP is valid for 10 minutes
   - OTP is stored in memory (in-memory store)

3. **Email sent to user**
   - Beautiful HTML email template
   - Contains 6-digit OTP code
   - Warns user not to share OTP

4. **User enters OTP**
   - Enters OTP and new password
   - Backend verifies OTP
   - Password is updated

---

## 📡 API Endpoints

### 1. Request Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "student1@campusx.edu"
}
```

**Response:**
```json
{
  "message": "If an account with this email exists, an OTP has been sent.",
  "success": true,
  "devOTP": "123456"  // Only in development mode
}
```

### 2. Reset Password with OTP
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "student1@campusx.edu",
  "otp": "123456",
  "newPassword": "mynewpassword"
}
```

**Response:**
```json
{
  "message": "Password reset successful",
  "success": true
}
```

### 3. Resend OTP
```http
POST /api/auth/resend-otp
Content-Type: application/json

{
  "email": "student1@campusx.edu"
}
```

---

## 🎨 Email Template

The OTP email includes:
- ✅ CampusX branding
- ✅ Clear OTP display
- ✅ Expiry time (10 minutes)
- ✅ Security warning
- ✅ Professional HTML design

---

## 🛡️ Security Features

### OTP Security:
- ✅ **6-digit random OTP** (100,000 - 999,999)
- ✅ **10-minute expiry** (600 seconds)
- ✅ **Single-use** (deleted after successful reset)
- ✅ **Email-specific** (tied to user's email)

### Implementation:
```typescript
// In-memory storage (for demo)
const otpStore: { 
  [email: string]: { 
    otp: string; 
    expires: number 
  } 
} = {};
```

**⚠️ Production Note**: For production, use **Redis** instead of in-memory storage:
```bash
npm install redis
```

---

## 🐛 Troubleshooting

### Problem: "Invalid credentials" error

**Solution**: Make sure you're using an **App Password**, not your regular Gmail password.

### Problem: "Connection timeout"

**Solutions**:
1. Check your internet connection
2. Verify firewall isn't blocking port 465/587
3. Try using port 587 with STARTTLS:

```typescript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});
```

### Problem: Email goes to spam

**Solutions**:
1. Add CampusX email to your contacts
2. Check SPF/DKIM records (advanced)
3. Use a professional email service (SendGrid, AWS SES)

### Problem: "Less secure app access"

**Solution**: This is deprecated. You **must** use App Passwords now.

---

## 📦 Production Recommendations

### 1. Use Professional Email Service

For production, consider:
- **SendGrid** (Free tier: 100 emails/day)
- **AWS SES** (Very cheap, highly reliable)
- **Mailgun** (Good for transactional emails)

### 2. Use Redis for OTP Storage

```bash
npm install redis
```

```typescript
import { createClient } from 'redis';

const redis = createClient();
await redis.connect();

// Store OTP (10-minute expiry)
await redis.setEx(`otp:${email}`, 600, otp);

// Retrieve OTP
const storedOTP = await redis.get(`otp:${email}`);
```

### 3. Add Rate Limiting

Prevent abuse:
```typescript
// Max 3 OTP requests per email per hour
```

---

## 📝 Testing Credentials

For development testing:

**Admin:**
- User ID: `A00001`
- Email: `admin@campusx.edu`
- Default Password: `password123`

**Teacher:**
- User ID: `T00001`
- Email: `teacher1@campusx.edu`
- Default Password: `password123`

**Student:**
- User ID: `S00001`
- Email: `student1@campusx.edu`
- Default Password: `password123`

---

## 🎯 Summary

✅ **Nodemailer** installed and configured  
✅ **Gmail App Password** set up  
✅ **OTP generation** implemented  
✅ **Beautiful email template** created  
✅ **Secure password reset** flow  
✅ **10-minute OTP expiry**  
✅ **Development mode** shows OTP in console  

---

## 🚀 Next Steps

1. Update `.env` with real Gmail credentials
2. Run `npm install` to install nodemailer
3. Seed database: `npm run seed:once`
4. Start backend: `npm run dev`
5. Test password reset in frontend

**Happy coding! 🎉**
