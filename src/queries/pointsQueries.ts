import { pool } from '../../backend/config/db'

export async function addPointsToUser(userId: number, points: number) {
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

    await client.query('COMMIT')

    const updated = await pool.query('SELECT total_points FROM user_points WHERE user_id = $1', [userId])
    return updated.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function getUserPoints(userId: number) {
  const result = await pool.query('SELECT total_points FROM user_points WHERE user_id = $1', [userId])
  return result.rows[0] || { total_points: 0 }
}
