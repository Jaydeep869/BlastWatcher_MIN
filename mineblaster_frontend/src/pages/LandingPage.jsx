import React from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Pickaxe, 
  Zap, 
  BarChart3, 
  Shield, 
  Target, 
  Mountain,
  Gem,
  Drill
} from 'lucide-react'

const LandingPage = () => {
  const navigate = useNavigate()

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
      transition: {
        duration: 0.6
      }
    }
  }

  const features = [
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Real-time Monitoring",
      description: "Track blast performance with advanced analytics"
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Precise Predictions",
      description: "AI-powered blast outcome predictions"
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Safety First",
      description: "Comprehensive safety monitoring and alerts"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Results",
      description: "Get immediate feedback on blast parameters"
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 mining-gradient">
        <motion.div 
          className="absolute top-20 left-10 text-mining-gold/20"
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
          <Pickaxe className="w-32 h-32" />
        </motion.div>
        
        <motion.div 
          className="absolute bottom-32 right-16 text-mining-copper/20"
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
          <Mountain className="w-40 h-40" />
        </motion.div>

        <motion.div 
          className="absolute top-1/2 right-1/4 text-mining-neon/10"
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.7, 0.3]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <Gem className="w-24 h-24" />
        </motion.div>
      </div>

      {/* Main Content */}
      <motion.div 
        className="relative z-10 container mx-auto px-6 py-16"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.div 
            className="flex items-center justify-center mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Drill className="w-12 h-12 text-mining-gold mr-4" />
            <h1 className="text-6xl font-bold bg-gradient-to-r from-mining-gold via-mining-neon to-mining-silver bg-clip-text text-transparent">
              BlastWatcher
            </h1>
            <Drill className="w-12 h-12 text-mining-gold ml-4 scale-x-[-1]" />
          </motion.div>
          
          <motion.p 
            className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            Revolutionary mining blast monitoring and prediction system. 
            Harness the power of AI to optimize your mining operations with 
            precision, safety, and real-time intelligence.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          variants={containerVariants}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ 
                scale: 1.05,
                rotateY: 5,
                z: 50
              }}
              className="mining-card text-center group cursor-pointer"
            >
              <motion.div 
                className="text-mining-neon mb-4 flex justify-center group-hover:text-mining-gold transition-colors duration-300"
                whileHover={{ rotate: 15 }}
              >
                {feature.icon}
              </motion.div>
              <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-mining-gold transition-colors duration-300">
                {feature.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          className="text-center"
          variants={itemVariants}
        >
          <motion.div
            className="mining-card max-w-2xl mx-auto"
            whileHover={{ scale: 1.02 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-white">
              Ready to Transform Your Mining Operations?
            </h2>
            <p className="text-gray-300 mb-8 text-lg">
              Join the future of mining with advanced blast monitoring, 
              AI-powered predictions, and comprehensive safety analytics.
            </p>
            
            <motion.button
              className="mining-button text-lg px-8 py-4 font-semibold relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/login')}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-mining-neon/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
              <span className="relative z-10 flex items-center justify-center">
                Get Started
                <Zap className="ml-2 w-5 h-5" />
              </span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Floating Elements */}
        <motion.div 
          className="absolute top-1/4 left-20 text-mining-gold/30"
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        >
          <Pickaxe className="w-16 h-16" />
        </motion.div>
      </motion.div>
    </div>
  )
}

export default LandingPage
