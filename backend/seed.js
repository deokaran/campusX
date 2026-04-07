import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Import models
import User from './src/models/user.model.js';
import Class from './src/models/class.model.js';
import Test from './src/models/test.model.js';
import Submission from './src/models/submission.model.js';
import Result from './src/models/result.model.js';
import Receipt from './src/models/receipt.model.js';
import Event from './src/models/event.model.js';
import ChatMessage from './src/models/chat.model.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/campusx');
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

    // Import users
    console.log('📥 Importing users...');
    await User.insertMany(seedData.users);
    console.log(`✅ Imported ${seedData.users.length} users`);

    // Import classes
    console.log('📥 Importing classes...');
    await Class.insertMany(seedData.classes);
    console.log(`✅ Imported ${seedData.classes.length} classes`);

    // Import tests
    console.log('📥 Importing tests...');
    await Test.insertMany(seedData.tests);
    console.log(`✅ Imported ${seedData.tests.length} tests`);

    // Import submissions
    console.log('📥 Importing submissions...');
    await Submission.insertMany(seedData.submissions);
    console.log(`✅ Imported ${seedData.submissions.length} submissions`);

    // Import results
    console.log('📥 Importing results...');
    await Result.insertMany(seedData.results);
    console.log(`✅ Imported ${seedData.results.length} results`);

    // Import receipts
    console.log('📥 Importing receipts...');
    await Receipt.insertMany(seedData.receipts);
    console.log(`✅ Imported ${seedData.receipts.length} receipts`);

    // Import events
    console.log('📥 Importing events...');
    await Event.insertMany(seedData.events);
    console.log(`✅ Imported ${seedData.events.length} events`);

    // Import chat messages
    console.log('📥 Importing chat messages...');
    await ChatMessage.insertMany(seedData.chatmessages);
    console.log(`✅ Imported ${seedData.chatmessages.length} chat messages`);

    console.log('\n✨ Database seeded successfully!');
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
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

// Run seeder
seedDatabase();
