require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Movie = require('../models/Movie');
const CategoryItem = require('../models/CategoryItem');

const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('\n❌ Fatal Error: MONGO_URI is not defined in your environment variables.');
  process.exit(1);
}

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
    ],
    theatres: [
      {
        id: 'th1',
        name: 'PVR ICON: Phoenix Palladium, Lower Parel',
        distance: '2.4 km away',
        facilities: ['M-Ticket', 'F&B', 'Recliner Seats'],
        showtimes: [
          { time: '10:15 AM', format: 'IMAX 3D', status: 'available', price: '₹450', bookedSeats: [] },
          { time: '01:30 PM', format: 'IMAX 3D', status: 'filling_fast', price: '₹550', bookedSeats: ['B1', 'B2'] },
          { time: '05:00 PM', format: '2D', status: 'almost_full', price: '₹350', bookedSeats: ['A1', 'A2', 'C5'] },
          { time: '08:45 PM', format: 'IMAX 3D', status: 'filling_fast', price: '₹600', bookedSeats: [] }
        ]
      },
      {
        id: 'th2',
        name: 'INOX: Megaplex Inorbit Mall, Malad',
        distance: '5.1 km away',
        facilities: ['M-Ticket', 'F&B', 'Dolby Atmos'],
        showtimes: [
          { time: '11:00 AM', format: '2D', status: 'available', price: '₹300', bookedSeats: [] },
          { time: '02:45 PM', format: '4DX', status: 'available', price: '₹650', bookedSeats: ['B7', 'B8'] },
          { time: '06:15 PM', format: '2D', status: 'filling_fast', price: '₹380', bookedSeats: [] },
          { time: '09:30 PM', format: '4DX', status: 'filling_fast', price: '₹700', bookedSeats: [] }
        ]
      }
    ]
  },
  {
    customId: 'm2',
    title: 'Kalki 2898 AD',
    genre: ['Action', 'Sci-Fi', 'Thriller'],
    rating: 8.6,
    voteCount: '280.9K',
    language: 'Telugu, Hindi, Tamil, Malayalam',
    certificate: 'UA',
    duration: '3h 01m',
    releaseDate: '27 Jun, 2024',
    formats: ['2D', '3D', 'IMAX 3D'],
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1600&auto=format&fit=crop',
    synopsis: 'A modern avatar of Vishnu, a Hindu god, who is believed to have descended to the earth in order to protect the world from evil forces in a post-apocalyptic era set in Kasi 2898 AD.',
    isPromoted: false,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'],
    cast: [
      { name: 'Prabhas', role: 'Bhairava', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' },
      { name: 'Amitabh Bachchan', role: 'Ashwatthama', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' },
      { name: 'Deepika Padukone', role: 'SUM-80', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' }
    ],
    theatres: [
      {
        id: 'th1',
        name: 'PVR ICON: Phoenix Palladium, Lower Parel',
        distance: '2.4 km away',
        facilities: ['M-Ticket', 'F&B'],
        showtimes: [
          { time: '11:15 AM', format: '3D', status: 'available', price: '₹400', bookedSeats: [] },
          { time: '03:30 PM', format: '3D', status: 'filling_fast', price: '₹450', bookedSeats: ['C5', 'C6'] },
          { time: '07:45 PM', format: 'IMAX 3D', status: 'almost_full', price: '₹650', bookedSeats: [] }
        ]
      }
    ]
  },
  {
    customId: 'm3',
    title: 'Stree 2: Sarkate Ka Aatank',
    genre: ['Comedy', 'Horror'],
    rating: 8.9,
    voteCount: '412.5K',
    language: 'Hindi',
    certificate: 'UA',
    duration: '2h 27m',
    releaseDate: '15 Aug, 2024',
    formats: ['2D'],
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1600&auto=format&fit=crop',
    synopsis: 'After the events of Stree, the town of Chanderi is being haunted by a headless entity called Sarkata, abducting progressive women. Vicky and his friends must team up with the mystery woman once again to save their town.',
    isPromoted: true,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Chandigarh', 'Ahmedabad', 'Pune', 'Kolkata'],
    cast: [
      { name: 'Shraddha Kapoor', role: 'Mystery Woman', photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop' },
      { name: 'Rajkummar Rao', role: 'Vicky', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop' },
      { name: 'Pankaj Tripathi', role: 'Rudra', photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&auto=format&fit=crop' }
    ],
    theatres: [
      {
        id: 'th2',
        name: 'INOX: Megaplex Inorbit Mall, Malad',
        distance: '5.1 km away',
        facilities: ['M-Ticket', 'F&B'],
        showtimes: [
          { time: '10:00 AM', format: '2D', status: 'available', price: '₹280', bookedSeats: [] },
          { time: '01:15 PM', format: '2D', status: 'filling_fast', price: '₹340', bookedSeats: [] },
          { time: '04:45 PM', format: '2D', status: 'almost_full', price: '₹380', bookedSeats: [] }
        ]
      }
    ]
  },
  {
    customId: 'm4',
    title: 'Deadpool & Wolverine',
    genre: ['Action', 'Comedy', 'Sci-Fi'],
    rating: 8.7,
    voteCount: '198.7K',
    language: 'English, Hindi, Tamil, Telugu',
    certificate: 'A',
    duration: '2h 08m',
    releaseDate: '26 Jul, 2024',
    formats: ['2D', '3D', '4DX', 'IMAX 3D'],
    posterUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1563089145-599997674d42?q=80&w=1600&auto=format&fit=crop',
    synopsis: 'Wolverine is recovering from his injuries when he crosses paths with the loudmouth, Deadpool. They team up to defeat a common enemy who threatens the entire multiverse.',
    isPromoted: false,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kochi'],
    cast: [
      { name: 'Ryan Reynolds', role: 'Wade Wilson / Deadpool', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop' },
      { name: 'Hugh Jackman', role: 'Logan / Wolverine', photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop' }
    ],
    theatres: [
      {
        id: 'th1',
        name: 'PVR ICON: Phoenix Palladium, Lower Parel',
        distance: '2.4 km away',
        facilities: ['M-Ticket', 'F&B'],
        showtimes: [
          { time: '12:30 PM', format: 'IMAX 3D', status: 'available', price: '₹500', bookedSeats: [] },
          { time: '04:15 PM', format: 'IMAX 3D', status: 'filling_fast', price: '₹550', bookedSeats: [] }
        ]
      }
    ]
  },
  {
    customId: 'm5',
    title: 'Interstellar (10th Anniversary Re-Release)',
    genre: ['Adventure', 'Drama', 'Sci-Fi'],
    rating: 9.3,
    voteCount: '620.1K',
    language: 'English',
    certificate: 'UA',
    duration: '2h 49m',
    releaseDate: '27 Sep, 2024',
    formats: ['IMAX 70mm', 'IMAX 3D', '2D'],
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1600&auto=format&fit=crop',
    synopsis: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    isPromoted: true,
    cities: ['Mumbai', 'Delhi-NCR', 'Bengaluru', 'Hyderabad', 'Pune'],
    cast: [
      { name: 'Matthew McConaughey', role: 'Cooper', photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop' },
      { name: 'Anne Hathaway', role: 'Brand', photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop' }
    ],
    theatres: [
      {
        id: 'th1',
        name: 'PVR ICON: Phoenix Palladium, Lower Parel',
        distance: '2.4 km away',
        facilities: ['M-Ticket', 'F&B'],
        showtimes: [
          { time: '02:00 PM', format: 'IMAX 70mm', status: 'almost_full', price: '₹800', bookedSeats: [] },
          { time: '07:15 PM', format: 'IMAX 70mm', status: 'almost_full', price: '₹950', bookedSeats: [] }
        ]
      }
    ]
  }
];

const defaultEvents = [
  {
    customId: 'e1',
    categoryType: 'event',
    title: 'Sunburn Arena ft. Alan Walker',
    category: 'Music Shows',
    date: 'Fri, 27 Sep onwards',
    venue: 'Mahalaxmi Race Course',
    price: '₹ 1,500 onwards',
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=600&auto=format&fit=crop',
    city: 'Mumbai',
    description: 'The world-renowned Norwegian DJ Alan Walker is bringing his WalkerWorld tour to India with spectacular visual production and global chartbuster hits.'
  },
  {
    customId: 'e2',
    categoryType: 'event',
    title: 'Zakir Khan - Live Standup Special',
    category: 'Comedy Shows',
    date: 'Sat, 05 Oct, 7:00 PM',
    venue: 'NCPA: Mumbai',
    price: '₹ 799 onwards',
    imageUrl: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=600&auto=format&fit=crop',
    city: 'Mumbai',
    description: 'The Sakht Launda returns with an all-new hilarious and heartfelt hour of storytelling that promises an unforgettable evening of laughter.'
  },
  {
    customId: 'e3',
    categoryType: 'event',
    title: 'Lollapalooza India 2025',
    category: 'Music Festival',
    date: '08 - 09 Mar 2025',
    venue: 'Bandra Kurla Complex',
    price: '₹ 5,999 onwards',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=600&auto=format&fit=crop',
    city: 'Mumbai',
    description: 'Asia’s biggest multi-genre music festival returns to Mumbai with multiple stages, international headliners, art installations, and culinary experiences.'
  },
  {
    customId: 'e4',
    categoryType: 'event',
    title: 'ISL 2024-25: Mumbai City FC vs Bengaluru FC',
    category: 'Sports',
    date: 'Sun, 20 Oct, 7:30 PM',
    venue: 'Mumbai Football Arena',
    price: '₹ 250 onwards',
    imageUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=600&auto=format&fit=crop',
    city: 'Mumbai',
    description: 'Catch the thrilling Indian Super League football rivalry live at the Mumbai Football Arena under floodlights.'
  }
];

const defaultSports = [
  {
    customId: 'sp1',
    categoryType: 'sport',
    title: 'India vs New Zealand - 2nd Test Match',
    category: 'Cricket',
    date: '24 - 28 Oct 2024, 9:30 AM',
    venue: 'MCA Stadium: Pune',
    price: '₹ 400 onwards',
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=600&auto=format&fit=crop',
    city: 'Pune'
  },
  {
    customId: 'sp2',
    categoryType: 'sport',
    title: 'Pro Kabaddi League Season 11',
    category: 'Kabaddi',
    date: '18 Oct onwards',
    venue: 'GMCB Indoor Stadium: Hyderabad',
    price: '₹ 300 onwards',
    imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=600&auto=format&fit=crop',
    city: 'Hyderabad'
  }
];

const defaultPlays = [
  {
    customId: 'pl1',
    categoryType: 'play',
    title: 'Mughal-E-Azam: The Musical',
    category: 'Theatre & Broadway',
    date: 'Fri, 18 Oct - Sun, 20 Oct',
    venue: 'Jio World Centre: Mumbai',
    price: '₹ 1,250 onwards',
    imageUrl: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?q=80&w=600&auto=format&fit=crop',
    city: 'Mumbai'
  },
  {
    customId: 'pl2',
    categoryType: 'play',
    title: 'A Doll\'s House - Hindi Adaptation',
    category: 'Classic Drama',
    date: 'Sat, 12 Oct, 6:30 PM',
    venue: 'Prithvi Theatre: Juhu',
    price: '₹ 500 onwards',
    imageUrl: 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?q=80&w=600&auto=format&fit=crop',
    city: 'Mumbai'
  }
];

const defaultActivities = [
  {
    customId: 'ac1',
    categoryType: 'activity',
    title: 'Imagicaa Theme & Water Park Pass',
    category: 'Theme Parks',
    date: 'Open All Days, 10:00 AM',
    venue: 'Khopoli, Off Mumbai-Pune Expressway',
    price: '₹ 999 onwards',
    imageUrl: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=600&auto=format&fit=crop',
    city: 'Mumbai'
  },
  {
    customId: 'ac2',
    categoryType: 'activity',
    title: 'Smaaash VR & Bowling Arcade',
    category: 'Gaming & Bowling',
    date: 'Open Daily',
    venue: 'Lower Parel: Mumbai',
    price: '₹ 699 onwards',
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=600&auto=format&fit=crop',
    city: 'Mumbai'
  }
];

const defaultPremieres = [
  {
    customId: 'p1',
    categoryType: 'premiere',
    title: 'Furiosa: A Mad Max Saga',
    language: 'English',
    badge: 'Premiere of the Week',
    rentPrice: '₹ 149',
    buyPrice: '₹ 499',
    description: 'The origin story of renegade warrior Furiosa before her encounter with Mad Max.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop'
  },
  {
    customId: 'p2',
    categoryType: 'premiere',
    title: 'Civil War',
    language: 'English',
    badge: 'New Release',
    rentPrice: '₹ 119',
    buyPrice: '₹ 399',
    description: 'A journey across a dystopian future America following a team of military-embedded journalists.',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=600&auto=format&fit=crop'
  },
  {
    customId: 'p3',
    categoryType: 'premiere',
    title: 'Godzilla x Kong: The New Empire',
    language: 'English, Hindi',
    badge: 'Trending Stream',
    rentPrice: '₹ 149',
    buyPrice: '₹ 499',
    description: 'Two ancient titans clash in a battle for human existence.',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=600&auto=format&fit=crop'
  }
];

const defaultUsers = [
  {
    name: 'Demo User',
    email: 'demo@bookmyshow.com',
    phone: '9876543210',
    passwordPlain: 'password123',
    role: 'user'
  },
  {
    name: 'VARUN TYAGI',
    email: 'varuntyagi2004@gmail.com',
    phone: '9258066241',
    passwordPlain: 'password123',
    role: 'admin'
  }
];

async function seedDatabase() {
  console.log('\n🌱 Starting Database Seed Process for BookMyTrip...');

  try {
    const conn = await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    const isCloud = MONGO_URI.startsWith('mongodb+srv://') || !conn.connection.host.includes('127.0.0.1');
    const targetLabel = isCloud ? 'MongoDB Atlas Cloud' : 'Local MongoDB';
    console.log(`✅ Connected to ${targetLabel}: Database "${conn.connection.name}" on host ${conn.connection.host}`);

    // 1. Seed Users
    let usersInserted = 0;
    let usersSkipped = 0;
    const salt = await bcrypt.genSalt(10);

    for (const u of defaultUsers) {
      const existing = await User.findOne({ email: u.email.toLowerCase() });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(u.passwordPlain, salt);
        await User.create({
          name: u.name,
          email: u.email.toLowerCase(),
          password: hashedPassword,
          phone: u.phone,
          role: u.role
        });
        usersInserted++;
      } else {
        usersSkipped++;
      }
    }
    console.log(`👥 Users: ${usersInserted} created, ${usersSkipped} already exist.`);

    // 2. Seed Movies
    let moviesInserted = 0;
    let moviesSkipped = 0;

    for (const m of defaultMovies) {
      const existing = await Movie.findOne({
        $or: [{ customId: m.customId }, { title: m.title }]
      });
      if (!existing) {
        await Movie.create(m);
        moviesInserted++;
      } else {
        moviesSkipped++;
      }
    }
    console.log(`🎬 Movies: ${moviesInserted} created, ${moviesSkipped} already exist.`);

    // 3. Seed CategoryItems helper
    const seedCategoryItems = async (items, label) => {
      let inserted = 0;
      let skipped = 0;

      for (const item of items) {
        const existing = await CategoryItem.findOne({
          categoryType: item.categoryType,
          $or: [{ customId: item.customId }, { title: item.title }]
        });

        if (!existing) {
          await CategoryItem.create(item);
          inserted++;
        } else {
          skipped++;
        }
      }
      console.log(`📌 ${label}: ${inserted} created, ${skipped} already exist.`);
    };

    await seedCategoryItems(defaultBanners, 'Banners');
    await seedCategoryItems(defaultEvents, 'Live Events');
    await seedCategoryItems(defaultSports, 'Sports Events');
    await seedCategoryItems(defaultPlays, 'Theatre Plays');
    await seedCategoryItems(defaultActivities, 'Fun Activities');
    await seedCategoryItems(defaultPremieres, 'Stream Premieres');

    console.log('\n✨ Database seeding completed successfully for database: bookmytrip!\n');
  } catch (error) {
    console.error('\n❌ Seeding Failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  }
}

seedDatabase();
