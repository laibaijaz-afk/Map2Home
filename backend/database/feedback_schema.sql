-- ========================================
-- Map2Home - Feedback Table Schema
-- ========================================
-- This table stores public user feedback/reviews for the Map2Home platform

CREATE TABLE IF NOT EXISTS feedback (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Foreign key constraint
  CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) 
    REFERENCES users(id) 
    ON DELETE CASCADE,
  
  -- Indexes for better query performance
  INDEX idx_user_id (user_id),
  INDEX idx_rating (rating),
  INDEX idx_created_at (created_at DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ========================================
-- Sample Data (Optional - for testing)
-- ========================================
-- Uncomment below to insert sample feedback

/*
INSERT INTO feedback (user_id, rating, comment) VALUES
  (1, 5, 'Amazing platform! The 2D map design feature is incredibly intuitive and saved me hours of planning.'),
  (2, 4, 'Very useful for cost estimation. Would love to see more material options in the future.'),
  (3, 5, 'The 3D visualization is stunning! Really helped me understand how my home will look.'),
  (4, 5, 'Professional and easy to use. Highly recommend Map2Home for anyone planning construction.');
*/

-- ========================================
-- Useful Queries
-- ========================================

-- Get all feedback with user details
-- SELECT f.id, u.name, f.rating, f.comment, f.created_at 
-- FROM feedback f 
-- JOIN users u ON f.user_id = u.id 
-- ORDER BY f.created_at DESC;

-- Get average rating
-- SELECT AVG(rating) as average_rating FROM feedback;

-- Get feedback count by rating
-- SELECT rating, COUNT(*) as count FROM feedback GROUP BY rating ORDER BY rating DESC;
