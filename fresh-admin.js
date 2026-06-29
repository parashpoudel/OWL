// Delete existing admin and create a fresh one
// Usage: node fresh-admin.js

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
    // Delete all existing admin users
    const deleteResult = await User.deleteMany({ isAdmin: true });
    console.log(`✓ Deleted ${deleteResult.deletedCount} existing admin user(s)`);

    // Create fresh admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@owl.community',
      password: 'admin123',
      isAdmin: true
    });

    await adminUser.save();
    console.log('\n✓ Fresh admin user created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Username: admin');
    console.log('Email: admin@owl.community');
    console.log('Password: admin123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ You can now login with these credentials!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});
