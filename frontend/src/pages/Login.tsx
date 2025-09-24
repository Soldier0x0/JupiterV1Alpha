import React, { useState } from 'react';
import { Shield, Mail, Building, Key, ArrowRight, Loader2, AlertCircle, CheckCircle2, Info, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import JupiterIcon from '../components/JupiterIcon';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | 'info'>('info');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: 'admin@projectjupiter.in',
    password: '',
    tenant_id: ''
  });

  const login = async () => {
    if (!formData.email || !formData.password) {
      setMessage('Please enter both email and password to continue.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('Authenticating credentials...');
    setMessageType('info');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          tenant_id: formData.tenant_id || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('jupiter_token', data.access_token);
        localStorage.setItem('jupiter_user', JSON.stringify(data.user));
        setMessage('Authentication successful. Redirecting to dashboard...');
        setMessageType('success');
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        const errorMessages = {
          401: 'Invalid credentials. Please check your email and password.',
          403: 'Access denied. Administrator privileges required.',
          429: 'Too many login attempts. Please wait before trying again.',
          500: 'Server error. Please contact system administrator.',
        };
        
        setMessage(errorMessages[response.status] || data.detail || 'Authentication failed. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Network error. Please check your connection and try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      login();
    }
  };

  const getMessageIcon = () => {
    switch (messageType) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'error':
        return <AlertCircle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
    }
  };

  const getMessageStyles = () => {
    switch (messageType) {
      case 'success':
        return 'bg-emerald-950/50 text-emerald-300 border-emerald-700/50 shadow-emerald-500/10';
      case 'error':
        return 'bg-red-950/50 text-red-300 border-red-700/50 shadow-red-500/10';
      case 'info':
        return 'bg-blue-950/50 text-blue-300 border-blue-700/50 shadow-blue-500/10';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-gray-950 to-slate-950 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-orange-500/5 to-red-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        {/* Brand Header */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center">
            <div className="relative">
              <JupiterIcon className="w-20 h-20" />
              {/* Subtle glow effect */}
              <div className="absolute inset-0 -m-2 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-full blur-lg"></div>
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-300 via-red-300 to-orange-400 bg-clip-text text-transparent tracking-tight">
              Jupiter SIEM
            </h1>
            <p className="text-slate-400 font-medium tracking-wide text-sm">
              Security Information & Event Management
            </p>
            <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-red-500 mx-auto rounded-full"></div>
          </div>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-slate-900/80 backdrop-blur-sm border border-slate-700/50 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden"
        >
          {/* Card Header */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 px-8 py-6 border-b border-slate-700/50">
            <h2 className="text-xl font-semibold text-slate-200 tracking-tight">Administrator Access</h2>
            <p className="text-slate-400 text-sm mt-1 font-medium">
              Enter your credentials to access the security platform
            </p>
          </div>

          {/* Card Content */}
          <div className="p-8 space-y-6">
            {/* Email Field */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Mail className="h-4 w-4 text-orange-400" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:bg-slate-800/80"
                placeholder="Enter your email address"
                disabled={loading}
                autoComplete="email"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Key className="h-4 w-4 text-orange-400" />
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3.5 pr-12 bg-slate-800/60 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:bg-slate-800/80"
                  placeholder="Enter your password"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Organization Field */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Building className="h-4 w-4 text-orange-400" />
                Organization <span className="text-slate-500 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={formData.tenant_id}
                onChange={(e) => setFormData(prev => ({ ...prev, tenant_id: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3.5 bg-slate-800/60 border border-slate-600/50 rounded-xl text-slate-200 placeholder-slate-500 transition-all duration-200 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 focus:bg-slate-800/80"
                placeholder="Leave blank for default organization"
                disabled={loading}
                autoComplete="organization"
              />
            </div>

            {/* Login Button */}
            <motion.button
              onClick={login}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-orange-500/25 focus:outline-none focus:ring-2 focus:ring-orange-400/50"
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </motion.button>

            {/* Message Display */}
            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl text-sm flex items-center gap-3 shadow-lg ${getMessageStyles()}`}
              >
                {getMessageIcon()}
                <span className="font-medium">{message}</span>
              </motion.div>
            )}

            {/* Admin Notice */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="p-4 bg-blue-950/30 border border-blue-700/30 rounded-xl"
            >
              <div className="flex items-center gap-3 text-blue-300 text-sm font-semibold mb-2">
                <Shield className="h-4 w-4" />
                Secure Access Portal
              </div>
              <p className="text-xs text-blue-200/80 leading-relaxed">
                This system requires administrator credentials. Access is logged and monitored. 
                New users must be provisioned by a system administrator.
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="flex justify-center space-x-6 text-sm">
            <a 
              href="/api/docs" 
              target="_blank" 
              className="text-slate-400 hover:text-orange-400 transition-colors duration-200 font-medium"
            >
              API Documentation
            </a>
            <span className="text-slate-600">•</span>
            <a 
              href="/api/health" 
              target="_blank" 
              className="text-slate-400 hover:text-orange-400 transition-colors duration-200 font-medium"
            >
              System Status
            </a>
          </div>
          
          <p className="text-xs text-slate-500 font-medium">
            © 2025 Jupiter SIEM • Protecting the Digital Frontier
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}