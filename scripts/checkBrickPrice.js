/**
 * Script to check if brick price in database is scraped or fallback
 * Run with: node scripts/checkBrickPrice.js
 */

require('dotenv').config();
const pool = require('../config/database');

async function checkBrickPrice() {
  const connection = await pool.getConnection();
  
  try {
    console.log('=== Checking Brick Price Source ===\n');
    
    // Check if columns exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'materials'
      AND COLUMN_NAME IN ('source_url', 'last_scraped_at', 'description')
    `);
    
    const columnNames = columns.map(c => c.COLUMN_NAME);
    const hasSourceUrl = columnNames.includes('source_url');
    const hasLastScraped = columnNames.includes('last_scraped_at');
    const hasDescription = columnNames.includes('description');
    
    console.log('Available columns:');
    console.log(`  - source_url: ${hasSourceUrl ? 'YES' : 'NO'}`);
    console.log(`  - last_scraped_at: ${hasLastScraped ? 'YES' : 'NO'}`);
    console.log(`  - description: ${hasDescription ? 'YES' : 'NO'}\n`);
    
    // Build query based on available columns
    let selectFields = 'name, cost_per_unit, unit, updated_at';
    if (hasSourceUrl) selectFields += ', source_url';
    if (hasLastScraped) selectFields += ', last_scraped_at';
    if (hasDescription) selectFields += ', description';
    
    const [bricks] = await connection.query(`
      SELECT ${selectFields}
      FROM materials 
      WHERE LOWER(name) = LOWER('Bricks') 
      AND is_active = TRUE
      LIMIT 1
    `);
    
    if (bricks.length === 0) {
      console.log('❌ No brick record found in database!');
      return;
    }
    
    const brick = bricks[0];
    
    console.log('=== Brick Price Information ===');
    console.log(`Name: ${brick.name}`);
    console.log(`Price: Rs ${brick.cost_per_unit} per ${brick.unit}`);
    console.log(`Last Updated: ${brick.updated_at}`);
    
    if (hasLastScraped) {
      console.log(`Last Scraped: ${brick.last_scraped_at || 'NULL (Never scraped)'}`);
    }
    
    if (hasSourceUrl) {
      console.log(`Source URL: ${brick.source_url || 'NULL'}`);
    }
    
    if (hasDescription) {
      console.log(`Description: ${brick.description || 'NULL'}`);
    }
    
    console.log('\n=== Analysis ===');
    
    // Determine if it's scraped or fallback
    let isScraped = false;
    let indicators = [];
    
    if (hasLastScraped && brick.last_scraped_at) {
      isScraped = true;
      indicators.push(`✓ last_scraped_at is set (${brick.last_scraped_at})`);
    } else if (hasLastScraped) {
      indicators.push('✗ last_scraped_at is NULL');
    }
    
    if (hasSourceUrl) {
      if (brick.source_url && brick.source_url.includes('costzone.org') && !brick.source_url.includes('fallback')) {
        isScraped = true;
        indicators.push(`✓ source_url points to actual website: ${brick.source_url}`);
      } else if (brick.source_url && brick.source_url.includes('fallback')) {
        indicators.push(`✗ source_url indicates fallback: ${brick.source_url}`);
      } else if (!brick.source_url) {
        indicators.push('✗ source_url is NULL');
      }
    }
    
    if (hasDescription) {
      if (brick.description && brick.description.includes('fallback')) {
        indicators.push(`✗ description indicates fallback: ${brick.description}`);
      } else if (brick.description && brick.description.includes('Scraped from')) {
        isScraped = true;
        indicators.push(`✓ description indicates scraped: ${brick.description}`);
      }
    }
    
    // Check if price matches fallback value
    const fallbackPrice = 17;
    if (parseFloat(brick.cost_per_unit) === fallbackPrice) {
      indicators.push(`⚠ Price matches fallback value (Rs ${fallbackPrice})`);
    }
    
    console.log(indicators.join('\n'));
    
    console.log('\n=== Conclusion ===');
    if (isScraped) {
      console.log('✅ BRICK PRICE WAS SCRAPED from website');
      if (hasLastScraped && brick.last_scraped_at) {
        console.log(`   Last scraped: ${brick.last_scraped_at}`);
      }
    } else {
      console.log('❌ BRICK PRICE IS FALLBACK (not scraped)');
      console.log('   The value Rs 17 is a hardcoded fallback price.');
      console.log('   This means the scraper could not extract prices from the website.');
    }
    
    // Check recent scraping logs
    console.log('\n=== Recent Scraping Activity ===');
    try {
      // First check what columns exist in scraping_logs
      const [logColumns] = await connection.query(`
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'scraping_logs'
      `);
      
      const logColumnNames = logColumns.map(c => c.COLUMN_NAME);
      console.log(`Available log columns: ${logColumnNames.join(', ')}\n`);
      
      let selectFields = 'triggered_by, status, started_at';
      if (logColumnNames.includes('materials_updated')) selectFields += ', materials_updated';
      if (logColumnNames.includes('materials_inserted')) selectFields += ', materials_inserted';
      if (logColumnNames.includes('total_materials')) selectFields += ', total_materials';
      if (logColumnNames.includes('error_message')) selectFields += ', error_message';
      if (logColumnNames.includes('execution_time_ms')) selectFields += ', execution_time_ms';
      
      const [logs] = await connection.query(`
        SELECT ${selectFields}
        FROM scraping_logs
        ORDER BY started_at DESC
        LIMIT 5
      `);
      
      if (logs.length > 0) {
        console.log(`Found ${logs.length} recent scraping log(s):\n`);
        logs.forEach((log, index) => {
          console.log(`${index + 1}. ${log.started_at} - ${log.triggered_by}`);
          console.log(`   Status: ${log.status}`);
          if (log.materials_updated !== undefined) {
            console.log(`   Materials updated: ${log.materials_updated}`);
          }
          if (log.materials_inserted !== undefined) {
            console.log(`   Materials inserted: ${log.materials_inserted}`);
          }
          if (log.total_materials !== undefined) {
            console.log(`   Total materials: ${log.total_materials}`);
          }
          if (log.error_message) {
            console.log(`   Error: ${log.error_message}`);
          }
          if (log.execution_time_ms) {
            console.log(`   Execution time: ${log.execution_time_ms}ms`);
          }
          console.log('');
        });
      } else {
        console.log('No scraping logs found.');
      }
    } catch (err) {
      console.log('Could not fetch scraping logs:', err.message);
      console.log('Error details:', err);
    }
    
  } catch (error) {
    console.error('Error checking brick price:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

checkBrickPrice();

