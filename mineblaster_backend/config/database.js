const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || process.env.MONGODB_URI_LOCAL,
      {
        // Additional connection options to handle SSL issues
        ssl: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      }
    );

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📁 Database: ${conn.connection.name}`);
    
    // Log available collections for debugging
    const collections = await conn.connection.db.listCollections().toArray();
    console.log(`📂 Collections available: ${collections.map(c => c.name).join(', ') || 'None yet'}`);
    
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    // Don't exit in development, allow server to run without DB for testing
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.log('🔄 Server will continue running without database connection');
    }
  }
};

// Collection configurations for better organization
const COLLECTIONS = {
  // Auth-related collections
  AUTH: {
    USERS: 'users',
  },
  // Data-related collections  
  DATA: {
    MINES: 'mines',
    BLAST_DATA: 'blastdata',
    PREDICTIONS: 'predictions',
  }
};

module.exports = { connectDB, COLLECTIONS };
