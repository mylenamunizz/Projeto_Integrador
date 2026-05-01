/**
 * Integration test for CSV user import with managerEmail field
 * Tests the sanitization and two-pass manager linking logic
 * 
 * Run with: node tests/import.integration.test.js
 */

const { pool } = require('../config/db')
const bcrypt = require('bcryptjs')
const app = require('../app')
const http = require('http')

// Test configuration
const TEST_EMAIL = 'test-admin@azis.com'
const TEST_PASSWORD = 'test123456'

// Helper function to make HTTP requests
function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    }

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`
    }

    const req = http.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          })
        } catch {
          resolve({
            status: res.statusCode,
            data: data,
          })
        }
      })
    })

    req.on('error', reject)

    if (body) {
      req.write(JSON.stringify(body))
    }
    req.end()
  })
}

// Test data matching the user requirement
const testUsers = [
  {
    name: 'Linguine',
    email: 'linguine@azis.com',
    password: '123456',
    role: 'Gestor',
    position: 'Onipresente',
    points: 1213,
    managerEmail: 'linguine@azis.com',
    __row: 2,
  },
  {
    name: 'Kaua',
    email: 'kaua@azis.com',
    password: '123456',
    role: 'Funcionario',
    position: 'Fudido',
    points: 1213,
    managerEmail: 'linguine@azis.com',
    __row: 3,
  },
  {
    name: 'Karol',
    email: 'karol@azis.com',
    password: '123456',
    role: 'Funcionario',
    position: 'Fudida',
    points: 1213,
    managerEmail: 'kaua@azis.com',
    __row: 4,
  },
]

async function runTests() {
  console.log('🧪 Starting CSV Import Integration Tests\n')

  try {
    // Step 1: Create test admin user
    console.log('1️⃣  Creating test admin user...')
    const hashedPassword = await bcrypt.hash(TEST_PASSWORD, 10)
    await pool.query(
      'DELETE FROM users WHERE email = $1',
      [TEST_EMAIL]
    )
    const adminResult = await pool.query(
      'INSERT INTO users (name, email, password, role, nivel) VALUES ($1, $2, $3, $4, $5) RETURNING id, email',
      [TEST_EMAIL, TEST_EMAIL, hashedPassword, 'admin', 3]
    )
    const adminId = adminResult.rows[0].id
    console.log(`   ✓ Admin user created (ID: ${adminId})\n`)

    // Step 2: Create JWT token for test admin
    console.log('2️⃣  Generating JWT token...')
    const jwt = require('jsonwebtoken')
    const token = jwt.sign({ id: adminId, email: TEST_EMAIL, nivel: 3 }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1h',
    })
    console.log(`   ✓ Token generated\n`)

    // Step 3: Clean up test users
    console.log('3️⃣  Cleaning up existing test users...')
    await pool.query(
      'DELETE FROM users WHERE email = ANY($1)',
      [testUsers.map(u => u.email)]
    )
    console.log(`   ✓ Test users cleaned\n`)

    // Step 4: Import users via API
    console.log('4️⃣  Sending import request to API...')
    const importResponse = await makeRequest('POST', '/api/users', testUsers, token)
    
    if (importResponse.status !== 201) {
      throw new Error(`Import failed with status ${importResponse.status}: ${JSON.stringify(importResponse.data)}`)
    }

    console.log(`   ✓ Import response status: ${importResponse.status}`)
    console.log(`   ✓ Created: ${importResponse.data.cadastrados}`)
    console.log(`   ✓ Errors: ${importResponse.data.falhas}`)
    console.log(`   ✓ Warnings: ${importResponse.data.detalhes.filter(d => d.status === 'aviso').length}\n`)

    // Step 5: Validate that all 3 users were created
    console.log('5️⃣  Validating user creation...')
    const usersResult = await pool.query(
      'SELECT id, name, email, role, position, points, gestor_id FROM users WHERE email = ANY($1) ORDER BY email',
      [testUsers.map(u => u.email)]
    )

    if (usersResult.rows.length !== 3) {
      throw new Error(`Expected 3 users, but found ${usersResult.rows.length}`)
    }
    console.log(`   ✓ All 3 users created successfully\n`)

    // Step 6: Validate manager relationships
    console.log('6️⃣  Validating manager relationships...')
    const users = usersResult.rows
    const userByEmail = new Map(users.map(u => [u.email, u]))

    // Linguine should be their own manager
    const linguine = userByEmail.get('linguine@azis.com')
    if (linguine.gestor_id === null) {
      console.log('   ✓ Linguine (manager) has no manager assigned (correct)')
    } else {
      throw new Error(`Linguine should have gestor_id = null, but got ${linguine.gestor_id}`)
    }

    // Kaua should have Linguine as manager
    const kaua = userByEmail.get('kaua@azis.com')
    if (kaua.gestor_id === linguine.id) {
      console.log(`   ✓ Kaua has correct manager: Linguine (ID: ${linguine.id})`)
    } else {
      throw new Error(
        `Kaua should have gestor_id = ${linguine.id}, but got ${kaua.gestor_id}`
      )
    }

    // Karol should have Kaua as manager
    const karol = userByEmail.get('karol@azis.com')
    if (karol.gestor_id === kaua.id) {
      console.log(`   ✓ Karol has correct manager: Kaua (ID: ${kaua.id})`)
    } else {
      throw new Error(
        `Karol should have gestor_id = ${kaua.id}, but got ${karol.gestor_id}`
      )
    }
    console.log()

    // Step 7: Validate all user data
    console.log('7️⃣  Validating user data integrity...')
    for (const user of users) {
      const testUser = testUsers.find(u => u.email === user.email)
      if (user.name !== testUser.name) {
        throw new Error(`Name mismatch for ${user.email}: expected "${testUser.name}", got "${user.name}"`)
      }
      if (user.role !== testUser.role.toLowerCase()) {
        throw new Error(`Role mismatch for ${user.email}: expected "${testUser.role}", got "${user.role}"`)
      }
      if (user.position !== testUser.position) {
        throw new Error(`Position mismatch for ${user.email}: expected "${testUser.position}", got "${user.position}"`)
      }
      if (user.points !== testUser.points) {
        throw new Error(`Points mismatch for ${user.email}: expected ${testUser.points}, got ${user.points}`)
      }
    }
    console.log(`   ✓ All user data validated successfully\n`)

    console.log('✅ ALL TESTS PASSED!\n')

    // Cleanup
    await pool.query(
      'DELETE FROM users WHERE email = ANY($1)',
      [[TEST_EMAIL, ...testUsers.map(u => u.email)]]
    )

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ TEST FAILED:', error.message)
    console.error(error)

    // Cleanup on error
    try {
      await pool.query(
        'DELETE FROM users WHERE email = ANY($1)',
        [[TEST_EMAIL, ...testUsers.map(u => u.email)]]
      )
      await pool.end()
    } catch (e) {
      console.error('Cleanup error:', e)
    }

    process.exit(1)
  }
}

// Start server and run tests
const server = app.listen(3001, () => {
  console.log('📡 Test server started on port 3001\n')
  runTests()
})

server.on('error', (err) => {
  console.error('Server error:', err)
  process.exit(1)
})
