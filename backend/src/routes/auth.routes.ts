import express from 'express';
import { login, register, forgotPassword, resetPassword, resendOTP } from '../controllers/auth.controller';

const router = express.Router();

// 🔐 Authentication Routes
router.post('/login', login);
router.post('/register', register);

// 📧 Password Reset Routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOTP);

export default router;
