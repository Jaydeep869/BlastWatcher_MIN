const mongoose = require('mongoose');
require('dotenv').config({ path: '../.env' });

const User = require('../models/User');
const { initializeFirebase, admin } = require('../config/firebase');

async function createEmailAdminUser() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Connected to MongoDB');

    // Initialize Firebase Admin
    initializeFirebase();

    // Create user in Firebase Authentication
    console.log('🔥 Creating user in Firebase Auth...');
    
    const firebaseUser = await admin.auth().createUser({
      email: 'admin@blastwatch.com',
      password: 'admin123',
      displayName: 'System Administrator',
      emailVerified: true
    });

    console.log('✅ Firebase user created:', firebaseUser.uid);

    // Check if user already exists in our database
    const existingUser = await User.findOne({ email: 'admin@blastwatch.com' });
    
    if (existingUser) {
      // Update existing user with Firebase UID
      existingUser.firebaseUid = firebaseUser.uid;
      existingUser.emailVerified = true;
      await existingUser.save();
      console.log('🔄 Updated existing admin user with Firebase UID');
    } else {
      // Create new admin user
      const adminUser = new User({
        firebaseUid: firebaseUser.uid,
        email: 'admin@blastwatch.com',
        username: 'admin',
        displayName: 'System Administrator',
        role: 'admin',
        emailVerified: true,
        isActive: true,
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          department: 'IT',
          position: 'System Administrator'
        }
      });

      await adminUser.save();
      console.log('✅ Created new admin user in database');
    }

    console.log('✅ Email admin user setup complete!');
    console.log('📧 Email: admin@blastwatch.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error creating email admin user:', error);
    if (error.code === 'auth/email-already-exists') {
      console.log('💡 Firebase user already exists, that\'s okay!');
      
      // Still try to update database
      try {
        const firebaseUser = await admin.auth().getUserByEmail('admin@blastwatch.com');
        const existingUser = await User.findOne({ email: 'admin@blastwatch.com' });
        
        if (existingUser) {
          existingUser.firebaseUid = firebaseUser.uid;
          await existingUser.save();
          console.log('🔄 Updated database user with existing Firebase UID');
        }
        
        console.log('✅ Admin user is ready to use!');
        console.log('📧 Email: admin@blastwatch.com');
        console.log('🔑 Password: admin123');
      } catch (dbError) {
        console.error('Database update error:', dbError);
      }
    }
  } finally {
    await mongoose.disconnect();
  }
}

createEmailAdminUser();
