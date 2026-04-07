import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcrypt';

// Import models
import User from './src/models/user.model';
import Department from './src/models/department.model';
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
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Clear all collections
const clearDatabase = async () => {
  try {
    await User.deleteMany({});
    await Department.deleteMany({});
    await Class.deleteMany({});
    await Test.deleteMany({});
    await Submission.deleteMany({});
    await Result.deleteMany({});
    await Receipt.deleteMany({});
    await Event.deleteMany({});
    await ChatMessage.deleteMany({});
    console.log('🗑️  All collections cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

// Import data
const importData = async () => {
  try {
    // Read seed data
    const seedDataPath = path.join(__dirname, 'seed-data.json');
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));

    // Get default password from .env
    const defaultPassword = process.env.DEFAULT_PASSWORD || 'password123';
    
    // Import users with properly hashed passwords
    console.log('📥 Importing users with hashed passwords...');
    console.log(`🔐 Default password: ${defaultPassword}`);
    
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    console.log(`🔐 Generated hash: ${hashedPassword.substring(0, 20)}...`);
    
    const usersWithHashedPasswords = seedData.users.map((user: any) => ({
      ...user,
      password: hashedPassword  // All users get the same default password
    }));
    
    await User.insertMany(usersWithHashedPasswords);
    
    // Count users by role
    const admins = usersWithHashedPasswords.filter((u: any) => u.role === 'A');
    const teachers = usersWithHashedPasswords.filter((u: any) => u.role === 'T');
    const students = usersWithHashedPasswords.filter((u: any) => u.role === 'S');
    
    console.log(`✅ Imported ${usersWithHashedPasswords.length} users:`);
    console.log(`   👔 ${admins.length} Admin(s): ${admins.map((a: any) => a._id).join(', ')}`);
    console.log(`   👨‍🏫 ${teachers.length} Teachers`);
    console.log(`   👨‍🎓 ${students.length} Students`);

    // Import departments
    if (seedData.departments && seedData.departments.length > 0) {
      console.log('📥 Importing departments...');
      await Department.insertMany(seedData.departments);
      console.log(`✅ Imported ${seedData.departments.length} departments`);
    }

    // Import classes
    if (seedData.classes && seedData.classes.length > 0) {
      console.log('📥 Importing classes...');
      await Class.insertMany(seedData.classes);
      console.log(`✅ Imported ${seedData.classes.length} classes`);
    }

    // Import tests
    if (seedData.tests && seedData.tests.length > 0) {
      console.log('📥 Importing tests...');
      await Test.insertMany(seedData.tests);
      console.log(`✅ Imported ${seedData.tests.length} tests`);
    }

    // Import submissions
    if (seedData.submissions && seedData.submissions.length > 0) {
      console.log('📥 Importing submissions...');
      await Submission.insertMany(seedData.submissions);
      console.log(`✅ Imported ${seedData.submissions.length} submissions`);
    }

    // Import results
    if (seedData.results && seedData.results.length > 0) {
      console.log('📥 Importing results...');
      await Result.insertMany(seedData.results);
      console.log(`✅ Imported ${seedData.results.length} results`);
    }

    // Import receipts
    if (seedData.receipts && seedData.receipts.length > 0) {
      console.log('📥 Importing receipts...');
      await Receipt.insertMany(seedData.receipts);
      console.log(`✅ Imported ${seedData.receipts.length} receipts`);
    }

    // Import events
    if (seedData.events && seedData.events.length > 0) {
      console.log('📥 Importing events...');
      await Event.insertMany(seedData.events);
      console.log(`✅ Imported ${seedData.events.length} events`);
    }

    // Import chat messages
    if (seedData.chatmessages && seedData.chatmessages.length > 0) {
      console.log('📥 Importing chat messages...');
      await ChatMessage.insertMany(seedData.chatmessages);
      console.log(`✅ Imported ${seedData.chatmessages.length} chat messages`);
    }

    console.log('\n✨ Database seeded successfully!');
    console.log('\n🔑 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 User ID: A00001`);
    console.log(`🔐 Password: ${defaultPassword}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 All users can change their password after logging in');
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
    throw error;
  }
};

// Main function
const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();
    await importData();
    console.log('\n🎉 All done! Database is ready to use.');
    console.log('💡 Backend must be restarted to apply changes.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
