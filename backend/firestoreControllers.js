// const admin = require('firebase-admin');
const { admin, db, bucket } = require('./firebase'); // Import the bucket

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
    // Get form data from req.body
    const { title, courseId, dueDate, facultyId, facultyName, description } = req.body;

    // Debug log to verify what's being received
    console.log("Received assignment data:", { 
      title, 
      courseId: courseId ? `"${courseId}"` : undefined,
      dueDate, 
      facultyId 
    });

    // Validate required fields
    if (!title || !courseId || !dueDate || !facultyId) {
      console.log("Missing fields:", { title, courseId, dueDate, facultyId });
      return res.status(400).json({ 
        error: "Missing required fields",
        message: "Please provide title, courseId, dueDate, and facultyId"
      });
    }

    // Trim courseId
    const trimmedCourseId = courseId.trim();
    console.log(`Checking for course with ID: "${trimmedCourseId}"`);

    // Try both methods of finding the course
    const courseQuery = db.collection("courses").where("courseID", "==", trimmedCourseId);
    const courseSnapshot = await courseQuery.get();
    console.log(`Query by field found ${courseSnapshot.size} matching courses`);

    const directCourseRef = db.collection("courses").doc(trimmedCourseId);
    const directCourseDoc = await directCourseRef.get();
    console.log(`Direct doc lookup exists: ${directCourseDoc.exists}`);

    // Check if course exists using either method
    let courseDocToUse;
    
    if (!courseSnapshot.empty) {
      courseDocToUse = courseSnapshot.docs[0];
      console.log("Course found by field query:", courseDocToUse.id);
    } else if (directCourseDoc.exists) {
      courseDocToUse = directCourseDoc;
      console.log("Course found by direct doc ID:", courseDocToUse.id);
    } else {
      // List all courses for debugging
      const allCoursesSnapshot = await db.collection("courses").get();
      console.log("All available courses:");
      allCoursesSnapshot.forEach(doc => {
        const data = doc.data();
        console.log(`- Doc ID: ${doc.id}, CourseId field: ${data.courseId || 'N/A'}`);
      });
      
      return res.status(404).json({
        error: "Course not found",
        message: `Course with ID "${trimmedCourseId}" does not exist`
      });
    }

    // Generate a unique assignment ID
    const assignmentId = `assign-${Date.now()}`;
    
    // Prepare assignment data (without file attachments)
    const assignmentData = {
      assignmentId,
      title,
      description: description || '',
      dueDate: admin.firestore.Timestamp.fromDate(new Date(dueDate)),
      attachments: [], // Empty array since we're skipping file uploads
      createdAt: admin.firestore.Timestamp.now(),
      status: 'active',
      facultyId,
      facultyName: facultyName || 'Unknown Faculty'
    };

    // Transaction to ensure atomic update
    await db.runTransaction(async (transaction) => {
      // Re-fetch the course data inside the transaction
      const courseRef = courseDocToUse.ref;
      const courseSnapshot = await transaction.get(courseRef);
      const courseData = courseSnapshot.data();
      const currentAssignments = courseData.assignments || [];
      
      transaction.update(courseRef, {
        assignments: [...currentAssignments, assignmentData]
      });
    });

    res.status(200).json({ 
      success: true,
      message: "Assignment created and added to course successfully!",
      assignmentId,
      courseId: trimmedCourseId
    });

  } catch (error) {
    console.error("Error creating assignment:", error);
    res.status(500).json({ 
      error: error.message,
      message: "Failed to create assignment"
    });
  }
};
// Helper function to notify students (example implementation)
async function notifyStudents(courseRef, assignmentId) {
  try {
    const courseDoc = await courseRef.get();
    const courseData = courseDoc.data();
    
    if (courseData.students && courseData.students.length > 0) {
      const batch = db.batch();
      
      courseData.students.forEach(studentId => {
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
          userId: studentId,
          type: 'new_assignment',
          assignmentId,
          courseId: courseRef.id,
          message: `New assignment: ${courseData.title}`,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
      
      await batch.commit();
    }
  } catch (error) {
    console.error("Error notifying students:", error);
    // Fail silently as this shouldn't block assignment creation
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
// Add these new functions to your existing firestoreController.js

// Get courses for a faculty member
const getFacultyCourses = async (req, res) => {
  try {
    const { facultyId } = req.query;
    
    if (!facultyId) {
      return res.status(400).json({ error: "Faculty ID is required" });
    }

    const snapshot = await db.collection('courses')
      .where('facultyId', '==', facultyId)
      .get();

    const courses = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.status(200).json(courses);
  } catch (error) {
    console.error("Error fetching courses:", error);
    res.status(500).json({ 
      error: error.message,
      message: "Failed to fetch courses" 
    });
  }
};

// Get pending submissions that need evaluation
const getPendingSubmissions = async (req, res) => {
  try {
    const snapshot = await db.collection('submissions')
      .where('evaluation', '==', null)
      .get();

    const submissions = await Promise.all(snapshot.docs.map(async doc => {
      const submissionData = doc.data();
      
      const assignmentDoc = await db.collection('assignments')
        .doc(submissionData.assignmentId)
        .get();
      const assignmentData = assignmentDoc.data();
      
      const studentDoc = await db.collection('users')
        .doc(submissionData.studentId)
        .get();
      const studentData = studentDoc.data();

      return {
        id: doc.id,
        assignmentTitle: assignmentData?.title || 'Unknown Assignment',
        studentName: studentData?.name || 'Unknown Student',
        submittedAt: submissionData.submittedAt?.toDate() || null,
        ...submissionData
      };
    }));

    res.status(200).json(submissions);
  } catch (error) {
    console.error("Error fetching pending submissions:", error);
    res.status(500).json({ 
      error: error.message,
      message: "Failed to fetch pending submissions" 
    });
  }
};

const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate courseId parameter
    if (!courseId) {
      return res.status(400).json({
        error: "Course ID is required",
        message: "Please provide a valid course ID"
      });
    }

    // Query courses where courseId field matches
    const snapshot = await db.collection('courses')
      .where('courseID', '==', courseId)
      .limit(1)
      .get();

    // Check if course exists
    if (snapshot.empty) {
      return res.status(404).json({
        error: "Course not found",
        message: `No course found with courseId: ${courseId}`
      });
    }

    // Get the first matching course (should be only one)
    const courseDoc = snapshot.docs[0];
    const courseData = courseDoc.data();

    // Get assignments from the course document
    const assignments = courseData.assignments || [];

    // Format assignments with additional information
    const formattedAssignments = assignments.map(assignment => ({
      ...assignment,
      courseId: courseData.courseId,
      courseName: courseData.courseName || 'Unnamed Course',
      // Convert Firestore Timestamps to JavaScript Date objects
      dueDate: assignment.dueDate?.toDate ? assignment.dueDate.toDate() : assignment.dueDate,
      createdAt: assignment.createdAt?.toDate ? assignment.createdAt.toDate() : assignment.createdAt,
      // Include the document ID for reference
      courseDocId: courseDoc.id
    }));

    res.status(200).json({
      success: true,
      courseId: courseData.courseId,
      courseName: courseData.courseName,
      assignments: formattedAssignments,
      count: formattedAssignments.length
    });

  } catch (error) {
    console.error("Error fetching course assignments:", error);
    res.status(500).json({
      error: error.message,
      message: "Failed to retrieve course assignments"
    });
  }
};
const getAssignmentWithDocument = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    
    if (!assignmentId) {
      return res.status(400).json({ error: "Assignment ID is required" });
    }

    // 1. Get the assignment
    const assignmentRef = db.collection('assignments').doc(assignmentId);
    const assignmentDoc = await assignmentRef.get();
    
    if (!assignmentDoc.exists) {
      return res.status(404).json({ error: "Assignment not found" });
    }

    const assignmentData = assignmentDoc.data();
    let relatedDocument = null;

    // 2. If assignment has attachments, get the first document
    if (assignmentData.attachments?.length > 0) {
      const docRef = db.collection('documents').doc(assignmentData.attachments[0].id);
      const docSnapshot = await docRef.get();
      
      if (docSnapshot.exists) {
        relatedDocument = docSnapshot.data();
      }
    }

    res.status(200).json({
      success: true,
      assignment: {
        ...assignmentData,
        id: assignmentDoc.id
      },
      relatedDocument
    });

  } catch (error) {
    console.error("Error fetching assignment:", error);
    res.status(500).json({ 
      error: error.message,
      message: "Failed to fetch assignment" 
    });
  }
};


module.exports = {
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
};