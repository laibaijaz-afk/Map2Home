const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

async function runSqlFile(connection, filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`[initDb] ${path.basename(filePath)} not found, skipping`);
    return;
  }

  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(Boolean);

  for (const stmt of statements) {
    try {
      await connection.query(stmt);
    } catch (stmtErr) {
      // Ignore duplicate entry / column already exists / db already exists errors
      const ignorable = [1060, 1062, 1007]; // ER_DUP_FIELDNAME, ER_DUP_ENTRY, ER_DB_CREATE_EXISTS
      if (stmtErr && (ignorable.includes(stmtErr.errno) || stmtErr.code === 'ER_DUP_ENTRY' || stmtErr.code === 'ER_DB_CREATE_EXISTS' || stmtErr.code === 'ER_DUP_FIELDNAME')) {
        console.log('[initDb] warning -', stmtErr.message.substring(0, 100), '... continuing');
        continue;
      }
      console.error('[initDb] error executing statement:', stmtErr.message);
      throw stmtErr;
    }
  }
  console.log(`[initDb] ${path.basename(filePath)} executed successfully`);
}

async function initDb() {
  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    console.log('[initDb] schema.sql not found, skipping DB initialization');
    return;
  }

  const host = process.env.DB_HOST || 'localhost';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

  console.log('[initDb] initializing database...');

  let connection;
  try {
    connection = await mysql.createConnection({ host, user, password, port });

    // Floor-plan JSON can exceed MySQL's default 1MB packet limit, which causes
    // saves to fail with a connection reset (ECONNRESET). Raise it to 64MB for
    // new connections. Best-effort: ignored if the user lacks SUPER privilege.
    try {
      await connection.query('SET GLOBAL max_allowed_packet = 67108864');
      console.log('[initDb] max_allowed_packet raised to 64MB');
    } catch (pktErr) {
      console.warn('[initDb] could not raise max_allowed_packet (need SUPER privilege):', pktErr.message);
    }

    // Run main schema first, then additional schemas
    await runSqlFile(connection, schemaPath);

    const mapsSchemaPath = path.join(__dirname, '..', 'database', 'maps_schema.sql');
    await runSqlFile(connection, mapsSchemaPath);

    console.log('[initDb] all schemas executed successfully');
  } catch (err) {
    console.error('[initDb] error executing schema:', err.message);
    throw err;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = initDb;
