'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Brain, Globe, ChevronDown } from 'lucide-react'

const HeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const features = [
    { icon: Shield, text: 'Advanced Security', color: 'text-red-500' },
    { icon: Brain, text: 'AI-Powered Analytics', color: 'text-purple-500' },
    { icon: Zap, text: 'Real-time Processing', color: 'text-yellow-500' },
    { icon: Globe, text: 'Global Threat Intelligence', color: 'text-blue-500' },
  ]

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative pt-16 px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Main Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-6"
          >
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4">
              <span className="bg-gradient-to-r from-jupiter-500 via-jupiter-400 to-jupiter-600 bg-clip-text text-transparent">
                Project
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyber-500 via-cyber-400 to-cyber-600 bg-clip-text text-transparent">
                Jupiter
              </span>
            </h1>
            <div className="w-24 h-1 bg-jupiter-gradient mx-auto mb-6"></div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-4 max-w-4xl mx-auto leading-relaxed"
          >
            Next-Generation <span className="font-semibold text-jupiter-500">SIEM Platform</span>
            <br />
            End-to-End Security Information and Event Management
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="text-lg text-gray-500 dark:text-gray-400 mb-8"
          >
            Designed & Developed by{' '}
            <span className="font-semibold text-jupiter-500">Harsha Vardhan</span>
            <br />
            <span className="text-sm">
              Built with AI collaboration • Started August 2025 • Phase 0 Complete
            </span>
          </motion.div>
        </motion.div>

        {/* Feature Icons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05, y: -5 }}
              className="flex flex-col items-center p-6 bg-white/50 dark:bg-dark-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 jupiter-glow"
            >
              <feature.icon size={32} className={`${feature.color} mb-3`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                {feature.text}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.1 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => scrollToSection('architecture')}
            className="px-8 py-4 bg-jupiter-gradient text-white rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 jupiter-glow"
          >
            Explore Architecture
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="https://github.com/Soldier0x0/JupiterEmerge"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-4 border-2 border-jupiter-500 text-jupiter-500 hover:bg-jupiter-500 hover:text-white rounded-full font-semibold transition-all duration-300"
          >
            View on GitHub
          </motion.a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.3 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer"
          onClick={() => scrollToSection('architecture')}
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center text-gray-400 dark:text-gray-500 hover:text-jupiter-500 transition-colors duration-300"
          >
            <span className="text-sm mb-2">Scroll to explore</span>
            <ChevronDown size={24} />
          </motion.div>
        </motion.div>

        {/* Jupiter Planet Animation */}
        <motion.div
          className="absolute top-20 right-10 w-32 h-32 opacity-20 pointer-events-none hidden lg:block"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: 'linear' },
            scale: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
          }}
        >
          <div className="w-full h-full bg-jupiter-gradient rounded-full shadow-2xl opacity-60"></div>
        </motion.div>
      </div>
    </section>
  )
}

export default HeroSection