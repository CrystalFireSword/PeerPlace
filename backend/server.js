// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { loginUser, registerUser } = require('./authController');

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Authentication routes
app.post('/api/login', loginUser);
app.post('/api/register', registerUser);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});