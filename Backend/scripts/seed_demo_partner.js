const path = require('path');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_e) {}
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User');
const Cinema = require('../src/models/Cinema');
const Screen = require('../src/models/Screen');
const Show = require('../src/models/Show');
const Movie = require('../src/models/Movie');

async function seedDemoPartner() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB:', mongoose.connection.name);

  const demoEmail = 'partner@cinemaworld.com';
  let partner = await User.findOne({ email: demoEmail });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Partner@123', salt);

  if (!partner) {
    partner = await User.create({
      name: 'Vikramaditya Roy',
      email: demoEmail,
      password: hashedPassword,
      phone: '9820198201',
      role: 'cinema_partner',
      businessName: 'CineWorld Multiplexes Ltd.',
      businessAddress: '4th Floor, Grand Mall, MG Road, Bengaluru',
      gstin: '29AABCC1234D1Z8',
      partnerStatus: 'active'
    });
    console.log('Created demo partner:', partner.email);
  } else {
    partner.role = 'cinema_partner';
    partner.password = hashedPassword;
    partner.businessName = 'CineWorld Multiplexes Ltd.';
    partner.partnerStatus = 'active';
    await partner.save();
    console.log('Updated existing demo partner:', partner.email);
  }

  // Ensure demo partner has at least one Cinema
  let cinema = await Cinema.findOne({ partner: partner._id });
  if (!cinema) {
    cinema = await Cinema.create({
      partner: partner._id,
      name: 'CineWorld: Grand Mall IMAX',
      city: 'Bengaluru',
      state: 'Karnataka',
      address: 'Level 4, Grand Galleria, MG Road',
      contactPhone: '9820198201',
      contactEmail: demoEmail,
      facilities: ['M-Ticket', 'F&B', 'Recliner', 'IMAX Laser', 'Dolby Atmos', 'Valet Parking'],
      screensCount: 2
    });
    console.log('Created demo cinema:', cinema.name);
  }

  // Ensure demo partner has 2 screens
  let screen1 = await Screen.findOne({ cinema: cinema._id, screenNumber: 'AUDI-1' });
  if (!screen1) {
    screen1 = await Screen.create({
      cinema: cinema._id,
      partner: partner._id,
      screenNumber: 'AUDI-1',
      name: 'Screen 1 (IMAX Laser)',
      screenType: 'IMAX 2D',
      totalCapacity: 120,
      seatingLayout: [
        { row: 'A', tier: 'Recliner', basePrice: 480, seatsCount: 10, disabledSeats: [] },
        { row: 'B', tier: 'Recliner', basePrice: 480, seatsCount: 10, disabledSeats: [] },
        { row: 'C', tier: 'Premium', basePrice: 320, seatsCount: 12, disabledSeats: [] },
        { row: 'D', tier: 'Premium', basePrice: 320, seatsCount: 12, disabledSeats: [] },
        { row: 'E', tier: 'Premium', basePrice: 320, seatsCount: 12, disabledSeats: [] },
        { row: 'F', tier: 'Normal', basePrice: 220, seatsCount: 16, disabledSeats: [] },
        { row: 'G', tier: 'Normal', basePrice: 220, seatsCount: 16, disabledSeats: [] },
        { row: 'H', tier: 'Normal', basePrice: 220, seatsCount: 16, disabledSeats: [] },
        { row: 'I', tier: 'Normal', basePrice: 220, seatsCount: 16, disabledSeats: [] }
      ]
    });
    console.log('Created screen 1:', screen1.name);
  }

  let screen2 = await Screen.findOne({ cinema: cinema._id, screenNumber: 'AUDI-2' });
  if (!screen2) {
    screen2 = await Screen.create({
      cinema: cinema._id,
      partner: partner._id,
      screenNumber: 'AUDI-2',
      name: 'Screen 2 (Dolby Atmos)',
      screenType: 'Standard 2D',
      totalCapacity: 90,
      seatingLayout: [
        { row: 'A', tier: 'Premium', basePrice: 280, seatsCount: 10, disabledSeats: [] },
        { row: 'B', tier: 'Premium', basePrice: 280, seatsCount: 10, disabledSeats: [] },
        { row: 'C', tier: 'Normal', basePrice: 190, seatsCount: 14, disabledSeats: [] },
        { row: 'D', tier: 'Normal', basePrice: 190, seatsCount: 14, disabledSeats: [] },
        { row: 'E', tier: 'Normal', basePrice: 190, seatsCount: 14, disabledSeats: [] },
        { row: 'F', tier: 'Normal', basePrice: 190, seatsCount: 14, disabledSeats: [] },
        { row: 'G', tier: 'Normal', basePrice: 190, seatsCount: 14, disabledSeats: [] }
      ]
    });
    console.log('Created screen 2:', screen2.name);
  }

  // Ensure at least 1 show is scheduled for today
  const existingShow = await Show.findOne({ partner: partner._id, status: 'active' });
  if (!existingShow) {
    const movie = await Movie.findOne({ status: 'published' });
    if (movie) {
      const show = await Show.create({
        partner: partner._id,
        cinema: cinema._id,
        screen: screen1._id,
        movie: movie._id,
        movieTitle: movie.title,
        showDate: 'Today',
        startTime: '07:30 PM',
        endTime: '10:15 PM',
        format: 'IMAX 2D',
        ticketPrice: 320,
        pricingTiers: { normal: 220, premium: 320, recliner: 480 },
        bookedSeats: ['C-5', 'C-6', 'A-3'],
        status: 'active'
      });
      console.log('Created demo show for today:', show.movieTitle, show.startTime);
    }
  }

  await mongoose.disconnect();
  console.log('✅ Demo Partner Seeding Complete! Credentials: partner@cinemaworld.com / Partner@123');
}

seedDemoPartner().catch(console.error);
