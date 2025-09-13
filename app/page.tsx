'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import SimpleHeroSection from '@/components/SimpleHeroSection'
import ArchitectureSection from '@/components/ArchitectureSection'
import TechStackSection from '@/components/TechStackSection'
import DevelopmentPhases from '@/components/DevelopmentPhases'
import ContactSection from '@/components/ContactSection'
import Header from '@/components/Header'
// import Footer from '@/components/Footer'
import { JupiterBackground } from '@/components/JupiterBackground'

export default function Home() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-dark-cosmos transition-colors duration-300">
      <JupiterBackground />
      <Header />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <SimpleHeroSection />
        <ArchitectureSection />
        <TechStackSection />
        <DevelopmentPhases />
        <ContactSection />
      </motion.div>
      
      {/* <Footer /> */}
    </main>
  )
}