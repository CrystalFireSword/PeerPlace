async function submitAnswer(submissionId, assignmentId, studentId, answer, attachments = []) {
    await db.collection("submissions").doc(submissionId).set({
      assignmentId,
      studentId,
      answer,
      attachments,
      submittedAt: admin.firestore.Timestamp.now(),
    });
  }
  