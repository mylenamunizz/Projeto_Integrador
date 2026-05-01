const { pool } = require('../config/db')

async function dump() {
    try {
        const { rows: users } = await pool.query('SELECT id, email, name, points FROM users LIMIT 10')
        console.log('--- DATABASE DUMP (FIRST 10 USERS) ---')
        users.forEach(u => console.log(`ID:${u.id} | EMAIL:${u.email} | NAME:${u.name} | POINTS:${u.points}`))

        const { rows: ana } = await pool.query('SELECT id, email, name, points FROM users WHERE email = \'ana@azis.com\'')
        console.log('--- TARGET USER (ANA) ---')
        ana.forEach(u => console.log(`ID:${u.id} | EMAIL:${u.email} | NAME:${u.name} | POINTS:${u.points}`))

        process.exit(0)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

dump()
