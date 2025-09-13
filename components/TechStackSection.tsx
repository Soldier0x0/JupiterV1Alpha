'use client'

import { motion } from 'framer-motion'
import { Code, Database, Cloud, Zap, Shield, Brain, Cpu, Globe } from 'lucide-react'

const TechStackSection = () => {
  const techCategories = [
    {
      category: 'Backend & Processing',
      icon: Code,
      color: 'from-blue-500 to-blue-600',
      technologies: [
        { name: 'Python', description: 'Core backend logic and AI integration', level: 95 },
        { name: 'Go', description: 'High-performance data processing', level: 85 },
        { name: 'Rust', description: 'Critical path optimization', level: 80 },
        { name: 'FastAPI', description: 'API framework for microservices', level: 90 }
      ]
    },
    {
      category: 'Frontend & UI',
      icon: Globe,
      color: 'from-green-500 to-teal-500',
      technologies: [
        { name: 'React', description: 'Modern UI framework', level: 90 },
        { name: 'TypeScript', description: 'Type-safe development', level: 85 },
        { name: 'Next.js', description: 'Full-stack React framework', level: 88 },
        { name: 'Tailwind CSS', description: 'Utility-first styling', level: 92 }
      ]
    },
    {
      category: 'Data & Storage',
      icon: Database,
      color: 'from-purple-500 to-pink-500',
      technologies: [
        { name: 'PostgreSQL', description: 'Primary relational database', level: 88 },
        { name: 'TimescaleDB', description: 'Time-series data optimization', level: 82 },
        { name: 'OpenSearch', description: 'Log analytics and search', level: 85 },
        { name: 'MinIO', description: 'Object storage solution', level: 80 }
      ]
    },
    {
      category: 'AI & Machine Learning',
      icon: Brain,
      color: 'from-orange-500 to-red-500',
      technologies: [
        { name: 'Langflow AI', description: 'AI workflow orchestration', level: 90 },
        { name: 'OpenAI API', description: 'Large language model integration', level: 88 },
        { name: 'Ollama', description: 'Local LLM deployment', level: 85 },
        { name: 'Vector Search', description: 'Similarity and pattern matching', level: 83 }
      ]
    },
    {
      category: 'Infrastructure',
      icon: Cloud,
      color: 'from-cyan-500 to-blue-500',
      technologies: [
        { name: 'Docker', description: 'Containerization platform', level: 90 },
        { name: 'Kubernetes', description: 'Container orchestration', level: 85 },
        { name: 'Azure', description: 'Cloud infrastructure', level: 82 },
        { name: 'Cloudflare', description: 'CDN and security', level: 88 }
      ]
    },
    {
      category: 'Security & Monitoring',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      technologies: [
        { name: 'Prometheus', description: 'Metrics collection and monitoring', level: 85 },
        { name: 'Loki', description: 'Log aggregation system', level: 83 },
        { name: 'Grafana', description: 'Observability dashboards', level: 88 },
        { name: 'Apache NiFi', description: 'Data flow management', level: 80 }
      ]
    }
  ]

  const aiCollaboration = [
    {
      name: 'Emergent (Claude)',
      description: 'Primary development assistant and architecture design',
      icon: '🚀',
      contribution: 'System design, code generation, problem solving'
    },
    {
      name: 'GitHub Copilot',
      description: 'Code completion and optimization',
      icon: '⚡',
      contribution: 'Code suggestions, refactoring, documentation'
    },
    {
      name: 'ChatGPT',
      description: 'Research and planning assistance',
      icon: '🧠',
      contribution: 'Technical research, best practices, debugging'
    }
  ]

  return (
    <section id="tech-stack" className="py-20 bg-gray-50 dark:bg-dark-900">
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
              Technology Stack
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A carefully curated selection of cutting-edge technologies for maximum performance and scalability
          </p>
        </motion.div>

        {/* Tech Categories Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {techCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              {/* Category Header */}
              <div className="flex items-center mb-6">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center mr-4`}>
                  <category.icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {category.category}
                </h3>
              </div>

              {/* Technologies */}
              <div className="space-y-4">
                {category.technologies.map((tech, techIndex) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: (categoryIndex * 0.1) + (techIndex * 0.1) }}
                    viewport={{ once: true }}
                    className="group"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-jupiter-500 transition-colors duration-200">
                        {tech.name}
                      </h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {tech.level}%
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {tech.description}
                    </p>
                    {/* Progress Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${tech.level}%` }}
                        transition={{ duration: 1, delay: (categoryIndex * 0.1) + (techIndex * 0.1) }}
                        viewport={{ once: true }}
                        className={`h-2 rounded-full bg-gradient-to-r ${category.color}`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI Collaboration Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-jupiter-50 to-cyber-50 dark:from-dark-800 dark:to-dark-700 rounded-3xl p-8 mb-12"
        >
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
            AI-Powered Development
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Project Jupiter is developed with cutting-edge AI collaboration, leveraging the latest in artificial intelligence 
            to accelerate development and ensure best practices.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6">
            {aiCollaboration.map((ai, index) => (
              <motion.div
                key={ai.name}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white dark:bg-dark-600 rounded-xl p-6 shadow-lg text-center"
              >
                <div className="text-4xl mb-4">{ai.icon}</div>
                <h4 className="font-bold text-jupiter-600 dark:text-jupiter-400 mb-2">
                  {ai.name}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {ai.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {ai.contribution}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center"
        >
          {[
            { number: '15+', label: 'Technologies' },
            { number: '6', label: 'Core Components' },
            { number: '23', label: 'Development Phases' },
            { number: '3', label: 'AI Collaborators' }
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="bg-white dark:bg-dark-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="text-3xl font-bold text-jupiter-500 mb-2">
                {stat.number}
              </div>
              <div className="text-gray-600 dark:text-gray-300 text-sm">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default TechStackSection