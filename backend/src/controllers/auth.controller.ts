import { Request, Response } from 'express';
import User from '../models/user.model';
import OTP from '../models/otp.model';
import bcrypt from 'bcrypt';
import { generateOTP, sendOTPEmail } from '../email.service';

export const login = async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;

    console.log('Login attempt:', { id, password: password ? '***' : 'missing' });

    const user = await User.findById(id);

    if (!user) {
      console.log('User not found:', id);
      return res.status(400).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password!);
    if (!isMatch) {
      console.log('Invalid password for user:', id);
      return res.status(400).json({ message: 'Invalid password' });
    }

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

export const register = async (req: Request, res: Response) => {
  try {
    const { _id, name, email, password, role, details } = req.body;

    const existingUser = await User.findById(_id);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const rawPassword = password || process.env.DEFAULT_PASSWORD || 'password123';
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

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

const findUserForPasswordReset = async (email?: string, userId?: string) => {
  if (email) {
    return User.findOne({ email });
  }
  if (userId) {
    return User.findById(userId);
  }
  return null;
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email, userId } = req.body;

    if (!email && !userId) {
      return res.status(400).json({ message: 'Email or User ID is required' });
    }

    const user = await findUserForPasswordReset(email, userId);
    if (!user) {
      return res.json({
        message: 'If an account with this email exists, an OTP has been sent.',
        success: true
      });
    }

    const otp = generateOTP();
    const targetEmail = user.email;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.findOneAndUpdate(
      { email: targetEmail },
      { email: targetEmail, otp, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`OTP for ${targetEmail}: ${otp} (Valid until ${expiresAt.toISOString()})`);

    const userName = user.name || user.details?.fullName || 'User';
    const emailSent = await sendOTPEmail(targetEmail, otp, userName);

    if (!emailSent) {
      console.warn('Email sending failed, but OTP is logged in console');
    }

    res.json({
      message: 'If an account with this email exists, an OTP has been sent.',
      success: true,
      email: targetEmail,
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Error processing request', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, userId, otp, newPassword } = req.body;

    if ((!email && !userId) || !otp || !newPassword) {
      return res.status(400).json({ message: 'Email or User ID, OTP, and new password are required' });
    }

    const user = await findUserForPasswordReset(email, userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const targetEmail = user.email;
    const storedOtp = await OTP.findOne({ email: targetEmail });

    if (!storedOtp) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    if (Date.now() > storedOtp.expiresAt.getTime()) {
      await OTP.deleteOne({ email: targetEmail });
      return res.status(400).json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (storedOtp.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    await OTP.deleteOne({ email: targetEmail });

    console.log(`Password reset successful for: ${targetEmail}`);

    res.json({
      message: 'Password reset successful',
      success: true
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Error resetting password', error });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email, userId } = req.body;

    if (!email && !userId) {
      return res.status(400).json({ message: 'Email or User ID is required' });
    }

    const user = await findUserForPasswordReset(email, userId);
    if (!user) {
      return res.json({
        message: 'If an account with this email exists, an OTP has been sent.',
        success: true
      });
    }

    const otp = generateOTP();
    const targetEmail = user.email;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await OTP.findOneAndUpdate(
      { email: targetEmail },
      { email: targetEmail, otp, expiresAt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log(`New OTP for ${targetEmail}: ${otp}`);

    const userName = user.name || user.details?.fullName || 'User';
    await sendOTPEmail(targetEmail, otp, userName);

    res.json({
      message: 'New OTP sent successfully',
      success: true,
      email: targetEmail,
      ...(process.env.NODE_ENV === 'development' && { devOTP: otp })
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ message: 'Error sending OTP', error });
  }
};
