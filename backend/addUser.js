const db = require("./firebase");

async function addUser(userId, name, email, role, classId = null) {
  await db.collection("users").doc(userId).set({
    name,
    email,
    role,
    classId,
  });
}
