const cron = require('node-cron');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const logActivity = require('../utils/logActivity');

// How many days a user stays blocked before auto-unblock kicks in
const AUTO_UNBLOCK_AFTER_DAYS = 7;

// How many days of activity logs to keep before cleanup deletes them
const LOG_RETENTION_DAYS = 30;

// ------------------------------------------
// JOB 1 — Auto-unblock users blocked too long
// ------------------------------------------
const autoUnblockUsers = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - AUTO_UNBLOCK_AFTER_DAYS);

    // Find users blocked before the cutoff date
    const usersToUnblock = await User.find({
      isBlocked: true,
      blockedAt: { $lte: cutoffDate }
    });

    for (const user of usersToUnblock) {
      user.isBlocked = false;
      user.blockedAt = null;
      await user.save();

      await logActivity({
        action: 'AUTO_UNBLOCK',
        performedBy: null, // system action
        targetUser: user,
        details: `System auto-unblocked ${user.username} after ${AUTO_UNBLOCK_AFTER_DAYS} days`
      });

      console.log(`✅ Auto-unblocked: ${user.username}`);
    }

    if (usersToUnblock.length > 0) {
      console.log(`Auto-unblock job: ${usersToUnblock.length} user(s) unblocked`);
    }
  } catch (error) {
    console.error('Auto-unblock job failed:', error.message);
  }
};

// ------------------------------------------
// JOB 2 — Clean up old activity logs
// ------------------------------------------
const cleanupOldLogs = async () => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - LOG_RETENTION_DAYS);

    const result = await ActivityLog.deleteMany({
      createdAt: { $lte: cutoffDate },
      action: { $ne: 'LOG_CLEANUP' } // don't let cleanup delete its own record before logging
    });

    if (result.deletedCount > 0) {
      await logActivity({
        action: 'LOG_CLEANUP',
        performedBy: null,
        targetUser: null,
        details: `System deleted ${result.deletedCount} log(s) older than ${LOG_RETENTION_DAYS} days`
      });

      console.log(`🧹 Log cleanup: ${result.deletedCount} old log(s) deleted`);
    }
  } catch (error) {
    console.error('Log cleanup job failed:', error.message);
  }
};

// ------------------------------------------
// Start all scheduled jobs
// ------------------------------------------
const startScheduledTasks = () => {
  // Runs every hour, at minute 0 (e.g. 1:00, 2:00, 3:00...)
  cron.schedule('0 * * * *', () => {
    console.log('⏰ Running scheduled task: auto-unblock check');
    autoUnblockUsers();
  });

  // Runs once a day at midnight
  cron.schedule('0 0 * * *', () => {
    console.log('⏰ Running scheduled task: log cleanup');
    cleanupOldLogs();
  });

  console.log('✅ Scheduled tasks initialized (auto-unblock hourly, log cleanup daily)');
};

module.exports = { startScheduledTasks, autoUnblockUsers, cleanupOldLogs };