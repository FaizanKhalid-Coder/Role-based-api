const ActivityLog = require('../models/ActivityLog');

const logActivity = async ({ action, performedBy, targetUser, details }) => {
  try {
    await ActivityLog.create({
      action,
      performedBy: performedBy ? performedBy._id : undefined,
      performedByUsername: performedBy ? performedBy.username : 'System',
      targetUser: targetUser ? targetUser._id : undefined,
      targetUsername: targetUser ? targetUser.username : undefined,
      details,
    });
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
};

module.exports = logActivity;