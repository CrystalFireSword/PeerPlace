import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import "../styles/Assignment.css";

const API_URL = "http://localhost:5000";

function Assignment() {
  const [assignment, setAssignment] = useState(null);
  const [relatedDocument, setRelatedDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignmentData = async () => {
      try {
        setLoading(true);
        const authToken = localStorage.getItem('authToken');
        
        // Check if we have assignment data passed via state
        const assignmentFromState = location.state?.assignment;
        
        if (assignmentFromState) {
          setAssignment(assignmentFromState);
          
          // Fetch related document if attachment exists
          if (assignmentFromState.attachments?.length > 0) {
            const docResponse = await axios.get(
              `${API_URL}/api/documents/${assignmentFromState.attachments[0].id}`,
              {
                headers: { 'Authorization': `Bearer ${authToken}` }
              }
            );
            setRelatedDocument(docResponse.data);
          }
        } else {
          // If no state, fetch from API using assignmentId in URL
          const assignmentId = window.location.pathname.split('/').pop();
          const response = await axios.get(
            `${API_URL}/api/assignments/${assignmentId}`,
            {
              headers: { 'Authorization': `Bearer ${authToken}` }
            }
          );
          
          setAssignment(response.data.assignment);
          
          if (response.data.relatedDocument) {
            setRelatedDocument(response.data.relatedDocument);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching assignment:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load assignment');
        setLoading(false);
      }
    };

    fetchAssignmentData();
  }, [location]);

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  const downloadDocument = () => {
    if (relatedDocument?.fileUrl) {
      window.open(relatedDocument.fileUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading assignment details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Assignment</h3>
        <p>{error}</p>
        <button onClick={handleBack} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="not-found-container">
        <h2>Assignment Not Found</h2>
        <button onClick={handleBack} className="back-btn">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="assignment-container">
      <div className="assignment-header">
        <button onClick={handleBack} className="back-btn">
          &larr; Back
        </button>
        <h1>{assignment.title}</h1>
      </div>
      
      <div className="assignment-details">
        <div className="detail-section">
          <h2>Details</h2>
          <div className="detail-grid">
            <div className="detail-item">
              <strong>Course:</strong> {assignment.courseName || 'N/A'}
            </div>
            <div className="detail-item">
              <strong>Faculty:</strong> {assignment.facultyName || 'N/A'}
            </div>
            <div className="detail-item">
              <strong>Status:</strong> 
              <span className={`status-badge ${assignment.status || 'active'}`}>
                {assignment.status || 'active'}
              </span>
            </div>
            <div className="detail-item">
              <strong>Due Date:</strong> 
              {new Date(assignment.dueDate?.toDate?.() || assignment.dueDate).toLocaleString()}
            </div>
          </div>
        </div>
        
        <div className="description-section">
          <h2>Description</h2>
          <p>{assignment.description || 'No description provided.'}</p>
        </div>
        
        {relatedDocument && (
          <div className="document-section">
            <h2>Related Document</h2>
            <div className="document-card" onClick={downloadDocument}>
              <div className="document-icon">
                <i className="fas fa-file-alt"></i>
              </div>
              <div className="document-info">
                <h3>{relatedDocument.name}</h3>
                <p>{relatedDocument.type} • {Math.round(relatedDocument.size / 1024)} KB</p>
              </div>
              <div className="download-btn">
                <i className="fas fa-download"></i>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Assignment;