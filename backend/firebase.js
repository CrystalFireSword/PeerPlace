const admin = require("firebase-admin");

const serviceAccount = require("./serviceAccountKey.json"); // Download from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'peerplace-it.appspot.com'
});

const db = admin.firestore();
const bucket = admin.storage().bucket();
module.exports = {admin,db,bucket};
