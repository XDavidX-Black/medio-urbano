// ============================================
// MEDIO URBANO - Firebase Configuration
// ============================================

let db = null;

try {
  const firebaseConfig = {
    apiKey: "AIzaSyBpUcRZLflzc6PFl0DsqtUHRlwWxwB83Qs",
    authDomain: "medio-urbano.firebaseapp.com",
    projectId: "medio-urbano",
    storageBucket: "medio-urbano.firebasestorage.app",
    messagingSenderId: "6304304662",
    appId: "1:6304304662:web:4b3f43e71d190d03e92f37"
  };

  firebase.initializeApp(firebaseConfig);
  db = firebase.firestore();
} catch (e) {
  console.warn('Firebase init failed:', e);
  db = null;
}
