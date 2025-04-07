// frontend/src/services/authService.js
const API_URL = "http://localhost:5000";

export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }
    
    // Store auth data
    localStorage.setItem('authToken', data.idToken);
    localStorage.setItem('userType', data.userType);
    localStorage.setItem('uid', data.uid);
    
    return data;
  },
  
  async register(email, password) {
    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }
    
    // Store auth data
    localStorage.setItem('authToken', data.idToken);
    localStorage.setItem('userType', data.userType);
    localStorage.setItem('uid', data.uid);
    
    return data;
  },
  
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userType');
    localStorage.removeItem('uid');
  },
  
  isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },
  
  getUserType() {
    return localStorage.getItem('userType');
  },
  
  getAuthToken() {
    return localStorage.getItem('authToken');
  }
};