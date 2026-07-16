const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// User schema — role field is the NEW thing here
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  // NEW — role field (admin or user)
  role: {
    type: String,
    enum: ['user', 'admin'],  // only these 2 values allowed
    default: 'user'           // everyone starts as user
  },
  // NEW — block feature
  isBlocked: {
    type: Boolean,
    default: false
  },
  // NEW — tracks when the user was blocked, used by the auto-unblock scheduled task
  blockedAt: {
    type: Date,
    default: null
  }
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);