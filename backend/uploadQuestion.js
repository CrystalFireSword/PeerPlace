async function uploadQuestion(questionId, title, description, createdBy, attachments = []) {
    await db.collection("questions").doc(questionId).set({
      title,
      description,
      attachments,
      createdBy,
      createdAt: admin.firestore.Timestamp.now(),
    });
  }
  