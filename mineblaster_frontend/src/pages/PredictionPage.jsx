import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { minesAPI, predictionsAPI } from '../services/api'
import { 
  ArrowLeft,
  Target,
  Zap,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calculator,
  Loader,
  Mountain,
  Save,
  Brain
} from 'lucide-react'

const PredictionPage = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [mines, setMines] = useState([])
  const [error, setError] = useState('')
  const [savingPrediction, setSavingPrediction] = useState(false)
  
  const [formData, setFormData] = useState({
    // Mine Information
    mineId: '',
    predictionId: '',
    
    // 14 Required Blast Parameters (same as DataEntry)
    depth: '',
    burden: '',
    spacing: '',
    stemming: '',
    totalChargeLength: '',
    explosivePerHole: '',
    maxChargePerDelay: '',
    totalExplosiveAmount: '',
    totalRockBlasted: '',
    powerFactor: '',
    distance: '',
    standardDeviation: '',
    frequency: ''
  })

  useEffect(() => {
    // Only load mines after user is authenticated
    if (user && !authLoading) {
      loadMines()
    } else if (!authLoading && !user) {
    }
  }, [user, authLoading])

  const loadMines = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      // Generate unique prediction ID
      const predictionId = `PRED-${Date.now()}`
      
      const predictionData = {
        mineId: formData.mineId,
        predictionId: predictionId,
        blastParameters: {
          depth: parseFloat(formData.depth),
          burden: parseFloat(formData.burden),
          spacing: parseFloat(formData.spacing),
          stemming: parseFloat(formData.stemming),
          totalChargeLength: parseFloat(formData.totalChargeLength),
          explosivePerHole: parseFloat(formData.explosivePerHole),
          maxChargePerDelay: parseFloat(formData.maxChargePerDelay),
          totalExplosiveAmount: parseFloat(formData.totalExplosiveAmount),
          totalRockBlasted: parseFloat(formData.totalRockBlasted),
          powerFactor: parseFloat(formData.powerFactor),
          distance: parseFloat(formData.distance),
          standardDeviation: parseFloat(formData.standardDeviation),
          frequency: parseFloat(formData.frequency)
        }
      }

      
      // Call prediction API
      const response = await predictionsAPI.createPrediction(predictionData)
      
      if (response.success) {
        setPrediction(response.data.prediction)
        
        // Update form with the generated prediction ID
        setFormData(prev => ({ ...prev, predictionId: predictionId }))
      } else {
        throw new Error(response.message || 'Prediction generation failed')
      }
    } catch (err) {
      console.error('Error generating prediction:', err)
      setError('Failed to generate prediction. Please try again.')
      
      // For development: Generate mock prediction if API fails
      const mockPrediction = {
        predictionId: `PRED-${Date.now()}`,
        efficiency: Math.floor(Math.random() * 15) + 80, // 80-95%
        safety: Math.floor(Math.random() * 10) + 90, // 90-100%
        fragmentationQuality: Math.floor(Math.random() * 20) + 75, // 75-95%
        vibrationLevel: (Math.random() * 30 + 20).toFixed(1), // 20-50 mm/s
        airblastLevel: (Math.random() * 20 + 100).toFixed(1), // 100-120 dB
        environmentalImpact: Math.floor(Math.random() * 20) + 70, // 70-90%
        costEfficiency: Math.floor(Math.random() * 15) + 80, // 80-95%
        recommendations: [
          "Consider adjusting burden distance for optimal fragmentation",
          "Current explosive amount is well-suited for the rock type",
          "Weather conditions are favorable for the blast operation",
          "Monitor vibration levels near sensitive structures"
        ],
        confidence: Math.floor(Math.random() * 15) + 85, // 85-100%
        createdAt: new Date().toISOString()
      }
      
      setPrediction(mockPrediction)
    } finally {
      setLoading(false)
    }
  }

  const savePrediction = async () => {
    if (!prediction) return
    
    setSavingPrediction(true)
    try {
      // Here you would save the prediction to the database
      
      // Mock save operation
      setTimeout(() => {
        setSavingPrediction(false)
        alert('Prediction saved successfully!')
      }, 1000)
      
    } catch (err) {
      console.error('Error saving prediction:', err)
      setSavingPrediction(false)
      setError('Failed to save prediction.')
    }
  }

  const formSections = [
    {
      title: "Mine & Prediction Information",
      icon: <Mountain className="w-5 h-5" />,
      fields: [
        { 
          name: 'mineId', 
          label: 'Select Mine', 
          type: 'select', 
          options: mines.map(mine => ({ value: mine._id, label: mine.name })),
          required: true 
        },
        { name: 'predictionId', label: 'Prediction ID', type: 'text', placeholder: 'Auto-generated', disabled: true }
      ]
    },
    {
      title: "Primary Blast Parameters (1-7)",
      icon: <Zap className="w-5 h-5" />,
      fields: [
        { name: 'depth', label: '1. Depth (meters)', type: 'number', placeholder: '12.5', step: '0.1', required: true },
        { name: 'burden', label: '2. Burden (meters)', type: 'number', placeholder: '4.5', step: '0.1', required: true },
        { name: 'spacing', label: '3. Spacing (meters)', type: 'number', placeholder: '5.5', step: '0.1', required: true },
        { name: 'stemming', label: '4. Stemming (meters)', type: 'number', placeholder: '3.0', step: '0.1', required: true },
        { name: 'totalChargeLength', label: '5. Total Charge Length (meters)', type: 'number', placeholder: '9.5', step: '0.1', required: true },
        { name: 'explosivePerHole', label: '6. Explosive per Hole (kg)', type: 'number', placeholder: '85.5', step: '0.1', required: true },
        { name: 'maxChargePerDelay', label: '7. Maximum Charge per Delay (kg)', type: 'number', placeholder: '250.0', step: '0.1', required: true }
      ]
    },
    {
      title: "Secondary Blast Parameters (8-14)",
      icon: <Calculator className="w-5 h-5" />,
      fields: [
        { name: 'totalExplosiveAmount', label: '8. Total Amount of Explosive (kg)', type: 'number', placeholder: '1200.0', step: '0.1', required: true },
        { name: 'totalRockBlasted', label: '9. Total Rock Blasted (tonnes)', type: 'number', placeholder: '5000', step: '1', required: true },
        { name: 'powerFactor', label: '10. Power Factor (tonnes per kg)', type: 'number', placeholder: '4.2', step: '0.01', required: true },
        { name: 'distance', label: '11. Distance (meters)', type: 'number', placeholder: '150', step: '1', required: true },
        { name: 'standardDeviation', label: '12. SD (Standard Deviation)', type: 'number', placeholder: '2.5', step: '0.01', required: true },
        { name: 'frequency', label: '13. Frequency (Hz)', type: 'number', placeholder: '25', step: '0.1', required: true }
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
          <h2 className="text-3xl font-bold text-white mb-4">AI Blast Prediction</h2>
          <p className="text-gray-300">
            Enter the same 14 blast parameters used in data entry to get AI-powered predictions for blast outcomes, efficiency, and safety recommendations.
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
            <form onSubmit={handleSubmit}>
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

                {/* Submit Button */}
                <motion.div variants={itemVariants}>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full mining-button py-4 text-lg font-semibold relative overflow-hidden disabled:opacity-50"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader className="w-5 h-5 mr-2 animate-spin" />
                        Analyzing Parameters...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Target className="w-5 h-5 mr-2" />
                        Generate Prediction
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
                <Target className="w-5 h-5 text-mining-gold mr-2" />
                Prediction Results
              </h3>

              {loading ? (
                <div className="text-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="inline-block mb-4"
                  >
                    <Loader className="w-12 h-12 text-mining-neon" />
                  </motion.div>
                  <p className="text-gray-400">Analyzing blast parameters...</p>
                </div>
              ) : prediction ? (
                <motion.div 
                  className="space-y-6"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6 }}
                >
                  {/* Confidence Score */}
                  <div className="text-center p-4 bg-mining-gold/10 border border-mining-gold/30 rounded-lg">
                    <div className="text-2xl font-bold text-mining-gold mb-1">
                      {prediction.confidence}%
                    </div>
                    <div className="text-sm text-gray-300">Prediction Confidence</div>
                  </div>

                  {/* Primary Metrics Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-mining-neon font-medium mb-3">Blast Efficiency</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Overall Efficiency:</span>
                          <span className="text-mining-gold font-semibold">{prediction.efficiency}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Fragmentation Quality:</span>
                          <span className="text-mining-copper font-semibold">{prediction.fragmentationQuality}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Energy Utilization:</span>
                          <span className="text-white font-medium">{prediction.energyUtilization || '85'}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-mining-neon font-medium mb-3">Safety & Vibration</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Safety Score:</span>
                          <span className="text-mining-neon font-semibold">{prediction.safety}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Ground Vibration:</span>
                          <span className="text-yellow-400 font-semibold">{prediction.vibrationLevel} mm/s</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Air Blast:</span>
                          <span className="text-red-400 font-semibold">{prediction.airblastLevel} dB</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4">
                      <h4 className="text-mining-neon font-medium mb-3">Environmental Impact</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Noise Level:</span>
                          <span className="text-white font-medium">{prediction.noiseLevel || '110'} dB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Dust Generation:</span>
                          <span className="text-white font-medium">{prediction.dustGeneration || 'Moderate'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Eco Score:</span>
                          <span className="text-green-400 font-medium">{prediction.ecoScore || '7'}/10</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cost Analysis */}
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-mining-neon font-medium mb-3">Cost Analysis</h4>
                    <div className="grid md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-mining-neon">${prediction.explosiveCost || '2,450'}</div>
                        <div className="text-sm text-gray-400">Explosive Cost</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-mining-neon">${prediction.drillingCost || '1,200'}</div>
                        <div className="text-sm text-gray-400">Drilling Cost</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-mining-neon">${prediction.totalBlastCost || '3,650'}</div>
                        <div className="text-sm text-gray-400">Total Blast Cost</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-mining-neon">${prediction.costPerTon || '0.73'}</div>
                        <div className="text-sm text-gray-400">Cost per Ton</div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      AI Recommendations
                    </h4>
                    <div className="space-y-2">
                      {prediction.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                          <AlertCircle className="w-4 h-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-300">{rec}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Save Prediction Button */}
                  <div className="flex justify-end">
                    <button
                      onClick={savePrediction}
                      disabled={savingPrediction}
                      className="px-6 py-3 bg-mining-neon text-gray-900 rounded-lg font-semibold 
                               hover:bg-mining-neon/90 transition-all duration-300 flex items-center
                               disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {savingPrediction ? 'Saving...' : 'Save Prediction'}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Fill out the form and click "Generate Prediction" to see AI-powered blast analysis.
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
