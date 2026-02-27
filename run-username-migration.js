/**
 * One-time migration: Add username column to users table
 * Run with: node run-username-migration.js
 */
const pool = require('./config/database');

async function run() {
  const conn = await pool.getConnection();
  try {
    console.log('Running username migration...');
    
    // Add username column (will fail if column exists - that's ok)
    try {
      await conn.query('ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER id');
      console.log('Added username column.');
    } catch (err) {
      if (err.code === 'ER_DUP_FIELDNAME') {
        console.log('Username column already exists, skipping.');
      } else {
        throw err;
      }
    }

    // Update existing admin user
    const [res] = await conn.query(
      "UPDATE users SET username = 'admin' WHERE email = 'admin@map2home.com' AND (username IS NULL OR username = '')"
    );
    console.log('Updated admin user:', res.affectedRows, 'row(s).');
    
    console.log('Migration complete.');
  } finally {
    conn.release();
    await pool.end();
  }
}

run().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
