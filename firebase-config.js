// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendEmailVerification,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Your Firebase config (copy from Firebase Console)
const firebaseConfig = {

  apiKey: "AIzaSyAbtZLnsyum8K5RvLnkM4pIzpZ_R2URnbM",

  authDomain: "mahapoojan-5c236.firebaseapp.com",

  projectId: "mahapoojan-5c236",

  storageBucket: "mahapoojan-5c236.firebasestorage.app",

  messagingSenderId: "22092331883",

  appId: "1:22092331883:web:67a272180811ce391a6a2e",

  measurementId: "G-9VRGZF33SS"

};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// ============================================
// EXPORT FUNCTIONS
// ============================================

// Register with Email/Password
async function registerWithEmail(email, password, name, phone) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Send email verification
    await sendEmailVerification(user);
    
    // Store additional user info (you can save to your backend later)
    console.log('User registered:', user.uid, name, phone);
    
    return { success: true, user, message: "Registration successful! Please verify your email." };
  } catch (error) {
    let message = "Registration failed";
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = "Email already registered. Please login.";
        break;
      case 'auth/weak-password':
        message = "Password should be at least 6 characters.";
        break;
      case 'auth/invalid-email':
        message = "Invalid email address.";
        break;
    }
    return { success: false, error: message };
  }
}

// Login with Email/Password
async function loginWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      return { success: false, error: "Please verify your email first. Check your inbox." };
    }
    
    return { success: true, user };
  } catch (error) {
    let message = "Login failed";
    switch (error.code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        message = "Invalid email or password.";
        break;
      case 'auth/too-many-requests':
        message = "Too many attempts. Try again later.";
        break;
    }
    return { success: false, error: message };
  }
}

// Login with Google
async function loginWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return { success: true, user: result.user };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Reset Password
async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
    return { success: true, message: "Password reset email sent!" };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Logout
async function logout() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Get Current User
function getCurrentUser() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      resolve(user);
    });
  });
}

// Export
export {
  auth,
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  resetPassword,
  logout,
  getCurrentUser,
  onAuthStateChanged
};