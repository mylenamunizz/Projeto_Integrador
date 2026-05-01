/**
 * Final integration test simulating complete CSV import flow
 * This tests the actual scenario described by the user
 */

const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');
const { createUsers } = require('../controllers/userController');

async function runFinalTest() {
  try {
    console.log('🧪 FINAL INTEGRATION TEST\n');
    console.log('='.repeat(60));

    // Step 1: Clean up test users
    console.log('\n1️⃣  Cleaning up existing test users...');
    const testEmails = ['linguine@azis.com', 'kaua@azis.com', 'karol@azis.com'];
    const cleanupResult = await pool.query(
      'DELETE FROM users WHERE LOWER(email) = ANY($1)',
      [testEmails]
    );
    console.log(`   ✓ Deleted ${cleanupResult.rowCount} existing test users\n`);

    // Step 2: Create admin user
    console.log('2️⃣  Creating admin user for import...');
    const adminEmail = 'admin-test@azis.com';
    await pool.query('DELETE FROM users WHERE email = $1', [adminEmail]);
    
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminResult = await pool.query(
      'INSERT INTO users (name, email, password, role, nivel) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['Test Admin', adminEmail, hashedPassword, 'admin', 3]
    );
    console.log(`   ✓ Admin created (ID: ${adminResult.rows[0].id})\n`);

    // Step 3: Prepare test data with sanitization issues
    console.log('3️⃣  Preparing test data (with trailing semicolons)...');
    const testData = [
      {
        name: 'Linguine',
        email: 'linguine@azis.com',
        password: '123456',
        role: 'Gestor',
        position: 'Onipresente',
        managerEmail: 'linguine@azis.com;;;;;;;;; ',
        __row: 2,
      },
      {
        name: 'Kaua',
        email: 'kaua@azis.com',
        password: '123456',
        role: 'Funcionario',
        position: 'Fudido',
        managerEmail: 'linguine@azis.com;;;;;;; ',
        __row: 3,
      },
      {
        name: 'Karol',
        email: 'karol@azis.com',
        password: '123456',
        role: 'Funcionario',
        position: 'Fudida',
        managerEmail: 'kaua@azis.com;;;;;;',
        __row: 4,
      },
    ];
    console.log(`   ✓ Test data ready\n`);

    // Step 4: Call createUsers
    console.log('4️⃣  Calling createUsers controller...');
    const mockReq = {
      body: testData,
      user: { id: adminResult.rows[0].id, email: adminEmail, nivel: 3 },
    };

    let statusCode = 200;
    let responseData = null;

    const mockRes = {
      status: function (code) {
        statusCode = code;
        return this;
      },
      json: function (data) {
        responseData = data;
        return this;
      },
    };

    await createUsers(mockReq, mockRes);
    console.log(`   ✓ Response status: ${statusCode}`);
    console.log(`   ✓ Created: ${responseData.cadastrados}`);
    console.log(`   ✓ Errors: ${responseData.falhas}`);
    console.log(`   ✓ Warnings: ${responseData.detalhes.filter(d => d.status === 'aviso').length}\n`);

    // Step 5: Verify users were created
    console.log('5️⃣  Verifying users in database...');
    const usersResult = await pool.query(
      'SELECT id, name, email, role, gestor_id FROM users WHERE email = ANY($1) ORDER BY email',
      [testEmails]
    );

    if (usersResult.rows.length === 3) {
      console.log(`   ✓ All 3 users created successfully\n`);
    } else {
      console.log(`   ⚠️  Only ${usersResult.rows.length} users created (expected 3)\n`);
    }

    // Step 6: Verify relationships
    console.log('6️⃣  Verifying manager relationships...');
    const userMap = new Map(usersResult.rows.map(u => [u.email, u]));
    
    const linguine = userMap.get('linguine@azis.com');
    const kaua = userMap.get('kaua@azis.com');
    const karol = userMap.get('karol@azis.com');

    let relationshipsOk = true;

    if (kaua && linguine && kaua.gestor_id === linguine.id) {
      console.log(`   ✓ Kaua → Linguine (correct)`);
    } else {
      console.log(`   ✗ Kaua → Linguine (INCORRECT)`);
      relationshipsOk = false;
    }

    if (karol && kaua && karol.gestor_id === kaua.id) {
      console.log(`   ✓ Karol → Kaua (correct)`);
    } else {
      console.log(`   ✗ Karol → Kaua (INCORRECT)`);
      relationshipsOk = false;
    }

    console.log();

    // Step 7: Show complete hierarchy
    console.log('7️⃣  Complete Organizational Structure:');
    const hierarchyResult = await pool.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        g.name AS manager_name
      FROM users u
      LEFT JOIN users g ON u.gestor_id = g.id
      WHERE u.email = ANY($1)
      ORDER BY u.email
    `, [testEmails]);

    hierarchyResult.rows.forEach(u => {
      const manager = u.manager_name ? ` → ${u.manager_name}` : ' (no manager)';
      console.log(`   ${u.name}${manager}`);
    });

    console.log('\n' + '='.repeat(60));
    if (statusCode === 201 && responseData.cadastrados === 3 && relationshipsOk) {
      console.log('\n✅ ALL TESTS PASSED! Import working correctly!\n');
    } else {
      console.log('\n❌ Some tests failed. Check output above.\n');
    }

    // Cleanup
    await pool.query('DELETE FROM users WHERE email = ANY($1)', [
      [adminEmail, ...testEmails],
    ]);
    await pool.end();
    process.exit(statusCode === 201 && responseData.cadastrados === 3 ? 0 : 1);
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.error(error);
    try {
      await pool.end();
    } catch (e) {}
    process.exit(1);
  }
}

runFinalTest();
