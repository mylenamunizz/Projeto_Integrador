const { getUserBadges } = require('../controllers/badgeController')
const { pool } = require('../config/db')

async function simulate() {
    const userId = 2 // Ana
    console.log(`Simulating getUserBadges for user ID ${userId}...`)

    // Mock req/res
    const req = { user: { id: userId } }
    const res = {
        json: (data) => {
            console.log('--- API RESPONSE ---')
            console.log(JSON.stringify(data, null, 2))
            process.exit(0)
        },
        status: (code) => ({
            json: (err) => {
                console.error(`Status ${code}:`, err)
                process.exit(1)
            }
        })
    }

    try {
        await getUserBadges(req, res)
    } catch (err) {
        console.error(err)
        process.exit(1)
    }
}

simulate()
