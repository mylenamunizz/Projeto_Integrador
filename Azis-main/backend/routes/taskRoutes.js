const express = require('express')
const {
  createTask,
  getTasks,
  updateTaskStatus,
  reviewTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController')
const { verifyToken, requireLevel, requireRole } = require('../middlewares/authMiddleware')

const router = express.Router()

router.use(verifyToken)

router.post('/', requireRole('gestor'), createTask)
router.get('/', requireLevel(1), getTasks)
router.patch('/:id/status', requireLevel(1), updateTaskStatus)
router.patch('/:id/review', requireLevel(2), reviewTask)
router.put('/:id', requireLevel(2), updateTask)
router.delete('/:id', requireLevel(2), deleteTask)

module.exports = router
