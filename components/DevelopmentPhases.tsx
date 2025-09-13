'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  Circle, 
  Clock, 
  Zap, 
  Shield, 
  Database, 
  Brain, 
  Cloud, 
  Network,
  ChevronRight,
  ChevronDown,
  Calendar,
  Target
} from 'lucide-react'

const DevelopmentPhases = () => {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const phases = [
    {
      phase: 0,
      title: 'Alpha Foundation',
      status: 'completed',
      category: 'foundation',
      icon: Target,
      duration: 'August 2025',
      description: 'Information gathering, technological resources, planning and blueprinting',
      details: [
        'Comprehensive threat landscape analysis',
        'Technology stack evaluation and selection',
        'System architecture design and documentation', 
        'Development roadmap creation',
        'Resource allocation planning',
        'Security framework design'
      ],
      achievements: [
        '23-phase development plan created',
        'Complete technology stack defined',
        'Architecture diagrams finalized',
        'AI collaboration framework established'
      ]
    },
    {
      phase: 1,
      title: 'Core Infrastructure',
      status: 'in-progress',
      category: 'infrastructure',
      icon: Cloud,
      duration: 'September 2025',
      description: 'Setting up foundational infrastructure and core services',
      details: [
        'Docker containerization setup',
        'Kubernetes cluster configuration',
        'CI/CD pipeline implementation',
        'Basic monitoring and logging',
        'Database initialization',
        'Security baseline implementation'
      ],
      achievements: []
    },
    {
      phase: 2,
      title: 'Data Ingestion Engine',
      status: 'planned',
      category: 'processing',
      icon: Database,
      duration: 'October 2025',
      description: 'Building robust data collection and preprocessing capabilities',
      details: [
        'Multi-source data collectors',
        'Apache NiFi flow configuration',
        'Data validation and sanitization',
        'Real-time streaming setup',
        'Backup and recovery systems',
        'Performance optimization'
      ],
      achievements: []
    },
    {
      phase: 3,
      title: 'AI Analytics Core',
      status: 'planned',
      category: 'ai',
      icon: Brain,
      duration: 'November 2025',
      description: 'Implementing machine learning and AI-powered threat detection',
      details: [
        'Langflow AI integration',
        'LLM pipeline development',
        'Vector search implementation',
        'Threat pattern recognition',
        'Anomaly detection algorithms',
        'AI model training and optimization'
      ],
      achievements: []
    },
    {
      phase: 4,
      title: 'Security Framework',
      status: 'planned',
      category: 'security',
      icon: Shield,
      duration: 'December 2025',
      description: 'Zero-trust security implementation across all components',
      details: [
        'mTLS implementation',
        'RBAC system development',
        'MFA integration',
        'Encryption at rest and in transit',
        'Security audit logging',
        'Penetration testing preparation'
      ],
      achievements: []
    },
    {
      phase: 5,
      title: 'Integration Layer',
      status: 'planned',
      category: 'integration',
      icon: Network,
      duration: 'January 2026',
      description: 'External system integrations and API development',
      details: [
        'MISP integration',
        'OpenCTI connectivity',
        'SOAR platform APIs',
        'Third-party threat feeds',
        'Custom integration framework',
        'API rate limiting and management'
      ],
      achievements: []
    }
  ]

  const categories = [
    { id: 'all', name: 'All Phases', icon: Circle },
    { id: 'foundation', name: 'Foundation', icon: Target },
    { id: 'infrastructure', name: 'Infrastructure', icon: Cloud },
    { id: 'processing', name: 'Processing', icon: Database },
    { id: 'ai', name: 'AI & ML', icon: Brain },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'integration', name: 'Integration', icon: Network }
  ]

  const filteredPhases = selectedCategory === 'all' 
    ? phases 
    : phases.filter(phase => phase.category === selectedCategory)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />
      case 'in-progress':
        return <Clock className="text-yellow-500" size={20} />
      default:
        return <Circle className="text-gray-400" size={20} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'from-green-500 to-green-600'
      case 'in-progress':
        return 'from-yellow-500 to-orange-500'
      default:
        return 'from-gray-400 to-gray-500'
    }
  }

  return (
    <section id="development" className="py-20 relative">
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
              Development Journey
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
            A comprehensive 23-phase development roadmap spanning from initial planning to full production deployment
          </p>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-lg">
              <div className="text-2xl font-bold text-green-500">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
            </div>
            <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-lg">
              <div className="text-2xl font-bold text-yellow-500">1</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">In Progress</div>
            </div>
            <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-lg">
              <div className="text-2xl font-bold text-blue-500">{phases.length - 2}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Planned</div>
            </div>
            <div className="bg-white dark:bg-dark-800 rounded-lg p-4 shadow-lg">
              <div className="text-2xl font-bold text-jupiter-500">23</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Phases</div>
            </div>
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {categories.map((category) => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-jupiter-500 text-white shadow-lg'
                  : 'bg-white dark:bg-dark-800 text-gray-600 dark:text-gray-300 hover:bg-jupiter-100 dark:hover:bg-jupiter-900/30'
              }`}
            >
              <category.icon size={16} />
              <span className="text-sm font-medium">{category.name}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-jupiter-500 to-cyber-500 hidden md:block"></div>
          
          {/* Phase Cards */}
          <div className="space-y-8">
            {filteredPhases.map((phase, index) => (
              <motion.div
                key={phase.phase}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Timeline Dot */}
                <div className="absolute left-6 w-4 h-4 rounded-full bg-white dark:bg-dark-800 border-4 border-jupiter-500 z-10 hidden md:block"></div>
                
                {/* Phase Card */}
                <div className="md:ml-16 bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="p-6">
                    {/* Phase Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${getStatusColor(phase.status)} flex items-center justify-center`}>
                          <phase.icon className="text-white" size={24} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                              Phase {phase.phase}: {phase.title}
                            </h3>
                            {getStatusIcon(phase.status)}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-1">
                              <Calendar size={14} />
                              <span>{phase.duration}</span>
                            </div>
                            <span className="capitalize">{phase.status.replace('-', ' ')}</span>
                          </div>
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setExpandedPhase(expandedPhase === phase.phase ? null : phase.phase)}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                      >
                        <motion.div
                          animate={{ rotate: expandedPhase === phase.phase ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight size={20} className="text-gray-400" />
                        </motion.div>
                      </motion.button>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                      {phase.description}
                    </p>

                    {/* Achievements */}
                    {phase.achievements.length > 0 && (
                      <div className="mb-4">
                        <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2 flex items-center">
                          <CheckCircle size={16} className="mr-2" />
                          Key Achievements
                        </h4>
                        <div className="grid md:grid-cols-2 gap-2">
                          {phase.achievements.map((achievement, idx) => (
                            <div key={idx} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                              <span>{achievement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Expanded Details */}
                    <AnimatePresence>
                      {expandedPhase === phase.phase && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-200 dark:border-gray-600 pt-4 mt-4"
                        >
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                            Phase Details & Deliverables
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {phase.details.map((detail, idx) => (
                              <div key={idx} className="flex items-start space-x-2 text-sm text-gray-600 dark:text-gray-300">
                                <div className="w-1.5 h-1.5 bg-jupiter-400 rounded-full mt-2 flex-shrink-0"></div>
                                <span>{detail}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Future Phases Teaser */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 text-center bg-gradient-to-r from-jupiter-50 to-cyber-50 dark:from-dark-800 dark:to-dark-700 rounded-3xl p-8"
        >
          <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            What's Coming Next?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-3xl mx-auto">
            The remaining 17 phases will cover advanced features including real-time threat hunting, 
            automated incident response, compliance reporting, and enterprise-grade scalability features.
          </p>
          <div className="grid md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              'Advanced Analytics',
              'Automated Response',
              'Enterprise Features'
            ].map((feature, index) => (
              <div key={feature} className="bg-white dark:bg-dark-600 rounded-lg p-4 shadow-md">
                <span className="text-jupiter-500 font-semibold">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default DevelopmentPhases