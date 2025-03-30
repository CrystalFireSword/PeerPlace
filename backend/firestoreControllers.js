const admin = require('firebase-admin');
const db = require('./firebase'); // Ensure this path is correct

const addUser = async (req, res) => {
  try {
    const { userId, name, email, role, classId } = req.body;
    await db.collection("users").doc(userId).set({
      name,
      email,
      role,
      classId: classId || null,
    });
    res.status(200).send("User added successfully!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const uploadQuestion = async (req, res) => {
  try {
    const { questionId, title, description, createdBy, attachments } = req.body;
    await db.collection("questions").doc(questionId).set({
      title,
      description,
      attachments: attachments || [],
      createdBy,
      createdAt: admin.firestore.Timestamp.now(),
    });
    res.status(200).send("Question uploaded successfully!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const assignQuestion = async (req, res) => {
  try {
    const { assignmentId, questionId, assignedTo, assignedBy, dueDate } = req.body;
    await db.collection("assignments").doc(assignmentId).set({
      questionId,
      assignedTo,
      assignedBy,
      dueDate: admin.firestore.Timestamp.fromDate(new Date(dueDate)),
    });
    res.status(200).send("Question assigned successfully!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Submit an Answer
const submitAnswer = async (req, res) => {
  try {
    const { submissionId, assignmentId, studentId, answer, attachments } = req.body;
    await db.collection("submissions").doc(submissionId).set({
      assignmentId,
      studentId,
      answer,
      attachments: attachments || [],
      submittedAt: admin.firestore.Timestamp.now(),
    });
    res.status(200).send("Answer submitted successfully!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Evaluate a Submission
const evaluateSubmission = async (req, res) => {
  try {
    const { submissionId, marks, feedback, evaluatedBy } = req.body;
    await db.collection("submissions").doc(submissionId).update({
      evaluation: {
        marks,
        feedback,
        evaluatedBy,
        evaluatedAt: admin.firestore.Timestamp.now(),
      },
    });
    res.status(200).send("Submission evaluated successfully!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Users (For Testing)
const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get All Questions
const getAllQuestions = async (req, res) => {
  try {
    const snapshot = await db.collection("questions").get();
    const questions = snapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      message: "Failed to retrieve questions" 
    });
  }
};

const getUserByEmail = async (req, res) => {
  try {
    // Extract email from query parameters
    const email = req.query.email;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ 
        error: "Email is required",
        message: "Please provide an email address"
      });
    }

    // Query Firestore to find user by email
    const querySnapshot = await db.collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();

    // Check if user exists
    if (querySnapshot.empty) {
      return res.status(404).json({ 
        message: "No user found with this email" 
      });
    }

    // Return the first (and should be only) matching user
    const userDoc = querySnapshot.docs[0];
    const userData = {
      id: userDoc.id,
      ...userDoc.data()
    };

    // Remove sensitive information if needed
    delete userData.password;

    res.status(200).json(userData);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({ 
      error: error.message,
      message: "Failed to retrieve user" 
    });
  }
};
// Export the functions
module.exports = {
  addUser,
  uploadQuestion,
  assignQuestion,
  submitAnswer,
  evaluateSubmission,
  getAllUsers,
  getAllQuestions,
  getUserByEmail
};