-- Materials table for admin cost management
CREATE TABLE IF NOT EXISTS materials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL UNIQUE,
    category ENUM('construction', 'finishing', 'other') DEFAULT 'construction',
    cost_per_unit DECIMAL(10, 2) NOT NULL,
    unit VARCHAR(50) DEFAULT 'sqm',
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT,
    FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Insert default materials (only materials from costzone.org - Pakistan-specific)
INSERT INTO materials (name, category, cost_per_unit, unit, description) VALUES
('Cement', 'construction', 1235.00, 'bag', 'Cement (Maple Leaf, DG, Bestway, etc.)'),
('Steel', 'construction', 250000.00, 'ton', 'Steel bars/Sariya for reinforcement'),
('Bricks', 'construction', 17.00, 'piece', 'Red bricks/Clay bricks'),
('Sand', 'construction', 7000.00, 'truck', 'Sand/Rait for construction'),
('Gravel', 'construction', 8000.00, 'truck', 'Crush/Bajri for construction'),
('Tiles', 'finishing', 400.00, 'sqm', 'Ceramic tiles'),
('Paint', 'finishing', 2200.00, 'liter', 'Paint (Berger, Nippon, Dulux, etc.)')
ON DUPLICATE KEY UPDATE name=name;
