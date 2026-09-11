require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MONGO_URI = process.env.MONGO_URI;

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);

    const adminEmail = 'admin@bookmyshow.com';
    let admin = await User.findOne({ email: adminEmail });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    if (admin) {
      admin.role = 'admin';
      admin.password = hashedPassword;
      admin.isDeactivated = false;
      await admin.save();
      console.log('✅ Updated existing account to Platform Administrator:', adminEmail);
    } else {
      admin = await User.create({
        name: 'Platform Administrator',
        email: adminEmail,
        password: hashedPassword,
        phone: '+91 9999900000',
        role: 'admin',
        businessName: 'BookMyTrip Platform HQ',
        isDeactivated: false
      });
      console.log('✅ Created new Platform Administrator account:', adminEmail);
    }

    await mongoose.disconnect();
    console.log('Done.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
}

seedAdmin();
