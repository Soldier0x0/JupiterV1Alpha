'use client'

import { motion } from 'framer-motion'
import { Code, Database, Cloud, Zap, Shield, Brain, Cpu, Globe } from 'lucide-react'

const TechStackSection = () => {
  const techCategories = [
    {
      category: 'Backend',
      icon: Code,
      technologies: [
        { name: 'Python', description: 'Core backend logic and AI pipeline integration', icon: '🐍' },
        { name: 'Go', description: 'High-performance event and log processing', icon: '⚡' },
        { name: 'Rust', description: 'Critical path optimization for low-latency tasks', icon: '🦀' },
        { name: 'FastAPI', description: 'Lightweight API framework for microservices', icon: '🚀' }
      ]
    },
    {
      category: 'Frontend',
      icon: Globe,
      technologies: [
        { name: 'React', description: 'Modern UI for dashboards and controls', icon: '⚛️' },
        { name: 'TypeScript', description: 'Type-safe, maintainable development', icon: '📘' },
        { name: 'Next.js', description: 'Full-stack React framework powering the landing page', icon: '▲' },
        { name: 'Tailwind CSS', description: 'Utility-first styling for responsive UI', icon: '🎨' }
      ]
    },
    {
      category: 'Data & Storage',
      icon: Database,
      technologies: [
        { name: 'PostgreSQL', description: 'Relational database for core data', icon: '🐘' },
        { name: 'TimescaleDB', description: 'Optimized time-series log storage', icon: '⏰' },
        { name: 'OpenSearch', description: 'Full-text search & log analytics', icon: '🔍' },
        { name: 'MinIO', description: 'S3-compatible object storage', icon: '💾' }
      ]
    },
    {
      category: 'AI & ML',
      icon: Brain,
      technologies: [
        { name: 'Langflow AI', description: 'Visual AI orchestration for workflows', icon: '🧠' },
        { name: 'OpenAI API', description: 'LLM integration for analytics & detection', icon: '🤖' },
        { name: 'Ollama', description: 'Local deployment of LLM models', icon: '🦙' },
        { name: 'Vector Search', description: 'Similarity & anomaly detection engine', icon: '🎯' }
      ]
    },
    {
      category: 'Infrastructure',
      icon: Cloud,
      technologies: [
        { name: 'Docker', description: 'Containerization platform for services', icon: '🐳' },
        { name: 'Kubernetes', description: 'Scalable orchestration for containers', icon: '☸️' },
        { name: 'Azure', description: 'Always-free tier cloud infrastructure', icon: '☁️' },
        { name: 'Cloudflare', description: 'Domain, DNS, and DDoS protection', icon: '🛡️' }
      ]
    },
    {
      category: 'Security & Monitoring',
      icon: Shield,
      technologies: [
        { name: 'Prometheus', description: 'System metrics collection & alerts', icon: '📊' },
        { name: 'Loki', description: 'Log aggregation & query engine', icon: '📝' },
        { name: 'Grafana', description: 'Dashboards for observability', icon: '📈' },
        { name: 'Apache NiFi', description: 'Data flow ingestion & orchestration', icon: '🌊' },
  { name: 'Keycloak', description: 'Authentication & RBAC for multi-tenancy', icon: '🔑' },
  { name: 'n8n', description: 'SOAR workflows for automated response', icon: '⚙️' },
  { name: 'MISP', description: 'Threat intelligence platform integration', icon: '🛰️' },
  { name: 'OpenCTI', description: 'Cyber threat intelligence management', icon: '🌐' }
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
            <span className="text-jupiter-400 drop-shadow-[0_0_10px_rgba(237,118,17,0.5)]">
              Technology Stack
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            A carefully curated selection of cutting-edge technologies for maximum performance and scalability
          </p>
        </motion.div>

        {/* Tech Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {techCategories.map((category, categoryIndex) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-dark-cosmos/40 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-jupiter-400/50 transition-all duration-300 shadow-lg"
            >
              {/* Category Header */}
              <div className="flex items-center mb-6">
                <category.icon size={20} className="text-jupiter-500 dark:text-jupiter-400 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {category.category}
                </h3>
              </div>

              {/* Technologies Grid */}
              <div className="grid grid-cols-2 gap-3">
                {category.technologies.map((tech, techIndex) => (
                  <motion.div
                    key={tech.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: (categoryIndex * 0.1) + (techIndex * 0.05) }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="group bg-gray-50 dark:bg-dark-deep/50 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-dark-deep transition-all duration-200 cursor-pointer"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-lg">{tech.icon}</span>
                      <span className="font-medium text-gray-800 dark:text-gray-200 text-sm group-hover:text-jupiter-500 dark:group-hover:text-jupiter-400 transition-colors">
                        {tech.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {tech.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* AI-Powered Development */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-white dark:bg-dark-cosmos/30 backdrop-blur-sm rounded-2xl p-8 mb-12 border border-gray-200 dark:border-gray-800 shadow-lg"
        >
          <h3 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            AI-Powered Development
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Leveraging cutting-edge AI collaboration to accelerate development and ensure best practices.
          </p>
          
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8">
            {aiCollaboration.map((ai, index) => (
              <motion.div
                key={ai.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.05 }}
                viewport={{ once: true }}
                className="group bg-gray-50 dark:bg-dark-deep/50 backdrop-blur-sm rounded-xl p-6 border border-gray-300 dark:border-gray-700 hover:border-jupiter-500 dark:hover:border-jupiter-400/50 transition-all duration-300 text-center min-w-[200px] shadow-md hover:shadow-lg"
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">
                  {ai.icon}
                </div>
                <h4 className="font-bold text-jupiter-600 dark:text-jupiter-400 mb-2 group-hover:text-jupiter-700 dark:group-hover:text-jupiter-300 transition-colors">
                  {ai.name}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-mono">
                  {ai.name === 'Emergent (Claude)' ? 'System design & code generation' : 
                   ai.name === 'GitHub Copilot' ? 'Code completion & optimization' : 
                   'Research & planning assistance'}
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