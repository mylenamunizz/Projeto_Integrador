const { pool } = require('../config/db')

async function createReward(title, description, points_cost, quantity, created_by = null) {
  try {
    const nameValue = title || description || ''
    if (!nameValue || points_cost <= 0 || quantity < 0) {
      throw new Error('Título, points_cost (>0) e quantity obrigatórios')
    }

    const result = await pool.query(
      'INSERT INTO rewards (name, title, description, points_cost, cost, quantity, active, created_by, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW()) RETURNING *',
      [nameValue, title, description || null, points_cost, points_cost, quantity, true, created_by || null]
    )
    return result.rows[0]
  } catch (error) {
    console.error('createReward query error:', error)
    throw error
  }
}

async function getAllRewardsAdmin() {
  const result = await pool.query(
    'SELECT id, COALESCE(name, title) AS name, title, description, points_cost, cost, quantity, active, created_by, created_at FROM rewards ORDER BY created_at DESC'
  )
  return result.rows
}

async function getActiveRewards() {
  const result = await pool.query(
    'SELECT id, COALESCE(name, title) AS name, title, description, points_cost, cost, quantity, active, created_by, created_at FROM rewards WHERE active = TRUE AND quantity > 0 ORDER BY points_cost ASC'
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
    let userPoints = userPointsResult.rows[0]?.total_points ?? null

    if (userPoints === null) {
      await client.query('INSERT INTO user_points (user_id, total_points, updated_at) VALUES ($1, $2, NOW())', [userId, 0])
      userPoints = 0
    }

    if (userPoints < reward.points_cost) {
      throw new Error('Saldo insuficiente')
    }

    const rewardUpdate = await client.query('UPDATE rewards SET quantity = quantity - 1 WHERE id = $1 RETURNING quantity', [rewardId])
    if (rewardUpdate.rows.length === 0) {
      throw new Error('Erro ao atualizar estoque da recompensa')
    }

    const updateUserPoints = await client.query('UPDATE user_points SET total_points = total_points - $1, updated_at = NOW() WHERE user_id = $2 RETURNING total_points', [reward.points_cost, userId])
    if (updateUserPoints.rows.length === 0) {
      throw new Error('Não foi possível atualizar pontos de usuário')
    }

    const updateUsers = await client.query('UPDATE users SET points = points - $1 WHERE id = $2 RETURNING points', [reward.points_cost, userId])
    if (updateUsers.rows.length === 0) {
      throw new Error('Não foi possível atualizar pontos no usuário')
    }

    const newTotalPoints = updateUserPoints.rows[0].total_points

    const voucherCode = `RW-${rewardId}-${userId}-${Date.now()}`

    const redemptionResult = await client.query(
      'INSERT INTO redemptions (user_id, reward_id, points_spent, cost, voucher_code, status, redeemed_at, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW()) RETURNING *',
      [userId, rewardId, reward.points_cost, reward.points_cost, voucherCode, 'completed']
    )

    await client.query('COMMIT')

    return {
      reward,
      remaining_points: newTotalPoints,
      redemption: {
        ...redemptionResult.rows[0],
        reward_name: reward.name || reward.title,
        reward_description: reward.description,
      },
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
    `SELECT
      r.*, 
      COALESCE(rew.name, rew.title) AS reward_name,
      rew.description AS reward_description
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
      WHERE u.nivel < 3
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
