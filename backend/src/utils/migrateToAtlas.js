import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const LOCAL_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/government_scheme_db';
const TARGET_URI = process.argv[2] || process.env.ATLAS_URI;

if (!TARGET_URI) {
  console.error('\n❌ ERROR: Target MongoDB Atlas connection string is required!');
  console.log('Usage: node src/utils/migrateToAtlas.js "<your-atlas-connection-string>"');
  console.log('Example: node src/utils/migrateToAtlas.js "mongodb+srv://admin:pass@cluster0.abcde.mongodb.net/government_scheme_db?retryWrites=true&w=majority"\n');
  process.exit(1);
}

const COLLECTIONS_TO_MIGRATE = [
  'departments',
  'schemes',
  'eligibilityrules',
  'users',
  'userprofiles',
  'bookmarks',
  'reminders',
  'notifications',
  'systemnotifications',
  'feedbacks',
  'searchhistories',
  'eligibilitychecks',
  'auditlogs',
  'adminrecommendations',
];

const runMigration = async () => {
  console.log('====================================================');
  console.log('  SchemeEngine: Local MongoDB -> Atlas Cloud Migration');
  console.log('====================================================');
  console.log(`[Source]      Local:  ${LOCAL_URI}`);
  console.log(`[Destination] Atlas:  ${TARGET_URI.replace(/:([^:@]+)@/, ':****@')}\n`);

  let localConn = null;
  let atlasConn = null;

  try {
    // 1. Connect to Local MongoDB
    console.log('Connecting to local MongoDB...');
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('✅ Connected to local MongoDB\n');

    // 2. Connect to Atlas MongoDB
    console.log('Connecting to MongoDB Atlas Cluster...');
    atlasConn = await mongoose.createConnection(TARGET_URI).asPromise();
    console.log('✅ Connected to MongoDB Atlas Cluster\n');

    const migrationSummary = [];

    // 3. Migrate each collection
    for (const colName of COLLECTIONS_TO_MIGRATE) {
      process.stdout.write(`Migrating collection: [${colName}] ... `);

      const localCol = localConn.collection(colName);
      const atlasCol = atlasConn.collection(colName);

      const localCount = await localCol.countDocuments();

      if (localCount === 0) {
        console.log('Skipped (0 documents)');
        migrationSummary.push({ collection: colName, local: 0, atlas: 0, status: 'EMPTY' });
        continue;
      }

      // Clear existing records in Atlas destination to avoid duplication
      await atlasCol.deleteMany({});

      // Stream documents in batches of 500 to handle large collections efficiently
      const cursor = localCol.find({});
      let batch = [];
      let migrated = 0;

      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        batch.push(doc);

        if (batch.length >= 500) {
          await atlasCol.insertMany(batch, { ordered: false });
          migrated += batch.length;
          batch = [];
        }
      }

      if (batch.length > 0) {
        await atlasCol.insertMany(batch, { ordered: false });
        migrated += batch.length;
      }

      const atlasCount = await atlasCol.countDocuments();
      console.log(`✅ ${migrated} / ${localCount} docs migrated`);
      migrationSummary.push({
        collection: colName,
        local: localCount,
        atlas: atlasCount,
        status: localCount === atlasCount ? 'MATCH' : 'MISMATCH',
      });
    }

    // 4. Print Summary Table
    console.log('\n====================================================');
    console.log('  MIGRATION VERIFICATION AUDIT');
    console.log('====================================================');
    console.table(migrationSummary);

    const hasMismatches = migrationSummary.some((s) => s.status === 'MISMATCH');
    if (hasMismatches) {
      console.warn('\n⚠️ Some collections had document count differences. Please review the table.');
    } else {
      console.log('\n🎉 ALL COLLECTIONS MIGRATED 100% SUCCESSFULLY WITH ZERO LOSS!');
    }

    // 5. Update backend .env file automatically
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      let envContent = fs.readFileSync(envPath, 'utf8');
      const targetDbName = TARGET_URI.includes('?') ? TARGET_URI : `${TARGET_URI}`;
      
      envContent = envContent.replace(
        /^MONGODB_URI=.*/m,
        `MONGODB_URI=${targetDbName}`
      );
      fs.writeFileSync(envPath, envContent, 'utf8');
      console.log('\n✅ Updated backend/.env with the new Atlas MONGODB_URI!');
    }

    console.log('\nReady for deployment! Your backend will now connect to MongoDB Atlas Cloud.');
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    if (error.message.includes('Authentication failed') || error.message.includes('bad auth')) {
      console.error('👉 Hint: Check your Atlas username, password, or URL-encoding for special characters.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('getaddrinfo')) {
      console.error('👉 Hint: Check your Atlas cluster URL hostname.');
    } else if (error.message.includes('queryTxt ETIMEOUT') || error.message.includes('whitelist')) {
      console.error('👉 Hint: Check MongoDB Atlas Network Access. Ensure 0.0.0.0/0 (Anywhere) is allowed.');
    }
  } finally {
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
    process.exit(0);
  }
};

runMigration();
