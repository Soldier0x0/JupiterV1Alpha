'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Moon, Sun, Menu, X, Circle } from 'lucide-react'
import { useTheme } from './ThemeProvider'

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  // Theme is always dark, no toggle needed

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

  const navItems = [
    { name: 'ARCH', id: 'architecture' },
    { name: 'TECH', id: 'tech-stack' },
    { name: 'DEV', id: 'development' },
    { name: 'CONTACT', id: 'contact' },
      { name: 'BLOG', external: true, url: 'https://blog.projectjupiter.in' },
    ]

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-black/80 backdrop-blur-lg border-b border-gray-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Minimal logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2 cursor-pointer font-mono"
            onClick={() => scrollToSection('hero')}
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-orange-400 rounded-full opacity-60" />
              <div className="w-2 h-2 bg-gray-600 rounded-full opacity-40" />
            </div>
            <span className="text-sm text-gray-400 hover:text-gray-200 transition-colors">
              JUPITER
            </span>
          </motion.div>

          {/* Desktop Navigation - Minimal */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                whileHover={{ y: -2 }}
                  onClick={() => item.external ? window.open(item.url, '_blank') : item.id && scrollToSection(item.id)}
                className="font-mono text-xs text-gray-500 hover:text-cyan-400 transition-colors duration-300 tracking-wider"
              >
                {item.name}
              </motion.button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-300"
            >
              {isOpen ? <X size={16} /> : <Menu size={16} />}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black/90 backdrop-blur-lg border-b border-gray-800"
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left font-mono text-sm text-gray-400 hover:text-cyan-400 py-2 transition-colors"
                >
                  {item.name}
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