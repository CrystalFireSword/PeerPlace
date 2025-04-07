// backend/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { loginUser, registerUser } = require('./authController');
const multer = require('multer');
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB file size limit
});

const {
  addUser,
  uploadQuestion,
  assignQuestion,
  submitAnswer,
  evaluateSubmission,
  getAllUsers,
  getAllQuestions,
  getUserByEmail,
  getFacultyCourses,
  getPendingSubmissions,
  getCourseAssignments,
  getAssignmentWithDocument
} = require('C:/Users/aksha/peer-place-for-jira/backend/firestoreControllers.js');

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
app.post('/api/users', addUser);
app.post('/api/questions', uploadQuestion);
app.post('/api/assignments', upload.array('attachments'), assignQuestion);
app.post('/api/submissions', submitAnswer);
app.put('/api/submissions/:submissionId/evaluate', evaluateSubmission);
app.get('/api/users', getAllUsers);
app.get('/api/questions', getAllQuestions);
app.get('/api/userByMail/email', getUserByEmail);
app.get('/api/courses', getFacultyCourses);
app.get('/api/course_assignments/:courseId', getCourseAssignments);
app.get('/api/submissions/pending', getPendingSubmissions);
// Add this with your other routes
app.get('/api/assignments/:assignmentId', getAssignmentWithDocument);
// app.post('/api/assignments', createAssignment);
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});