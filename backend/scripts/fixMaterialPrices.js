const pool = require('../config/database');
require('dotenv').config();

async function fixMaterialPrices() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Fixing material prices and units...');
    
    // Fix Bricks - should be Rs 13-20 per piece, not 15500
    await connection.query(
      'UPDATE materials SET cost_per_unit = 17, unit = ? WHERE name = ? AND (cost_per_unit > 100 OR unit != ?)',
      ['piece', 'Bricks', 'piece']
    );
    console.log('✓ Fixed Bricks: Rs 17 per piece');
    
    // Fix Steel - should be Rs 250,000 per ton, not 234
    await connection.query(
      'UPDATE materials SET cost_per_unit = 250000, unit = ? WHERE name = ? AND (cost_per_unit < 100000 OR unit != ?)',
      ['ton', 'Steel', 'ton']
    );
    console.log('✓ Fixed Steel: Rs 250,000 per ton');
    
    // Fix Gravel - should be Rs 8,000 per truck, not 149
    await connection.query(
      'UPDATE materials SET cost_per_unit = 8000, unit = ? WHERE name = ? AND (cost_per_unit < 1000 OR unit != ?)',
      ['truck', 'Gravel', 'truck']
    );
    console.log('✓ Fixed Gravel: Rs 8,000 per truck');
    
    // Ensure Cement unit is 'bag'
    await connection.query(
      'UPDATE materials SET unit = ? WHERE name = ? AND unit != ?',
      ['bag', 'Cement', 'bag']
    );
    console.log('✓ Verified Cement unit: bag');
    
    // Ensure Sand unit is 'truck'
    await connection.query(
      'UPDATE materials SET unit = ? WHERE name = ? AND unit != ?',
      ['truck', 'Sand', 'truck']
    );
    console.log('✓ Verified Sand unit: truck');
    
    // Ensure Paint unit is 'liter'
    await connection.query(
      'UPDATE materials SET unit = ? WHERE name = ? AND unit != ?',
      ['liter', 'Paint', 'liter']
    );
    console.log('✓ Verified Paint unit: liter');
    
    // Ensure Tiles unit is 'sqm'
    await connection.query(
      'UPDATE materials SET unit = ? WHERE name = ? AND unit != ?',
      ['sqm', 'Tiles', 'sqm']
    );
    console.log('✓ Verified Tiles unit: sqm');
    
    // Show final materials
    const [materials] = await connection.query(
      'SELECT name, cost_per_unit, unit FROM materials WHERE is_active = TRUE ORDER BY name'
    );
    
    console.log('\nFinal materials with correct prices and units:');
    materials.forEach(m => {
      console.log(`  ${m.name}: Rs ${m.cost_per_unit} per ${m.unit}`);
    });
    
  } catch (error) {
    console.error('Error fixing material prices:', error);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
}

fixMaterialPrices();

