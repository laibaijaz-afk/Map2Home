const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

function formatError(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;

  const parts = [];
  if (err.message) parts.push(err.message);
  if (err.code) parts.push(`code=${err.code}`);
  if (err.errno !== undefined && err.errno !== null) parts.push(`errno=${err.errno}`);
  if (err.sqlState) parts.push(`sqlState=${err.sqlState}`);
  if (err.sqlMessage) parts.push(`sqlMessage=${err.sqlMessage}`);
  if (err.address) parts.push(`address=${err.address}`);
  if (err.port !== undefined && err.port !== null) parts.push(`port=${err.port}`);

  return parts.length ? parts.join(' | ') : String(err);
}

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
        console.log('[initDb] warning -', formatError(stmtErr).substring(0, 160), '... continuing');
        continue;
      }
      console.error('[initDb] error executing statement:', formatError(stmtErr));
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

  console.log(`[initDb] initializing database (host=${host}, port=${port}, user=${user})...`);

  let connection;
  try {
    connection = await mysql.createConnection({ host, user, password, port });

    // Run main schema first, then additional schemas
    await runSqlFile(connection, schemaPath);

    const mapsSchemaPath = path.join(__dirname, '..', 'database', 'maps_schema.sql');
    await runSqlFile(connection, mapsSchemaPath);

    console.log('[initDb] all schemas executed successfully');
  } catch (err) {
    console.error('[initDb] error executing schema:', formatError(err));
    throw err;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

module.exports = initDb;
