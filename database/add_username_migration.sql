-- Migration: Add username column to users table
-- Run this if your users table was created before username was added
-- Usage: mysql -u your_user -p map2home < add_username_migration.sql

USE map2home;

-- Add username column (skip if column already exists)
ALTER TABLE users ADD COLUMN username VARCHAR(50) UNIQUE AFTER id;

-- Update existing admin user with default username
UPDATE users SET username = 'admin' WHERE email = 'admin@map2home.com' AND (username IS NULL OR username = '');
