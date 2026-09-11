const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { connectDB, closeDB } = require('../src/config/db');
const mongoose = require('mongoose');

async function restoreVenues() {
  await connectDB();
  const db = mongoose.connection.db;

  const c1Id = new mongoose.Types.ObjectId('6aa30287b032aec24aeaf36f');
  const c2Id = new mongoose.Types.ObjectId('6aa30287b032aec24aeaf372');

  const exists1 = await db.collection('cinemas').findOne({ _id: c1Id });
  if (!exists1) {
    await db.collection('cinemas').insertOne({
      _id: c1Id,
      name: 'INOX Megaplex: Inorbit Mall, Malad',
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Level 3, Inorbit Mall, Link Road, Malad West',
      contactPhone: '+91 22 6677 8899',
      contactEmail: 'malad.inox@bookmyshow.com',
      facilities: ['M-Ticket', 'F&B', 'Recliner', 'Parking', 'Wheelchair Access', 'Dolby Atmos'],
      status: 'active',
      screensCount: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Restored INOX Megaplex (6aa30287b032aec24aeaf36f)');
  }

  const exists2 = await db.collection('cinemas').findOne({ _id: c2Id });
  if (!exists2) {
    await db.collection('cinemas').insertOne({
      _id: c2Id,
      name: 'PVR Superplex: Logix City Centre, Sector 32',
      city: 'Delhi-NCR',
      state: 'Uttar Pradesh',
      address: 'Logix Mall, Sector 32, Noida',
      contactPhone: '+91 120 4567 890',
      contactEmail: 'logix.pvr@bookmyshow.com',
      facilities: ['M-Ticket', 'F&B', 'Recliner', 'Parking', 'Wheelchair Access'],
      status: 'active',
      screensCount: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('Restored PVR Superplex (6aa30287b032aec24aeaf372)');
  }

  const allCinemas = await db.collection('cinemas').find().toArray();
  console.log('Total cinemas now:', allCinemas.length);
  for (const c of allCinemas) {
    console.log('  -', c._id.toString(), c.name, `(${c.city})`);
  }
  await closeDB();
}

restoreVenues().catch(err => {
  console.error(err);
  process.exit(1);
});
