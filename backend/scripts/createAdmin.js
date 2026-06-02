const bcrypt = require('bcryptjs');
const pool = require('../config/database');
require('dotenv').config();

async function createAdmin() {
  const connection = await pool.getConnection();
  
  try {
    // Admin credentials
    const adminName = 'MBT Admin';
    const adminEmail = 'mbt1234@map2home.com'; // Using email format since system uses email for login
    const adminPassword = 'mbt@1234';
    
    console.log('Creating admin user...');
    console.log('Email:', adminEmail);
    console.log('Password:', adminPassword);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    console.log('Password hashed successfully');
    
    // Check if admin already exists
    const [existing] = await connection.query(
      'SELECT id, email FROM users WHERE email = ?',
      [adminEmail]
    );
    
    if (existing.length > 0) {
      console.log('Admin user already exists. Updating...');
      // Update existing user to be admin
      await connection.query(
        `UPDATE users 
         SET name = ?, 
             password_hash = ?, 
             role = 'admin', 
             is_verified = TRUE 
         WHERE email = ?`,
        [adminName, hashedPassword, adminEmail]
      );
      console.log('✓ Admin user updated successfully!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      console.log('Role: admin');
    } else {
      // Insert new admin user
      await connection.query(
        `INSERT INTO users (name, email, password_hash, role, is_verified, google_account) 
         VALUES (?, ?, ?, 'admin', TRUE, FALSE)`,
        [adminName, adminEmail, hashedPassword]
      );
      console.log('✓ Admin user created successfully!');
      console.log('Email:', adminEmail);
      console.log('Password:', adminPassword);
      console.log('Role: admin');
    }
    
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
}

createAdmin();

