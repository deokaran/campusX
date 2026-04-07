import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import User from './src/models/user.model';
import Class from './src/models/class.model';
import Test from './src/models/test.model';
import Submission from './src/models/submission.model';
import Result from './src/models/result.model';
import Receipt from './src/models/receipt.model';
import Event from './src/models/event.model';
import ChatMessage from './src/models/chat.model';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campusx');
    console.log('✅ MongoDB connected successfully\n');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    return false;
  }
};

// Verify data
const verifyData = async () => {
  try {
    console.log('🔍 Verifying database contents...\n');
    console.log('━'.repeat(70));
    
    // Count documents in each collection
    const userCount = await User.countDocuments();
    const classCount = await Class.countDocuments();
    const testCount = await Test.countDocuments();
    const submissionCount = await Submission.countDocuments();
    const resultCount = await Result.countDocuments();
    const receiptCount = await Receipt.countDocuments();
    const eventCount = await Event.countDocuments();
    const chatCount = await ChatMessage.countDocuments();

    // Display counts
    console.log(`📊 Collection Statistics:`);
    console.log(`   Users:        ${userCount} documents`);
    console.log(`   Classes:      ${classCount} documents`);
    console.log(`   Tests:        ${testCount} documents`);
    console.log(`   Submissions:  ${submissionCount} documents`);
    console.log(`   Results:      ${resultCount} documents`);
    console.log(`   Receipts:     ${receiptCount} documents`);
    console.log(`   Events:       ${eventCount} documents`);
    console.log(`   Chat Messages:${chatCount} documents`);
    console.log('━'.repeat(70));

    // Verify expected counts
    const expectedCounts = {
      users: 43,
      classes: 6,
      tests: 5,
      submissions: 11,
      results: 3,
      receipts: 4,
      events: 8,
      chatmessages: 12
    };

    let allCorrect = true;

    if (userCount !== expectedCounts.users) {
      console.log(`❌ Users count mismatch! Expected: ${expectedCounts.users}, Got: ${userCount}`);
      allCorrect = false;
    }
    if (classCount !== expectedCounts.classes) {
      console.log(`❌ Classes count mismatch! Expected: ${expectedCounts.classes}, Got: ${classCount}`);
      allCorrect = false;
    }
    if (testCount !== expectedCounts.tests) {
      console.log(`❌ Tests count mismatch! Expected: ${expectedCounts.tests}, Got: ${testCount}`);
      allCorrect = false;
    }
    if (submissionCount !== expectedCounts.submissions) {
      console.log(`❌ Submissions count mismatch! Expected: ${expectedCounts.submissions}, Got: ${submissionCount}`);
      allCorrect = false;
    }
    if (resultCount !== expectedCounts.results) {
      console.log(`❌ Results count mismatch! Expected: ${expectedCounts.results}, Got: ${resultCount}`);
      allCorrect = false;
    }
    if (receiptCount !== expectedCounts.receipts) {
      console.log(`❌ Receipts count mismatch! Expected: ${expectedCounts.receipts}, Got: ${receiptCount}`);
      allCorrect = false;
    }
    if (eventCount !== expectedCounts.events) {
      console.log(`❌ Events count mismatch! Expected: ${expectedCounts.events}, Got: ${eventCount}`);
      allCorrect = false;
    }
    if (chatCount !== expectedCounts.chatmessages) {
      console.log(`❌ Chat Messages count mismatch! Expected: ${expectedCounts.chatmessages}, Got: ${chatCount}`);
      allCorrect = false;
    }

    if (allCorrect) {
      console.log('\n✅ All collections have correct document counts!\n');
    } else {
      console.log('\n⚠️  Some collections have unexpected document counts.\n');
    }

    // Sample data verification
    console.log('🔍 Checking sample data...\n');

    // Check for admin user
    const admin = await User.findOne({ _id: 'A00001' });
    if (admin) {
      console.log(`✅ Admin found: ${admin.name} (${admin.email})`);
    } else {
      console.log('❌ Admin A00001 not found!');
      allCorrect = false;
    }

    // Check for teacher
    const teacher = await User.findOne({ _id: 'T00001' });
    if (teacher) {
      console.log(`✅ Teacher found: ${teacher.name} (${teacher.email})`);
    } else {
      console.log('❌ Teacher T00001 not found!');
      allCorrect = false;
    }

    // Check for student
    const student = await User.findOne({ _id: 'S00001' });
    if (student) {
      console.log(`✅ Student found: ${student.name} (${student.email})`);
    } else {
      console.log('❌ Student S00001 not found!');
      allCorrect = false;
    }

    // Check for class
    const classDoc = await Class.findOne({ _id: 'CS-2022-A' });
    if (classDoc) {
      console.log(`✅ Class found: ${classDoc.name} (${classDoc.studentIds.length} students)`);
    } else {
      console.log('❌ Class CS-2022-A not found!');
      allCorrect = false;
    }

    // Check for test
    const test = await Test.findOne({ _id: 'TEST001' });
    if (test) {
      console.log(`✅ Test found: ${test.title} (${test.questions.length} questions)`);
    } else {
      console.log('❌ Test TEST001 not found!');
      allCorrect = false;
    }

    console.log('\n' + '━'.repeat(70));

    if (allCorrect) {
      console.log('🎉 Database verification PASSED! All data is present and correct.');
      console.log('\n📋 Quick Login Credentials (password: password123):');
      console.log('   Admin:   A00001 / admin1@campusx.edu');
      console.log('   Teacher: T00001 / teacher1@campusx.edu');
      console.log('   Student: S00001 / student1@campusx.edu');
    } else {
      console.log('⚠️  Database verification FAILED! Some data is missing or incorrect.');
      console.log('   Try running: npm run seed:once');
    }

    console.log('━'.repeat(70) + '\n');

  } catch (error) {
    console.error('❌ Error verifying data:', error);
    throw error;
  }
};

// Main function
const verify = async () => {
  try {
    const connected = await connectDB();
    if (!connected) {
      console.log('\n⚠️  Cannot verify - database connection failed!');
      console.log('   Make sure MongoDB is running.');
      process.exit(1);
    }
    await verifyData();
    process.exit(0);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
};

// Run verification
verify();
