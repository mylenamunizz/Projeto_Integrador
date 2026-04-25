/**
 * Script to clean up test users from the database
 * Run with: node scripts/cleanup-test-users.js
 */

const { pool } = require('../config/db');

async function cleanupTestUsers() {
  try {
    console.log('🧹 Cleaning up test users...\n');

    // List of test user emails to delete
    const testEmails = [
      'linguine@azis.com',
      'kaua@azis.com',
      'karol@azis.com',
      'test-admin@azis.com',
      'test-admin@test.com',
    ];

    // Delete test users
    const result = await pool.query(
      'DELETE FROM users WHERE LOWER(email) = ANY($1)',
      [testEmails.map(e => e.toLowerCase())]
    );

    console.log(`✅ Deleted ${result.rowCount} test user(s)\n`);

    // Show remaining users
    const remainingUsers = await pool.query(
      'SELECT id, name, email, role, nivel FROM users ORDER BY email'
    );

    console.log(`📊 Remaining users in database (${remainingUsers.rows.length}):`);
    if (remainingUsers.rows.length > 0) {
      console.table(remainingUsers.rows);
    } else {
      console.log('   (no users)');
    }

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    try {
      await pool.end();
    } catch (e) {}
    process.exit(1);
  }
}

cleanupTestUsers();
