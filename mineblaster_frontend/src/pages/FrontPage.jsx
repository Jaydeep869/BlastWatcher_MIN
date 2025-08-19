import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { 
  BarChart3, 
  Target, 
  Database, 
  LogOut, 
  User,
  Drill,
  Shield,
  Zap
} from 'lucide-react'

const FrontPage = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const menuItems = [
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: "Dashboard",
      description: "View mine analytics and performance metrics",
      path: "/dashboard",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-400/50",
      available: true
    },
    {
      icon: <Target className="w-12 h-12" />,
      title: "Prediction",
      description: "AI-powered blast outcome predictions",
      path: "/prediction",
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-400/50",
      available: true
    },
    {
      icon: <Database className="w-12 h-12" />,
      title: "Data Entry",
      description: "Input blast data and parameters",
      path: "/data-entry",
      color: "from-purple-500/20 to-pink-500/20",
      borderColor: "border-purple-400/50",
      available: user.role === 'data_entry' || user.role === 'admin'
    }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
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
      {/* Background Elements */}
      <div className="absolute inset-0 mining-gradient">
        <motion.div 
          className="absolute top-20 right-20 text-mining-gold/10"
          animate={{ 
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
        >
          <Drill className="w-32 h-32" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-32 left-16 text-mining-copper/10"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <Shield className="w-40 h-40" />
        </motion.div>
      </div>

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
              <Drill className="w-8 h-8 text-mining-gold mr-3" />
              <h1 className="text-2xl font-bold text-white">BlastWatcher</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-mining-gold" />
                <span className="text-gray-300">{user.username}</span>
                <span className="px-2 py-1 bg-mining-gold/20 text-mining-gold text-xs rounded-full capitalize">
                  {user.role.replace('_', ' ')}
                </span>
              </div>
              
              <motion.button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 border border-red-500/50 
                         text-red-400 rounded-lg hover:bg-red-500/30 hover:text-red-300 
                         transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div 
        className="relative z-10 container mx-auto px-6 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Welcome Section */}
        <motion.div 
          className="text-center mb-16"
          variants={itemVariants}
        >
          <h2 className="text-4xl font-bold text-white mb-4">
            Welcome, {user.username}!
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Access your mining operations dashboard and tools. 
            Monitor blast performance, make predictions, and manage your data.
          </p>
        </motion.div>

        {/* Menu Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto"
          variants={containerVariants}
        >
          {menuItems.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: item.available ? 1.05 : 1,
                rotateY: item.available ? 5 : 0,
                z: item.available ? 50 : 0
              }}
              className={`
                mining-card relative overflow-hidden cursor-pointer group
                ${item.available 
                  ? 'hover:bg-white/15' 
                  : 'opacity-50 cursor-not-allowed'
                }
              `}
              onClick={() => item.available && navigate(item.path)}
            >
              {/* Background Gradient */}
              <div className={`
                absolute inset-0 bg-gradient-to-br ${item.color} opacity-0 
                ${item.available ? 'group-hover:opacity-100' : ''} 
                transition-opacity duration-300
              `} />
              
              {/* Content */}
              <div className="relative z-10 text-center">
                <motion.div 
                  className={`
                    text-mining-neon mb-6 flex justify-center
                    ${item.available 
                      ? 'group-hover:text-mining-gold' 
                      : 'text-gray-500'
                    } 
                    transition-colors duration-300
                  `}
                  whileHover={item.available ? { rotate: 15 } : {}}
                >
                  {item.icon}
                </motion.div>
                
                <h3 className={`
                  text-2xl font-semibold mb-4
                  ${item.available 
                    ? 'text-white group-hover:text-mining-gold' 
                    : 'text-gray-500'
                  } 
                  transition-colors duration-300
                `}>
                  {item.title}
                </h3>
                
                <p className={`
                  ${item.available 
                    ? 'text-gray-400 group-hover:text-gray-300' 
                    : 'text-gray-600'
                  } 
                  transition-colors duration-300 leading-relaxed
                `}>
                  {item.description}
                </p>

                {!item.available && (
                  <div className="mt-4 px-3 py-1 bg-gray-700/50 text-gray-400 text-sm rounded-full inline-block">
                    Restricted Access
                  </div>
                )}
              </div>

              {/* Animated Border */}
              {item.available && (
                <motion.div 
                  className={`
                    absolute inset-0 border-2 ${item.borderColor} rounded-xl opacity-0 
                    group-hover:opacity-100 transition-opacity duration-300
                  `}
                  initial={false}
                  whileHover={{ 
                    boxShadow: "0 0 20px rgba(0, 255, 255, 0.3)" 
                  }}
                />
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div 
          className="mt-16 grid md:grid-cols-3 gap-6 max-w-4xl mx-auto"
          variants={containerVariants}
        >
          <motion.div 
            className="mining-card text-center"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <Zap className="w-8 h-8 text-mining-neon mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">Quick Access</h4>
            <p className="text-gray-400 text-sm">
              Streamlined interface for efficient mining operations
            </p>
          </motion.div>

          <motion.div 
            className="mining-card text-center"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <Shield className="w-8 h-8 text-mining-gold mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">Secure Access</h4>
            <p className="text-gray-400 text-sm">
              Role-based permissions ensure data security
            </p>
          </motion.div>

          <motion.div 
            className="mining-card text-center"
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
          >
            <Target className="w-8 h-8 text-mining-copper mx-auto mb-3" />
            <h4 className="text-lg font-semibold text-white mb-2">Precision Tools</h4>
            <p className="text-gray-400 text-sm">
              Advanced analytics for optimal blast outcomes
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default FrontPage
