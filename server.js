const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));
app.use(express.static(path.join(__dirname)));

app.get("/test", (req, res) => {
  res.json({
    dirname: __dirname,
    cwd: process.cwd(),
    files: require("fs").readdirSync(__dirname)
  });
});
// MongoDB Connection
console.log("Connecting to MongoDB...");

mongoose.connect(process.env.MONGODB_URI)
.then(async () => {
  console.log("✅ MongoDB connected");
  console.log("Connection state:", mongoose.connection.readyState);

  await createDefaultAdmin();
})
.catch(err => {
  console.error("❌ MongoDB connection error:", err);
});

const User = require('./models/User');

// Import Routes
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);

// Create a default admin if none exists
const createDefaultAdmin = async () => {
  const adminExists = await User.exists({ isAdmin: true });
  if (!adminExists) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@owl.community';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    const adminUser = new User({
      username: adminUsername,
      email: adminEmail,
      password: adminPassword,
      isAdmin: true
    });

    await adminUser.save();
    console.log('Default admin created:');
    console.log(`  username: ${adminUsername}`);
    console.log(`  email: ${adminEmail}`);
    console.log(`  password: ${adminPassword}`);
    console.log('Please change the password after first login.');
  }
};

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/blogs', (req, res) => {
  res.sendFile(path.join(__dirname, 'blogs.html'));
});

app.get('/blog/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'blog.html'));
});

app.get('/plants', (req, res) => {
  res.sendFile(path.join(__dirname, 'plants.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Server error' });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
