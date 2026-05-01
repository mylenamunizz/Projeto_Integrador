const { pool } = require('../config/db')
const { checkAndUnlockBadges } = require('../controllers/badgeController')

async function addPointsToUser(userId, points) {
  if (!userId || points <= 0) {
    throw new Error('Parâmetros inválidos para addPointsToUser')
  }

  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const userPointsResult = await client.query('SELECT total_points FROM user_points WHERE user_id = $1 FOR UPDATE', [userId])

    if (userPointsResult.rows.length > 0) {
      await client.query('UPDATE user_points SET total_points = total_points + $1, updated_at = NOW() WHERE user_id = $2', [points, userId])
    } else {
      await client.query('INSERT INTO user_points (user_id, total_points, updated_at) VALUES ($1, $2, NOW())', [userId, points])
    }

    // O trigger trg_sync_user_points já sincroniza automaticamente
    // Não é necessário fazer UPDATE manual aqui - isso causaria duplicação
    // A tabela user_points é a fonte da verdade, e o trigger mantém users.points sincronizado

    await client.query('COMMIT')

    const updated = await pool.query('SELECT total_points FROM user_points WHERE user_id = $1', [userId])
    const newTotalPoints = updated.rows[0].total_points

    // Verificar novos selos de forma assíncrona (não bloqueante)
    checkAndUnlockBadges(userId, newTotalPoints).catch(err => console.error('[Badges] Error in background check:', err))

    return updated.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function getUserPoints(userId) {
  const result = await pool.query('SELECT total_points FROM user_points WHERE user_id = $1', [userId])
  return result.rows[0] || { total_points: 0 }
}

module.exports = {
  addPointsToUser,
  getUserPoints,
}
