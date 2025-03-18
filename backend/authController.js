// backend/authController.js
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// Firebase Web API Key (from your Firebase project settings)
const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY;

async function loginUser(req, res) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Use Firebase REST API to sign in with email/password
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    const userData = response.data;
    
    return res.status(200).json({
      idToken: userData.idToken,
      uid: userData.localId,
      refreshToken: userData.refreshToken,
      expiresIn: userData.expiresIn,
      email: userData.email
    });
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    return res.status(401).json({ error: 'Invalid email or password' });
  }
}

async function registerUser(req, res) {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Use Firebase REST API to register a new user
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
      {
        email,
        password,
        returnSecureToken: true
      }
    );

    const userData = response.data;
    
    return res.status(201).json({
      idToken: userData.idToken,
      uid: userData.localId,
      refreshToken: userData.refreshToken,
      expiresIn: userData.expiresIn,
      email: userData.email
    });
  } catch (error) {
    console.error('Registration error:', error.response?.data || error.message);
    return res.status(400).json({ 
      error: error.response?.data?.error?.message || 'Registration failed' 
    });
  }
}

module.exports = { loginUser, registerUser };