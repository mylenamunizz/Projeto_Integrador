const express = require('express')
const { verifyToken } = require('../middlewares/authMiddleware')
const badgeController = require('../controllers/badgeController')

const router = express.Router()

router.use(verifyToken)

router.get('/', badgeController.getUserBadges)
router.post('/:id/claim', badgeController.claimBadge)

module.exports = router
