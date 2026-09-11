require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Movie = require('../models/Movie');
const CategoryItem = require('../models/CategoryItem');
const Cinema = require('../models/Cinema');
const Screen = require('../models/Screen');
const Show = require('../models/Show');
const Booking = require('../models/Booking');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('\n❌ Fatal Error: MONGO_URI is not defined in your environment variables.');
  process.exit(1);
}

// ----------------------------------------------------
// 1. CAROUSEL BANNERS (Customer Panel Header)
// ----------------------------------------------------
const defaultBanners = [
  {
    customId: 'b1',
    categoryType: 'banner',
    title: 'Dune: Part Two',
    subtitle: 'Experience the epic saga in IMAX 3D',
    category: 'Movies',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
    tag: 'Trending Worldwide',
    movieId: 'm1'
  },
  {
    customId: 'b2',
    categoryType: 'banner',
    title: 'Kalki 2898 AD',
    subtitle: 'The greatest mythological sci-fi adventure of the year',
    category: 'Movies',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    tag: 'Blockbuster Hit',
    movieId: 'm2'
  },
  {
    customId: 'b3',
    categoryType: 'banner',
    title: 'Coldplay: Music of the Spheres World Tour',
    subtitle: 'Live Stadium Concert Experience',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1600&auto=format&fit=crop',
    tag: 'Selling Fast',
    link: '/events'
  },
  {
    customId: 'b4',
    categoryType: 'banner',
    title: 'Arijit Singh - Live in Symphony',
    subtitle: 'An enchanting musical evening across major Indian cities',
    category: 'Events',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1600&auto=format&fit=crop',
    tag: 'Exclusive',
    link: '/events'
  }
];

// ----------------------------------------------------
// 2. THEATRICAL RELEASES (Catalog)
// ----------------------------------------------------
const defaultMovies = [
  {
    customId: 'm1',
    title: 'Dune: Part Two',
    genre: ['Action', 'Adventure', 'Sci-Fi'],
    rating: 8.8,
    voteCount: '154.2K',
    language: 'English, Hindi, Telugu',
    certificate: 'UA16+',
    duration: '2h 46m',
    releaseDate: '1 Mar, 2024',
    formats: ['2D', 'IMAX 3D', '4DX'],
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1600&auto=format&fit=crop',
    synopsis: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.',
    isPromoted: true,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chandigarh', 'Chennai', 'Pune'],
    cast: [
      { name: 'Timothée Chalamet', role: 'Paul Atreides', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
      { name: 'Zendaya', role: 'Chani', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' },
      { name: 'Rebecca Ferguson', role: 'Lady Jessica', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
      { name: 'Javier Bardem', role: 'Stilgar', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    customId: 'm2',
    title: 'Kalki 2898 AD',
    genre: ['Action', 'Sci-Fi', 'Mythology'],
    rating: 8.6,
    voteCount: '210.8K',
    language: 'Telugu, Hindi, Tamil, Malayalam',
    certificate: 'UA',
    duration: '3h 01m',
    releaseDate: '27 Jun, 2024',
    formats: ['2D', '3D', 'IMAX 3D'],
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    synopsis: 'A modern-day avatar of Vishnu, a Hindu god, who is believed to have descended to the earth to protect the world from evil forces in a dystopian setting set in the post-apocalyptic year 2898 AD.',
    isPromoted: true,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai'],
    cast: [
      { name: 'Prabhas', role: 'Bhairava', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' },
      { name: 'Deepika Padukone', role: 'SUM-80', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop' },
      { name: 'Kamal Haasan', role: 'Supreme Yaskin', photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    customId: 'm3',
    title: 'Stree 2: Sarkate Ka Aatank',
    genre: ['Comedy', 'Horror'],
    rating: 8.9,
    voteCount: '345.5K',
    language: 'Hindi',
    certificate: 'UA16+',
    duration: '2h 29m',
    releaseDate: '15 Aug, 2024',
    formats: ['2D'],
    posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=1600&auto=format&fit=crop',
    synopsis: 'After the events of Stree, the town of Chanderi faces a new menace in the form of a headless entity named Sarkata, who abducts modern independent women. Vicky and his loyal friends team up once again with the mysterious female spirit to save their town.',
    isPromoted: true,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Chandigarh', 'Pune', 'Kolkata'],
    cast: [
      { name: 'Rajkummar Rao', role: 'Vicky', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
      { name: 'Shraddha Kapoor', role: 'The Mystery Woman', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' },
      { name: 'Pankaj Tripathi', role: 'Rudra Bhaiya', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' },
      { name: 'Abhishek Banerjee', role: 'Jana', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    customId: 'm4',
    title: 'Deadpool & Wolverine',
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    rating: 8.7,
    voteCount: '289.1K',
    language: 'English, Hindi, Telugu',
    certificate: 'A',
    duration: '2h 08m',
    releaseDate: '26 Jul, 2024',
    formats: ['2D', '3D', 'IMAX 3D', '4DX'],
    posterUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=1600&auto=format&fit=crop',
    synopsis: 'A listless Wade Wilson toils away in civilian life with his days as the morally flexible mercenary, Deadpool, behind him. But when his homeworld faces an existential threat, Wade must reluctantly suit up again with an even more reluctant Wolverine.',
    isPromoted: false,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Kolkata'],
    cast: [
      { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
      { name: 'Hugh Jackman', role: 'Logan / Wolverine', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop' },
      { name: 'Emma Corrin', role: 'Cassandra Nova', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    customId: 'm5',
    title: 'Fighter',
    genre: ['Action', 'Thriller'],
    rating: 8.2,
    voteCount: '178.4K',
    language: 'Hindi',
    certificate: 'UA',
    duration: '2h 46m',
    releaseDate: '25 Jan, 2024',
    formats: ['2D', '3D', 'IMAX 3D'],
    posterUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f9?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4ea16e6f9?q=80&w=1600&auto=format&fit=crop',
    synopsis: 'An elite Air Force unit, the Air Dragons, comes together in the face of imminent danger. Top aviators battle internal turbulence while defending the skies from hostile air incursions.',
    isPromoted: false,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Chandigarh'],
    cast: [
      { name: 'Hrithik Roshan', role: 'Squadron Leader Shamsher Pathania', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
      { name: 'Deepika Padukone', role: 'Squadron Leader Minal Rathore', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop' },
      { name: 'Anil Kapoor', role: 'Group Captain Rakesh Jai Singh', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    customId: 'm6',
    title: 'Oppenheimer',
    genre: ['Biography', 'Drama', 'History'],
    rating: 9.1,
    voteCount: '412.3K',
    language: 'English, Hindi',
    certificate: 'UA16+',
    duration: '3h 00m',
    releaseDate: '21 Jul, 2023',
    formats: ['2D', 'IMAX 2D'],
    posterUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=1600&auto=format&fit=crop',
    synopsis: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during the Manhattan Project.',
    isPromoted: false,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru'],
    cast: [
      { name: 'Cillian Murphy', role: 'J. Robert Oppenheimer', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
      { name: 'Emily Blunt', role: 'Katherine Oppenheimer', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
      { name: 'Matt Damon', role: 'Leslie Groves', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop' },
      { name: 'Robert Downey Jr.', role: 'Lewis Strauss', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    customId: 'm7',
    title: 'Pushpa 2: The Rule',
    genre: ['Action', 'Crime', 'Drama'],
    rating: 9.0,
    voteCount: '512.4K',
    language: 'Telugu, Hindi, Tamil, Malayalam',
    certificate: 'UA16+',
    duration: '3h 15m',
    releaseDate: '6 Dec, 2024',
    formats: ['2D', '3D', 'IMAX 2D'],
    posterUrl: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1533613220915-609f661a6fe1?q=80&w=1600&auto=format&fit=crop',
    synopsis: 'Pushpa Raj expands his red sandalwood empire beyond Indian borders, sparking an explosive clash with SP Bhanwar Singh Shekhawat and rival syndicates.',
    isPromoted: true,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai'],
    cast: [
      { name: 'Allu Arjun', role: 'Pushpa Raj', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
      { name: 'Rashmika Mandanna', role: 'Srivalli', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' },
      { name: 'Fahadh Faasil', role: 'SP Bhanwar Singh Shekhawat', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop' }
    ]
  },
  {
    customId: 'm8',
    title: 'Interstellar (10th Anniversary Re-Release)',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    rating: 9.3,
    voteCount: '620.1K',
    language: 'English',
    certificate: 'UA',
    duration: '2h 49m',
    releaseDate: '7 Nov, 2024',
    formats: ['IMAX 2D', '2D'],
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    isPromoted: false,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru'],
    cast: [
      { name: 'Matthew McConaughey', role: 'Cooper', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
      { name: 'Anne Hathaway', role: 'Brand', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' },
      { name: 'Jessica Chastain', role: 'Murph', photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=200&auto=format&fit=crop' }
    ]
  }
];

// ----------------------------------------------------
// 3. ENTERTAINMENT CATEGORY ITEMS (Events, Sports, Plays, etc.)
// ----------------------------------------------------
const defaultCategoryItems = [
  // Events
  {
    categoryType: 'event',
    customId: 'e1',
    title: 'Coldplay: Music of the Spheres World Tour 2026',
    subtitle: 'Live Stadium Tour Mumbai',
    category: 'Music Shows',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=800&auto=format&fit=crop',
    date: 'Jan 18, 2026',
    venue: 'DY Patil Stadium: Navi Mumbai',
    price: '₹2,500 onwards',
    city: 'Mumbai',
    description: 'Witness the record-breaking global phenomenon live with spectacular LED wristbands, lasers, and timeless anthems.',
    tag: 'Trending'
  },
  {
    categoryType: 'event',
    customId: 'e2',
    title: 'Arijit Singh - Symphony in the Capital',
    subtitle: 'Grand Orchestral Concert',
    category: 'Music Shows',
    imageUrl: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=800&auto=format&fit=crop',
    date: 'Feb 14, 2026',
    venue: 'Jawaharlal Nehru Stadium: Delhi',
    price: '₹1,999 onwards',
    city: 'Delhi-NCR',
    description: 'An unforgettable evening of soulful Bollywood melodies performed with a 50-piece international symphony orchestra.',
    tag: 'Bestseller'
  },
  {
    categoryType: 'event',
    customId: 'e3',
    title: 'Zakir Khan - Tathastu Live Tour',
    subtitle: 'Standup Comedy Special',
    category: 'Comedy Shows',
    imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=800&auto=format&fit=crop',
    date: 'Dec 22, 2024',
    venue: 'NCPA: Nariman Point, Mumbai',
    price: '₹999 onwards',
    city: 'Mumbai',
    description: 'The Sakht Launda returns with an all-new rib-tickling, emotional narrative special.',
    tag: 'Filling Fast'
  },
  // Plays
  {
    categoryType: 'play',
    customId: 'p1',
    title: 'Mughal-E-Azam: The Grand Musical',
    subtitle: 'Broadway-style Indian Theatrical Production',
    category: 'Theatre & Musical',
    imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=800&auto=format&fit=crop',
    date: 'Dec 28, 2024',
    venue: 'Kamani Auditorium: Delhi',
    price: '₹1,500 onwards',
    city: 'Delhi-NCR',
    description: 'Directed by Feroz Abbas Khan with Manish Malhotra costumes, featuring live Kathak dance sequences and soul-stirring qawwalis.',
    tag: 'Award Winner'
  },
  {
    categoryType: 'play',
    customId: 'p2',
    title: 'The Alchemist: Live on Stage',
    subtitle: 'Paulo Coelho Classic Drama Adaptation',
    category: 'Drama',
    imageUrl: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?q=80&w=800&auto=format&fit=crop',
    date: 'Jan 05, 2026',
    venue: 'Prithvi Theatre: Juhu, Mumbai',
    price: '₹600 onwards',
    city: 'Mumbai',
    description: 'A visual theatrical journey exploring destiny, the universe, and following one\'s personal legend.',
    tag: 'Classic'
  },
  // Sports
  {
    categoryType: 'sport',
    customId: 's1',
    title: 'IPL 2026: Mumbai Indians vs Chennai Super Kings',
    subtitle: 'El Clásico of Indian Cricket',
    category: 'Cricket',
    imageUrl: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=800&auto=format&fit=crop',
    date: 'Apr 12, 2026',
    venue: 'Wankhede Stadium: Churchgate, Mumbai',
    price: '₹1,800 onwards',
    city: 'Mumbai',
    description: 'The fiercest rivalry in franchise cricket history under the floodlights at the iconic Wankhede.',
    tag: 'High Demand'
  },
  {
    categoryType: 'sport',
    customId: 's2',
    title: 'ISL Football: Mohun Bagan vs East Bengal',
    subtitle: 'Kolkata Derby Extravaganza',
    category: 'Football',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=800&auto=format&fit=crop',
    date: 'Feb 02, 2026',
    venue: 'Salt Lake Stadium: Kolkata',
    price: '₹350 onwards',
    city: 'Kolkata',
    description: 'Over a century of footballing heritage and passion in Asia\'s biggest stadium.',
    tag: 'Derby'
  },
  // Activities
  {
    categoryType: 'activity',
    customId: 'a1',
    title: 'Imagicaa Theme & Water Park',
    subtitle: 'Full-Day All-Access Adventure Pass',
    category: 'Theme Parks',
    imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=800&auto=format&fit=crop',
    date: 'Open Daily (10:00 AM - 07:00 PM)',
    venue: 'Khopoli, Mumbai-Pune Expressway',
    price: '₹1,299 per person',
    city: 'Mumbai',
    description: 'High-speed roller coasters, wave pools, themed restaurants, and family entertainment.',
    tag: 'Weekend Fun'
  },
  {
    categoryType: 'activity',
    customId: 'a2',
    title: 'Smaaash VR & Bowling Arcade',
    subtitle: 'Twilight Gaming Package',
    category: 'Arcade & Bowling',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=800&auto=format&fit=crop',
    date: 'Daily (11:00 AM - 11:00 PM)',
    venue: 'DLF CyberHub: Gurugram, Delhi-NCR',
    price: '₹799 onwards',
    city: 'Delhi-NCR',
    description: 'State-of-the-art virtual reality simulators, twilight bowling alleys, and sports bar lounge.',
    tag: 'Popular'
  }
];

// ----------------------------------------------------
// MAIN SEED EXECUTION
// ----------------------------------------------------
async function runSeed() {
  console.log('\n🚀 [BookMyTrip Seeder] Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected successfully.\n');

  console.log('🧹 Clearing legacy collections to guarantee fresh synchronization...');
  await Promise.all([
    User.deleteMany({}),
    Cinema.deleteMany({}),
    Screen.deleteMany({}),
    Movie.deleteMany({}),
    Show.deleteMany({}),
    Booking.deleteMany({}),
    CategoryItem.deleteMany({})
  ]);
  console.log('✅ Collections cleaned.\n');

  // --------------------------------------------------
  // A. SEED USERS (Partner & Customers)
  // --------------------------------------------------
  console.log('👤 Seeding Users & Partner Accounts...');
  const salt = await bcrypt.genSalt(10);
  const partnerHashedPassword = await bcrypt.hash('password123', salt);
  const customerHashedPassword = await bcrypt.hash('password123', salt);

  // Platform Administrator
  const admin = await User.create({
    name: 'Platform Administrator',
    email: 'admin@bookmyshow.com',
    password: partnerHashedPassword, // 'password123'
    role: 'admin',
    phone: '+91 9999900000',
    businessName: 'BookMyTrip Platform HQ',
    partnerStatus: 'active'
  });

  // Primary B2B Cinema Partner
  const partner = await User.create({
    name: 'Varun Tyagi (Cinema Partner)',
    email: 'partner@bookmyshow.com',
    password: partnerHashedPassword,
    role: 'cinema_partner',
    phone: '+91 9876543210',
    businessName: 'INOX Cinecorp Multiplexes Ltd.',
    partnerPhone: '011-45678900',
    businessAddress: 'Tower B, Cyber City, DLF Phase 2, Gurugram, Delhi-NCR',
    partnerStatus: 'active'
  });

  // Primary Demo Customer
  const demoCustomer = await User.create({
    name: 'Demo Customer',
    email: 'demo@bookmyshow.com',
    password: customerHashedPassword,
    role: 'customer',
    phone: '+91 9811223344'
  });

  // Additional Simulated Indian Customers for realistic booking history
  const simulatedCustomers = await User.create([
    { name: 'Rahul Sharma', email: 'rahul.sharma@gmail.com', password: customerHashedPassword, role: 'customer', phone: '+91 9810123456' },
    { name: 'Priya Verma', email: 'priya.verma@gmail.com', password: customerHashedPassword, role: 'customer', phone: '+91 9820234567' },
    { name: 'Amit Patel', email: 'amit.patel@gmail.com', password: customerHashedPassword, role: 'customer', phone: '+91 9830345678' },
    { name: 'Sneha Reddy', email: 'sneha.reddy@gmail.com', password: customerHashedPassword, role: 'customer', phone: '+91 9840456789' },
    { name: 'Vikram Singh', email: 'vikram.singh@gmail.com', password: customerHashedPassword, role: 'customer', phone: '+91 9850567890' },
    { name: 'Ananya Gupta', email: 'ananya.gupta@gmail.com', password: customerHashedPassword, role: 'customer', phone: '+91 9860678901' },
    { name: 'Rohan Joshi', email: 'rohan.joshi@gmail.com', password: customerHashedPassword, role: 'customer', phone: '+91 9870789012' },
    { name: 'Pooja Malhotra', email: 'pooja.m@gmail.com', password: customerHashedPassword, role: 'customer', phone: '+91 9880890123' }
  ]);

  const allCustomers = [demoCustomer, ...simulatedCustomers];
  console.log(`✅ Seeded 1 Cinema Partner + ${allCustomers.length} Customers.\n`);

  // --------------------------------------------------
  // B. SEED CINEMAS (B2B Partner Multiplexes)
  // --------------------------------------------------
  console.log('🏛️ Seeding Cinema Venues...');
  const cinemas = await Cinema.create([
    {
      partner: partner._id,
      name: 'INOX Megaplex: Inorbit Mall, Malad',
      city: 'Mumbai',
      state: 'Maharashtra',
      address: 'Level 3, Inorbit Mall, Link Road, Malad West',
      contactPhone: '+91 22 6677 8899',
      contactEmail: 'malad.inox@bookmyshow.com',
      facilities: ['M-Ticket', 'F&B', 'Recliner', 'Parking', 'Wheelchair Access', 'Dolby Atmos'],
      status: 'active',
      screensCount: 3
    },
    {
      partner: partner._id,
      name: 'PVR ICON: Phoenix Palladium, Lower Parel',
      city: 'Mumbai',
      state: 'Maharashtra',
      address: '462, Senapati Bapat Marg, Lower Parel',
      contactPhone: '+91 22 4333 5555',
      contactEmail: 'palladium.pvr@bookmyshow.com',
      facilities: ['M-Ticket', 'F&B', 'Recliner', 'Parking', 'Dolby Atmos'],
      status: 'active',
      screensCount: 3
    },
    {
      partner: partner._id,
      name: 'Cinepolis: DLF Avenue, Saket',
      city: 'Delhi-NCR',
      state: 'Delhi',
      address: 'Plot A4, Press Enclave Marg, Saket District Centre',
      contactPhone: '+91 11 4055 6677',
      contactEmail: 'saket.cinepolis@bookmyshow.com',
      facilities: ['M-Ticket', 'F&B', 'Parking', 'Wheelchair Access', 'Dolby Atmos'],
      status: 'active',
      screensCount: 2
    },
    {
      partner: partner._id,
      name: 'PVR Superplex: Logix City Centre, Sector 32',
      city: 'Delhi-NCR',
      state: 'Uttar Pradesh',
      address: 'Logix Mall, Sector 32, Noida',
      contactPhone: '+91 120 4567 890',
      contactEmail: 'logix.pvr@bookmyshow.com',
      facilities: ['M-Ticket', 'F&B', 'Recliner', 'Parking', 'Wheelchair Access'],
      status: 'active',
      screensCount: 2
    }
  ]);
  console.log(`✅ Seeded ${cinemas.length} Multiplex Venues.\n`);

  // --------------------------------------------------
  // C. SEED AUDITORIUMS / SCREENS
  // --------------------------------------------------
  console.log('📺 Seeding Auditoriums & Seating Maps...');
  const screenData = [];

  for (const c of cinemas) {
    // Screen 1: Standard Dolby Atmos
    screenData.push({
      cinema: c._id,
      partner: partner._id,
      screenNumber: 'Screen 1',
      name: 'Audi 1 (Dolby Atmos 7.1)',
      screenType: 'Standard 2D',
      totalCapacity: 76,
      status: 'active',
      seatingLayout: [
        { row: 'A', tier: 'Recliner', basePrice: 400, seatsCount: 10 },
        { row: 'B', tier: 'Premium', basePrice: 250, seatsCount: 12 },
        { row: 'C', tier: 'Premium', basePrice: 250, seatsCount: 12 },
        { row: 'D', tier: 'Normal', basePrice: 180, seatsCount: 14 },
        { row: 'E', tier: 'Normal', basePrice: 180, seatsCount: 14 },
        { row: 'F', tier: 'Normal', basePrice: 180, seatsCount: 14 }
      ]
    });

    // Screen 2: IMAX 3D Laser
    screenData.push({
      cinema: c._id,
      partner: partner._id,
      screenNumber: 'Screen 2',
      name: 'Audi 2 (IMAX 3D Laser)',
      screenType: 'IMAX 3D',
      totalCapacity: 84,
      status: 'active',
      seatingLayout: [
        { row: 'A', tier: 'Recliner', basePrice: 550, seatsCount: 10 },
        { row: 'B', tier: 'Recliner', basePrice: 550, seatsCount: 10 },
        { row: 'C', tier: 'Premium', basePrice: 350, seatsCount: 12 },
        { row: 'D', tier: 'Premium', basePrice: 350, seatsCount: 12 },
        { row: 'E', tier: 'Premium', basePrice: 350, seatsCount: 12 },
        { row: 'F', tier: 'Normal', basePrice: 250, seatsCount: 14 },
        { row: 'G', tier: 'Normal', basePrice: 250, seatsCount: 14 }
      ]
    });

    // If 3 screens (Mumbai flagship venues)
    if (c.screensCount >= 3) {
      screenData.push({
        cinema: c._id,
        partner: partner._id,
        screenNumber: 'Screen 3',
        name: 'Audi 3 (4DX Motion Lounge)',
        screenType: '4DX',
        totalCapacity: 52,
        status: 'active',
        seatingLayout: [
          { row: 'A', tier: 'Recliner', basePrice: 600, seatsCount: 8 },
          { row: 'B', tier: 'Premium', basePrice: 450, seatsCount: 10 },
          { row: 'C', tier: 'Premium', basePrice: 450, seatsCount: 10 },
          { row: 'D', tier: 'Normal', basePrice: 350, seatsCount: 12 },
          { row: 'E', tier: 'Normal', basePrice: 350, seatsCount: 12 }
        ]
      });
    }
  }

  const screens = await Screen.create(screenData);
  console.log(`✅ Seeded ${screens.length} Auditoriums with tiered seat maps.\n`);

  // --------------------------------------------------
  // D. SEED CENTRAL MOVIES WITH THEATRE SHOWTIMES EMBEDDED
  // --------------------------------------------------
  console.log('🎬 Seeding Movies Catalog & Customer Showtimes...');
  // For each movie, embed partner theatres and showtimes for the Customer MovieDetailsPage
  const preparedMovies = defaultMovies.map((m) => {
    const movieTheatres = cinemas.map((c, cIdx) => ({
      id: `th-${cIdx + 1}`,
      name: c.name,
      distance: `${(cIdx + 1) * 2.1} km away`,
      facilities: c.facilities,
      showtimes: [
        { time: '10:15 AM', format: '2D', status: 'available', price: '₹180', bookedSeats: ['D4', 'D5'] },
        { time: '01:30 PM', format: 'IMAX 3D', status: 'filling_fast', price: '₹350', bookedSeats: ['A1', 'A2', 'C5', 'C6', 'C7'] },
        { time: '05:00 PM', format: '2D', status: 'available', price: '₹250', bookedSeats: ['B1', 'B2'] },
        { time: '08:45 PM', format: 'IMAX 3D', status: 'almost_full', price: '₹400', bookedSeats: ['A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2'] }
      ]
    }));

    return {
      ...m,
      theatres: movieTheatres
    };
  });

  const movies = await Movie.create(preparedMovies);
  console.log(`✅ Seeded ${movies.length} Theatrical Releases.\n`);

  // --------------------------------------------------
  // E. SEED B2B SCHEDULED SHOWS (Synchronized with Screens)
  // --------------------------------------------------
  console.log('📅 Scheduling Theatrical Shows in B2B Database...');
  const showsData = [];
  const dates = ['Today', 'Tomorrow', '13 Sep', '14 Sep', '15 Sep'];
  const timeslots = [
    { start: '10:15 AM', end: '12:45 PM', format: '2D', basePrice: 180 },
    { start: '01:30 PM', end: '04:15 PM', format: 'IMAX 3D', basePrice: 350 },
    { start: '05:00 PM', end: '07:45 PM', format: '2D', basePrice: 220 },
    { start: '08:45 PM', end: '11:30 PM', format: 'IMAX 3D', basePrice: 400 },
    { start: '11:45 PM', end: '02:15 AM', format: '2D', basePrice: 200 }
  ];

  // Distribute shows across screens & movies
  for (let i = 0; i < screens.length; i++) {
    const s = screens[i];
    const cinemaObj = cinemas.find((c) => c._id.toString() === s.cinema.toString());

    // Schedule 3 shows per screen across different dates
    for (let dIdx = 0; dIdx < 3; dIdx++) {
      const showDate = dates[dIdx];
      const slot = timeslots[(i + dIdx) % timeslots.length];
      const movieObj = movies[(i + dIdx) % movies.length];

      // Realistic booked seats array
      const bookedSeatsCount = dIdx === 0 ? 8 : dIdx === 1 ? 16 : 3;
      const bookedSeats = [];
      const rowLetters = ['A', 'B', 'C', 'D'];
      for (let b = 1; b <= bookedSeatsCount; b++) {
        const row = rowLetters[b % rowLetters.length];
        bookedSeats.push(`${row}${b}`);
      }

      showsData.push({
        partner: partner._id,
        cinema: cinemaObj._id,
        screen: s._id,
        movie: movieObj._id,
        movieTitle: movieObj.title,
        showDate: showDate,
        startTime: slot.start,
        endTime: slot.end,
        format: s.screenType.includes('IMAX') ? 'IMAX 3D' : slot.format,
        ticketPrice: slot.basePrice,
        pricingTiers: {
          normal: slot.basePrice,
          premium: slot.basePrice + 70,
          recliner: slot.basePrice + 200
        },
        bookedSeats: bookedSeats,
        status: 'active'
      });
    }
  }

  const shows = await Show.create(showsData);
  console.log(`✅ Seeded ${shows.length} Scheduled Shows.\n`);

  // --------------------------------------------------
  // F. SEED CUSTOMER BOOKINGS & ADMISSION AUDITS
  // --------------------------------------------------
  console.log('🎟️ Seeding Real-world Customer Bookings & Gate Check-ins...');
  const bookingsData = [];
  const bookingPrefixes = [849201, 732104, 915420, 602381, 419823, 304918, 512940, 683921, 749102, 829103, 938210, 482910, 592810, 691820, 718290, 819201, 918203, 381920, 491820, 582910, 692810, 782910, 892019, 902819, 391820, 482911, 572910, 682910];

  for (let idx = 0; idx < bookingPrefixes.length; idx++) {
    const bookingCode = `BMS-${bookingPrefixes[idx]}`;
    const showObj = shows[idx % shows.length];
    const customerObj = allCustomers[idx % allCustomers.length];
    const cinemaObj = cinemas.find((c) => c._id.toString() === showObj.cinema.toString());
    const screenObj = screens.find((s) => s._id.toString() === showObj.screen.toString());

    // Seat count 1 to 3
    const count = (idx % 3) + 1;
    const seatList = [];
    const seatRow = idx % 2 === 0 ? 'B' : idx % 3 === 0 ? 'A' : 'D';
    for (let s = 1; s <= count; s++) {
      seatList.push(`${seatRow}${s + (idx % 5)}`);
    }

    const baseFare = showObj.ticketPrice * count;
    const convenienceFee = 45;
    const totalAmount = baseFare + convenienceFee;

    // First 18 tickets are ALREADY CHECKED IN (for live revenue & admission metrics)
    // Last 10 tickets are PENDING CHECK-IN (ready to test on Gate Scanner!)
    const isValidated = idx < 18;
    const validationTime = isValidated
      ? new Date(Date.now() - (idx * 15 * 60 * 1000)) // Scaled in past 4 hours
      : null;

    bookingsData.push({
      bookingId: bookingCode,
      user: customerObj._id,
      movie: showObj.movie,
      movieCustomId: `m${(idx % movies.length) + 1}`,
      categoryType: 'movie',
      movieTitle: showObj.movieTitle,
      theatreName: cinemaObj.name,
      showtime: showObj.startTime,
      showDate: showObj.showDate,
      seats: seatList,
      seatsCount: count,
      ticketPrice: baseFare,
      convenienceFee: convenienceFee,
      totalAmount: totalAmount,
      paymentStatus: 'paid',
      bookingStatus: 'confirmed',
      cinema: cinemaObj._id,
      partner: partner._id,
      screen: screenObj._id,
      screenName: screenObj.name,
      show: showObj._id,
      ticketValidated: isValidated,
      validatedAt: validationTime,
      validatedBy: isValidated ? partner._id : null,
      validationHistory: isValidated
        ? [
            {
              validatedAt: validationTime,
              validatedBy: partner._id,
              action: 'GATE_CHECK_IN',
              notes: 'Admitted at turnstile gate scanner.'
            }
          ]
        : []
    });
  }

  const bookings = await Booking.create(bookingsData);
  console.log(`✅ Seeded ${bookings.length} Customer Bookings:`);
  console.log(`   - 18 Marked as "Checked In" (Admitted at Gate)`);
  console.log(`   - 10 Marked as "Pending Check-In" (Ready for Gate Scanner test!)\n`);

  // --------------------------------------------------
  // G. SEED CATEGORIES & CAROUSELS
  // --------------------------------------------------
  console.log('🎪 Seeding Events, Plays, Sports & Carousel Banners...');
  await CategoryItem.create([...defaultBanners, ...defaultCategoryItems]);
  console.log(`✅ Seeded ${defaultBanners.length} Banners + ${defaultCategoryItems.length} Category Items.\n`);

  // --------------------------------------------------
  // SUMMARY REPORT
  // --------------------------------------------------
  console.log('====================================================');
  console.log('🎉 BOOKMYTRIP SYNCHRONIZED SEEDING COMPLETED');
  console.log('====================================================');
  console.log(`• Cinema Partner: partner@bookmyshow.com (password123)`);
  console.log(`• Customer Demo:  demo@bookmyshow.com (password123)`);
  console.log(`• Total Cinemas:  ${cinemas.length} multiplex venues`);
  console.log(`• Total Screens:  ${screens.length} auditoriums`);
  console.log(`• Total Movies:   ${movies.length} releases with showtimes`);
  console.log(`• Total Shows:    ${shows.length} scheduled screenings`);
  console.log(`• Total Bookings: ${bookings.length} customer admissions`);
  console.log('====================================================\n');

  await mongoose.disconnect();
  console.log('🔌 Disconnected from MongoDB. Ready for testing!');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('\n❌ Seeding Failed with Error:', err);
  process.exit(1);
});
