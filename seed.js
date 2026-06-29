// Run this script once to create the first admin user
// Usage: node seed.js

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(async () => {
  console.log('MongoDB connected');
  
  try {
    // Check if admin already exists
    const adminExists = await User.findOne({ username: 'admin' });
    
    if (adminExists) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@owl.community',
      password: 'admin123', // CHANGE THIS!
      isAdmin: true
    });

    await adminUser.save();
    console.log('✓ Admin user created successfully!');
    console.log('Username: admin');
    console.log('Email: admin@owl.community');
    console.log('Password: admin123');
    console.log('\n⚠️  IMPORTANT: Change the password immediately after first login!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
