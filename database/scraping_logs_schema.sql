-- Scraping logs table for tracking scraping activities
CREATE TABLE IF NOT EXISTS scraping_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    status ENUM('success', 'error', 'partial') NOT NULL,
    materials_updated INT DEFAULT 0,
    materials_inserted INT DEFAULT 0,
    total_materials INT DEFAULT 0,
    error_message TEXT,
    execution_time_ms INT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    triggered_by ENUM('cron', 'manual', 'startup') DEFAULT 'cron',
    triggered_by_user_id INT NULL,
    FOREIGN KEY (triggered_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_started_at (started_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

