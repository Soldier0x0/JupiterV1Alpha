import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Eye, ArrowRight, Github, Book, Server, Lock, Globe, BarChart3 } from 'lucide-react';
import WebGLBackground from './WebGLBackground';
import JupiterIcon from './JupiterIcon';

const LandingPage = () => {
  const features = [
    {
      icon: Shield,
      title: "Enterprise SIEM",
      description: "Advanced security monitoring with real-time threat detection, automated incident response, and comprehensive audit trails."
    },
    {
      icon: Zap,
      title: "SOAR Automation", 
      description: "Orchestrate security workflows with intelligent automation, custom playbooks, and seamless integration capabilities."
    },
    {
      icon: Eye,
      title: "Threat Intelligence",
      description: "Integrated threat intelligence feeds with IOC management, behavioral analysis, and predictive security insights."
    }
  ];

  const capabilities = [
    {
      icon: Lock,
      title: "Zero Trust Architecture",
      description: "Built-in zero trust security model with continuous verification and least-privilege access controls."
    },
    {
      icon: Globe,
      title: "Multi-Tenant Security",
      description: "Enterprise-grade multi-tenancy with complete data isolation and customizable security policies."
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Machine learning-powered analytics with behavioral profiling and anomaly detection capabilities."
    }
  ];

  const faqs = [
    {
      question: "What makes Jupiter SIEM enterprise-ready?",
      answer: "Jupiter SIEM offers enterprise-grade security with complete data sovereignty, advanced compliance frameworks, and scalable multi-tenant architecture designed for modern threat landscapes."
    },
    {
      question: "How does the threat intelligence integration work?",
      answer: "Seamlessly integrates with leading threat intelligence providers including VirusTotal, AbuseIPDB, and custom feeds with automated IOC enrichment and context-aware threat scoring."
    },
    {
      question: "What compliance frameworks are supported?",
      answer: "Built-in support for SOC 2, ISO 27001, PCI DSS, GDPR, and HIPAA with automated compliance reporting, audit trails, and policy enforcement capabilities."
    }
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-slate-950 text-slate-200 overflow-hidden">
      <WebGLBackground />
      
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }}></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '12s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/3 to-pink-500/3 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '20s' }}></div>
      </div>
      
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 flex justify-between items-center p-6 md:px-12 backdrop-blur-sm"
      >
        <motion.div 
          className="flex items-center space-x-4"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        >
          <JupiterIcon className="w-12 h-12" />
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-300 via-red-300 to-orange-400 bg-clip-text text-transparent tracking-tight">
              Jupiter SIEM
            </h1>
            <p className="text-xs text-slate-400 font-medium tracking-wider uppercase">Enterprise Security Platform</p>
          </div>
        </motion.div>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-slate-300 hover:text-orange-300 transition-colors font-medium tracking-wide">Features</a>
          <a href="#capabilities" className="text-slate-300 hover:text-orange-300 transition-colors font-medium tracking-wide">Capabilities</a>
          <a href="#faq" className="text-slate-300 hover:text-orange-300 transition-colors font-medium tracking-wide">FAQ</a>
          <a href="https://github.com/your-org/jupiter" className="text-slate-300 hover:text-orange-300 transition-colors flex items-center space-x-2 font-medium">
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </nav>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10 text-center py-24 px-6"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <h1 className="text-6xl md:text-8xl font-bold mb-8 tracking-tight leading-tight">
            <span className="bg-gradient-to-r from-orange-300 via-red-400 to-orange-500 bg-clip-text text-transparent">
              Secure.
            </span>{' '}
            <span className="bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500 bg-clip-text text-transparent">
              Detect.
            </span>{' '}
            <span className="bg-gradient-to-r from-orange-400 via-yellow-500 to-orange-600 bg-clip-text text-transparent">
              Respond.
            </span>
          </h1>
        </motion.div>
        
        <motion.p 
          className="text-xl md:text-2xl text-slate-300 mb-12 max-w-5xl mx-auto leading-relaxed font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Enterprise-grade Security Information & Event Management platform delivering 
          <span className="text-orange-300 font-medium"> real-time threat detection</span>, 
          <span className="text-red-300 font-medium"> automated incident response</span>, and 
          <span className="text-yellow-300 font-medium"> comprehensive security visibility</span> for modern organizations.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <motion.button
            onClick={() => window.location.href = '/dashboard'}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center space-x-3 shadow-xl hover:shadow-orange-500/25"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Access Console</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            onClick={() => window.location.href = '/docs'}
            className="bg-slate-800/50 hover:bg-slate-700/50 text-slate-200 hover:text-white px-10 py-4 rounded-xl font-semibold text-lg transition-all duration-300 border border-slate-600/50 hover:border-slate-500/50 flex items-center space-x-3 backdrop-blur-sm"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Book className="w-5 h-5" />
            <span>Documentation</span>
          </motion.button>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        id="features"
        className="relative z-10 py-24 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Core Security <span className="bg-gradient-to-r from-orange-300 to-red-400 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Advanced security capabilities designed for enterprise threat landscapes and regulatory compliance requirements.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group relative bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/50 hover:bg-slate-800/40 transition-all duration-300 cursor-pointer overflow-hidden"
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                viewport={{ once: true }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg"
                    whileHover={{ rotate: 5, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <feature.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-200">{feature.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Capabilities Section */}
      <motion.section 
        id="capabilities"
        className="relative z-10 py-24 px-6 bg-gradient-to-r from-slate-900/20 to-slate-800/20"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Enterprise <span className="bg-gradient-to-r from-blue-300 to-cyan-400 bg-clip-text text-transparent">Capabilities</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Built for scale, designed for security, optimized for modern enterprise environments.
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {capabilities.map((capability, index) => (
              <motion.div
                key={index}
                className="group relative bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/50 hover:bg-slate-800/40 transition-all duration-300 cursor-pointer overflow-hidden"
                initial={{ y: 80, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{ y: -8, scale: 1.02 }}
                viewport={{ once: true }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <motion.div
                    className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mb-8 shadow-lg"
                    whileHover={{ rotate: -5, scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <capability.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-4 text-slate-200">{capability.title}</h3>
                  <p className="text-slate-400 leading-relaxed font-medium">{capability.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        id="faq"
        className="relative z-10 py-24 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              Frequently Asked <span className="bg-gradient-to-r from-orange-300 to-red-400 bg-clip-text text-transparent">Questions</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
              Common questions about Jupiter SIEM capabilities, implementation, and enterprise features.
            </p>
          </motion.div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-8 hover:border-slate-600/50 hover:bg-slate-800/40 transition-all duration-300"
                initial={{ x: -50, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold mb-4 text-orange-300">{faq.question}</h3>
                <p className="text-slate-300 leading-relaxed font-medium">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <motion.footer 
        className="relative z-10 bg-slate-900/60 backdrop-blur-sm border-t border-slate-700/50 py-16 px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        viewport={{ once: true }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-4 mb-6">
                <JupiterIcon className="w-10 h-10" />
                <div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-300 to-red-400 bg-clip-text text-transparent">Jupiter SIEM</span>
                  <p className="text-sm text-slate-400 font-medium">Enterprise Security Platform</p>
                </div>
              </div>
              <p className="text-slate-400 leading-relaxed font-medium max-w-md">
                Protecting digital assets with enterprise-grade security intelligence, 
                automated threat response, and comprehensive compliance capabilities.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-slate-200">Resources</h4>
              <div className="space-y-3 text-slate-400">
                <a href="/docs" className="block hover:text-orange-300 transition-colors font-medium">Documentation</a>
                <a href="/api" className="block hover:text-orange-300 transition-colors font-medium">API Reference</a>
                <a href="/support" className="block hover:text-orange-300 transition-colors font-medium">Support Center</a>
                <a href="/compliance" className="block hover:text-orange-300 transition-colors font-medium">Compliance</a>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-slate-200">Technology</h4>
              <div className="space-y-3 text-slate-400 font-medium">
                <div className="flex items-center space-x-2">
                  <Server className="w-4 h-4" />
                  <span>FastAPI Backend</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-blue-400 to-cyan-500 rounded"></div>
                  <span>React Frontend</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded"></div>
                  <span>DuckDB Analytics</span>
                </div>
                <p className="text-sm text-slate-500 mt-4">Powered by modern open-source technologies</p>
              </div>
            </div>
          </div>
          
          <div className="pt-8 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-slate-500 font-medium">© 2025 Jupiter SIEM. Securing the digital frontier.</p>
            <div className="flex items-center space-x-6 text-sm">
              <a href="/privacy" className="text-slate-400 hover:text-orange-300 transition-colors font-medium">Privacy Policy</a>
              <a href="/terms" className="text-slate-400 hover:text-orange-300 transition-colors font-medium">Terms of Service</a>
              <a href="/security" className="text-slate-400 hover:text-orange-300 transition-colors font-medium">Security</a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
};

export default LandingPage;