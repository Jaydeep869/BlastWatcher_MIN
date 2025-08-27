import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Drill,
  ArrowLeft
} from 'lucide-react'

const LoginSignup = () => {
  const navigate = useNavigate()
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    signupWithEmail, 
    resetPassword, 
    loading,
    isAuthenticated,
    user
  } = useAuth()
  
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })

  // Automatically redirect if user is already authenticated
  useEffect(() => {
    // Only redirect if we have all required state and not loading
    if (isAuthenticated && user && !loading) {
      // Use a small delay to ensure React has finished all state updates
      const redirectTimer = setTimeout(() => {
        navigate('/front', { replace: true })
      }, 150)
      
      return () => clearTimeout(redirectTimer)
    }
  }, [isAuthenticated, user, loading, navigate])

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
    setMessage('')
  }

  const handleGoogleLogin = async () => {
    setError('')
    setMessage('')

    try {
      const result = await loginWithGoogle()

      if (result.success) {
        // Don't navigate immediately - let useEffect handle navigation when isAuthenticated becomes true
        setMessage('Login successful! Redirecting...')
      } else {
        setError(result.error || 'Google login failed')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred during login')
    }
  }

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (isLogin) {
      // Login
      if (!formData.email || !formData.password) {
        setError('Email and password are required')
        return
      }

      try {
        const result = await loginWithEmail(formData.email, formData.password)
        
        if (result.success) {
          setMessage('Login successful! Redirecting...')
          // Don't navigate immediately - let useEffect handle navigation
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError('Login failed. Please try again.')
      }
    } else {
      // Signup
      if (!formData.email || !formData.password || !formData.confirmPassword || !formData.displayName) {
        setError('All fields are required')
        return
      }

      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }

      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters')
        return
      }

      try {
        const result = await signupWithEmail(
          formData.email, 
          formData.password, 
          formData.displayName
        )
        
        if (result.success) {
          setMessage('Account created successfully! Redirecting...')
          // Don't navigate immediately - let useEffect handle navigation
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError('Signup failed. Please try again.')
      }
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first')
      return
    }

    try {
      const result = await resetPassword(formData.email)
      
      if (result.success) {
        setMessage(result.message)
        setError('')
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError('Failed to send reset email')
    }
  }

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 mining-gradient">
        <motion.div 
          className="absolute top-10 left-10 text-mining-gold/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Drill className="w-32 h-32" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-10 right-10 text-mining-copper/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <Drill className="w-24 h-24" />
        </motion.div>
      </div>

      {/* Back Button */}
      <motion.button
        className="absolute top-8 left-8 z-20 glassmorphism p-3 rounded-lg hover:bg-white/20 transition-colors duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="w-6 h-6 text-mining-gold" />
      </motion.button>

      {/* Main Form Container */}
      <motion.div 
        className="relative z-10 w-full max-w-md mx-auto px-6"
        variants={formVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div 
          className="mining-card"
          whileHover={{ scale: 1.02 }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="flex items-center justify-center mb-4"
              whileHover={{ rotate: 5 }}
            >
              <Drill className="w-8 h-8 text-mining-gold mr-2" />
              <h1 className="text-2xl font-bold text-white">BlastWatcher</h1>
            </motion.div>
            
            <h2 className="text-xl text-gray-300">
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-400 mt-2">
              {isLogin ? 'Sign in to your account' : 'Join BlastWatcher today'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex mb-6 bg-gray-800/50 rounded-lg p-1">
            <button
              onClick={() => {setIsLogin(true); setError(''); setMessage('')}}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                isLogin 
                  ? 'bg-mining-gold text-gray-900 font-semibold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {setIsLogin(false); setError(''); setMessage('')}}
              className={`flex-1 py-2 px-4 rounded-md transition-all duration-200 ${
                !isLogin 
                  ? 'bg-mining-gold text-gray-900 font-semibold' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Google Login Section */}
          <div className="space-y-6">
            {/* Error/Success Messages */}
            {error && (
              <motion.div 
                className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            {message && (
              <motion.div 
                className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {message}
              </motion.div>
            )}

            {/* Google Login Button */}
            <motion.button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-100 text-gray-800 font-semibold py-3 px-4 rounded-lg 
                       transition-all duration-300 flex items-center justify-center space-x-3
                       disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              {loading ? (
                <motion.div 
                  className="flex items-center justify-center"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Drill className="w-5 h-5 mr-2 text-mining-gold" />
                  <span>Processing...</span>
                </motion.div>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">or</span>
              </div>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              {/* Name Field (Signup only) */}
              {!isLogin && (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="displayName"
                    placeholder="Full Name"
                    value={formData.displayName}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg 
                             text-white placeholder-gray-400 focus:outline-none focus:border-mining-gold 
                             transition-colors duration-300"
                    required={!isLogin}
                  />
                </div>
              )}

              {/* Email Field */}
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg 
                           text-white placeholder-gray-400 focus:outline-none focus:border-mining-gold 
                           transition-colors duration-300"
                  required
                />
              </div>

              {/* Password Field */}
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg 
                           text-white placeholder-gray-400 focus:outline-none focus:border-mining-gold 
                           transition-colors duration-300"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                           hover:text-white transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Confirm Password Field (Signup only) */}
              {!isLogin && (
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg 
                             text-white placeholder-gray-400 focus:outline-none focus:border-mining-gold 
                             transition-colors duration-300"
                    required={!isLogin}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                             hover:text-white transition-colors duration-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              )}

              {/* Forgot Password (Login only) */}
              {isLogin && (
                <div className="text-right">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-mining-gold hover:text-mining-gold/80 
                             transition-colors duration-300"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full bg-mining-gold hover:bg-mining-gold/90 text-gray-900 
                         font-semibold py-3 px-4 rounded-lg transition-all duration-300
                         disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? (
                  <motion.div 
                    className="flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Drill className="w-5 h-5 mr-2" />
                    <span>{isLogin ? 'Signing in...' : 'Creating account...'}</span>
                  </motion.div>
                ) : (
                  <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                )}
              </motion.button>
            </form>

            {/* Info Section */}
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-4">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
              
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
                <div className="flex flex-col items-center p-2 bg-gray-800/30 rounded">
                  <User className="w-4 h-4 mb-1 text-mining-gold" />
                  <span>Secure</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-800/30 rounded">
                  <Lock className="w-4 h-4 mb-1 text-mining-gold" />
                  <span>Encrypted</span>
                </div>
                <div className="flex flex-col items-center p-2 bg-gray-800/30 rounded">
                  <Drill className="w-4 h-4 mb-1 text-mining-gold" />
                  <span>Fast</span>
                </div>
              </div>
            </div>
          </div>

          {/* Role Information */}
          <div className="mt-6 p-4 bg-gray-800/30 rounded-lg border border-gray-700">
            <p className="text-sm text-gray-400 mb-2">User Roles:</p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><span className="text-mining-gold">•</span> Normal User: View mines and predictions</p>
              <p><span className="text-mining-gold">•</span> Data Entry: Add and edit blast data</p>
              <p><span className="text-mining-gold">•</span> Admin: Full system access</p>
            </div>
            <p className="text-xs text-gray-600 mt-2 italic">
              Role assignment is handled by administrators
            </p>
          </div>

          {/* Test Accounts */}
          <div className="mt-4 p-4 bg-blue-900/20 rounded-lg border border-blue-700">
            <p className="text-sm text-blue-400 mb-2">Test Account:</p>
            <div className="text-xs text-blue-300 space-y-1">
              <p><span className="text-mining-gold">Email:</span> admin@blastwatch.com</p>
              <p><span className="text-mining-gold">Password:</span> admin123</p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LoginSignup
