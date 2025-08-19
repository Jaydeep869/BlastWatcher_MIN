import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { minesAPI } from '../services/api'
import { 
  ArrowLeft,
  Mountain,
  MapPin,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Loader2
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [selectedMine, setSelectedMine] = useState(null)
  const [mines, setMines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated || !user) {
      navigate('/login')
      return
    }
    
    loadDashboardData()
  }, [isAuthenticated, user, navigate])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError('')
      
      // Load mines data
      const minesResponse = await minesAPI.getAllMines()
      
      if (minesResponse.success) {
        // The API returns data in { data: { mines: [...], pagination: {...} } } format
        const minesData = minesResponse.data?.mines || minesResponse.data || []
        setMines(minesData)
        if (minesData && minesData.length > 0) {
          setSelectedMine(minesData[0])
        }
      } else {
        setError('Failed to load mines data')
        console.error('Failed to load mines:', minesResponse.message)
      }
    } catch (err) {
      console.error('Dashboard data loading error:', err)
      setError('Failed to load dashboard data. Using demo mode.')
      // Set some demo mines for testing
      setMines([])
    } finally {
      setLoading(false)
    }
  }

  // Mock data for charts and demo
  const blastData = [
    { date: 'Aug 10', efficiency: 85, safety: 90, output: 120 },
    { date: 'Aug 11', efficiency: 88, safety: 92, output: 135 },
    { date: 'Aug 12', efficiency: 82, safety: 88, output: 115 },
    { date: 'Aug 13', efficiency: 90, safety: 94, output: 142 },
    { date: 'Aug 14', efficiency: 87, safety: 91, output: 128 },
    { date: 'Aug 15', efficiency: 92, safety: 95, output: 155 },
    { date: 'Aug 16', efficiency: 89, safety: 93, output: 138 }
  ]

  const explosiveData = [
    { name: 'ANFO', value: 45, color: '#FFD700' },
    { name: 'Emulsion', value: 30, color: '#00FFFF' },
    { name: 'PETN', value: 15, color: '#B87333' },
    { name: 'Other', value: 10, color: '#C0C0C0' }
  ]

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6 } }
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
              <h1 className="text-2xl font-bold text-white">
                {selectedMine ? `${selectedMine.name} Dashboard` : 'BlastWatcher Dashboard'}
              </h1>
            </div>
            
            <div className="text-gray-300">
              Welcome, {user?.displayName || user?.email || 'User'}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className="relative z-10 flex items-center justify-center min-h-[50vh]">
          <motion.div 
            className="flex items-center space-x-3 text-mining-gold"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-8 h-8" />
            <span className="text-lg font-medium">Loading dashboard...</span>
          </motion.div>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <motion.div 
          className="relative z-10 container mx-auto px-6 py-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Error State */}
          {error && (
            <motion.div 
              className="bg-yellow-500/20 border border-yellow-500 text-yellow-400 px-6 py-4 rounded-lg mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <AlertTriangle className="w-5 h-5 inline mr-2" />
              {error}
            </motion.div>
          )}

          {/* Mine Selector or Empty State */}
          {mines.length > 0 ? (
            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <h2 className="text-xl font-semibold text-white mb-4">Select Mine</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mines.map((mine) => (
                  <motion.div
                    key={mine._id}
                    className={`mining-card cursor-pointer transition-all duration-300 ${
                      selectedMine?._id === mine._id 
                        ? 'ring-2 ring-mining-gold bg-mining-gold/10' 
                        : 'hover:bg-white/5'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedMine(mine)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-white flex items-center">
                          <Mountain className="w-4 h-4 mr-2 text-mining-gold" />
                          {mine.name}
                        </h3>
                        <p className="text-sm text-gray-400 flex items-center mt-1">
                          <MapPin className="w-3 h-3 mr-1" />
                          {mine.location}
                        </p>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        mine.status === 'active' 
                          ? 'bg-green-500/20 text-green-400' 
                          : mine.status === 'maintenance'
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : 'bg-red-500/20 text-red-400'
                      }`}>
                        {mine.status}
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-300">
                      <p>Capacity: {mine.capacity || 'N/A'} tons</p>
                      <p>Company: {mine.operatingCompany || 'N/A'}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              className="text-center py-12"
              variants={itemVariants}
            >
              <Mountain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No Mines Available</h3>
              <p className="text-gray-400 mb-6">
                {error 
                  ? 'Unable to connect to the backend. Check if the server is running.'
                  : 'No mines are configured in the system. Contact your administrator to add mines.'
                }
              </p>
              <motion.button
                onClick={() => navigate('/front')}
                className="mining-button px-6 py-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Back to Home
              </motion.button>
            </motion.div>
          )}

          {/* Demo Charts Section */}
          <motion.div 
            className="mt-8"
            variants={itemVariants}
          >
            <h2 className="text-xl font-semibold text-white mb-6">Sample Analytics</h2>
            
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="mining-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Efficiency</p>
                    <p className="text-2xl font-bold text-mining-gold">87%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-mining-gold" />
                </div>
              </div>

              <div className="mining-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Safety Score</p>
                    <p className="text-2xl font-bold text-green-400">95%</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              </div>

              <div className="mining-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Last Blast</p>
                    <p className="text-lg font-semibold text-white">Aug 15</p>
                  </div>
                  <Calendar className="w-8 h-8 text-mining-copper" />
                </div>
              </div>

              <div className="mining-card">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Status</p>
                    <p className="text-lg font-semibold text-mining-neon">Demo Mode</p>
                  </div>
                  <Activity className="w-8 h-8 text-mining-neon" />
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Chart */}
              <motion.div 
                className="mining-card"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Performance Metrics</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={blastData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="efficiency" stroke="#FFD700" strokeWidth={2} />
                    <Line type="monotone" dataKey="safety" stroke="#10B981" strokeWidth={2} />
                    <Line type="monotone" dataKey="output" stroke="#00FFFF" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Explosive Usage */}
              <motion.div 
                className="mining-card"
                variants={itemVariants}
              >
                <h3 className="text-lg font-semibold text-white mb-4">Explosive Usage</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={explosiveData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {explosiveData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

export default Dashboard
