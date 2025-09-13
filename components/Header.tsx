'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Menu, X, Shield, Code, Rocket, Mail, Satellite, Radar } from 'lucide-react'
import { useTheme } from './ThemeProvider'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setIsOpen(false)
    }
  }

  // Space-themed navigation items
  const navItems = [
    { name: 'Mission Control', id: 'architecture', icon: Satellite },
    { name: 'Tech Arsenal', id: 'tech-stack', icon: Code },
    { name: 'Launch Sequence', id: 'development', icon: Rocket },
    { name: 'Ground Control', id: 'contact', icon: Radar },
  ]

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-dark-cosmos/80 backdrop-blur-xl shadow-2xl border-b border-neon-cyan/20'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Minimal Logo - Just orbital ring */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.8 }}
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => scrollToSection('hero')}
          >
            <div className="relative">
              {/* Orbital rings */}
              <div className="w-10 h-10 border-2 border-neon-cyan/60 rounded-full animate-pulse-slow relative group-hover:border-neon-cyan">
                <div className="absolute inset-1 border border-jupiter-400/40 rounded-full group-hover:border-jupiter-400/80" />
                <div className="absolute inset-2 bg-gradient-to-br from-neon-cyan via-jupiter-400 to-neon-purple rounded-full opacity-70 group-hover:opacity-100" />
              </div>
              {/* Small orbiting dot */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-neon-cyan rounded-full animate-orbit shadow-lg shadow-neon-cyan/50" />
            </div>
            <span className="text-lg font-orbitron font-bold text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-jupiter-400 hover:from-jupiter-400 hover:to-neon-cyan transition-all duration-500">
              JUPITER
            </span>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => scrollToSection(item.id)}
                className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-neon-cyan transition-all duration-500 group relative hover-slow"
              >
                <item.icon size={16} className="group-hover:text-neon-cyan group-hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.8)] transition-all duration-500" />
                <span className="font-rajdhani font-medium">{item.name}</span>
                {/* Hover underline effect */}
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-neon-cyan to-jupiter-400 group-hover:w-full transition-all duration-500" />
              </motion.button>
            ))}
          </nav>

          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.5 }}
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-full bg-dark-deep/50 hover:bg-dark-deep border border-neon-cyan/30 hover:border-neon-cyan transition-all duration-500 cyber-glow"
            >
              <AnimatePresence mode="wait">
                {theme === 'dark' ? (
                  <motion.div
                    key="sun"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Sun size={18} className="text-jupiter-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Moon size={18} className="text-neon-cyan" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Mobile Menu Button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-full bg-dark-deep/50 hover:bg-dark-deep border border-neon-cyan/30 hover:border-neon-cyan transition-all duration-500"
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <X size={18} className="text-neon-cyan" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Menu size={18} className="text-neon-cyan" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="md:hidden bg-dark-cosmos/95 backdrop-blur-xl border-t border-neon-cyan/20"
          >
            <div className="px-4 py-6 space-y-2">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ x: 10, scale: 1.02 }}
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center space-x-3 w-full px-4 py-3 text-left text-gray-300 hover:text-neon-cyan hover:bg-dark-deep/50 rounded-xl transition-all duration-500 group"
                >
                  <item.icon size={18} className="group-hover:text-neon-cyan group-hover:drop-shadow-[0_0_8px_rgba(0,245,255,0.8)] transition-all duration-500" />
                  <span className="font-rajdhani font-medium">{item.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Header