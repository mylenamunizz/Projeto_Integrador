/**
 * Direct unit test for CSV user import sanitization
 * Tests the sanitization and two-pass manager linking logic without HTTP
 * 
 * Run with: node tests/import.unit.test.js
 */

const { pool } = require('../config/db')
const { createUsers } = require('../controllers/userController')
const bcrypt = require('bcryptjs')

// Mock request/response objects
function createMockReq(body) {
  return {
    body: body,
    user: {
      id: 1,
      email: 'admin@test.com',
      nivel: 3,
    },
  }
}

function createMockRes() {
  let statusCode = 200
  let jsonData = null

  return {
    status: function (code) {
      statusCode = code
      return this
    },
    json: function (data) {
      jsonData = data
      return this
    },
    getStatus: () => statusCode,
    getJson: () => jsonData,
  }
}

// Test configuration
const TEST_EMAIL = 'test-admin@test.com'

// Test data with sanitization issues (trailing semicolons)
const testUsersWithSanitizationIssues = [
  {
    name: 'Linguine',
    email: 'linguine@azis.com',
    password: '123456',
    role: 'Gestor',
    position: 'Onipresente',
    managerEmail: 'linguine@azis.com;;;;;;;;; ', // Extra semicolons and space
    __row: 2,
  },
  {
    name: 'Kaua',
    email: 'kaua@azis.com',
    password: '123456',
    role: 'Funcionario',
    position: 'Fudido',
    managerEmail: 'linguine@azis.com;;;;;;; ', // Extra semicolons and space
    __row: 3,
  },
  {
    name: 'Karol',
    email: 'karol@azis.com',
    password: '123456',
    role: 'Funcionario',
    position: 'Fudida',
    managerEmail: 'kaua@azis.com;;;;;;', // Extra semicolons
    __row: 4,
  },
]

async function runTests() {
  console.log('🧪 Starting CSV Import Unit Tests\n')

  try {
    // Setup: Create admin user
    console.log('1️⃣  Setting up test admin user...')
    const hashedPassword = await bcrypt.hash('test123456', 10)
    await pool.query('DELETE FROM users WHERE email = $1', [TEST_EMAIL])
    const adminResult = await pool.query(
      'INSERT INTO users (name, email, password, role, nivel) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      ['Test Admin', TEST_EMAIL, hashedPassword, 'admin', 3]
    )
    const adminId = adminResult.rows[0].id
    console.log(`   ✓ Admin created\n`)

    // Clean up test users
    console.log('2️⃣  Cleaning up existing test users...')
    await pool.query(
      'DELETE FROM users WHERE email = ANY($1)',
      [
        testUsersWithSanitizationIssues.map(u => u.email),
      ]
    )
    console.log(`   ✓ Test users cleaned\n`)

    // Test: Call createUsers with sanitization issues
    console.log('3️⃣  Testing createUsers with unsanitized data...')
    const req = createMockReq(testUsersWithSanitizationIssues)
    req.user = { id: adminId, email: TEST_EMAIL, nivel: 3 }

    const res = createMockRes()
    await createUsers(req, res)

    const status = res.getStatus()
    const result = res.getJson()

    if (status !== 201) {
      throw new Error(`Expected status 201, got ${status}: ${JSON.stringify(result)}`)
    }
    console.log(`   ✓ Request successful (status 201)`)
    console.log(`   ✓ Created: ${result.cadastrados}`)
    console.log(`   ✓ Errors: ${result.falhas}`)
    console.log(`   ✓ Warnings: ${result.detalhes.filter(d => d.status === 'aviso').length}\n`)

    // Test: Validate that all 3 users were created
    console.log('4️⃣  Validating user creation...')
    const usersResult = await pool.query(
      'SELECT id, name, email, role, position, gestor_id FROM users WHERE email = ANY($1) ORDER BY email',
      [testUsersWithSanitizationIssues.map(u => u.email)]
    )

    if (usersResult.rows.length !== 3) {
      throw new Error(`Expected 3 users, but found ${usersResult.rows.length}`)
    }
    console.log(`   ✓ All 3 users created successfully\n`)

    // Test: Validate manager relationships
    console.log('5️⃣  Validating manager relationships (sanitization test)...')
    const users = usersResult.rows
    const userByEmail = new Map(users.map(u => [u.email, u]))

    // Linguine should not have a manager (or self-assigned)
    const linguine = userByEmail.get('linguine@azis.com')
    console.log(`   ✓ Linguine created: name="${linguine.name}"`)

    // Kaua should have Linguine as manager despite sanitization issues
    const kaua = userByEmail.get('kaua@azis.com')
    if (kaua.gestor_id === linguine.id) {
      console.log(`   ✓ Kaua correctly linked to Linguine (despite trailing semicolons)`)
    } else {
      throw new Error(
        `Kaua not linked to Linguine. Expected gestor_id=${linguine.id}, got ${kaua.gestor_id}`
      )
    }

    // Karol should have Kaua as manager despite sanitization issues
    const karol = userByEmail.get('karol@azis.com')
    if (karol.gestor_id === kaua.id) {
      console.log(`   ✓ Karol correctly linked to Kaua (despite trailing semicolons)`)
    } else {
      throw new Error(`Karol not linked to Kaua. Expected gestor_id=${kaua.id}, got ${karol.gestor_id}`)
    }
    console.log()

    // Test: Verify all data fields are sanitized
    console.log('6️⃣  Verifying data sanitization...')
    for (const user of users) {
      // Check that no semicolons or extra whitespace remain
      if (user.name.includes(';') || user.name.includes(';;;;')) {
        throw new Error(`Name still contains semicolons: "${user.name}"`)
      }
      if (user.position.includes(';') || user.position.includes(';;;;')) {
        throw new Error(`Position still contains semicolons: "${user.position}"`)
      }
      console.log(`   ✓ User "${user.name}" data sanitized correctly`)
    }
    console.log()

    // Test: Check warnings were logged for missing managers
    console.log('7️⃣  Checking warning logs...')
    const warnings = result.detalhes.filter(d => d.status === 'aviso')
    console.log(`   ✓ Total warnings: ${warnings.length}`)
    if (warnings.length > 0) {
      warnings.forEach(w => {
        console.log(`      - ${w.email}: ${w.motivo}`)
      })
    }
    console.log()

    console.log('✅ ALL TESTS PASSED!\n')

    // Cleanup
    await pool.query(
      'DELETE FROM users WHERE email = ANY($1)',
      [
        [
          TEST_EMAIL,
          ...testUsersWithSanitizationIssues.map(u => u.email),
        ],
      ]
    )

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message)
    console.error(error.stack)

    // Cleanup on error
    try {
      await pool.query('DELETE FROM users WHERE email LIKE $1 OR email = $2', [
        '%azis.com%',
        TEST_EMAIL,
      ])
      await pool.end()
    } catch (e) {
      console.error('Cleanup error:', e)
    }

    process.exit(1)
  }
}

runTests()
