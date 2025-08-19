require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const adminUser = {
  firebaseUid: 'admin-dummy-123456789', // Dummy Firebase UID for admin
  email: 'admin@blastwatch.com',
  displayName: 'System Administrator',
  role: 'admin',
  photoURL: null,
  isActive: true,
  lastLogin: new Date(),
  emailVerified: true
};

const addAdminUser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@blastwatch.com' });
    
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists:', existingAdmin.email);
      console.log('   Role:', existingAdmin.role);
      console.log('   Status:', existingAdmin.isActive ? 'Active' : 'Inactive');
      process.exit(0);
    }

    // Create admin user
    const admin = new User(adminUser);
    await admin.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('   Email:', admin.email);
    console.log('   Role:', admin.role);
    console.log('   Display Name:', admin.displayName);
    console.log('   Firebase UID:', admin.firebaseUid);
    
    console.log('\n📝 Note: This is a dummy admin account for testing.');
    console.log('   In production, admin users should be created through proper Firebase authentication.');
    
    process.exit(0);

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    process.exit(1);
  }
};

addAdminUser();
