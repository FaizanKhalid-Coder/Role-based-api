const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ['PROMOTE', 'BLOCK', 'UNBLOCK', 'DELETE', 'AUTO_UNBLOCK', 'LOG_CLEANUP'],
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // system-triggered actions have no admin user behind them
  },
  performedByUsername: {
    type: String,
    required: true,
    default: 'System',
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  targetUsername: {
    type: String,
  },
  details: {
    type: String,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);