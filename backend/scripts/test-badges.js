const { addPointsToUser } = require('../queries/pointsQueries')
const { pool } = require('../config/db')

async function test() {
    const email = 'admin@azis.dev'
    try {
        const userResult = await pool.query('SELECT id, points FROM users WHERE email = $1', [email])
        if (userResult.rows.length === 0) {
            console.error('User not found')
            process.exit(1)
        }
        const user = userResult.rows[0]
        console.log(`User ${email} has ${user.points} points. Adding 60 points...`)

        await addPointsToUser(user.id, 60)

        console.log('Points added. Waiting for async check...')
        await new Promise(resolve => setTimeout(resolve, 2000))

        console.log('Checking user_badges...')
        const badgesResult = await pool.query('SELECT * FROM user_badges WHERE user_id = $1', [user.id])
        console.log(`User has ${badgesResult.rows.length} badges unlocked.`)
        console.log(JSON.stringify(badgesResult.rows, null, 2))

        process.exit(0)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

test()
