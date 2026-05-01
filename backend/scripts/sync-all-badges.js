const { checkAndUnlockBadges } = require('../controllers/badgeController')
const { pool } = require('../config/db')

async function sync() {
    try {
        const { rows: users } = await pool.query('SELECT id, email, points FROM users WHERE email = \'ana@azis.com\'')
        console.log(`Syncing badges for ${users.length} users...`)

        for (const user of users) {
            console.log(`DEBUG: User ${user.email} ID=${user.id} Points=${user.points} Type=${typeof user.points}`)
            console.log(`Checking user ${user.email} (${user.points} pts)...`)
            await checkAndUnlockBadges(user.id, user.points)

            const { rows: test } = await pool.query('SELECT * FROM user_badges WHERE user_id = $1', [user.id])
            console.log(`DEBUG: User ${user.email} now has ${test.length} badges in user_badges table.`)
        }

        console.log('Sync complete!')
        process.exit(0)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

sync()
