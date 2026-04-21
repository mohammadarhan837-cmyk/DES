const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/des').then(async () => {
  const result = await mongoose.connection.collection('users').updateMany(
    { isVerified: false },
    { $set: { isVerified: true } }
  );
  console.log('✅ Fixed unverified users:', result.modifiedCount);
  mongoose.disconnect();
}).catch(err => {
  console.error('DB error:', err.message);
  process.exit(1);
});
