'use client'

import { motion, useScroll, useTransform } from 'framer-motion'
import { ChevronDown, Satellite, Zap, Brain, Shield, Globe, Radar, Orbit } from 'lucide-react'

const HeroSection = () => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, -200])
  const opacity = useTransform(scrollY, [0, 300], [1, 0])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Space-themed features with cyber/orbital icons
  const features = [
    { 
      icon: Satellite, 
      text: 'Orbit-Scale Security Visibility', 
      color: 'text-neon-cyan',
      glow: 'drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]'
    },
    { 
      icon: Brain, 
      text: 'AI-Assisted Threat Hunting', 
      color: 'text-neon-purple',
      glow: 'drop-shadow-[0_0_8px_rgba(191,0,255,0.8)]'
    },
    { 
      icon: Zap, 
      text: 'Streaming Detection at Wire Speed', 
      color: 'text-jupiter-400',
      glow: 'drop-shadow-[0_0_8px_rgba(237,118,17,0.8)]'
    },
    { 
      icon: Orbit, 
      text: 'Global Threat Intel Constellations', 
      color: 'text-neon-green',
      glow: 'drop-shadow-[0_0_8px_rgba(57,255,20,0.8)]'
    },
  ]

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative pt-16 px-4 overflow-hidden">
      <motion.div 
        style={{ y, opacity }}
        className="max-w-7xl mx-auto text-center relative z-10"
      >
        {/* Main Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-8"
        >
          {/* Project Jupiter Title with Cool Fonts */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, delay: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-audiowide font-bold mb-6 leading-tight">
              <span className="block text-white mb-2">
                project
              </span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-jupiter-400 via-neon-orange to-neon-pink">
                Jupiter
              </span>
            </h1>
            
            {/* Orbital ring around title */}
            <motion.div 
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-neon-cyan/20 rounded-full opacity-40 pointer-events-none"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
          </motion.div>

          {/* Subtitle with space theme */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="mb-6"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-orbitron font-bold text-white mb-4">
              Orbit-Scale Security Visibility
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 font-rajdhani font-light leading-relaxed max-w-4xl mx-auto">
              AI-powered analytics and real-time detection,{' '}
              <span className="text-neon-cyan font-medium">designed for defenders of tomorrow</span>
            </p>
          </motion.div>

          {/* Developer attribution */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0 }}
            className="text-base text-gray-500 mb-12 font-rajdhani"
          >
            Engineered by{' '}
            <span className="font-semibold text-jupiter-400">Harsha Vardhan</span>
            <br />
            <span className="text-sm text-gray-600">
              Built with AI collaboration • Phase 0 Complete • Active Development
            </span>
          </motion.div>
        </motion.div>

        {/* Feature Icons Grid */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16 max-w-5xl mx-auto"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.4 + index * 0.1 }}
              whileHover={{ 
                scale: 1.05, 
                y: -8,
                transition: { duration: 0.6, ease: 'easeOut' }
              }}
              className="group"
            >
              <div className="relative p-6 bg-dark-cosmos/40 backdrop-blur-sm rounded-2xl border border-gray-800 hover:border-neon-cyan/50 transition-all duration-700 cyber-glow hover-slow">
                {/* Icon with orbital ring */}
                <div className="relative mb-4 flex justify-center">
                  <motion.div
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 1, ease: 'easeInOut' }}
                    className={`w-12 h-12 ${feature.color} ${feature.glow} group-hover:scale-110 transition-all duration-500`}
                  >
                    <feature.icon size={48} />
                  </motion.div>
                  {/* Orbital ring around icon */}
                  <div className="absolute inset-0 w-16 h-16 border border-gray-700 group-hover:border-neon-cyan/40 rounded-full -m-2 group-hover:scale-125 transition-all duration-700" />
                </div>
                
                <p className="text-sm font-rajdhani font-medium text-gray-300 group-hover:text-gray-100 text-center leading-relaxed transition-colors duration-500">
                  {feature.text}
                </p>

                {/* Hover shimmer effect */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20"
        >
          <motion.button
            whileHover={{ 
              scale: 1.05, 
              boxShadow: '0 0 40px rgba(0, 245, 255, 0.6), 0 0 80px rgba(0, 245, 255, 0.3)' 
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.6 }}
            onClick={() => scrollToSection('architecture')}
            className="group relative px-10 py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-dark-void font-orbitron font-bold text-lg rounded-full shadow-2xl hover:shadow-neon-cyan/50 transition-all duration-600 overflow-hidden"
          >
            <span className="relative z-10">Explore Architecture</span>
            {/* Button glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan to-neon-purple opacity-0 group-hover:opacity-20 transition-opacity duration-600" />
          </motion.button>
          
          <motion.a
            whileHover={{ 
              scale: 1.05,
              borderColor: 'rgba(0, 245, 255, 1)',
              boxShadow: '0 0 30px rgba(0, 245, 255, 0.4)'
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.6 }}
            href="https://github.com/Soldier0x0/JupiterEmerge"
            target="_blank"
            rel="noopener noreferrer"
            className="group px-10 py-4 border-2 border-neon-cyan/60 text-neon-cyan hover:text-dark-void hover:bg-neon-cyan font-orbitron font-bold text-lg rounded-full transition-all duration-600 relative overflow-hidden"
          >
            <span className="relative z-10">View on GitHub</span>
            {/* Fill effect on hover */}
            <div className="absolute inset-0 bg-neon-cyan transform translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
          </motion.a>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 2 }}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 cursor-pointer group"
          onClick={() => scrollToSection('architecture')}
        >
          <motion.div
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center text-gray-400 group-hover:text-neon-cyan transition-colors duration-500"
          >
            <span className="text-sm font-rajdhani mb-2 group-hover:text-glow">Navigate to Mission Control</span>
            <div className="relative">
              <ChevronDown size={24} className="group-hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
              <div className="absolute inset-0 w-8 h-8 border border-neon-cyan/30 rounded-full -m-2 group-hover:border-neon-cyan/80 transition-colors duration-500" />
            </div>
          </motion.div>
        </motion.div>

        {/* Background decorative elements */}
        <div className="absolute top-1/4 right-10 w-2 h-2 bg-neon-cyan rounded-full animate-twinkle opacity-60" />
        <div className="absolute top-1/3 left-10 w-1 h-1 bg-jupiter-400 rounded-full animate-twinkle opacity-40" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-1.5 h-1.5 bg-neon-purple rounded-full animate-twinkle opacity-50" style={{ animationDelay: '2s' }} />
      </motion.div>
    </section>
  )
}

export default HeroSection