import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/StudentDashboard.css";

const API_URL = "http://localhost:5000";

function StudentDashboard() {
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = localStorage.getItem('email');
        const authToken = localStorage.getItem('authToken');
        
        if (!email || !authToken) {
          navigate('/login');
          return;
        }

        setLoading(true);
        
        // 1. Fetch user details
        const userResponse = await axios.get(`${API_URL}/api/userByMail/email`, {
          params: { email },
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        
        if (!userResponse.data) {
          throw new Error('No user data received');
        }
        
        setUserData(userResponse.data);

        // 2. Check if user has courses
        if (!userResponse.data.courses || userResponse.data.courses.length === 0) {
          setCourses([]);
          setAssignments([]);
          setLoading(false);
          return;
        }

        // 3. Fetch course details
        const coursePromises = userResponse.data.courses.map(courseId => 
          axios.get(`${API_URL}/api/course_assignments/${courseId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
          })
        );

        const courseResponses = await Promise.all(coursePromises);
        const validCourses = courseResponses
          .filter(response => response.data)
          .map(response => response.data);

        setCourses(validCourses);

        // 4. Process assignments
        const allAssignments = validCourses.reduce((acc, course) => {
          if (course.assignments && course.assignments.length > 0) {
            const courseAssignments = course.assignments.map(assignment => ({
              ...assignment,
              courseName: course.courseName || course.title || 'Unknown Course',
              courseId: course.id || course.courseId
            }));
            return [...acc, ...courseAssignments];
          }
          return acc;
        }, []);

        // Filter and sort assignments
        const activeAssignments = allAssignments
          .filter(assignment => !assignment.status || assignment.status === 'active')
          .sort((a, b) => {
            try {
              const dateA = a.dueDate?.toDate ? a.dueDate.toDate() : new Date(a.dueDate);
              const dateB = b.dueDate?.toDate ? b.dueDate.toDate() : new Date(b.dueDate);
              return dateA - dateB;
            } catch (e) {
              return 0;
            }
          });

        setAssignments(activeAssignments);
        setLoading(false);

      } catch (err) {
        console.error('Error in fetchUserData:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const formatDate = (dateValue) => {
    if (!dateValue) return 'No due date';
    
    try {
      const date = dateValue.toDate ? dateValue.toDate() : new Date(dateValue);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  const getTimeRemaining = (dueDate) => {
    if (!dueDate) return 'No due date';
    
    try {
      const date = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
      const now = new Date();
      const diffTime = date - now;
      
      if (diffTime < 0) return 'Past due';
      
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (diffDays > 0) {
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ${diffHours} hr${diffHours !== 1 ? 's' : ''}`;
      }
      return `${diffHours} hr${diffHours !== 1 ? 's' : ''}`;
    } catch (e) {
      return 'Invalid date';
    }
  };

  const handleAssignmentClick = (assignment) => {
    navigate(`/assignment/${assignment.assignmentId}`, {
      state: { 
        assignment,
        // Include any related document if already available
        relatedDocument: assignment.attachments?.length > 0 ? 
          { id: assignment.attachments[0].id } : null
      }
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('uid');
    localStorage.removeItem('email');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Dashboard</h3>
        <p>{error}</p>
        <button onClick={handleLogout} className="logout-btn">
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {userData?.name || 'Student'}!</h1>
        <button onClick={handleLogout} className="logout-btn">
          <i className="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>

      <div className="user-profile-card">
        <div className="profile-header">
          <h2><i className="fas fa-user-circle"></i> Your Profile</h2>
        </div>
        <div className="profile-details">
          <div className="detail-item">
            <i className="fas fa-user"></i>
            <span><strong>Name:</strong> {userData?.name}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-envelope"></i>
            <span><strong>Email:</strong> {userData?.email}</span>
          </div>
          <div className="detail-item">
            <i className="fas fa-graduation-cap"></i>
            <span><strong>Role:</strong> {userData?.role}</span>
          </div>
          {userData?.classId && (
            <div className="detail-item">
              <i className="fas fa-users"></i>
              <span><strong>Class ID:</strong> {userData.classId}</span>
            </div>
          )}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="courses-section">
          <div className="section-header">
            <h2><i className="fas fa-book"></i> Your Courses ({courses.length})</h2>
          </div>
          {courses.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-book-open"></i>
              <p>You are not enrolled in any courses.</p>
            </div>
          ) : (
            <div className="courses-grid">
              {courses.map(course => (
                <div key={course.courseId} className="course-card">
                  <div className="course-icon">
                    <i className="fas fa-book-reader"></i>
                  </div>
                  <h3>{course.courseName || course.title || 'Unknown Course'}</h3>
                  <div className="course-meta">
                    <span><i className="fas fa-id-card"></i> {course.courseId}</span>
                    {course.instructor && (
                      <span><i className="fas fa-chalkboard-teacher"></i> {course.instructor}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="assignments-section">
          <div className="section-header">
            <h2><i className="fas fa-tasks"></i> Active Assignments ({assignments.length})</h2>
          </div>
          {assignments.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-check-circle"></i>
              <p>No active assignments found.</p>
            </div>
          ) : (
            <div className="assignments-grid">
              {assignments.map(assignment => {
                const timeRemaining = getTimeRemaining(assignment.dueDate);
                const isPastDue = timeRemaining === 'Past due';
                const isDueSoon = !isPastDue && timeRemaining.includes('hr');
                
                return (
                  <div 
                    key={assignment.assignmentId} 
                    className={`assignment-card ${isPastDue ? 'past-due' : ''} ${isDueSoon ? 'due-soon' : ''}`}
                    onClick={() => handleAssignmentClick(assignment)}
                  >
                    <div className="assignment-badge">
                      <i className={`fas ${isPastDue ? 'fa-exclamation-circle' : 'fa-clipboard-list'}`}></i>
                    </div>
                    <div className="assignment-content">
                      <h3>{assignment.title}</h3>
                      <div className="assignment-meta">
                        <span className="course-name">
                          <i className="fas fa-book"></i> {assignment.courseName}
                        </span>
                        <span className="due-date">
                          <i className="fas fa-calendar-day"></i> {formatDate(assignment.dueDate)}
                        </span>
                      </div>
                      <div className={`time-remaining ${isPastDue ? 'past-due-text' : ''}`}>
                        <i className={`fas ${isPastDue ? 'fa-clock' : 'fa-hourglass-half'}`}></i>
                        {timeRemaining}
                      </div>
                      {assignment.facultyName && (
                        <div className="faculty-info">
                          <i className="fas fa-user-tie"></i> {assignment.facultyName}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;