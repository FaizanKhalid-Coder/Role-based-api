const User = require('../models/User');
const logActivity = require('../utils/logActivity');
const ActivityLog = require('../models/ActivityLog');

// @route GET /api/admin/users
// Get all users — admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/admin/users/:id/promote
// Promote user to admin
const promoteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check already admin
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    user.role = 'admin';
    await user.save();

    // Log this action
    await logActivity({
      action: 'PROMOTE',
      performedBy: req.user,
      targetUser: user,
      details: `${req.user.username} promoted ${user.username} to admin`
    });

    res.status(200).json({
      success: true,
      message: `${user.username} promoted to admin`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/admin/users/:id/block
// Block or unblock user
const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot block another admin
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block an admin' });
    }

  // Toggle block status
    user.isBlocked = !user.isBlocked;
    user.blockedAt = user.isBlocked ? new Date() : null; // track when blocked, clear when unblocked
    await user.save();
    
    // Log this action
    await logActivity({
      action: user.isBlocked ? 'BLOCK' : 'UNBLOCK',
      performedBy: req.user,
      targetUser: user,
      details: user.isBlocked
        ? `${req.user.username} blocked ${user.username}`
        : `${req.user.username} unblocked ${user.username}`
    });

    res.status(200).json({
      success: true,
      message: user.isBlocked
        ? `${user.username} has been blocked`
        : `${user.username} has been unblocked`,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/admin/users/:id
// Delete user
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Cannot delete admin
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an admin' });
    }

    // Log this action BEFORE deleting (so we still have user info)
    await logActivity({
      action: 'DELETE',
      performedBy: req.user,
      targetUser: user,
      details: `${req.user.username} deleted ${user.username}`
    });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `${user.username} has been deleted`
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @route GET /api/admin/logs
// Get all activity logs — admin only
const getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 }) // newest first
      .limit(100); // avoid pulling unlimited history

    res.status(200).json({
      success: true,
      count: logs.length,
      logs
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAllUsers, promoteUser, blockUser, deleteUser, getActivityLogs };