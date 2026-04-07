import { Request, Response } from 'express';
import User from '../models/user.model';
import bcrypt from 'bcrypt';
import { generateOTP, sendOTPEmail } from '../email.service';

// In-memory OTP storage (for demo - in production use Redis)
const otpStore: { [email: string]: { otp: string; expires: number } } = {};

// 🔐 SIMPLE LOGIN (No JWT - College Project Version)
export const login = async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;

    console.log('Login attempt:', { id, password: password ? '***' : 'missing' });

    // Find user by ID (e.g., A00001, S00001, T00001)
    const user = await User.findById(id);
    
    if (!user) {
      console.log('User not found:', id);
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      console.log('Invalid password for user:', id);
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Return user data (without password)
    const userResponse = user.toObject();
    delete userResponse.password;

    console.log('Login successful:', id);

    res.json({
      message: 'Login successful',
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error in login', error });
  }
};

// 🔐 REGISTER (Simplified)
export const register = async (req: Request, res: Response) => {
  try {
    const { _id, name, email, password, role, details } = req.body;

    // Check if user exists
    const existingUser = await User.findById(_id);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Use provided password or default from .env
    const rawPassword = password || process.env.DEFAULT_PASSWORD || "password123";

    // Hash password
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    // Create user
    const user = new User({
      _id,
      name,
      email,
      password: hashedPassword,
      role,
      details: details || {}
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      defaultPassword: password ? undefined : rawPassword
    });

  } catch (error) {
    res.status(500).json({ message: 'Error in register', error });
  }
};

// 📧 REQUEST PASSWORD RESET OTP
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not for security
      return res.json({ 
        message: 'If an account with this email exists, an OTP has been sent.',
        success: true
      });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store OTP with 10-minute expiry
    otpStore[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    };

    console.log(`🔐 OTP for ${email}: ${otp} (Valid for 10 minutes)`);

    // Send OTP via email
    const userName = user.name || user.details?.fullName || 'User';
    const emailSent = await sendOTPEmail(email, otp, userName);

    if (!emailSent) {
      console.warn('⚠️ Email sending failed, but OTP is logged in console');
    }

    res.json({ 
      message: 'If an account with this email exists, an OTP has been sent.',
      success: true,
      // For development/testing only - remove in production
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request', error });
  }
};

// 🔐 VERIFY OTP AND RESET PASSWORD
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email, OTP, and new password are required' });
    }

    // Check if OTP exists and is valid
    const storedOTP = otpStore[email];
    if (!storedOTP) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Check if OTP has expired
    if (Date.now() > storedOTP.expires) {
      delete otpStore[email];
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Delete used OTP
    delete otpStore[email];

    console.log(`✅ Password reset successful for: ${email}`);

    res.json({ 
      message: 'Password reset successful',
      success: true
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error });
  }
};

// 🔄 RESEND OTP
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ 
        message: 'If an account with this email exists, an OTP has been sent.',
        success: true
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    
    // Store OTP
    otpStore[email] = {
      otp,
      expires: Date.now() + 10 * 60 * 1000
    };

    console.log(`🔐 New OTP for ${email}: ${otp}`);

    // Send OTP via email
    const userName = user.name || user.details?.fullName || 'User';
    await sendOTPEmail(email, otp, userName);

    res.json({ 
      message: 'New OTP sent successfully',
      success: true,
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    });

  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Error sending OTP', error });
  }
};
