const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { connectDB, closeDB } = require('../src/config/db');
const mongoose = require('mongoose');

async function performBackup() {
  console.log('--- STARTING PRE-TRANSFORMATION DATABASE BACKUP ---');
  await connectDB();
  const db = mongoose.connection.db;

  const backupDir = path.join(__dirname, '..', 'backups', 'backup_pre_customer_only');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const collections = await db.listCollections().toArray();
  const summary = [];

  for (const col of collections) {
    const colName = col.name;
    const docs = await db.collection(colName).find().toArray();
    const filePath = path.join(backupDir, `${colName}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(docs, null, 2), 'utf-8');
    const stats = fs.statSync(filePath);
    summary.push({
      collection: colName,
      count: docs.length,
      file: `${colName}.json`,
      sizeKB: (stats.size / 1024).toFixed(2) + ' KB'
    });
  }

  console.log('\n✅ BACKUP COMPLETED SUCCESSFULLY!');
  console.log(`Directory: ${backupDir}\n`);
  console.table(summary);

  // Write manifest file
  const manifest = {
    backupDate: new Date().toISOString(),
    database: mongoose.connection.name,
    host: mongoose.connection.host,
    collections: summary
  };
  fs.writeFileSync(path.join(backupDir, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf-8');

  await closeDB();
}

performBackup().catch((err) => {
  console.error('❌ Backup failed:', err);
  process.exit(1);
});
