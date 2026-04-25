require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await User.deleteMany({});
    console.log('✅ Cleared users');

    const admin = await User.create({
      firstName: 'Admin',
      lastName: 'CanBebe',
      email: 'admin@canbebe.com',
      password: 'Admin123!',
      role: 'admin',
      language: 'fr',
    });

    console.log('\n✅ Admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 Login credentials:');
    console.log('   Email   : admin@canbebe.com');
    console.log('   Password: Admin123!');
    console.log('   Role    : admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Open: http://localhost:5000');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

seed();
