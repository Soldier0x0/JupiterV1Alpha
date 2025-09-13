'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, Cloud, Shield, Zap, Brain, Network, ChevronRight, Eye, EyeOff } from 'lucide-react'

const ArchitectureSection = () => {
  const [showDetailed, setShowDetailed] = useState(false)

  const architectureComponents = [
    {
      title: 'Data Ingestion Layer',
      icon: Database,
      description: 'Multi-source data collection and preprocessing',
      technologies: ['Apache NiFi', 'Syslog', 'APIs', 'Dark Web Feeds'],
      color: 'from-blue-500 to-blue-600',
      details: 'Handles real-time data ingestion from multiple sources including threat feeds, system logs, network traffic, and dark web intelligence. Uses Apache NiFi for data flow management and preprocessing.'
    },
    {
      title: 'Processing Engine',
      icon: Zap,
      description: 'Real-time data processing and normalization',
      technologies: ['Go', 'Rust', 'Python', 'TimescaleDB'],
      color: 'from-yellow-500 to-orange-500',
      details: 'High-performance processing engine built with Go and Rust for speed, Python for flexibility. Normalizes, enriches, and correlates security events in real-time.'
    },
    {
      title: 'AI Analytics Core',
      icon: Brain,
      description: 'Machine learning powered threat detection',
      technologies: ['Langflow AI', 'OpenAI API', 'Ollama', 'Vector Search'],
      color: 'from-purple-500 to-pink-500',
      details: 'Advanced AI/ML pipeline using Langflow for orchestration, LLM integration for natural language processing of threat intelligence, and vector search for similarity detection.'
    },
    {
      title: 'Storage Layer',
      icon: Cloud,
      description: 'Distributed data storage and archival',
      technologies: ['PostgreSQL', 'MinIO', 'OpenSearch', 'TimescaleDB'],
      color: 'from-green-500 to-teal-500',
      details: 'Multi-tier storage architecture with PostgreSQL for structured data, MinIO for object storage, OpenSearch for log analytics, and TimescaleDB for time-series data.'
    },
    {
      title: 'Security Layer',
      icon: Shield,
      description: 'Zero-trust security framework',
      technologies: ['mTLS', 'RBAC', 'MFA', 'Encryption'],
      color: 'from-red-500 to-red-600',
      details: 'Comprehensive security implementation with mutual TLS, role-based access control, multi-factor authentication, and end-to-end encryption for all data flows.'
    },
    {
      title: 'Integration Hub',
      icon: Network,
      description: 'External system integrations and APIs',
      technologies: ['MISP', 'OpenCTI', 'SOAR', 'IR Tools'],
      color: 'from-cyan-500 to-blue-500',
      details: 'Seamless integration with existing security infrastructure including MISP for threat intelligence sharing, OpenCTI for knowledge management, and SOAR platforms.'
    }
  ]

  return (
    <section id="architecture" className="py-20 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-jupiter-500 to-cyber-500 bg-clip-text text-transparent">
              System Architecture
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            A comprehensive, modular architecture designed for scalability, security, and performance
          </p>
          
          {/* View Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowDetailed(!showDetailed)}
            className="flex items-center space-x-2 mx-auto px-6 py-3 bg-jupiter-100 dark:bg-jupiter-900/30 text-jupiter-600 dark:text-jupiter-400 rounded-full hover:bg-jupiter-200 dark:hover:bg-jupiter-900/50 transition-all duration-300"
          >
            {showDetailed ? <EyeOff size={20} /> : <Eye size={20} />}
            <span>{showDetailed ? 'Simplified View' : 'Detailed View'}</span>
          </motion.button>
        </motion.div>

        {/* Architecture Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {architectureComponents.map((component, index) => (
            <motion.div
              key={component.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative group"
            >
              <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 h-full">
                {/* Icon with gradient background */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${component.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <component.icon size={32} className="text-white" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {component.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {component.description}
                </p>

                {/* Technologies */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {component.technologies.map((tech, techIndex) => (
                    <span
                      key={techIndex}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Detailed View */}
                <AnimatePresence>
                  {showDetailed && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {component.details}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Hover indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ChevronRight size={20} className="text-jupiter-500" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Architecture Flow Diagram */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-jupiter-50 to-cyber-50 dark:from-dark-800 dark:to-dark-700 rounded-3xl p-8 mb-12"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Data Flow Architecture
          </h3>
          
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-8">
            {['Input Sources', 'Processing', 'AI Analysis', 'Storage', 'Response'].map((stage, index) => (
              <div key={stage} className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="bg-white dark:bg-dark-600 rounded-full p-4 shadow-lg border-2 border-jupiter-200 dark:border-jupiter-700"
                >
                  <span className="text-sm font-semibold text-jupiter-600 dark:text-jupiter-400">
                    {stage}
                  </span>
                </motion.div>
                {index < 4 && (
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                    className="hidden md:block ml-4 text-jupiter-400"
                  >
                    <ChevronRight size={24} />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Key Features */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">
            Architecture Highlights
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: 'Scalable & Modular',
                description: 'Each component can scale independently based on load requirements'
              },
              {
                title: 'AI-First Design',
                description: 'Built from ground up with AI/ML capabilities as core components'
              },
              {
                title: 'Zero-Trust Security',
                description: 'Every component authenticated and encrypted by default'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                whileHover={{ y: -5 }}
                className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
              >
                <h4 className="font-bold text-jupiter-600 dark:text-jupiter-400 mb-2">
                  {feature.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default ArchitectureSection