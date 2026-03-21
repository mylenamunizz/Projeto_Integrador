const express = require('express')
const { importUsers } = require('../controllers/importController')
const { verifyToken, requireLevel } = require('../middlewares/authMiddleware')

const router = express.Router()

router.use(verifyToken)
router.post('/', requireLevel(3), importUsers)

module.exports = router
