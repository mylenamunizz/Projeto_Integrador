const express = require('express')
const { getUsers, createUsers, updateUser, deleteUserById, clearOrganization } = require('../controllers/userController')
const { verifyToken, requireLevel } = require('../middlewares/authMiddleware')

const router = express.Router()

// Todas as rotas de usuário exigem token válido
router.use(verifyToken)

router.get('/', requireLevel(2), getUsers)
router.post('/', requireLevel(2), createUsers)
router.put('/:id', requireLevel(2), updateUser)
router.delete('/structure', requireLevel(2), clearOrganization)
router.delete('/:id', requireLevel(2), deleteUserById)

module.exports = router