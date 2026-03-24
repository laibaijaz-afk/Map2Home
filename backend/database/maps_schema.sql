-- Maps table for storing 2D map images with room specifications
CREATE TABLE IF NOT EXISTS maps (
    id INT PRIMARY KEY AUTO_INCREMENT,
    room_type VARCHAR(50) NOT NULL DEFAULT 'house',
    title VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    description TEXT,
    bedrooms INT NOT NULL DEFAULT 0,
    bathrooms INT NOT NULL DEFAULT 0,
    kitchen INT NOT NULL DEFAULT 0,
    drawing_room INT NOT NULL DEFAULT 0,
    dining_room INT NOT NULL DEFAULT 0,
    store_room INT NOT NULL DEFAULT 0,
    garage INT NOT NULL DEFAULT 0,
    servant_quarter INT NOT NULL DEFAULT 0,
    tv_lounge INT NOT NULL DEFAULT 0,
    plot_length DECIMAL(10,2) DEFAULT NULL,
    plot_width DECIMAL(10,2) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_room_type (room_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Migration: add room specification columns to existing maps table safely
-- These will silently fail if columns already exist (handled by initDb error logic)
ALTER TABLE maps ADD COLUMN bedrooms INT NOT NULL DEFAULT 0;
ALTER TABLE maps ADD COLUMN bathrooms INT NOT NULL DEFAULT 0;
ALTER TABLE maps ADD COLUMN kitchen INT NOT NULL DEFAULT 0;
ALTER TABLE maps ADD COLUMN drawing_room INT NOT NULL DEFAULT 0;
ALTER TABLE maps ADD COLUMN dining_room INT NOT NULL DEFAULT 0;
ALTER TABLE maps ADD COLUMN store_room INT NOT NULL DEFAULT 0;
ALTER TABLE maps ADD COLUMN garage INT NOT NULL DEFAULT 0;
ALTER TABLE maps ADD COLUMN servant_quarter INT NOT NULL DEFAULT 0;
ALTER TABLE maps ADD COLUMN tv_lounge INT NOT NULL DEFAULT 0;
ALTER TABLE maps ADD COLUMN plot_length DECIMAL(10,2) DEFAULT NULL;
ALTER TABLE maps ADD COLUMN plot_width DECIMAL(10,2) DEFAULT NULL;
