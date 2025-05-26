const express = require('express');
const router = express.Router();
const {
  getAllDashboardUsers,
  updateUserById,
  updatePassword,
  deleteUserById,
} = require('../controllers/userController');

const { protect, adminOnly } = require('../middleware/authadminMiddleware');


// === Routes protégées par middleware
router.get('/alldashboardusers', protect, adminOnly, getAllDashboardUsers);
router.put('/:id', protect, adminOnly, updateUserById);
router.delete('/:id', protect, adminOnly, deleteUserById);

module.exports = router;
