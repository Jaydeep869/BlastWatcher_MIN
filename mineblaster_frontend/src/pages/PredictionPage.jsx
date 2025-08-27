import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { minesAPI } from '../services/api'
import { 
  ArrowLeft,
  AlertCircle,
  Loader,
  Mountain,
  Brain,
  CheckCircle,
  Save
} from 'lucide-react'

const PredictionPage = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [mines, setMines] = useState([])
  const [error, setError] = useState('')
  const [savingPrediction, setSavingPrediction] = useState(false)
  
  const [formData, setFormData] = useState({
    // Mine Information
    mineId: '',
    
    // ML Model Selection
    selectedModel: 'linear_regression',
    
    // Required parameters for ML prediction
    distance: '', // Distance (D) in meters
    maxChargePerDelay: '', // Maximum charge weight per delay (Q) in kg
  })
  
  // State for ML predictions
  const [mlPrediction, setMlPrediction] = useState(null)
  const [mlLoading, setMlLoading] = useState(false)

  useEffect(() => {
    // Only load mines after user is authenticated
    if (user && !authLoading) {
      loadMines()
    } else if (!authLoading && !user) {
    }
  }, [user, authLoading])

  const loadMines = async () => {
    try {
      setError('');
      
      const response = await minesAPI.getAllMines()
      
      if (response.success) {
        // The API returns data in { data: { mines: [...], pagination: {...} } } format
        const minesData = response.data?.mines || response.data || []
        setMines(minesData)
      } else {
        setError('Failed to load mines')
        console.error('Failed to load mines:', response.message)
      }
    } catch (error) {
      console.error('Error loading mines:', error);
      setError('Failed to load mines. Please try again.');
    }
  };

  // ML Prediction API call
  const predictPPV = async (distance, chargeWeight, mineId) => {
    try {
      const mlServiceUrl = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8009'
      const response = await fetch(`${mlServiceUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          distance: parseFloat(distance),
          charge_weight: parseFloat(chargeWeight),
          mine_id: mineId
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('🤖 ML Prediction Result:', data)
      return data
    } catch (error) {
      console.error('❌ ML Prediction Error:', error)
      throw error
    }
  }

  const handleMLPrediction = async () => {
    if (!formData.distance || !formData.maxChargePerDelay || !formData.mineId) {
      setError('Please fill in Distance, Maximum Charge Weight per Delay, and select a Mine for ML prediction')
      return
    }
    
    setMlLoading(true)
    setError('')
    
    try {
      const result = await predictPPV(
        formData.distance, 
        formData.maxChargePerDelay, 
        formData.mineId
      )
      
      setMlPrediction(result)
      console.log('✅ PPV Prediction successful:', result.ppv)
      
    } catch (error) {
      console.error('❌ ML Prediction failed:', error)
      setError('Failed to get ML prediction. Please check if the ML service is running.')
    } finally {
      setMlLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const savePrediction = async () => {
    if (!mlPrediction) return
    
    setSavingPrediction(true)
    try {
      // Here you would save the ML prediction to the database
      console.log('💾 Saving ML Prediction:', {
        mineId: formData.mineId,
        distance: formData.distance,
        chargeWeight: formData.maxChargePerDelay,
        ppv: mlPrediction.ppv,
        scaledDistance: mlPrediction.scaled_distance,
        modelUsed: mlPrediction.model_used,
        timestamp: new Date().toISOString()
      })
      
      // Mock save operation
      setTimeout(() => {
        setSavingPrediction(false)
        alert('✅ ML Prediction saved successfully!')
      }, 1000)
      
    } catch (err) {
      console.error('Error saving prediction:', err)
      setSavingPrediction(false)
      setError('Failed to save prediction.')
    }
  }

  const formSections = [
    {
      title: "Mine & Model Selection",
      icon: <Mountain className="w-5 h-5" />,
      fields: [
        { 
          name: 'mineId', 
          label: 'Select Mine', 
          type: 'select', 
          options: mines.map(mine => ({ value: mine._id, label: mine.name })),
          required: true 
        },
        {
          name: 'selectedModel',
          label: 'Prediction Model',
          type: 'select',
          options: [
            { value: 'linear_regression', label: '🤖 Linear Regression (Active)' },
            { value: 'coming_soon', label: '🚧 Advanced ML Model (Coming Soon)' }
          ],
          required: true
        }
      ]
    },
    {
      title: "🎯 ML Prediction Parameters (Required)",
      icon: <Brain className="w-5 h-5" />,
      fields: [
        { 
          name: 'distance', 
          label: 'Distance (D) - meters', 
          type: 'number', 
          placeholder: '186', 
          step: '0.1', 
          required: true,
          description: 'Distance from blast to monitoring point'
        },
        { 
          name: 'maxChargePerDelay', 
          label: 'Max Charge Weight per Delay (Q) - kg', 
          type: 'number', 
          placeholder: '100', 
          step: '0.1', 
          required: true,
          description: 'Maximum charge weight per delay for PPV calculation'
        }
      ]
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.2,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mining-gradient" />

      {/* Header */}
      <motion.div 
        className="relative z-10 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <motion.button
                onClick={() => navigate('/front')}
                className="mr-4 p-2 glassmorphism rounded-lg hover:bg-white/20 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft className="w-5 h-5 text-mining-gold" />
              </motion.button>
              <Brain className="w-6 h-6 text-mining-gold mr-3" />
              <h1 className="text-2xl font-bold text-white">Blast Prediction</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="px-3 py-1 bg-mining-gold/20 text-mining-gold text-sm rounded-full">
                {user?.role?.replace('_', ' ').toUpperCase() || 'USER'}
              </span>
              <span className="text-gray-300">{user?.displayName || user?.email || 'User'}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="relative z-10 container mx-auto px-6 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">ML Blast Prediction</h2>
          <p className="text-gray-300">
            Enter Distance (D) and Maximum Charge Weight per Delay (Q) to get AI-powered PPV predictions using Linear Regression model.
          </p>
          
          {/* Mine Selection Status */}
          {mines.length === 0 && !error && user && !authLoading && (
            <motion.div 
              className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 px-4 py-3 rounded-lg mt-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center">
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Loading mines from database...
              </div>
            </motion.div>
          )}
          
          {mines.length > 0 && (
            <motion.div 
              className="bg-green-500/20 border border-green-500 text-green-400 px-4 py-3 rounded-lg mt-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 mr-2" />
                ✅ Found {mines.length} active mine(s): {mines.map(m => m.name).join(', ')}
              </div>
            </motion.div>
          )}
          
          {/* Error Message */}
          {error && (
            <motion.div 
              className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mt-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                {error}
              </div>
            </motion.div>
          )}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={(e) => { e.preventDefault(); handleMLPrediction(); }}>
              <motion.div 
                className="space-y-8"
                variants={containerVariants}
              >
                {formSections.map((section, sectionIndex) => (
                  <motion.div 
                    key={sectionIndex}
                    variants={itemVariants}
                    className="mining-card"
                  >
                    <div className="flex items-center mb-6">
                      <div className="text-mining-gold mr-3">
                        {section.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-white">
                        {section.title}
                      </h3>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {section.fields.map((field, fieldIndex) => (
                        <div key={fieldIndex} className={field.type === 'textarea' ? 'md:col-span-2 lg:col-span-3' : ''}>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {field.label} {field.required && <span className="text-red-400">*</span>}
                          </label>
                          {field.type === 'select' ? (
                            <select
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleInputChange}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg 
                                       focus:ring-2 focus:ring-mining-neon focus:border-transparent 
                                       text-white transition-all duration-300"
                              required={field.required}
                            >
                              <option value="">Select {field.label.replace(/^\d+\.\s*/, '')}</option>
                              {field.options?.map((option, optionIndex) => (
                                <option key={optionIndex} value={typeof option === 'object' ? option.value : option}>
                                  {typeof option === 'object' ? option.label : option}
                                </option>
                              ))}
                            </select>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleInputChange}
                              placeholder={field.placeholder}
                              rows={field.rows || 3}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg 
                                       focus:ring-2 focus:ring-mining-neon focus:border-transparent 
                                       text-white placeholder-gray-400 transition-all duration-300 resize-vertical"
                              required={field.required}
                            />
                          ) : (
                            <input
                              type={field.type}
                              name={field.name}
                              value={formData[field.name]}
                              onChange={handleInputChange}
                              placeholder={field.placeholder}
                              step={field.step}
                              disabled={field.disabled}
                              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg 
                                       focus:ring-2 focus:ring-mining-neon focus:border-transparent 
                                       text-white placeholder-gray-400 transition-all duration-300
                                       disabled:opacity-50 disabled:cursor-not-allowed"
                              required={field.required}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}

                {/* Submit Button - Simple ML Prediction */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={mlLoading || !formData.distance || !formData.maxChargePerDelay || !formData.mineId || formData.selectedModel === 'coming_soon'}
                    className="w-full bg-gradient-to-r from-mining-neon/20 to-blue-500/20 border border-mining-neon/50 
                             hover:from-mining-neon/30 hover:to-blue-500/30 hover:border-mining-neon/70
                             text-mining-neon hover:text-white py-4 text-lg font-semibold 
                             transition-all duration-300 rounded-lg mb-4 relative overflow-hidden 
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: mlLoading ? 1 : 1.02 }}
                    whileTap={{ scale: mlLoading ? 1 : 0.98 }}
                  >
                    {mlLoading ? (
                      <div className="flex items-center justify-center">
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Predicting PPV...
                      </div>
                    ) : formData.selectedModel === 'coming_soon' ? (
                      <div className="flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        Model Coming Soon
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Brain className="w-5 h-5 mr-2" />
                        🤖 Predict PPV with ML
                      </div>
                    )}
                  </motion.button>
                </motion.div>
              </motion.div>
            </form>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            <motion.div 
              variants={itemVariants}
              className="mining-card sticky top-8"
            >
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
                <Brain className="w-5 h-5 text-mining-gold mr-2" />
                ML Prediction Results
              </h3>

              {/* ML Prediction Results */}
              {mlPrediction && (
                <motion.div 
                  className="mb-6 p-4 bg-gradient-to-r from-mining-neon/10 to-blue-500/10 
                           border border-mining-neon/30 rounded-lg"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h4 className="text-lg font-semibold text-mining-neon mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    🤖 ML Prediction Results
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-mining-neon mb-1">
                        {mlPrediction.ppv.toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-300">Peak Particle Velocity (mm/s)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-mining-gold mb-1">
                        {mlPrediction.scaled_distance.toFixed(3)}
                      </div>
                      <div className="text-sm text-gray-300">Scaled Distance (SD)</div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-400 space-y-1">
                    <div><strong>Mine:</strong> {mlPrediction.mine_id}</div>
                    <div><strong>Model:</strong> {mlPrediction.model_used}</div>
                    {mlPrediction.calculation_steps && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-mining-neon hover:text-white">
                          View Calculation Steps
                        </summary>
                        <div className="mt-2 p-2 bg-gray-900/50 rounded text-xs">
                          {Object.entries(mlPrediction.calculation_steps).map(([step, calc]) => (
                            <div key={step} className="mb-1">
                              <strong>{step.replace(/_/g, ' ')}:</strong> {calc}
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                  
                  {/* Save Prediction Button */}
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={savePrediction}
                      disabled={savingPrediction}
                      className="px-4 py-2 bg-mining-neon text-gray-900 rounded-lg font-semibold text-sm
                               hover:bg-mining-neon/90 transition-all duration-300 flex items-center
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {savingPrediction ? 'Saving...' : 'Save Prediction'}
                    </button>
                  </div>
                </motion.div>
              )}

              {mlLoading && (
                <div className="text-center py-4 mb-6">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-2"
                  >
                    <Brain className="w-8 h-8 text-mining-neon" />
                  </motion.div>
                  <p className="text-gray-400">Running ML prediction...</p>
                </div>
              )}

              {!mlPrediction && !mlLoading && (
                <div className="text-center py-8">
                  <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Fill in Distance (D) and Charge Weight (Q), then click "Predict PPV with ML" to see results.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default PredictionPage
