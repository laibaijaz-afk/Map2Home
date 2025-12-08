const pool = require('../config/database');
require('dotenv').config();

async function updateDescriptions() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query(
      'UPDATE materials SET description = ? WHERE name = ?',
      ['Cement (Maple Leaf, DG, Bestway, etc.)', 'Cement']
    );
    
    await connection.query(
      'UPDATE materials SET description = ? WHERE name = ?',
      ['Steel bars/Sariya for reinforcement', 'Steel']
    );
    
    await connection.query(
      'UPDATE materials SET description = ? WHERE name = ?',
      ['Red bricks/Clay bricks', 'Bricks']
    );
    
    await connection.query(
      'UPDATE materials SET description = ? WHERE name = ?',
      ['Sand/Rait for construction', 'Sand']
    );
    
    await connection.query(
      'UPDATE materials SET description = ? WHERE name = ?',
      ['Crush/Bajri for construction', 'Gravel']
    );
    
    await connection.query(
      'UPDATE materials SET description = ? WHERE name = ?',
      ['Ceramic tiles', 'Tiles']
    );
    
    await connection.query(
      'UPDATE materials SET description = ? WHERE name = ?',
      ['Paint (Berger, Nippon, Dulux, etc.)', 'Paint']
    );
    
    console.log('✓ All descriptions updated');
    
    const [materials] = await connection.query(
      'SELECT name, cost_per_unit, unit, description FROM materials WHERE is_active = TRUE ORDER BY name'
    );
    
    console.log('\nFinal materials:');
    materials.forEach(m => {
      console.log(`  ${m.name}: Rs ${m.cost_per_unit} per ${m.unit} - ${m.description}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
}

updateDescriptions();

