const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
require('dotenv').config();

const mongoose = require('mongoose');
const User = require('../models/User');
const Offer = require('../models/Offer');

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://varuncuraj77_db_user:KwsQK0ioCITipm3C@cluster0.64rakqf.mongodb.net/bookmytrip?appName=Cluster0';

async function seedAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB.');

    // 1. Seed Super Admin
    const adminEmail = 'admin@bookmytrip.com';
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`Found existing admin user (${adminEmail}). Updating credentials and privileges...`);
      admin.role = 'admin';
      admin.adminRole = 'super_admin';
      admin.password = hashedPassword;
      admin.name = 'Platform Super Admin';
      admin.phone = '+91 98765 43210';
      admin.isDeactivated = false;
      await admin.save();
      console.log('✅ Admin user updated successfully.');
    } else {
      console.log(`Creating new super admin user: ${adminEmail}...`);
      admin = await User.create({
        name: 'Platform Super Admin',
        email: adminEmail,
        password: hashedPassword,
        phone: '+91 98765 43210',
        role: 'admin',
        adminRole: 'super_admin'
      });
      console.log('✅ Super Admin created successfully.');
    }

    // 2. Seed Default Bank & Promotional Offers
    const existingOffersCount = await Offer.countDocuments();
    if (existingOffersCount === 0) {
      console.log('Seeding initial Bank Alliances & Promotional Offers...');
      await Offer.insertMany([
        {
          code: 'ICICIB1G1',
          title: 'ICICI Bank Buy 1 Get 1 Free',
          description: 'Get 1 complimentary movie ticket on purchase of 1 ticket using ICICI Bank Coral, Rubyx, or Sapphiro Credit Cards.',
          discountType: 'b1g1',
          discountValue: 100,
          maxDiscountAmount: 350,
          minBookingAmount: 250,
          bankName: 'ICICI Bank',
          cardType: 'Credit',
          category: 'bank',
          applicableCinemas: [],
          usageLimitPerUser: 2,
          isActive: true,
          badgeText: 'B1G1'
        },
        {
          code: 'SBICARD250',
          title: 'SBI Card Elite - ₹250 Instant Off',
          description: 'Flat ₹250 discount on minimum booking of 2 movie tickets with SBI Card Elite / Aurum.',
          discountType: 'flat',
          discountValue: 250,
          maxDiscountAmount: 250,
          minBookingAmount: 500,
          bankName: 'State Bank of India',
          cardType: 'Credit',
          category: 'bank',
          applicableCinemas: [],
          usageLimitPerUser: 1,
          isActive: true,
          badgeText: '₹250 OFF'
        },
        {
          code: 'AMEX20',
          title: 'American Express Weekend Delight',
          description: '20% discount up to ₹200 on all Saturday and Sunday bookings with Amex Cards.',
          discountType: 'percentage',
          discountValue: 20,
          maxDiscountAmount: 200,
          minBookingAmount: 400,
          bankName: 'American Express',
          cardType: 'Credit',
          category: 'bank',
          applicableCinemas: [],
          usageLimitPerUser: 4,
          isActive: true,
          badgeText: '20% OFF'
        },
        {
          code: 'WELCOME50',
          title: 'New Member Welcome Treat',
          description: 'Flat ₹50 off on your first ticket booking across any theatre partner.',
          discountType: 'flat',
          discountValue: 50,
          maxDiscountAmount: 50,
          minBookingAmount: 200,
          bankName: 'All Banks / UPI',
          cardType: 'All',
          category: 'promotional',
          applicableCinemas: [],
          usageLimitPerUser: 1,
          isActive: true,
          badgeText: 'NEW USER'
        }
      ]);
      console.log('✅ Seeded 4 Bank & Promotional Offers.');
    } else {
      console.log(`Offers already exist in DB (${existingOffersCount} found).`);
    }

    console.log('\n=============================================');
    console.log('  SUPER ADMIN CREDENTIALS');
    console.log('  Email:    admin@bookmytrip.com');
    console.log('  Password: Admin@123');
    console.log('  Role:     admin (super_admin)');
    console.log('=============================================\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding admin:', err);
    process.exit(1);
  }
}

seedAdmin();
