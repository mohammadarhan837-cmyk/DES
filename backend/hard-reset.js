const mongoose = require('mongoose');
require('dotenv').config();

async function hardReset() {
  try {
    console.log('--- Database Hard Reset Initiated ---');
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/escrow');
    
    const collections = ['users', 'projects', 'negotiations', 'progresses', 'tokenblacklists'];
    
    for (const colName of collections) {
      try {
        await mongoose.connection.db.collection(colName).deleteMany({});
        console.log(`✅ Cleared collection: ${colName}`);
      } catch (e) {
        console.log(`ℹ️ Collection ${colName} not found or already empty.`);
      }
    }

    console.log('--- Hard Reset Complete! System is now fresh. ---');
    process.exit(0);
  } catch (error) {
    console.error('❌ Reset Failed:', error);
    process.exit(1);
  }
}

hardReset();
