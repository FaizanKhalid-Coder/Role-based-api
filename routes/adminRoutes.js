const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  promoteUser,
  blockUser,
  deleteUser,
  getActivityLogs
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorizeRoles } = require('../middleware/roleMiddleware');

// All routes need:
// 1st — protect (must be logged in)
// 2nd — authorizeRoles (must be admin)
router.use(protect);
router.use(authorizeRoles('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/promote', promoteUser);
router.put('/users/:id/block', blockUser);
router.delete('/users/:id', deleteUser);
router.get('/logs', getActivityLogs);

module.exports = router;