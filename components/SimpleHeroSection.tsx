'use client'

import { motion } from 'framer-motion'
import { Terminal, ArrowRight, Shield, Zap, Cpu } from 'lucide-react'

const SimpleHeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-gray-900 to-black">
      {/* Background geometric elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-80 h-80 border border-cyan-400/10 rotate-45 animate-spin" style={{ animationDuration: '60s' }} />
        <div className="absolute bottom-1/4 left-1/3 w-60 h-60 border border-orange-400/10 rotate-12 animate-pulse" />
      </div>

      {/* Left side indicators */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 flex flex-col items-center space-y-8 z-20">
        <div className="writing-mode-vertical text-xs font-mono text-gray-500 tracking-widest">
          CYBERSEC_PROJECT_2025
        </div>
        <div className="flex flex-col space-y-4">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
          <div className="w-1 h-8 bg-gradient-to-b from-emerald-400 to-transparent opacity-60" />
          <div className="w-2 h-2 bg-orange-400 rounded-full opacity-40" />
        </div>
        <div className="writing-mode-vertical text-xs font-mono text-orange-400">
          PHASE_00_COMPLETE
        </div>
      </div>

      {/* Main content */}
      <div className="ml-24 pt-32 max-w-6xl">
        {/* Terminal header */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-2 text-emerald-400 font-mono text-sm mb-4">
            <Terminal size={16} />
            <span>~/projects/jupiter $</span>
            <span className="animate-pulse">|</span>
          </div>
          <div className="text-gray-400 font-mono text-sm">
            <span className="text-emerald-400">harsha@projectjupiter</span>
            <span className="text-gray-600">:</span>
            <span className="text-blue-400">~/siem-platform</span> 
            <span className="text-gray-400"> initialized</span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="mb-12"
        >
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative mb-2"
          >
            <h1 className="text-2xl md:text-3xl font-light text-gray-400 font-mono tracking-wider ml-12">
              project
            </h1>
            <div className="absolute -bottom-1 left-0 w-10 h-px bg-gradient-to-r from-emerald-400 to-transparent" />
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-500 to-orange-600 leading-none tracking-tight">
              JUPITER
            </h1>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="mt-8 ml-4"
          >
            <div className="font-mono text-sm text-gray-500 mb-2">
              {'>'} SIEM.exe --mode=realtime --threat-intel=global
            </div>
            <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed max-w-2xl">
              Next-generation security platform with{' '}
              <span className="text-cyan-400 font-medium">orbit-scale visibility</span>
              {' '}and AI-powered threat detection
            </p>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 font-mono text-sm"
        >
          {[
            { label: 'COMPONENTS', value: '06', color: 'text-emerald-400' },
            { label: 'TECH_STACK', value: '15+', color: 'text-cyan-400' },
            { label: 'AI_MODELS', value: '03', color: 'text-orange-400' },
            { label: 'PHASES', value: '23', color: 'text-purple-400' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.7 + index * 0.1 }}
              className="border border-gray-800 bg-black/40 p-4 backdrop-blur-sm hover:border-gray-600 transition-all duration-500 group"
            >
              <div className={`text-2xl font-bold ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                {stat.value}
              </div>
              <div className="text-gray-500 text-xs mt-1 tracking-wide">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Action area */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
          className="flex flex-col md:flex-row items-start space-y-4 md:space-y-0 md:space-x-8"
        >
          <motion.button
            whileHover={{ x: 10, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => scrollToSection('architecture')}
            className="group flex items-center space-x-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-black font-semibold px-8 py-4 relative overflow-hidden transition-all duration-300"
          >
            <span className="relative z-10">EXPLORE ARCHITECTURE</span>
            <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </motion.button>

          <div className="flex items-center space-x-4 text-gray-400 font-mono text-sm">
            <div className="w-px h-8 bg-gray-700" />
            <div>
              <div>DEVELOPER: Harsha Vardhan</div>
              <div className="text-xs text-gray-600">AI-ASSISTED_DEVELOPMENT</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right side floating elements */}
      <div className="absolute right-12 top-1/2 -translate-y-1/2 space-y-8 hidden lg:block">
        {[
          { icon: Shield, color: 'text-red-400' },
          { icon: Cpu, color: 'text-blue-400' },
          { icon: Zap, color: 'text-yellow-400' },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 0.6, x: 0 }}
            transition={{ duration: 0.8, delay: 2.5 + index * 0.5 }}
            className={`p-4 border border-gray-800 bg-black/20 backdrop-blur-sm ${item.color} hover:scale-110 transition-transform cursor-pointer`}
          >
            <item.icon size={24} />
          </motion.div>
        ))}
      </div>

      {/* GitHub link */}
      <motion.a
        href="https://github.com/Soldier0x0/JupiterEmerge"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3 }}
        className="fixed bottom-8 right-8 font-mono text-xs text-gray-500 hover:text-cyan-400 transition-colors underline decoration-dotted"
      >
        view_source.git →
      </motion.a>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.5 }}
        className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer"
        onClick={() => scrollToSection('architecture')}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-px h-12 bg-gradient-to-b from-transparent via-gray-600 to-transparent"
        />
      </motion.div>
    </div>
  )
}

export default SimpleHeroSection