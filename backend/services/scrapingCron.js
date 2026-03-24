const cron = require('node-cron');
const { scrapeAndUpdatePrices } = require('./costzoneScraper');
const pool = require('../config/database');

let isRunning = false;
let cronJob = null;

/**
 * Log scraping activity to database
 */
async function logScrapingActivity(logData) {
  const connection = await pool.getConnection();
  try {
    await connection.query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    const [result] = await connection.query(`
      INSERT INTO scraping_logs (
        status, materials_updated, materials_inserted, total_materials,
        error_message, execution_time_ms, started_at, completed_at,
        triggered_by, triggered_by_user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      logData.status,
      logData.materials_updated || 0,
      logData.materials_inserted || 0,
      logData.total_materials || 0,
      logData.error_message || null,
      logData.execution_time_ms || null,
      logData.started_at || new Date(),
      logData.completed_at || new Date(),
      logData.triggered_by || 'cron',
      logData.triggered_by_user_id || null
    ]);

    return result.insertId;
  } catch (error) {
    console.error('[Cron] Error logging scraping activity:', error);
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Send notification about price updates
 */
async function sendPriceUpdateNotification(result) {
  try {
    // Log to console for now (can be extended to email/websocket/etc)
    const message = `✅ Prices Updated: ${result.totalUpdated || 0} materials updated (${result.updated || 0} updated, ${result.inserted || 0} inserted)`;
    console.log(`[Notification] ${message}`);
    
    // TODO: Add email notification or websocket notification here
    // For now, we'll just log it and store in database
    
    return true;
  } catch (error) {
    console.error('[Cron] Error sending notification:', error);
    return false;
  }
}

/**
 * Execute scraping job
 */
async function executeScraping(triggeredBy = 'cron', userId = null) {
  if (isRunning) {
    console.log('[Cron] Scraping already in progress, skipping...');
    return;
  }

  isRunning = true;
  const startTime = Date.now();
  const startedAt = new Date();
  let logId = null;

  try {
    console.log(`[Cron] Starting scraping job (triggered by: ${triggeredBy})...`);
    
    // Create log entry
    logId = await logScrapingActivity({
      status: 'success',
      started_at: startedAt,
      triggered_by: triggeredBy,
      triggered_by_user_id: userId
    });

    // Execute scraping
    const result = await scrapeAndUpdatePrices(userId);
    
    const executionTime = Date.now() - startTime;
    const completedAt = new Date();

    // Determine status
    let status = 'success';
    if (result.totalUpdated === 0) {
      status = 'partial';
    }
    if (result.error) {
      status = 'error';
    }

    // Update log entry
    const connection = await pool.getConnection();
    try {
      const updateResult = await connection.query(`
        UPDATE scraping_logs 
        SET status = ?, 
            materials_updated = ?, 
            materials_inserted = ?, 
            total_materials = ?,
            execution_time_ms = ?,
            completed_at = ?,
            error_message = ?
        WHERE id = ?
      `, [
        status,
        result.updated || 0,
        result.inserted || 0,
        result.totalUpdated || 0,
        executionTime,
        completedAt,
        result.error || null,
        logId
      ]);
      console.log(`[Cron] Updated log entry ${logId} with status: ${status}, materials: ${result.totalUpdated || 0}`);
    } catch (updateError) {
      console.error('[Cron] Error updating log entry:', updateError);
    } finally {
      connection.release();
    }

    // Send notification
    await sendPriceUpdateNotification(result);

    console.log(`[Cron] Scraping completed in ${executionTime}ms. Updated ${result.totalUpdated || 0} materials.`);
    
    return {
      success: true,
      result,
      executionTime,
      logId
    };
  } catch (error) {
    const executionTime = Date.now() - startTime;
    const completedAt = new Date();
    
    console.error('[Cron] Scraping error:', error);

    // Update log entry with error
    if (logId) {
      const connection = await pool.getConnection();
      try {
        const updateResult = await connection.query(`
          UPDATE scraping_logs 
          SET status = 'error',
              error_message = ?,
              execution_time_ms = ?,
              completed_at = ?
          WHERE id = ?
        `, [
          error.message || 'Unknown error',
          executionTime,
          completedAt,
          logId
        ]);
        console.log(`[Cron] Updated log entry ${logId} with error status`);
      } catch (updateError) {
        console.error('[Cron] Error updating log entry with error:', updateError);
      } finally {
        connection.release();
      }
    } else {
      // Create error log entry if we didn't get a logId
      try {
        await logScrapingActivity({
          status: 'error',
          started_at: startedAt,
          completed_at: completedAt,
          execution_time_ms: executionTime,
          error_message: error.message || 'Unknown error',
          triggered_by: triggeredBy,
          triggered_by_user_id: userId
        });
        console.log('[Cron] Created error log entry');
      } catch (logError) {
        console.error('[Cron] Error creating error log entry:', logError);
      }
    }

    return {
      success: false,
      error: error.message,
      executionTime
    };
  } finally {
    isRunning = false;
  }
}

/**
 * Start cron job (runs every 5 minutes)
 */
function startCronJob() {
  if (cronJob) {
    console.log('[Cron] Cron job already started');
    return;
  }

  // Run every 5 minutes: '*/5 * * * *'
  cronJob = cron.schedule('*/5 * * * *', async () => {
    await executeScraping('cron');
  }, {
    scheduled: true,
    timezone: "Asia/Karachi"
  });

  console.log('[Cron] Cron job started - will run every 5 minutes');
}

/**
 * Stop cron job
 */
function stopCronJob() {
  if (cronJob) {
    cronJob.stop();
    cronJob = null;
    console.log('[Cron] Cron job stopped');
  }
}

/**
 * Run scraping immediately (for startup or manual trigger)
 */
async function runScrapingNow(triggeredBy = 'startup', userId = null) {
  return await executeScraping(triggeredBy, userId);
}

module.exports = {
  startCronJob,
  stopCronJob,
  runScrapingNow,
  executeScraping,
  logScrapingActivity
};

