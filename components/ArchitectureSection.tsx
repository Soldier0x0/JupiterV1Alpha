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
            <span className="text-jupiter-400 drop-shadow-[0_0_10px_rgba(237,118,17,0.5)]">
              System Architecture
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            A comprehensive, modular architecture designed for scalability, security, and performance
          </p>
          {/* Spacer removed */}
        </motion.div>

        {/* View Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-dark-deep border border-gray-700 rounded-full p-1 flex">
            <button
              onClick={() => setShowDetailed(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                !showDetailed 
                  ? 'bg-jupiter-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Simple
            </button>
            <button
              onClick={() => setShowDetailed(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                showDetailed 
                  ? 'bg-jupiter-500 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              Detailed
            </button>
          </div>
        </div>

        {/* Architecture Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {architectureComponents.map((component, index) => (
            <motion.div
              key={component.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="group bg-dark-cosmos/40 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-jupiter-400/50 transition-all duration-300"
            >
              {/* Icon and Title */}
              <div className="flex items-start space-x-4 mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${component.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <component.icon size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-jupiter-300 transition-colors">
                    {component.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {showDetailed ? component.details : component.description}
                  </p>
                </div>
              </div>

              {/* Technologies */}
              <div className="flex flex-wrap gap-2">
                {component.technologies.slice(0, showDetailed ? 4 : 2).map((tech, techIndex) => (
                  <span
                    key={techIndex}
                    className="px-2 py-1 bg-dark-deep text-gray-300 text-xs rounded-md border border-gray-700"
                  >
                    {tech}
                  </span>
                ))}
                {!showDetailed && component.technologies.length > 2 && (
                  <span className="px-2 py-1 text-gray-500 text-xs">
                    +{component.technologies.length - 2} more
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Data Flow Architecture */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-dark-cosmos/30 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-gray-200 dark:border-gray-800 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            Data Flow Architecture
          </h3>
          
          <div className="flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0 md:space-x-4">
            {[
              { 
                name: 'Input Sources', 
                icon: '📡', 
                tooltip: 'Logs, APIs, dark web feeds, network traffic' 
              },
              { 
                name: 'Processing', 
                icon: '⚙️', 
                tooltip: 'Real-time normalization and enrichment' 
              },
              { 
                name: 'AI Analysis', 
                icon: '🧠', 
                tooltip: 'Pattern recognition and threat detection' 
              },
              { 
                name: 'Storage', 
                icon: '💾', 
                tooltip: 'Multi-tier data persistence and archival' 
              },
              { 
                name: 'Response', 
                icon: '🚨', 
                tooltip: 'Alerting, reporting, and automated actions' 
              }
            ].map((stage, index) => (
              <div key={stage.name} className="flex items-center">
                <motion.div
                  whileHover={{ scale: 1.1, y: -5 }}
                  className="group relative bg-gray-50 dark:bg-dark-deep border border-gray-300 dark:border-gray-700 hover:border-jupiter-500 dark:hover:border-jupiter-400 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
                  title={stage.tooltip}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <span className="text-2xl">{stage.icon}</span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-jupiter-600 dark:group-hover:text-jupiter-400 transition-colors text-center">
                      {stage.name}
                    </span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 dark:bg-dark-void text-xs text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                    {stage.tooltip}
                  </div>
                </motion.div>
                
                {index < 4 && (
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    className="hidden md:block mx-3 text-jupiter-500 dark:text-jupiter-400"
                  >
                    <ChevronRight size={20} />
                  </motion.div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Architecture Highlights */}
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
                description: 'Each component can scale independently based on load requirements',
                icon: '🔧'
              },
              {
                title: 'AI-First Design',
                description: 'Built from ground up with AI/ML capabilities as core components',
                icon: '🤖'
              },
              {
                title: 'Zero-Trust Security',
                description: 'Every component authenticated and encrypted by default',
                icon: '🛡️'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ 
                  y: -8, 
                  scale: 1.02,
                  boxShadow: '0 10px 40px rgba(237, 118, 17, 0.2)'
                }}
                viewport={{ once: true }}
                className="group bg-white dark:bg-dark-cosmos/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-jupiter-500 dark:hover:border-jupiter-400/50 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl"
              >
                <div className="text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h4 className="font-bold text-jupiter-600 dark:text-jupiter-400 mb-3 group-hover:text-jupiter-700 dark:group-hover:text-jupiter-300 transition-colors">
                  {feature.title}
                </h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
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