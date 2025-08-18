import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Eye, ArrowRight, Github, Book, Server } from 'lucide-react';
import WebGLBackground from './WebGLBackground';

const LandingPage = () => {
  const features = [
    {
      icon: Shield,
      title: "Advanced SIEM",
      description: "Real-time security monitoring with intelligent threat detection and automated response capabilities."
    },
    {
      icon: Zap,
      title: "SOAR Automation", 
      description: "Build custom playbooks with triggers and actions to automate your incident response workflow."
    },
    {
      icon: Eye,
      title: "Threat Intelligence",
      description: "Integrate with multiple threat feeds including AbuseIPDB, VirusTotal, and custom IOC management."
    }
  ];

  const faqs = [
    {
      question: "What makes Project Jupiter different?",
      answer: "Self-hosted security visibility with enterprise-grade features, complete data control, and zero vendor lock-in."
    },
    {
      question: "How does multi-tenant support work?",
      answer: "Isolated data environments for different teams/clients with role-based access control and tenant-specific configurations."
    },
    {
      question: "What threat intelligence sources are supported?",
      answer: "AbuseIPDB, VirusTotal, LeakIX, DeHashed, HaveIBeenPwned, and custom IOC feeds with automated enrichment."
    }
  ];

  return (
    <div className="relative min-h-screen bg-cosmic-black text-zinc-200 overflow-hidden">
      <WebGLBackground />
      
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex justify-between items-center p-6 md:px-12"
      >
        <div className="flex items-center space-x-3">
          <motion.div 
            className="w-10 h-10 bg-gradient-to-br from-jupiter-secondary to-jupiter-primary rounded-xl flex items-center justify-center"
            whileHover={{ scale: 1.1, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <Shield className="w-6 h-6 text-cosmic-black" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gradient">Project Jupiter</h1>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="hover:text-jupiter-secondary transition-colors">Features</a>
          <a href="#faq" className="hover:text-jupiter-secondary transition-colors">FAQ</a>
          <a href="https://github.com/your-org/jupiter" className="hover:text-jupiter-secondary transition-colors flex items-center space-x-2">
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative z-10 text-center py-20 px-6"
      >
        <motion.h1 
          className="text-5xl md:text-7xl font-bold mb-6"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <span className="text-gradient">Secure.</span>{' '}
          <span className="text-gradient">Isolate.</span>{' '}
          <span className="text-gradient">Visualize.</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-zinc-400 mb-12 max-w-4xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          A modern, self-hosted SIEM & SOAR for real-time log visibility, 
          threat intelligence, and incident response.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.button
            onClick={() => window.location.href = '/dashboard'}
            className="btn-primary flex items-center space-x-2 text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Launch Console</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            onClick={() => window.location.href = '/docs'}
            className="btn-ghost flex items-center space-x-2 text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Book className="w-5 h-5" />
            <span>Get Started</span>
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features"
        className="relative z-10 py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Enterprise Security <span className="text-gradient">Capabilities</span>
          </motion.h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="card-glow group cursor-pointer"
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                viewport={{ once: true }}
              >
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    className="w-16 h-16 bg-gradient-to-br from-jupiter-secondary to-jupiter-primary rounded-2xl flex items-center justify-center mb-6 group-hover:animate-pulse-glow"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.8 }}
                  >
                    <feature.icon className="w-8 h-8 text-cosmic-black" />
                  </motion.div>
                  <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                  <p className="text-zinc-400 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        id="faq"
        className="relative z-10 py-20 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.h2 
            className="text-4xl font-bold text-center mb-16"
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Frequently Asked <span className="text-gradient">Questions</span>
          </motion.h2>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="card"
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-semibold mb-3 text-jupiter-secondary">{faq.question}</h3>
                <p className="text-zinc-400 leading-relaxed">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 bg-cosmic-dark/50 backdrop-blur-sm border-t border-cosmic-border py-12 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-jupiter-secondary to-jupiter-primary rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-cosmic-black" />
                </div>
                <span className="text-xl font-bold">Project Jupiter</span>
              </div>
              <p className="text-zinc-400">Enterprise-grade security visibility for the modern threat landscape.</p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <div className="space-y-2 text-zinc-400">
                <a href="/docs" className="block hover:text-jupiter-secondary transition-colors">Documentation</a>
                <a href="/api" className="block hover:text-jupiter-secondary transition-colors">API Reference</a>
                <a href="/support" className="block hover:text-jupiter-secondary transition-colors">Support</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Technology</h4>
              <div className="flex items-center space-x-4 text-zinc-400">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4" />
                  <span>Debian</span>
                </div>
                <span>•</span>
                <span>Docker</span>
                <span>•</span>
                <span>OpenSearch</span>
              </div>
              <p className="text-sm text-zinc-500 mt-2">Powered by open-source technologies</p>
            </div>
          </div>
          
          <div className="text-center pt-8 border-t border-cosmic-border">
            <p className="text-zinc-500">© 2025 Project Jupiter. Protecting the digital frontier.</p>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;