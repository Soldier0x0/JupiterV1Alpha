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
          {/* Left Column - Profile */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="bg-dark-cosmos/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-800 h-fit"
          >
            {/* Profile Header */}
            <div className="flex items-center mb-8">
              <div className="w-20 h-20 bg-jupiter-gradient rounded-full flex items-center justify-center mr-6 shadow-lg">
                <span className="text-white font-bold text-2xl">HV</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">
                  {contactInfo.name}
                </h3>
                <p className="text-jupiter-400 font-medium">
                  Cybersecurity Engineer | AI Security Architect
                </p>
                <div className="mt-2 px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full inline-block">
                  Open for Collaboration
                </div>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-4 mb-8">
              <motion.a
                href={`mailto:${contactInfo.email}`}
                whileHover={{ scale: 1.02 }}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-deep transition-all duration-200 group"
              >
                <Mail size={18} className="text-jupiter-400" />
                <span className="text-gray-300 group-hover:text-white transition-colors">
                  {contactInfo.email}
                </span>
              </motion.a>

              <div className="flex items-center space-x-3 p-3">
                <MapPin size={18} className="text-jupiter-400" />
                <div>
                  <span className="text-gray-300">{contactInfo.location}</span>
                  <span className="text-gray-500 text-sm ml-2">({contactInfo.timezone})</span>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`w-12 h-12 rounded-full bg-dark-deep border border-gray-700 hover:border-jupiter-400 flex items-center justify-center transition-all duration-200 group ${social.color}`}
                >
                  <social.icon size={20} className="group-hover:scale-110 transition-transform" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Right Column - Project Status & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Project Status Timeline */}
            <div className="bg-dark-cosmos/40 backdrop-blur-sm rounded-2xl p-8 border border-gray-800">
              <h4 className="text-xl font-bold text-white mb-6">
                Project Status Timeline
              </h4>
              <div className="space-y-4">
                {[
                  { phase: 'Start', status: 'August 2025', icon: '🚀' },
                  { phase: 'Current Phase', status: 'Phase 0 Complete', icon: '✅' },
                  { phase: 'Next Milestone', status: 'Infrastructure Setup', icon: '⏳' }
                ].map((item, index) => (
                  <div key={item.phase} className="flex items-center space-x-4">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <div className="text-jupiter-400 font-medium">{item.phase}</div>
                      <div className="text-gray-300 text-sm">{item.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="space-y-4">
              <motion.a
                href={`mailto:${contactInfo.email}?subject=Project Jupiter Inquiry`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center space-x-2 w-full px-8 py-4 bg-jupiter-gradient text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 jupiter-glow"
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
                className="flex items-center justify-center space-x-2 w-full px-8 py-4 border-2 border-jupiter-400 text-jupiter-400 hover:bg-jupiter-400 hover:text-dark-void rounded-xl font-semibold transition-all duration-300"
              >
                <Github size={20} />
                <span>View Repository</span>
              </motion.a>
            </div>

            {/* Caption */}
            <p className="text-center text-gray-400 text-sm">
              Follow Project Jupiter's journey into next-gen SIEM.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ContactSection