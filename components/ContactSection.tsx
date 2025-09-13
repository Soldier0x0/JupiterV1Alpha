'use client'

import { motion } from 'framer-motion'
import { Mail, Github, Linkedin, Twitter, MapPin, Calendar, ExternalLink, Send } from 'lucide-react'

const ContactSection = () => {
  const contactInfo = {
    name: 'Harsha Vardhan',
    email: 'harsha@projectjupiter.in',
    domain: 'projectjupiter.in',
    location: 'India',
    timezone: 'IST (UTC+5:30)',
    github: 'https://github.com/Soldier0x0',
    linkedin: 'https://www.linkedin.com/in/sai-harsha-vardhan/',
    twitter: 'https://twitter.com/Soldier0x00'
  }

  const socialLinks = [
    {
      name: 'GitHub',
      url: contactInfo.github,
      icon: Github,
      color: 'hover:text-gray-800 dark:hover:text-gray-200',
      description: 'View source code and repositories'
    },
    {
      name: 'LinkedIn', 
      url: contactInfo.linkedin,
      icon: Linkedin,
      color: 'hover:text-blue-600',
      description: 'Professional profile and experience'
    },
    {
      name: 'Twitter',
      url: contactInfo.twitter,
      icon: Twitter,
      color: 'hover:text-blue-400',
      description: 'Follow for project updates'
    }
  ]

  const projectStats = [
    { label: 'Project Start', value: 'August 2025' },
    { label: 'Current Phase', value: 'Phase 0 Complete' },
    { label: 'Development Status', value: 'Active Development' },
    { label: 'Next Milestone', value: 'Infrastructure Setup' }
  ]

  return (
    <section id="contact" className="py-20 bg-gray-50 dark:bg-dark-900">
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
              Get In Touch
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Interested in Project Jupiter or want to discuss cybersecurity and AI? Let's connect!
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Personal Info Card */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center mb-6">
                <div className="w-16 h-16 bg-jupiter-gradient rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold text-xl">HV</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {contactInfo.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Cybersecurity Engineer & AI Enthusiast
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <motion.a
                  href={`mailto:${contactInfo.email}`}
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group"
                >
                  <Mail size={20} className="text-jupiter-500 group-hover:scale-110 transition-transform duration-200" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {contactInfo.email}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Primary contact for professional inquiries
                    </div>
                  </div>
                  <ExternalLink size={16} className="text-gray-400 group-hover:text-jupiter-500 ml-auto" />
                </motion.a>

                <div className="flex items-center space-x-3 p-3">
                  <MapPin size={20} className="text-jupiter-500" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {contactInfo.location}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {contactInfo.timezone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-3">
                  <Calendar size={20} className="text-jupiter-500" />
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      Available for collaboration
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Open to discussing new opportunities
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Connect on Social Platforms
              </h4>
              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.02, x: 5 }}
                    className={`flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 group ${social.color}`}
                  >
                    <div className="w-10 h-10 bg-gray-100 dark:bg-gray-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <social.icon size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {social.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {social.description}
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-gray-400 group-hover:text-current" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Project Status & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Project Status */}
            <div className="bg-gradient-to-r from-jupiter-50 to-cyber-50 dark:from-dark-800 dark:to-dark-700 rounded-2xl p-8 shadow-lg">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Project Status
              </h4>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {projectStats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ scale: 1.05 }}
                    className="bg-white dark:bg-dark-600 rounded-lg p-4 text-center"
                  >
                    <div className="text-jupiter-500 font-bold text-lg mb-1">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      {stat.label}
                    </div>
                  </motion.div>
                ))}
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-center">
                Follow the development journey and be part of the next-generation SIEM platform evolution.
              </p>
            </div>

            {/* Call to Action */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Interested in Collaboration?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Whether you're a security professional, developer, or just curious about cutting-edge SIEM technology, 
                I'd love to hear from you!
              </p>
              
              <div className="space-y-4">
                <motion.a
                  href={`mailto:${contactInfo.email}?subject=Project Jupiter Inquiry`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center space-x-2 w-full px-6 py-4 bg-jupiter-gradient text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 jupiter-glow"
                >
                  <Send size={20} />
                  <span>Send Email</span>
                </motion.a>
                
                <motion.a
                  href={contactInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center space-x-2 w-full px-6 py-4 border-2 border-jupiter-500 text-jupiter-500 hover:bg-jupiter-500 hover:text-white rounded-lg font-semibold transition-all duration-300"
                >
                  <Github size={20} />
                  <span>View Repository</span>
                </motion.a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white dark:bg-dark-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Quick Links
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'Architecture', id: 'architecture' },
                  { name: 'Tech Stack', id: 'tech-stack' },
                  { name: 'Development', id: 'development' },
                  { name: 'GitHub Repo', href: contactInfo.github }
                ].map((link, index) => (
                  <motion.button
                    key={link.name}
                    whileHover={{ scale: 1.05 }}
                    onClick={() => {
                      if (link.href) {
                        window.open(link.href, '_blank')
                      } else if (link.id) {
                        document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth' })
                      }
                    }}
                    className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-jupiter-100 dark:hover:bg-jupiter-900/30 hover:text-jupiter-600 dark:hover:text-jupiter-400 transition-all duration-200"
                  >
                    {link.name}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection