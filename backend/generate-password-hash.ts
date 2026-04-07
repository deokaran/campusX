import bcrypt from 'bcrypt';

// Generate proper bcrypt hash for password123
const generateHash = async () => {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password: password123');
  console.log('Bcrypt hash:', hash);
  console.log('\nCopy this hash and replace all password fields in seed-data.json');
};

generateHash();
