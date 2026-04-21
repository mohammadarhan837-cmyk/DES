const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Project = require('./models/Project');

async function checkData() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/escrow');
  const users = await User.find({}, 'name role walletAddress isWalletLocked');
  const projects = await Project.find({}).populate('freelancer', 'name walletAddress');
  
  console.log('--- USERS IN DB ---');
  console.table(users.map(u => ({ name: u.name, role: u.role, wallet: u.walletAddress, locked: u.isWalletLocked })));
  
  console.log('--- PROJECTS IN DB ---');
  console.table(projects.map(p => ({ 
    title: p.title, 
    freelancer: p.freelancer?.name || 'NONE', 
    freelancerWallet: p.freelancer?.walletAddress || 'MISSING' 
  })));
  
  process.exit(0);
}
checkData();
