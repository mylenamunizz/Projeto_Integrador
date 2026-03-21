const { pool } = require('../config/db')

async function createReward(title, description, points_cost, quantity, created_by = null) {
  try {
    if (!title || points_cost <= 0 || quantity < 0) {
      throw new Error('Título, pontos_cost (>0) e quantidade obrigatórios')
    }

    const result = await pool.query(
      'INSERT INTO rewards (title, name, description, points_cost, cost, quantity, stock, active, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) RETURNING *',
      [title, title, description || null, points_cost, points_cost, quantity, quantity, true, created_by || null]
    )
    return result.rows[0]
  } catch (error) {
    console.error('createReward query error:', error)
    throw error
  }
}

async function getAllRewardsAdmin() {
  const result = await pool.query(
    'SELECT id, title, description, points_cost, quantity, active, created_by, created_at FROM rewards ORDER BY created_at DESC'
  )
  return result.rows
}

async function getActiveRewards() {
  const result = await pool.query(
    'SELECT id, title, description, points_cost, quantity, active, created_by, created_at FROM rewards WHERE active = TRUE AND quantity > 0 ORDER BY points_cost ASC'
  )
  return result.rows
}

async function getRewardById(rewardId) {
  const result = await pool.query('SELECT * FROM rewards WHERE id = $1', [rewardId])
  return result.rows[0]
}

async function updateReward(rewardId, fields) {
  const updates = []
  const values = []
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

async function toggleReward(rewardId) {
  const result = await pool.query('UPDATE rewards SET active = NOT active WHERE id = $1 RETURNING *', [rewardId])
  return result.rows[0]
}

async function deleteReward(rewardId) {
  const result = await pool.query('DELETE FROM rewards WHERE id = $1 RETURNING *', [rewardId])
  return result.rows[0]
}

async function redeemReward(userId, rewardId) {
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
    await client.query('UPDATE user_points SET total_points = total_points - $1, updated_at = NOW() WHERE user_id = $2', [reward.points_cost, userId])

    await client.query('INSERT INTO redemptions (user_id, reward_id, points_spent, redeemed_at) VALUES ($1, $2, $3, NOW())', [userId, rewardId, reward.points_cost])

    await client.query('COMMIT')

    return {
      reward,
      remaining_points: userPoints - reward.points_cost,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

async function getMyRedemptions(userId) {
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

async function getLeaderboard(limit = 10) {
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

async function getUserPoints(userId) {
  const result = await pool.query('SELECT total_points FROM user_points WHERE user_id = $1', [userId])
  return result.rows[0] || { total_points: 0 }
}

module.exports = {
  createReward,
  getAllRewardsAdmin,
  getActiveRewards,
  getRewardById,
  updateReward,
  toggleReward,
  deleteReward,
  redeemReward,
  getMyRedemptions,
  getLeaderboard,
  getUserPoints,
}
