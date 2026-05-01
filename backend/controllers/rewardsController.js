const { pool } = require('../config/db')
const rewardsQueries = require('../queries/rewardsQueries')

async function getAllRewardsAdmin(req, res) {
  try {
    const rewards = await rewardsQueries.getAllRewardsAdmin()
    return res.status(200).json({ message: 'Recompensas listadas (admin)', data: rewards })
  } catch (error) {
    console.error('getAllRewardsAdmin error:', error)
    return res.status(500).json({ message: 'Erro interno', data: null })
  }
}

async function getActiveRewards(req, res) {
  try {
    const rewards = await rewardsQueries.getActiveRewards()
    return res.status(200).json({ message: 'Recompensas ativas listadas', data: rewards })
  } catch (error) {
    console.error('getActiveRewards error:', error)
    return res.status(500).json({ message: 'Erro interno', data: null })
  }
}

async function createReward(req, res) {
  try {
    const { title, description, points_cost, quantity } = req.body

    if (!title || typeof points_cost !== 'number' || points_cost <= 0 || typeof quantity !== 'number' || quantity < 0) {
      return res.status(400).json({ message: 'Dados inválidos: título, custo (>0) e quantidade são obrigatórios', data: null })
    }

    const reward = await rewardsQueries.createReward(title, description, points_cost, quantity, req.user?.id || null)
    return res.status(201).json({ message: 'Recompensa criada com sucesso', data: reward })
  } catch (error) {
    console.error('createReward error:', error)
    return res.status(500).json({ message: error.message || 'Erro ao criar recompensa', data: null })
  }
}

async function updateReward(req, res) {
  try {
    const rewardId = Number(req.params.id)
    const fields = req.body

    if (!rewardId) {
      return res.status(400).json({ message: 'ID inválido', data: null })
    }

    const reward = await rewardsQueries.updateReward(rewardId, fields)
    return res.status(200).json({ message: 'Recompensa atualizada', data: reward })
  } catch (error) {
    console.error('updateReward error:', error)
    return res.status(500).json({ message: 'Erro interno', data: null })
  }
}

async function toggleReward(req, res) {
  try {
    const rewardId = Number(req.params.id)
    if (!rewardId) {
      return res.status(400).json({ message: 'ID inválido', data: null })
    }
    const reward = await rewardsQueries.toggleReward(rewardId)
    return res.status(200).json({ message: 'Recompensa alternada (ativo/inativo)', data: reward })
  } catch (error) {
    console.error('toggleReward error:', error)
    return res.status(500).json({ message: 'Erro interno', data: null })
  }
}

async function deleteReward(req, res) {
  try {
    const rewardId = Number(req.params.id)
    if (!rewardId) {
      return res.status(400).json({ message: 'ID inválido', data: null })
    }

    const redemptionCountResult = await pool.query('SELECT count(*) AS count FROM redemptions WHERE reward_id = $1', [rewardId])
    const redemptionCount = Number(redemptionCountResult.rows[0]?.count ?? 0)

    if (redemptionCount > 0) {
      return res.status(400).json({ message: 'Não é possível excluir recompensa com resgates existentes', data: null })
    }

    const reward = await rewardsQueries.deleteReward(rewardId)
    if (!reward) {
      return res.status(404).json({ message: 'Recompensa não encontrada', data: null })
    }

    return res.status(200).json({ message: 'Recompensa excluída', data: reward })
  } catch (error) {
    console.error('deleteReward error:', error)
    return res.status(500).json({ message: 'Erro interno', data: null })
  }
}

async function redeemReward(req, res) {
  try {
    const rewardId = Number(req.params.id)
    const userId = req.user.id

    if (!rewardId || !userId) {
      return res.status(400).json({ message: 'Dados inválidos', data: null })
    }

    const result = await rewardsQueries.redeemReward(userId, rewardId)
    return res.status(201).json({ message: 'Recompensa resgatada com sucesso', data: result })
  } catch (error) {
    console.error('redeemReward error:', error)
    if (error?.message?.includes('Saldo insuficiente') || error?.message?.includes('sem estoque')) {
      return res.status(400).json({ message: error.message, data: null })
    } else if (error?.message?.includes('não encontrada') || error?.message?.includes('inativa')) {
      return res.status(404).json({ message: error.message, data: null })
    }

    // Retornar detalhe extra em dev para identificar falha exata
    return res.status(500).json({ message: `Erro interno: ${error?.message ?? 'sem detalhes'}`, data: null })
  }
}

async function getMyRedemptions(req, res) {
  try {
    const userId = req.user.id
    const redemptions = await rewardsQueries.getMyRedemptions(userId)
    return res.status(200).json({ message: 'Histórico de resgates', data: redemptions })
  } catch (error) {
    console.error('getMyRedemptions error:', error)
    return res.status(500).json({ message: 'Erro interno', data: null })
  }
}

async function getLeaderboard(req, res) {
  try {
    const leaderboard = await rewardsQueries.getLeaderboard()
    return res.status(200).json({ message: 'Leaderboard', data: leaderboard })
  } catch (error) {
    console.error('getLeaderboard error:', error)
    return res.status(500).json({ message: 'Erro interno', data: null })
  }
}

async function getMyPoints(req, res) {
  try {
    const userId = req.user.id
    const points = await rewardsQueries.getUserPoints(userId)
    return res.status(200).json({ message: 'Pontos do usuário', data: points })
  } catch (error) {
    console.error('getMyPoints error:', error)
    return res.status(500).json({ message: 'Erro interno', data: null })
  }
}

async function deleteMyRedemptions(req, res) {
  try {
    const userId = req.user.id

    const result = await pool.query('DELETE FROM redemptions WHERE user_id = $1 RETURNING id', [userId])

    return res.status(200).json({ message: 'Histórico de resgates apagado', deleted: result.rowCount })
  } catch (error) {
    console.error('deleteMyRedemptions error:', error)
    return res.status(500).json({ message: 'Erro interno', data: null })
  }
}

module.exports = {
  getAllRewardsAdmin,
  getActiveRewards,
  createReward,
  updateReward,
  toggleReward,
  deleteReward,
  redeemReward,
  getMyRedemptions,
  deleteMyRedemptions,
  getLeaderboard,
  getMyPoints,
}
