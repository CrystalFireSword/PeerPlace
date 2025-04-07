import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CreateAssignment.css';

const API_URL = "http://localhost:5000";

function CreateAssignment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    dueTime: '',
    attachments: []
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facultyInfo, setFacultyInfo] = useState(null);

  // Load faculty info on component mount
  useEffect(() => {
    const loadFacultyInfo = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const facultyId = localStorage.getItem('uid');
        
        if (!authToken || !facultyId) {
          throw new Error('Authentication required');
        }

        const response = await axios.get(`${API_URL}/api/userByMail/email`, {
          params: { email: localStorage.getItem('email') },
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        setFacultyInfo(response.data);
      } catch (err) {
        console.error('Error loading faculty info:', err);
      }
    };

    loadFacultyInfo();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      attachments: Array.from(e.target.files)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
  
    try {
      const authToken = localStorage.getItem('authToken');
      const facultyId = localStorage.getItem('uid');
      
      if (!authToken || !facultyId || !facultyInfo) {
        throw new Error('Authentication required');
      }
  
      // Combine date and time for dueDateTime
      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);
      
      // For file handling, we'll keep using FormData
      const formPayload = new FormData();
      formPayload.append('title', formData.title);      
      formPayload.append('courseId', formData.courseId.trim()); // Trim whitespace from courseId
      formPayload.append('dueDate', dueDateTime.toISOString());
      formPayload.append('facultyId', facultyId);
      formPayload.append('facultyName', facultyInfo.name);
      formPayload.append('description', formData.description || '');
      
      // Append each file
      formData.attachments.forEach(file => {
        formPayload.append('attachments', file);
      });
  
      const response = await axios.post(`${API_URL}/api/assignments`, formPayload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 10000 // 10 second timeout
      });
  
      if (response.data) {
        navigate('/facultydashboard', { 
          state: { 
            success: 'Assignment created successfully!',
            assignmentId: response.data.assignmentId
          } 
        });
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      if (err.response?.data?.error === "Course not found") {
        setError(`Course "${formData.courseId}" does not exist`);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create assignment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="create-assignment-container">
      <h1>Create New Assignment</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-group">
          <label htmlFor="title">Assignment Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="courseId">Course ID*</label>
          <input
            type="text"
            id="courseId"
            name="courseId"
            value={formData.courseId}
            onChange={handleChange}
            required
            placeholder="Enter exact course ID"
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Due Date*</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="dueTime">Due Time*</label>
            <input
              type="time"
              id="dueTime"
              name="dueTime"
              value={formData.dueTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="attachments">Attachments</label>
          <input
            type="file"
            id="attachments"
            name="attachments"
            onChange={handleFileChange}
            multiple
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/facultydashboard')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAssignment;