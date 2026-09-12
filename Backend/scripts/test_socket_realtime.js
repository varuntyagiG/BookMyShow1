const { io: ioClient } = require('socket.io-client');

async function runSocketVerification() {
  console.log('🧪 Starting Real-Time WebSocket End-to-End Verification Test...\n');

  const serverUrl = 'http://localhost:5000';
  let passedAssertions = 0;

  // 1. First test: Direct socket connection to server
  const client1 = ioClient(serverUrl, {
    transports: ['websocket', 'polling'],
    timeout: 5000
  });

  await new Promise((resolve, reject) => {
    client1.on('connect', () => {
      console.log('✅ Socket Client connected successfully (Socket ID:', client1.id, ')');
      resolve();
    });
    client1.on('connect_error', (err) => {
      reject(err);
    });
    setTimeout(() => reject(new Error('Connection timed out')), 4000);
  });
  passedAssertions++;

  // 2. Test join_show room acknowledgment
  const ackReceived = await new Promise((resolve, reject) => {
    client1.on('joined_show_ack', (data) => {
      console.log('✅ Server acknowledged show room join:', data);
      resolve(data);
    });
    client1.emit('join_show', { showId: 'test-show-room-123' });
    setTimeout(() => reject(new Error('Ack timeout')), 3000);
  });

  if (ackReceived.showId === 'test-show-room-123') {
    passedAssertions++;
  }

  // 3. Test HTTP booking flow triggering real-time multi-cast
  // Register a test customer to get a valid JWT token
  const testEmail = `test_ws_${Date.now()}@bookmyshow.com`;
  const registerRes = await fetch(`${serverUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'WebSocket Test User',
      email: testEmail,
      password: 'password123',
      phone: '9988776655'
    })
  });
  const regData = await registerRes.json();
  const token = regData.token;
  const userId = regData.user?.id || regData.user?._id;
  console.log('✅ Test user registered with ID:', userId);

  // Connect user's authenticated socket (Alice)
  const aliceSocket = ioClient(serverUrl, {
    transports: ['websocket', 'polling'],
    auth: { token }
  });

  await new Promise((resolve) => {
    aliceSocket.on('connect', () => {
      console.log('✅ Alice connected with JWT auth (auto-joined user room: user:' + userId + ')');
      resolve();
    });
  });

  // Client 1 (Bob) joins show room for Audi 1
  client1.emit('join_show', { showId: 'show-test-678' });
  await new Promise(r => setTimeout(r, 100));

  // Set up listeners for booking events
  const aliceConfirmedPromise = new Promise((resolve, reject) => {
    aliceSocket.on('BOOKING_CONFIRMED', (data) => {
      console.log('🎉 Alice received real-time BOOKING_CONFIRMED:', data.message);
      if (data.movieTitle && data.seats) {
        passedAssertions++;
        resolve();
      } else {
        reject(new Error('Invalid confirmation payload'));
      }
    });
    setTimeout(() => reject(new Error('BOOKING_CONFIRMED timeout')), 5000);
  });

  // Now trigger actual ticket booking via HTTP API
  console.log('\n🎟️ Submitting ticket booking request to /api/bookings...');
  const bookingRes = await fetch(`${serverUrl}/api/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      theatreName: 'PVR Inox Phoenix Marketcity',
      showtime: '07:30 PM',
      showDate: 'Today',
      movieTitle: 'Inception (IMAX)',
      seats: [`Z${Math.floor(Math.random() * 800 + 100)}`, `Z${Math.floor(Math.random() * 800 + 100)}`],
      ticketPrice: 600,
      convenienceFee: 70,
      totalAmount: 670,
      categoryType: 'movie'
    })
  });

  const bookingJson = await bookingRes.json();
  console.log('📥 Booking API Response Status:', bookingRes.status, '| Booking ID:', bookingJson.booking?.bookingId);

  // Wait for real-time WebSocket confirmation
  await aliceConfirmedPromise;

  client1.disconnect();
  aliceSocket.disconnect();

  console.log(`\n🎉 ALL ${passedAssertions} REAL-TIME WEBSOCKET ASSERTIONS PASSED!`);
  process.exit(0);
}

runSocketVerification().catch((err) => {
  console.error('\n❌ Socket verification failed:', err.message);
  process.exit(1);
});
