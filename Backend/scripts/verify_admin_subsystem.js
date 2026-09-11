const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();

const mongoose = require('mongoose');
const { connectDB } = require('../src/config/db');
const User = require('../src/models/User');
const adminController = require('../src/controllers/adminController');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../src/middleware/authMiddleware');

async function runVerification() {
  console.log('🚀 Starting Platform Super Admin Subsystem Verification...\n');

  try {
    await connectDB();
    console.log('✅ Connected to MongoDB Atlas.');

    // 1. Verify Admin User Exists
    const admin = await User.findOne({ email: 'admin@bookmytrip.com' });
    if (!admin) {
      throw new Error('Admin user admin@bookmytrip.com not found in database');
    }
    console.log(`✅ Admin Account Verified: ${admin.email} (Role: ${admin.role}, AdminRole: ${admin.adminRole})`);

    const isMatch = await admin.comparePassword('Admin@123');
    if (!isMatch) {
      throw new Error('Password verification failed for Admin@123');
    }
    console.log('✅ Master Password "Admin@123" validated successfully.');

    // 2. Generate and Verify Admin JWT Token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, adminRole: admin.adminRole },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded.role !== 'admin') {
      throw new Error('JWT token did not carry role="admin"');
    }
    console.log('✅ Admin Session JWT Signed & Verified with Super Admin privileges.');

    // 3. Test mock request to adminController.getOverview
    const mockRes = () => {
      let responseData = null;
      let statusCode = 200;
      return {
        status: (code) => {
          statusCode = code;
          return {
            json: (data) => {
              responseData = data;
              return responseData;
            }
          };
        },
        json: (data) => {
          responseData = data;
          return responseData;
        },
        getData: () => responseData,
        getStatus: () => statusCode
      };
    };

    const overviewRes = mockRes();
    await adminController.getOverview({ query: { range: 'all' } }, overviewRes);
    const overviewData = overviewRes.getData();
    if (!overviewData || !overviewData.success) {
      throw new Error('getOverview failed: ' + JSON.stringify(overviewData));
    }
    console.log('✅ Admin Overview Controller Executed:');
    console.log(`   - Nationwide GMV: ₹${overviewData.data.stats.totalRevenue}`);
    console.log(`   - BMS 10% Platform Cut: ₹${overviewData.data.stats.platformFeeRevenue}`);
    console.log(`   - Total Bookings: ${overviewData.data.stats.totalBookings}`);
    console.log(`   - Partner Theatres: ${overviewData.data.stats.totalVendors}`);

    // 4. Test mock request to adminController.getSettlements
    const settlementsRes = mockRes();
    await adminController.getSettlements({}, settlementsRes);
    const settlementsData = settlementsRes.getData();
    if (!settlementsData || !settlementsData.success) {
      throw new Error('getSettlements failed: ' + JSON.stringify(settlementsData));
    }
    console.log(`✅ Nodal Financial Settlements Reconciled: ${settlementsData.data.length} Partner Ledgers.`);

    // 5. Test mock request to adminController.getOffers
    const offersRes = mockRes();
    await adminController.getOffers({}, offersRes);
    const offersData = offersRes.getData();
    if (!offersData || !offersData.success) {
      throw new Error('getOffers failed: ' + JSON.stringify(offersData));
    }
    console.log(`✅ Commercial Bank Alliances Verified: ${offersData.data.length} Active Campaigns.`);

    console.log('\n🎉 ALL ADMIN PLATFORM SUBSYSTEM CHECKS PASSED!\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Verification Error:', err.message);
    process.exit(1);
  }
}

runVerification();
