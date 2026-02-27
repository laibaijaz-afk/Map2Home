const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function initDb() {
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.log('[initDb] schema.sql not found, skipping DB initialization');
    return;
  }

  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

  console.log('[initDb] initializing database using schema:', schemaPath);

  let connection;
  try {
    // Connect without specifying database so we can run CREATE DATABASE and other statements
    connection = await mysql.createConnection({ host, user, password, port });

    // Split statements and run sequentially so we can ignore duplicate-entry errors for idempotence
    const statements = schemaSql
      .split(/;\s*\n/) // split on semicolon+newline to keep statements intact
      .map(s => s.trim())
      .filter(Boolean);

    for (const stmt of statements) {
      try {
        await connection.query(stmt);
      } catch (stmtErr) {
        // Ignore duplicate entry errors (e.g., inserting default admin twice)
        if (stmtErr && (stmtErr.code === 'ER_DUP_ENTRY' || (stmtErr.errno === 1062))) {
          console.log('[initDb] warning - duplicate entry or already exists, continuing:', stmtErr.message);
          continue;
        }
        // Some MySQL servers may error on CREATE DATABASE if database already exists; ignore that too
        if (stmtErr && (stmtErr.code === 'ER_DB_CREATE_EXISTS' || (stmtErr.errno === 1007))) {
          console.log('[initDb] warning - database already exists, continuing');
          continue;
        }
        // For any other error, throw to let caller decide
        console.error('[initDb] error executing statement:', stmtErr.message);
        throw stmtErr;
      }
    }

    console.log('[initDb] schema executed successfully (statements run)');
  } catch (err) {
    console.error('[initDb] error executing schema:', err.message);
    // do not rethrow duplicate-entry related errors; rethrow other errors
    // If we reach here it means an unexpected error occurred
    throw err;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = initDb;
