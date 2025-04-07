import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/FacultyDashboard.css";

const API_URL = "http://localhost:5000"; // Your backend URL

function FacultyDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const email = localStorage.getItem('email');
    const authToken = localStorage.getItem('authToken');
    
    if (!email || !authToken) {
      // Redirect to login if no email or token found
      navigate('/login');
      return;
    }

    // Fetch user details and faculty-specific data
    const fetchFacultyData = async () => {
      try {
        // Fetch user details
        const userResponse = await axios.get(`${API_URL}/api/userByMail/email`, {
          params: { email },
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        setUserData(userResponse.data);

        // Fetch courses taught by this faculty (example)
        const coursesResponse = await axios.get(`${API_URL}/api/courses`, {
          params: { facultyId: userResponse.data.id },
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        setCourses(coursesResponse.data);

        // Fetch pending submissions (example)
        const submissionsResponse = await axios.get(`${API_URL}/api/submissions/pending`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        setPendingSubmissions(submissionsResponse.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching faculty data:', err);
        setError(err.response?.data?.message || 'Failed to fetch faculty data');
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [navigate]);

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('uid');
    localStorage.removeItem('email');
    navigate('/login');
  };

  // Function to navigate to create assignment
  const handleCreateAssignment = () => {
    navigate('/create-assignment');
  };

  // Function to evaluate a submission
  const handleEvaluateSubmission = (submissionId) => {
    navigate(`/evaluate-submission/${submissionId}`);
  };

  // Loading state
  if (loading) {
    return <div className="loading-container">Loading faculty dashboard...</div>;
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={handleLogout} className="logout-btn">Return to Login</button>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, Professor {userData.name || 'Faculty'}!</h1>
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
          {userData.department && (
            <div className="detail-item">
              <strong>Department:</strong> {userData.department}
            </div>
          )}
        </div>
      </div>

      <div className="faculty-actions">
        <button onClick={handleCreateAssignment} className="action-btn">
          Create New Assignment
        </button>
      </div>

      <div className="dashboard-sections">
        {/* Courses Section */}
        <div className="section courses-section">
          <h3>Your Courses</h3>
          {courses.length > 0 ? (
            <ul className="courses-list">
              {courses.map(course => (
                <li key={course.id} className="course-item">
                  <h4>{course.name}</h4>
                  <p>Code: {course.code}</p>
                  <p>Students: {course.studentCount}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No courses assigned</p>
          )}
        </div>

        {/* Pending Submissions Section */}
        <div className="section submissions-section">
          <h3>Pending Evaluations</h3>
          {pendingSubmissions.length > 0 ? (
            <table className="submissions-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Student</th>
                  <th>Submitted On</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingSubmissions.map(submission => (
                  <tr key={submission.id}>
                    <td>{submission.assignmentTitle}</td>
                    <td>{submission.studentName}</td>
                    <td>{new Date(submission.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <button 
                        onClick={() => handleEvaluateSubmission(submission.id)}
                        className="evaluate-btn"
                      >
                        Evaluate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No pending submissions</p>
          )}
        </div>

        {/* Quick Stats Section */}
        <div className="section stats-section">
          <h3>Quick Stats</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Courses</h4>
              <p>{courses.length}</p>
            </div>
            <div className="stat-card">
              <h4>Students</h4>
              <p>{courses.reduce((acc, course) => acc + course.studentCount, 0)}</p>
            </div>
            <div className="stat-card">
              <h4>Pending Evaluations</h4>
              <p>{pendingSubmissions.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FacultyDashboard;