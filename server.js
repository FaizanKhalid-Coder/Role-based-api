const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const { startScheduledTasks } = require('./jobs/scheduledTasks');

// Load env vars first
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());           // Allow cross-origin requests
app.use(express.json());   // Parse JSON request body
app.use(cookieParser());   // Parse cookies

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Base route
app.get('/', (req, res) => {
  res.json({ message: 'Role Based API Running...' });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startScheduledTasks(); // start cron jobs once server is up
});