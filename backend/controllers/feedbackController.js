const pool = require('../config/database');

/**
 * Add Feedback
 * POST /api/feedback/add
 * Protected route - requires authentication
 */
const addFeedback = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const userId = req.userId; // From JWT auth middleware

    console.log('[feedbackController.addFeedback] user:', userId, 'rating:', rating);

    // Validation
    if (!rating || !comment) {
      return res.status(400).json({ 
        success: false,
        error: 'Rating and comment are required' 
      });
    }

    // Validate rating range (1-5)
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ 
        success: false,
        error: 'Rating must be between 1 and 5' 
      });
    }

    // Validate comment length
    if (comment.trim().length < 10) {
      return res.status(400).json({ 
        success: false,
        error: 'Comment must be at least 10 characters long' 
      });
    }

    if (comment.length > 1000) {
      return res.status(400).json({ 
        success: false,
        error: 'Comment cannot exceed 1000 characters' 
      });
    }

    const connection = await pool.getConnection();

    try {
      // Check if user has already submitted feedback
      const [existingFeedback] = await connection.query(
        'SELECT id FROM feedback WHERE user_id = ?',
        [userId]
      );

      if (existingFeedback.length > 0) {
        // Update existing feedback
        await connection.query(
          'UPDATE feedback SET rating = ?, comment = ?, updated_at = NOW() WHERE user_id = ?',
          [ratingNum, comment.trim(), userId]
        );

        console.log('[feedbackController.addFeedback] feedback updated for user:', userId);

        connection.release();

        return res.status(200).json({
          success: true,
          message: 'Feedback updated successfully'
        });
      } else {
        // Insert new feedback
        const [result] = await connection.query(
          'INSERT INTO feedback (user_id, rating, comment) VALUES (?, ?, ?)',
          [userId, ratingNum, comment.trim()]
        );

        console.log('[feedbackController.addFeedback] new feedback created with id:', result.insertId);

        connection.release();

        return res.status(201).json({
          success: true,
          message: 'Feedback submitted successfully',
          feedbackId: result.insertId
        });
      }
    } catch (dbError) {
      connection.release();
      throw dbError;
    }
  } catch (error) {
    console.error('[feedbackController.addFeedback] error:', error.message);
    next(error);
  }
};

/**
 * Get All Public Feedback
 * GET /api/feedback/all
 * Public route - no authentication required
 */
const getAllFeedback = async (req, res, next) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Get all feedback with user details, ordered by most recent
      const [feedbackList] = await connection.query(
        `SELECT 
          f.id,
          f.rating,
          f.comment,
          f.created_at,
          u.name,
          u.email
        FROM feedback f
        INNER JOIN users u ON f.user_id = u.id
        WHERE u.is_verified = true
        ORDER BY f.created_at DESC
        LIMIT 100`,
        []
      );

      connection.release();

      // Format the response
      const formattedFeedback = feedbackList.map(item => ({
        id: item.id,
        name: item.name,
        rating: item.rating,
        comment: item.comment,
        created_at: item.created_at
      }));

      console.log('[feedbackController.getAllFeedback] returned', formattedFeedback.length, 'feedback items');

      return res.status(200).json({
        success: true,
        count: formattedFeedback.length,
        feedback: formattedFeedback
      });
    } catch (dbError) {
      connection.release();
      throw dbError;
    }
  } catch (error) {
    console.error('[feedbackController.getAllFeedback] error:', error.message);
    next(error);
  }
};

/**
 * Get Feedback Statistics
 * GET /api/feedback/stats
 * Public route - no authentication required
 */
const getFeedbackStats = async (req, res, next) => {
  try {
    const connection = await pool.getConnection();

    try {
      // Get average rating and total count
      const [stats] = await connection.query(
        `SELECT 
          COUNT(*) as total_feedback,
          AVG(rating) as average_rating,
          SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) as five_star,
          SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) as four_star,
          SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) as three_star,
          SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) as two_star,
          SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) as one_star
        FROM feedback`,
        []
      );

      connection.release();

      return res.status(200).json({
        success: true,
        stats: {
          total: stats[0].total_feedback,
          average: parseFloat(stats[0].average_rating || 0).toFixed(1),
          distribution: {
            5: stats[0].five_star,
            4: stats[0].four_star,
            3: stats[0].three_star,
            2: stats[0].two_star,
            1: stats[0].one_star
          }
        }
      });
    } catch (dbError) {
      connection.release();
      throw dbError;
    }
  } catch (error) {
    console.error('[feedbackController.getFeedbackStats] error:', error.message);
    next(error);
  }
};

/**
 * Get User's Own Feedback
 * GET /api/feedback/my-feedback
 * Protected route - requires authentication
 */
const getMyFeedback = async (req, res, next) => {
  try {
    const userId = req.userId;

    const connection = await pool.getConnection();

    try {
      const [feedback] = await connection.query(
        'SELECT id, rating, comment, created_at, updated_at FROM feedback WHERE user_id = ?',
        [userId]
      );

      connection.release();

      if (feedback.length === 0) {
        return res.status(200).json({
          success: true,
          feedback: null,
          message: 'No feedback submitted yet'
        });
      }

      return res.status(200).json({
        success: true,
        feedback: feedback[0]
      });
    } catch (dbError) {
      connection.release();
      throw dbError;
    }
  } catch (error) {
    console.error('[feedbackController.getMyFeedback] error:', error.message);
    next(error);
  }
};

module.exports = {
  addFeedback,
  getAllFeedback,
  getFeedbackStats,
  getMyFeedback
};
