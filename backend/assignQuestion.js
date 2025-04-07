async function assignQuestion(assignmentId, questionId, assignedTo, assignedBy, dueDate) {
    await db.collection("assignments").doc(assignmentId).set({
      questionId,
      assignedTo,
      assignedBy,
      dueDate: admin.firestore.Timestamp.fromDate(new Date(dueDate)),
    });
  }
  