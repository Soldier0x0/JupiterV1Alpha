'use client'

import { motion } from 'framer-motion'
import { Heart, Github, Linkedin, Twitter, Mail, ExternalLink } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  const footerLinks = [
    {
      title: 'Project',
      links: [
        { name: 'Architecture', href: '#architecture' },
        { name: 'Tech Stack', href: '#tech-stack' },
        { name: 'Development', href: '#development' },
        { name: 'GitHub Repository', href: 'https://github.com/Soldier0x0/JupiterEmerge', external: true }
      ]
    },
    {
      title: 'Developer',
      links: [
        { name: 'Harsha Vardhan', href: '#contact' },
        { name: 'Email', href: 'mailto:harsha@projectjupiter.in', external: true },
        { name: 'LinkedIn', href: 'https://www.linkedin.com/in/sai-harsha-vardhan/', external: true },
        { name: 'Twitter', href: 'https://twitter.com/Soldier0x00', external: true }
      ]
    },
    {
      title: 'Technologies',
      links: [
        { name: 'Python & Go', href: '#tech-stack' },
        { name: 'AI & Machine Learning', href: '#tech-stack' },
        { name: 'Cloud Infrastructure', href: '#tech-stack' },
        { name: 'Security Framework', href: '#tech-stack' }
      ]
    }
  ]

  const socialLinks = [
    { 
      icon: Github, 
      href: 'https://github.com/Soldier0x0', 
      label: 'GitHub',
      color: 'hover:text-gray-800 dark:hover:text-gray-200'
    },
    { 
      icon: Linkedin, 
      href: 'https://www.linkedin.com/in/sai-harsha-vardhan/', 
      label: 'LinkedIn',
      color: 'hover:text-blue-600'
    },
    { 
      icon: Twitter, 
      href: 'https://twitter.com/Soldier0x00', 
      label: 'Twitter',
      color: 'hover:text-blue-400'
    },
    { 
      icon: Mail, 
      href: 'mailto:harsha@projectjupiter.in', 
      label: 'Email',
      color: 'hover:text-jupiter-500'
    }
  ]

  const handleNavClick = (href: string, external: boolean = false) => {
    if (external) {
      window.open(href, '_blank', 'noopener noreferrer')
    } else if (href.startsWith('#')) {
      const element = document.getElementById(href.substring(1))
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <div className="bg-white dark:bg-dark-950 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Project Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-jupiter-gradient rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">J</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-jupiter-500 to-jupiter-600 bg-clip-text text-transparent">
                Project Jupiter
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed">
              Next-generation SIEM platform combining advanced AI, real-time threat detection, 
              and comprehensive security analytics in a unified solution.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
              <span>Built with</span>
              <Heart size={14} className="text-red-500 mx-1" />
              <span>and AI collaboration</span>
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <motion.button
                      whileHover={{ x: 5 }}
                      onClick={() => handleNavClick(link.href, link.external)}
                      className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-jupiter-500 dark:hover:text-jupiter-400 transition-colors duration-200 text-sm group"
                    >
                      <span>{link.name}</span>
                      {link.external && (
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      )}
                    </motion.button>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="border-t border-gray-200 dark:border-gray-700 pt-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-center md:text-left">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                © {currentYear} Project Jupiter. Designed and developed by{' '}
                <button
                  onClick={() => handleNavClick('#contact')}
                  className="font-semibold text-jupiter-500 hover:text-jupiter-600 transition-colors duration-200"
                >
                  Harsha Vardhan
                </button>
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                Domain: <span className="font-mono">projectjupiter.in</span> • 
                Built with Next.js, React, and Tailwind CSS
              </p>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className={`p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 ${social.color} transition-all duration-200 hover:shadow-lg`}
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Additional Info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            viewport={{ once: true }}
            className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800"
          >
            <div className="grid md:grid-cols-3 gap-4 text-center md:text-left">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  PROJECT STATUS
                </span>
                <p className="text-sm text-jupiter-500 font-semibold">
                  Phase 0 Complete • Active Development
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  TECH STACK
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Python • Go • Rust • AI/ML • Cloud
                </p>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  COLLABORATION
                </span>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  AI-Powered Development
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Footer
