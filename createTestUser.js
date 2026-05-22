const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const create = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Hash password manually
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  // Create org directly
  const orgResult = await mongoose.connection.db.collection('organizations').insertOne({
    name: 'Bright Future Chama',
    type: 'chama',
    email: 'admin@test.com',
    phone: '0712345678',
    currency: 'KES',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ Org created:', orgResult.insertedId);

  // Create user directly
  await mongoose.connection.db.collection('users').deleteOne({ email: 'admin@test.com' });
  
  const userResult = await mongoose.connection.db.collection('users').insertOne({
    organization: orgResult.insertedId,
    name: 'Daniel Admin',
    email: 'admin@test.com',
    password: hashedPassword,
    phone: '0712345678',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log('✅ User created:', userResult.insertedId);
  console.log('Email: admin@test.com');
  console.log('Password: password123');
  process.exit(0);
};

create().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});