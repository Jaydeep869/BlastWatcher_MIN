require('dotenv').config();
const mongoose = require('mongoose');
const Mine = require('../models/Mine');

const sampleMines = [
  {
    name: "Jayant OCP",
    location: "Singrauli, Madhya Pradesh",
    operatingCompany: "Northern Coalfields Limited (NCL)",
    capacity: 15000,
    status: "active",
    mineType: "opencast",
    coordinates: {
      latitude: 24.1947,
      longitude: 82.6746
    },
    description: "Large opencast coal mine operated by NCL in Singrauli region",
    safetyRating: 95,
    establishedYear: 1989,
    contactDetails: {
      phone: "+91-7652-254321",
      email: "jayant.ocp@ncl.gov.in",
      address: "Jayant Area, Singrauli, Madhya Pradesh"
    }
  },
  {
    name: "Khadia OCP",
    location: "Singrauli, Madhya Pradesh", 
    operatingCompany: "Northern Coalfields Limited (NCL)",
    capacity: 12000,
    status: "active",
    mineType: "opencast",
    coordinates: {
      latitude: 24.2156,
      longitude: 82.7245
    },
    description: "Major opencast coal mine in Singrauli coalfield",
    safetyRating: 92,
    establishedYear: 1995,
    contactDetails: {
      phone: "+91-7652-255421",
      email: "khadia.ocp@ncl.gov.in",
      address: "Khadia Area, Singrauli, Madhya Pradesh"
    }
  },
  {
    name: "Bina OCP",
    location: "Sagar, Madhya Pradesh",
    operatingCompany: "Northern Coalfields Limited (NCL)",
    capacity: 8000,
    status: "active", 
    mineType: "opencast",
    coordinates: {
      latitude: 23.7025,
      longitude: 78.5569
    },
    description: "Opencast coal mine in Bina area of Madhya Pradesh",
    safetyRating: 90,
    establishedYear: 2001,
    contactDetails: {
      phone: "+91-7582-245321",
      email: "bina.ocp@ncl.gov.in",
      address: "Bina Mining Area, Sagar, Madhya Pradesh"
    }
  }
];

const addSampleMines = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing mines
    await Mine.deleteMany({});
    console.log('🗑️ Cleared existing mines');

    // Insert sample mines
    const insertedMines = await Mine.insertMany(sampleMines);
    console.log(`✅ Added ${insertedMines.length} sample mines:`);
    
    insertedMines.forEach(mine => {
      console.log(`   - ${mine.name} (${mine.location})`);
    });

    console.log('\n🎉 Sample mines added successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error adding sample mines:', error);
    process.exit(1);
  }
};

addSampleMines();
