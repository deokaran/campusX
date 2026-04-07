import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';

dotenv.config();

console.log('\n🔍 CampusX Database Seeding - Pre-flight Check\n');
console.log('━'.repeat(70));

let allChecks = true;

// Check 1: Environment file
console.log('\n1. Checking .env file...');
if (fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('   ✅ .env file found');
  
  // Check MongoDB URI
  if (process.env.MONGO_URI) {
    console.log(`   ✅ MONGO_URI configured: ${process.env.MONGO_URI}`);
  } else {
    console.log('   ❌ MONGO_URI not found in .env!');
    console.log('      Add: MONGO_URI=mongodb://127.0.0.1:27017/campusx');
    allChecks = false;
  }
  
  // Check PORT
  if (process.env.PORT) {
    console.log(`   ✅ PORT configured: ${process.env.PORT}`);
  } else {
    console.log('   ⚠️  PORT not configured (will use default)');
  }
} else {
  console.log('   ❌ .env file not found!');
  console.log('      Create .env file with: MONGO_URI=mongodb://127.0.0.1:27017/campusx');
  allChecks = false;
}

// Check 2: Seed data file
console.log('\n2. Checking seed-data.json...');
const seedDataPath = path.join(__dirname, 'seed-data.json');
if (fs.existsSync(seedDataPath)) {
  console.log('   ✅ seed-data.json found');
  
  try {
    const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf-8'));
    
    // Validate seed data structure
    const requiredCollections = ['users', 'classes', 'tests', 'submissions', 'results', 'receipts', 'events', 'chatmessages'];
    const missingCollections = requiredCollections.filter(col => !seedData[col]);
    
    if (missingCollections.length === 0) {
      console.log('   ✅ All required collections present in seed data');
      console.log(`      - Users: ${seedData.users.length}`);
      console.log(`      - Classes: ${seedData.classes.length}`);
      console.log(`      - Tests: ${seedData.tests.length}`);
      console.log(`      - Submissions: ${seedData.submissions.length}`);
      console.log(`      - Results: ${seedData.results.length}`);
      console.log(`      - Receipts: ${seedData.receipts.length}`);
      console.log(`      - Events: ${seedData.events.length}`);
      console.log(`      - Chat Messages: ${seedData.chatmessages.length}`);
    } else {
      console.log(`   ❌ Missing collections: ${missingCollections.join(', ')}`);
      allChecks = false;
    }
  } catch (error) {
    console.log('   ❌ Invalid JSON in seed-data.json!');
    console.log(`      Error: ${error.message}`);
    allChecks = false;
  }
} else {
  console.log('   ❌ seed-data.json not found!');
  console.log('      Make sure seed-data.json exists in the backend directory');
  allChecks = false;
}

// Check 3: Node modules
console.log('\n3. Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('   ✅ node_modules found');
  
  // Check for critical dependencies
  const criticalDeps = ['mongoose', 'dotenv', 'express'];
  const missingDeps = criticalDeps.filter(dep => !fs.existsSync(path.join(nodeModulesPath, dep)));
  
  if (missingDeps.length === 0) {
    console.log('   ✅ All critical dependencies installed');
  } else {
    console.log(`   ❌ Missing dependencies: ${missingDeps.join(', ')}`);
    console.log('      Run: npm install');
    allChecks = false;
  }
} else {
  console.log('   ❌ node_modules not found!');
  console.log('      Run: npm install');
  allChecks = false;
}

// Check 4: Model files
console.log('\n4. Checking model files...');
const modelsPath = path.join(__dirname, 'src', 'models');
if (fs.existsSync(modelsPath)) {
  const requiredModels = [
    'user.model.ts',
    'class.model.ts',
    'test.model.ts',
    'submission.model.ts',
    'result.model.ts',
    'receipt.model.ts',
    'event.model.ts',
    'chat.model.ts'
  ];
  
  const missingModels = requiredModels.filter(model => !fs.existsSync(path.join(modelsPath, model)));
  
  if (missingModels.length === 0) {
    console.log('   ✅ All model files present');
  } else {
    console.log(`   ❌ Missing model files: ${missingModels.join(', ')}`);
    allChecks = false;
  }
} else {
  console.log('   ❌ src/models directory not found!');
  allChecks = false;
}

// Check 5: MongoDB connection
console.log('\n5. Checking MongoDB connection...');
if (process.env.MONGO_URI) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI as string, {
        serverSelectionTimeoutMS: 5000
      });
      console.log('   ✅ MongoDB connection successful');
      await mongoose.connection.close();
      
      console.log('\n' + '━'.repeat(70));
      
      if (allChecks) {
        console.log('\n🎉 All pre-flight checks PASSED!\n');
        console.log('✅ You are ready to seed the database.');
        console.log('\nRun: npm run seed:once\n');
      } else {
        console.log('\n⚠️  Some pre-flight checks FAILED!\n');
        console.log('Please fix the issues above before seeding.\n');
      }
      
      process.exit(allChecks ? 0 : 1);
    } catch (error) {
      console.log('   ❌ MongoDB connection failed!');
      console.log(`      Error: ${error.message}`);
      console.log('\n   Troubleshooting:');
      console.log('   - Is MongoDB installed and running?');
      console.log('   - Check MongoDB service: sudo systemctl status mongod (Linux)');
      console.log('   - Check MongoDB service: brew services list (macOS)');
      console.log('   - Check MONGO_URI in .env file');
      
      console.log('\n' + '━'.repeat(70));
      console.log('\n⚠️  Pre-flight checks FAILED!\n');
      console.log('Please fix MongoDB connection before seeding.\n');
      
      process.exit(1);
    }
  })();
} else {
  console.log('   ⚠️  Skipped (MONGO_URI not configured)');
  
  console.log('\n' + '━'.repeat(70));
  console.log('\n⚠️  Pre-flight checks FAILED!\n');
  console.log('Please configure MONGO_URI in .env file.\n');
  
  process.exit(1);
}
