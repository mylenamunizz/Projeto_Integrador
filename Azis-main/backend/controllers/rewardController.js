const rewardsQueries = require('../queries/rewardsQueries')

async function getRewards(req, res) {
  try {
    const rewards = await rewardsQueries.getActiveRewards()
    return res.status(200).json({ rewards })
  } catch (error) {
    console.error('getRewards error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

async function createReward(req, res) {
  try {
    const { title, description, points_cost, quantity } = req.body

    if (!title || typeof points_cost !== 'number' || points_cost <= 0 || typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ error: 'Dados inválidos para criar recompensa' })
    }

    const reward = await rewardsQueries.createReward(title, description, points_cost, quantity, req.user.id)

    return res.status(201).json({ message: 'Recompensa criada com sucesso', reward })
  } catch (error) {
    console.error('createReward error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

async function redeemReward(req, res) {
  try {
    const { id: rewardId } = req.params
    const userId = req.user.id

    const result = await rewardsQueries.redeemReward(userId, Number(rewardId))

    return res.status(201).json({
      message: 'Recompensa resgatada com sucesso',
      ...result,
    })
  } catch (error) {
    console.error('redeemReward error:', error)
    if (error.message.includes('não encontrada') || error.message.includes('inativa')) {
      return res.status(404).json({ error: error.message })
    }
    if (error.message.includes('Saldo insuficiente') || error.message.includes('estoque')) {
      return res.status(400).json({ error: error.message })
    }
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

    if (reward.stock <= 0) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Recompensa sem estoque disponível' })
    }

    const userResult = await client.query('SELECT id, points FROM users WHERE id = $1 FOR UPDATE', [userId])
    const user = userResult.rows[0]

    if (!user) {
      await client.query('ROLLBACK')
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    if (user.points < reward.cost) {
      await client.query('ROLLBACK')
      return res.status(400).json({ error: 'Saldo insuficiente para resgatar essa recompensa' })
    }

    await client.query('UPDATE users SET points = points - $1 WHERE id = $2', [reward.cost, userId])
    await client.query('UPDATE rewards SET stock = stock - 1 WHERE id = $1', [rewardId])

    const userUpdatedResult = await client.query('SELECT points FROM users WHERE id = $1', [userId])
    const userPoints = userUpdatedResult.rows[0]?.points || 0

    const voucherCode = `${rewardId}-${userId}-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`

    const redemptionResult = await client.query(
      'INSERT INTO redemptions (reward_id, user_id, cost, voucher_code, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [rewardId, userId, reward.cost, voucherCode, 'completed']
    )

    await client.query('COMMIT')

    return res.status(201).json({
      message: 'Recompensa resgatada com sucesso',
      redemption: redemptionResult.rows[0],
      userPoints,
    })
  } catch (error) {
    await client.query('ROLLBACK')
    console.error('redeemReward error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  } finally {
    client.release()
  }
}

async function getRedemptions(req, res) {
  try {
    const userId = req.user.id
    const redemptions = await rewardsQueries.getMyRedemptions(userId)
    return res.status(200).json({ redemptions })
  } catch (error) {
    console.error('getRedemptions error:', error)
    return res.status(500).json({ error: 'Erro interno do servidor' })
  }
}

module.exports = {
  getRewards,
  createReward,
  redeemReward,
  getRedemptions,
}
