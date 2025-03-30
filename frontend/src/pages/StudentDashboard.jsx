import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/StudentDashboard.css";
const API_URL = "http://localhost:5000"; // Your backend URL

function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const email = localStorage.getItem('email');
    
    if (!email) {
      // Redirect to login if no email found
      navigate('/login');
      return;
    }

    // Fetch user details
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/userBymail/email`, {
          params: { email }
        });

        setUserData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError(err.response?.data?.message || 'Failed to fetch user details');
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('uid');
    localStorage.removeItem('email');
    navigate('/login');
  };

  // Loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Error state
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={handleLogout}>Return to Login</button>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {userData.name || 'Student'}!</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="user-details">
        <h2>Your Profile</h2>
        <div className="detail-grid">
          <div className="detail-item">
            <strong>Name:</strong> {userData.name}
          </div>
          <div className="detail-item">
            <strong>Email:</strong> {userData.email}
          </div>
          <div className="detail-item">
            <strong>Role:</strong> {userData.role}
          </div>
          {userData.classId && (
            <div className="detail-item">
              <strong>Class ID:</strong> {userData.classId}
            </div>
          )}
        </div>
      </div>

      {/* You can add more dashboard sections here */}
      <div className="dashboard-sections">
        {/* Example sections */}
        <div className="section">
          <h3>Recent Assignments</h3>
          {/* Add assignment listing logic */}
        </div>
        <div className="section">
          <h3>Upcoming Deadlines</h3>
          {/* Add deadline listing logic */}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;