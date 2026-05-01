/**
 * Script to list all users and their manager relationships
 * Run with: node scripts/list-users.js
 */

const { pool } = require('../config/db');

async function listUsers() {
  try {
    console.log('📋 Users in database:\n');

    const result = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.nivel,
        u.position,
        u.points,
        g.name AS manager_name,
        g.email AS manager_email,
        u.gestor_id
      FROM users u
      LEFT JOIN users g ON u.gestor_id = g.id
      ORDER BY u.email
    `);

    if (result.rows.length === 0) {
      console.log('   (no users found)');
      await pool.end();
      process.exit(0);
    }

    console.table(result.rows);

    // Show hierarchy
    console.log('\n📊 Organizational Hierarchy:\n');
    
    const managers = result.rows.filter(u => u.nivel >= 2);
    
    for (const manager of managers) {
      console.log(`👤 ${manager.name} (${manager.email}) - Level ${manager.nivel}`);
      const subordinates = result.rows.filter(u => u.gestor_id === manager.id);
      if (subordinates.length > 0) {
        subordinates.forEach(sub => {
          console.log(`   └─ ${sub.name} (${sub.email})`);
        });
      } else {
        console.log('   (no subordinates)');
      }
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    try {
      await pool.end();
    } catch (e) {}
    process.exit(1);
  }
}

listUsers();
