import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth'

// Firebase configuration for mineblast869 project
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyD4Uk9ha5ac7KSAv4U0KMMANy0l-5zLC7g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mineblast869.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mineblast869",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mineblast869.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "552919777985",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:552919777985:web:9735ec1e792846e9e44a40"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app)

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider()

// Configure Google Provider
googleProvider.addScope('email')
googleProvider.addScope('profile')

// Set custom parameters
googleProvider.setCustomParameters({
  prompt: 'select_account'
})

export { auth, googleProvider }
export default app
