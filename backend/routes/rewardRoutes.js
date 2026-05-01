const express = require('express')
const { verifyToken, requireLevel } = require('../middlewares/authMiddleware')
const rewardsController = require('../controllers/rewardsController')

const router = express.Router()

router.use(verifyToken)

// Rota admin (deve vir antes das demais para evitar conflito de rota)
router.post('/', requireLevel(3), rewardsController.createReward)
router.get('/admin', requireLevel(3), rewardsController.getAllRewardsAdmin)
router.put('/:id', requireLevel(3), rewardsController.updateReward)
router.patch('/:id', requireLevel(3), rewardsController.updateReward) // compatibilidade PUT/PATCH
router.patch('/:id/toggle', requireLevel(3), rewardsController.toggleReward)
router.delete('/:id', requireLevel(3), rewardsController.deleteReward)

// Rotas usuário
router.get('/', requireLevel(1), rewardsController.getActiveRewards)
router.post('/:id/redeem', requireLevel(1), rewardsController.redeemReward)
router.get('/my-redemptions', requireLevel(1), rewardsController.getMyRedemptions)
router.delete('/history', requireLevel(1), rewardsController.deleteMyRedemptions)
router.get('/history', requireLevel(1), rewardsController.getMyRedemptions)
router.get('/leaderboard', requireLevel(1), rewardsController.getLeaderboard)
router.get('/my-points', requireLevel(1), rewardsController.getMyPoints)

module.exports = router
