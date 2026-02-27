-- Create database
CREATE DATABASE IF NOT EXISTS map2home;
USE map2home;

-- 2️⃣ Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('user','admin') DEFAULT 'user',
    is_verified BOOLEAN DEFAULT FALSE,
    google_account BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3️⃣ Email verification tokens table
CREATE TABLE IF NOT EXISTS email_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4️⃣ Password reset tokens table
CREATE TABLE IF NOT EXISTS reset_tokens (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5️⃣ Insert default admin user
-- Default credentials: admin@map2home.com / admin123
-- Password is already hashed using bcrypt
INSERT IGNORE INTO users (
    username,
    name,
    email,
    password_hash,
    role,
    is_verified
) VALUES (
    'admin',
    'Admin',
    'admin@map2home.com',
    '$2y$10$XZuZHbM50VSjoLLy.SonGevP9/tVcPHn889WzGn5DEb70NzRnyIfu',
    'admin',
    TRUE
);