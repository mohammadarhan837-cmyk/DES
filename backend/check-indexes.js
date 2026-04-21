const mongoose = require('mongoose');
require('dotenv').config();

async function checkIndexes() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/escrow');
  const indexes = await mongoose.connection.db.collection('users').indexes();
  console.log('User Indexes:', JSON.stringify(indexes, null, 2));
  process.exit();
}

checkIndexes();
