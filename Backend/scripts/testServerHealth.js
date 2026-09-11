const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const express = require('express');
const http = require('http');

async function testServer() {
  // Spawn child process or require server
  console.log('Testing Backend server boot...');
  const { exec } = require('child_process');
  
  const proc = exec('node src/server.js', {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: '5099' }
  });

  proc.stdout.on('data', (d) => process.stdout.write(d));
  proc.stderr.on('data', (d) => process.stderr.write(d));

  // Wait 3 seconds for server to listen
  await new Promise(res => setTimeout(res, 3500));

  // Fetch health
  const res = await fetch('http://localhost:5099/api/health');
  const data = await res.json();
  console.log('HTTP GET /api/health Response:', data);

  // Terminate test server
  proc.kill();
  console.log('Server test process terminated cleanly.');

  if (data.status === 'healthy' && data.database.status === 'connected') {
    console.log('🎉 BACKEND SERVER HEALTH CHECK PASSED!');
  } else {
    throw new Error('Server health check returned non-healthy state!');
  }
}

testServer().catch(err => {
  console.error('❌ Server boot test error:', err);
  process.exit(1);
});
