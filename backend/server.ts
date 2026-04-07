import app from './src/app';
import dotenv from 'dotenv';
import connectDB from './src/config/db';
import { verifyEmailConfig } from './src/email.service';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  // Connect to database
  await connectDB();
  
  // Verify email configuration (non-blocking)
  console.log('\n📧 Verifying email configuration...');
  const emailReady = await verifyEmailConfig();
  
  if (!emailReady) {
    console.warn('⚠️  Email service not configured properly');
    console.warn('💡 OTP will be logged to console instead');
    console.warn('📖 See EMAIL_SETUP.md for configuration instructions\n');
  } else {
    console.log('');
  }
  
  // Start Express server
  app.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API available at http://localhost:${PORT}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  });
};

startServer();
