import { pool } from '../../backend/config/db'

export async function createReward(title: string, description: string, points_cost: number, quantity: number, created_by: number | null = null) {
  const result = await pool.query(
    'INSERT INTO rewards (title, description, points_cost, quantity, active, created_by) VALUES ($1, $2, $3, $4, TRUE, $5) RETURNING *',
    [title, description || null, points_cost, quantity, created_by]
  )
  return result.rows[0]
}

export async function getAllRewardsAdmin() {
  const result = await pool.query('SELECT * FROM rewards ORDER BY created_at DESC')
  return result.rows
}

export async function getActiveRewards() {
  const result = await pool.query('SELECT * FROM rewards WHERE active = TRUE AND quantity > 0 ORDER BY points_cost ASC')
  return result.rows
}

export async function getRewardById(rewardId: number) {
  const result = await pool.query('SELECT * FROM rewards WHERE id = $1', [rewardId])
  return result.rows[0]
}

export async function updateReward(rewardId: number, fields: { title?: string; description?: string; points_cost?: number; quantity?: number; active?: boolean }) {
  const updates: string[] = []
  const values: any[] = []
  let idx = 1

  if (fields.title !== undefined) {
    updates.push(`title = $${idx++}`)
    values.push(fields.title)
  }
  if (fields.description !== undefined) {
    updates.push(`description = $${idx++}`)
    values.push(fields.description)
  }
  if (fields.points_cost !== undefined) {
    updates.push(`points_cost = $${idx++}`)
    values.push(fields.points_cost)
  }
  if (fields.quantity !== undefined) {
    updates.push(`quantity = $${idx++}`)
    values.push(fields.quantity)
  }
  if (fields.active !== undefined) {
    updates.push(`active = $${idx++}`)
    values.push(fields.active)
  }

  if (!updates.length) {
    throw new Error('Nenhum campo para atualizar')
  }

  values.push(rewardId)
  const query = `UPDATE rewards SET ${updates.join(', ')}, created_at = created_at WHERE id = $${idx} RETURNING *`
  const result = await pool.query(query, values)
  return result.rows[0]
}

export async function toggleReward(rewardId: number) {
  const result = await pool.query(
    'UPDATE rewards SET active = NOT active WHERE id = $1 RETURNING *',
    [rewardId]
  )
  return result.rows[0]
}

export async function deleteReward(rewardId: number) {
  const result = await pool.query('DELETE FROM rewards WHERE id = $1 RETURNING *', [rewardId])
  return result.rows[0]
}

export async function redeemReward(userId: number, rewardId: number) {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

    const rewardResult = await client.query('SELECT * FROM rewards WHERE id = $1 FOR UPDATE', [rewardId])
    const reward = rewardResult.rows[0]

    if (!reward || !reward.active) {
      throw new Error('Recompensa não encontrada ou inativa')
    }

    if (reward.quantity <= 0) {
      throw new Error('Recompensa sem estoque disponível')
    }

    const userPointsResult = await client.query('SELECT total_points FROM user_points WHERE user_id = $1 FOR UPDATE', [userId])
    const userPoints = userPointsResult.rows[0]?.total_points || 0

    if (userPoints < reward.points_cost) {
      throw new Error('Saldo insuficiente')
    }

    await client.query('UPDATE rewards SET quantity = quantity - 1 WHERE id = $1', [rewardId])

    if (userPointsResult.rows.length > 0) {
      await client.query('UPDATE user_points SET total_points = total_points - $1, updated_at = NOW() WHERE user_id = $2', [reward.points_cost, userId])
    } else {
      throw new Error('Saldo insuficiente ou registro de pontos inválido')
    }

    await client.query('INSERT INTO redemptions (user_id, reward_id, points_spent, redeemed_at) VALUES ($1, $2, $3, NOW())', [userId, rewardId, reward.points_cost])

    await client.query('COMMIT')

    return {
      reward: reward,
      remaining_points: userPoints - reward.points_cost,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function getMyRedemptions(userId: number) {
  const result = await pool.query(
    `SELECT r.*, rew.title, rew.description
      FROM redemptions r
      JOIN rewards rew ON r.reward_id = rew.id
      WHERE r.user_id = $1
      ORDER BY r.redeemed_at DESC`,
    [userId]
  )
  return result.rows
}

export async function getLeaderboard(limit = 10) {
  const result = await pool.query(
    `SELECT u.id AS user_id, u.name, COALESCE(up.total_points, 0) AS total_points
      FROM users u
      LEFT JOIN user_points up ON u.id = up.user_id
      ORDER BY total_points DESC
      LIMIT $1`,
    [limit]
  )
  return result.rows
}

export async function getUserPoints(userId: number) {
  const result = await pool.query('SELECT total_points FROM user_points WHERE user_id = $1', [userId])
  return result.rows[0] || { total_points: 0 }
}
