const express = require('express');
const {
  createTask,
  getTasks,
  updateTaskStatus,
  assignTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createTask);
router.get('/', getTasks);
router.patch('/:id/status', updateTaskStatus);
router.patch('/:id/assign', assignTask);
router.delete('/:id', deleteTask);

module.exports = router;
