import express from 'express'
import { verifyToken, requireLevel } from '../../backend/middlewares/authMiddleware'
import * as rewardsController from '../controllers/rewardsController'

const router = express.Router()

router.use(verifyToken)

// Rotas de usuário
router.get('/', requireLevel(1), rewardsController.getActiveRewards)
router.post('/:id/redeem', requireLevel(1), rewardsController.redeemReward)
router.get('/my-redemptions', requireLevel(1), rewardsController.getMyRedemptions)
router.get('/history', requireLevel(1), rewardsController.getMyRedemptions)
router.get('/leaderboard', requireLevel(1), rewardsController.getLeaderboard)
router.get('/my-points', requireLevel(1), rewardsController.getMyPoints)

// Rotas admin
router.get('/admin', requireLevel(3), rewardsController.getAllRewardsAdmin)
router.post('/', requireLevel(3), rewardsController.createReward)
router.put('/:id', requireLevel(3), rewardsController.updateReward)
router.patch('/:id/toggle', requireLevel(3), rewardsController.toggleReward)
router.delete('/:id', requireLevel(3), rewardsController.deleteReward)

export default router
