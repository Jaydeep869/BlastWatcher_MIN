import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { minesAPI, blastDataAPI } from '../services/api'
import { 
  ArrowLeft,
  Database,
  Save,
  CheckCircle,
  AlertCircle,
  Calculator,
  Target,
  Zap,
  TrendingUp,
  Loader,
  Mountain
} from 'lucide-react'

const DataEntryPage = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [mines, setMines] = useState([])
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    // Mine Information
    mineId: '',
    blastId: '',
    blastDate: '',
    
    // 14 Required Blast Parameters
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
    frequency: '',
    
    // Additional Information
    rockType: '',
    weatherCondition: '',
    notes: ''
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
      const response = await minesAPI.getAllMines()
      
      if (response.success) {
        // The API returns data in { data: { mines: [...], pagination: {...} } } format
        const minesData = response.data?.mines || response.data || []
        setMines(minesData)
      } else {
        setError('Failed to load mines')
        console.error('Failed to load mines:', response.message)
      }
    } catch (err) {
      console.error('Error loading mines:', err)
      setError('Failed to load mines. Please check your connection.')
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const blastData = {
        mineId: formData.mineId,
        blastId: formData.blastId,
        blastDate: formData.blastDate,
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
        },
        additionalInfo: {
          rockType: formData.rockType,
          weatherCondition: formData.weatherCondition,
          notes: formData.notes
        }
      }

      const response = await blastDataAPI.create(blastData)
      
      if (response.success) {
        setSuccess(true)
        
        // Reset form after 3 seconds
        setTimeout(() => {
          setSuccess(false)
          setFormData({
            mineId: '',
            blastId: '',
            blastDate: '',
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
            frequency: '',
            rockType: '',
            weatherCondition: '',
            notes: ''
          })
        }, 3000)
      } else {
        setError(response.message || 'Failed to save blast data')
      }
    } catch (err) {
      console.error('Error saving blast data:', err)
      setError('Failed to save blast data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formSections = [
    {
      title: "Mine & Blast Information",
      icon: <Mountain className="w-5 h-5" />,
      fields: [
        { 
          name: 'mineId', 
          label: 'Select Mine', 
          type: 'select', 
          options: mines.map(mine => ({ value: mine._id, label: mine.name })),
          required: true 
        },
        { name: 'blastId', label: 'Blast ID', type: 'text', placeholder: 'BL-2024-001', required: true },
        { name: 'blastDate', label: 'Blast Date', type: 'date', required: true }
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
    },
    {
      title: "Additional Information",
      icon: <Target className="w-5 h-5" />,
      fields: [
        { name: 'rockType', label: 'Rock Type', type: 'select', options: [
          { value: 'Granite', label: 'Granite' },
          { value: 'Limestone', label: 'Limestone' },
          { value: 'Sandstone', label: 'Sandstone' },
          { value: 'Basalt', label: 'Basalt' },
          { value: 'Quartzite', label: 'Quartzite' },
          { value: 'Coal', label: 'Coal' },
          { value: 'Other', label: 'Other' }
        ]},
        { name: 'weatherCondition', label: 'Weather Condition', type: 'select', options: [
          { value: 'Clear', label: 'Clear' },
          { value: 'Cloudy', label: 'Cloudy' },
          { value: 'Rainy', label: 'Rainy' },
          { value: 'Windy', label: 'Windy' },
          { value: 'Stormy', label: 'Stormy' }
        ]},
        { name: 'notes', label: 'Additional Notes', type: 'textarea', placeholder: 'Enter any additional observations or notes...', rows: 3 }
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

  // Check access permission
  if (user?.role !== 'data_entry' && user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 mining-gradient" />
        <div className="relative z-10 mining-card text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-400 mb-4">
            You don't have permission to access this page. Data entry is restricted to authorized personnel only.
          </p>
          <motion.button
            onClick={() => navigate('/front')}
            className="mining-button px-6 py-3"
            whileHover={{ scale: 1.05 }}
          >
            Back to Dashboard
          </motion.button>
        </div>
      </div>
    )
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
              <Database className="w-6 h-6 text-mining-gold mr-3" />
              <h1 className="text-2xl font-bold text-white">Data Entry</h1>
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
          <h2 className="text-3xl font-bold text-white mb-4">Blast Data Entry</h2>
          <p className="text-gray-300">
            Record blast parameters and results for analysis and AI model training.
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

        {success ? (
          // Success Message
          <motion.div 
            className="mining-card text-center max-w-2xl mx-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-2xl font-bold text-white mb-4">Data Saved Successfully!</h3>
            <p className="text-gray-300 mb-6">
              Blast data has been recorded and will be used to improve prediction accuracy.
            </p>
            <div className="flex justify-center space-x-4">
              <motion.button
                onClick={() => setSuccess(false)}
                className="mining-button px-6 py-3"
                whileHover={{ scale: 1.05 }}
              >
                Enter New Data
              </motion.button>
              <motion.button
                onClick={() => navigate('/front')}
                className="px-6 py-3 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-600/50 transition-colors duration-300"
                whileHover={{ scale: 1.05 }}
              >
                Back to Dashboard
              </motion.button>
            </div>
          </motion.div>
        ) : (
          // Form
          <form onSubmit={handleSubmit}>
            <motion.div 
              className="space-y-8 max-w-4xl mx-auto"
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
                            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg 
                                     focus:ring-2 focus:ring-mining-neon focus:border-transparent 
                                     text-white placeholder-gray-400 transition-all duration-300"
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
                      Saving Data...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Save className="w-5 h-5 mr-2" />
                      Save Blast Data
                    </div>
                  )}
                </motion.button>
              </motion.div>

              {/* Info Box */}
              <motion.div 
                variants={itemVariants}
                className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-6"
              >
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-lg font-semibold text-blue-400 mb-2">Data Usage Notice</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      All entered data will be used to improve our AI prediction models. 
                      This helps provide more accurate blast predictions for future operations. 
                      Data is encrypted and stored securely according to industry standards.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </form>
        )}
      </motion.div>
    </div>
  )
}

export default DataEntryPage
