import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut, 
  onAuthStateChanged,
  getIdToken,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth, googleProvider } from '../config/firebase'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [firebaseUser, setFirebaseUser] = useState(null)
  
  // Use refs to prevent race conditions and loops
  const authProcessedRef = useRef(false)
  const unsubscribeRef = useRef(null)
  const lastProcessedUserRef = useRef(null)
  const debounceTimeoutRef = useRef(null)
  const isInitialLoadRef = useRef(true)

  useEffect(() => {
    // Reset auth state when component mounts
    authProcessedRef.current = false
    lastProcessedUserRef.current = null
    isInitialLoadRef.current = true
    
    // Check for existing session on mount
    const checkExistingSession = () => {
      const savedToken = localStorage.getItem('firebaseToken')
      const savedUser = localStorage.getItem('userData')
      
      if (savedToken && savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          // Don't set authenticated state yet, let Firebase auth handle it
        } catch (error) {
          console.error('Error parsing saved user data:', error)
          localStorage.removeItem('firebaseToken')
          localStorage.removeItem('userData')
        }
      }
    }
    
    checkExistingSession()
    
    const handleAuthChange = async (firebaseUser) => {
      
      // Clear any pending debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      
      // For initial load, process immediately, otherwise debounce
      const delay = isInitialLoadRef.current ? 0 : 100
      isInitialLoadRef.current = false
      
      // Debounce rapid auth state changes
      debounceTimeoutRef.current = setTimeout(async () => {
        await processAuthChange(firebaseUser)
      }, delay)
    }
    
    const processAuthChange = async (firebaseUser) => {
      if (firebaseUser) {
        // Check if we already processed this exact user to avoid loops
        const currentUserKey = `${firebaseUser.uid}_${firebaseUser.email}`
        if (lastProcessedUserRef.current === currentUserKey && authProcessedRef.current) {
          return
        }
        
        setLoading(true)
        lastProcessedUserRef.current = currentUserKey
        authProcessedRef.current = true
        
        try {
          // Get Firebase ID token
          const idToken = await getIdToken(firebaseUser, true)
          
          // Check if we already have this token to avoid redundant API calls
          const existingToken = localStorage.getItem('firebaseToken')
          if (existingToken === idToken && user && isAuthenticated) {
            setFirebaseUser(firebaseUser)
            setLoading(false)
            return
          }
          
          // Store token in localStorage
          localStorage.setItem('firebaseToken', idToken)
          
          // Send token to backend for verification and user creation/update
          const result = await authAPI.firebaseLogin(idToken)
          
          if (result.success) {
            setFirebaseUser(firebaseUser)
            setUser(result.data.user)
            setIsAuthenticated(true)
            
            // Store user data
            localStorage.setItem('userData', JSON.stringify(result.data.user))
            
          } else {
            throw new Error(result.message || 'Authentication failed')
          }
        } catch (error) {
          console.error('❌ Authentication error:', error)
          authProcessedRef.current = false
          lastProcessedUserRef.current = null
          await handleLogout()
        }
      } else {
        // User is signed out
        authProcessedRef.current = false
        lastProcessedUserRef.current = null
        setFirebaseUser(null)
        setUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem('firebaseToken')
        localStorage.removeItem('userData')
      }
      
      setLoading(false)
    }

    // Set up the auth state listener
    unsubscribeRef.current = onAuthStateChanged(auth, handleAuthChange)

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
        debounceTimeoutRef.current = null
      }
    }
  }, []) // Empty dependency array

  const loginWithGoogle = async (useRedirect = false) => {
    try {
      setLoading(true)
      authProcessedRef.current = false // Reset for new login
      lastProcessedUserRef.current = null // Reset user tracking
      
      if (useRedirect) {
        // Use redirect method as fallback for popup issues
        await signInWithRedirect(auth, googleProvider)
        // Redirect will handle the rest
        return { success: true, redirect: true }
      } else {
        // Try popup first
        const result = await signInWithPopup(auth, googleProvider)
        // onAuthStateChanged will handle the rest
        return { success: true, user: result.user }
      }
    } catch (error) {
      console.error('Google login error:', error)
      setLoading(false)
      authProcessedRef.current = false
      lastProcessedUserRef.current = null
      
      let errorMessage = 'Google login failed'
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Login was cancelled'
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = 'Popup was blocked by browser. Trying redirect method...'
        // Automatically try redirect if popup fails
        return await loginWithGoogle(true)
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'Domain not authorized for OAuth'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true)
      authProcessedRef.current = false // Reset for new login
      lastProcessedUserRef.current = null // Reset user tracking
      
      const result = await signInWithEmailAndPassword(auth, email, password)
      // onAuthStateChanged will handle the rest
      return { success: true, user: result.user }
    } catch (error) {
      console.error('Email login error:', error)
      setLoading(false)
      authProcessedRef.current = false
      lastProcessedUserRef.current = null
      
      let errorMessage = 'Login failed'
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email'
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'This account has been disabled'
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const signupWithEmail = async (email, password, displayName) => {
    try {
      setLoading(true)
      authProcessedRef.current = false // Reset for new signup
      lastProcessedUserRef.current = null // Reset user tracking
      
      const result = await createUserWithEmailAndPassword(auth, email, password)
      
      // Update display name if provided
      if (displayName) {
        await updateProfile(result.user, { displayName })
      }
      
      // onAuthStateChanged will handle the rest
      return { success: true, user: result.user }
    } catch (error) {
      console.error('Email signup error:', error)
      setLoading(false)
      authProcessedRef.current = false
      lastProcessedUserRef.current = null
      
      let errorMessage = 'Signup failed'
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      return { success: true, message: 'Password reset email sent' }
    } catch (error) {
      console.error('Password reset error:', error)
      
      let errorMessage = 'Failed to send reset email'
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address'
      }
      
      return { success: false, error: errorMessage }
    }
  }

  const handleLogout = async () => {
    try {
      authProcessedRef.current = false // Reset auth state
      lastProcessedUserRef.current = null // Reset user tracking
      await signOut(auth)
      // onAuthStateChanged will handle cleanup
      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Logout failed' }
    }
  }

  // Refresh Firebase token
  const refreshToken = async () => {
    if (firebaseUser && !authProcessedRef.current) {
      try {
        const idToken = await getIdToken(firebaseUser, true)
        localStorage.setItem('firebaseToken', idToken)
        return idToken
      } catch (error) {
        console.error('Token refresh error:', error)
        await handleLogout()
        return null
      }
    }
    return null
  }

  const value = {
    user,
    firebaseUser,
    isAuthenticated,
    loading,
    loginWithGoogle,
    loginWithEmail,
    signupWithEmail,
    resetPassword,
    logout: handleLogout,
    refreshToken,
    // Legacy methods for backward compatibility
    login: loginWithGoogle,
    signup: loginWithGoogle
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
