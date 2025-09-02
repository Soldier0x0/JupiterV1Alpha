import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Building, Crown } from 'lucide-react';
import { authAPI } from '../utils/api';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    tenant_name: '',
    is_owner: false
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await authAPI.register(formData);
      setMessage('Registration successful! You can now login.');
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <div className="min-h-screen bg-cosmic-black flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="card text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Registration Disabled</h1>
            <p className="text-zinc-400 mb-6">
              Public registration is disabled. New accounts must be created by system administrators.
            </p>
            <div className="space-y-4">
              <div className="bg-zinc-800 p-4 rounded-lg text-left">
                <h3 className="font-semibold text-yellow-400 mb-2">Admin-Controlled System</h3>
                <p className="text-sm text-zinc-400">
                  This Jupiter SIEM instance uses admin-controlled user creation for enhanced security. 
                  Contact your system administrator to request account access.
                </p>
              </div>
              <a
                href="/login"
                className="btn-primary w-full inline-block text-center"
              >
                Return to Login
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-jupiter-secondary to-jupiter-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Shield className="w-8 h-8 text-cosmic-black" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gradient">Join Project Jupiter</h1>
            <p className="text-zinc-400 mt-2">Create your security operations center</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="security@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-300">
                <Building className="w-4 h-4 inline mr-2" />
                Organization Name
              </label>
              <input
                type="text"
                name="tenant_name"
                value={formData.tenant_name}
                onChange={handleChange}
                className="input-field"
                placeholder="Your Organization"
                required
              />
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="is_owner"
                id="is_owner"
                checked={formData.is_owner}
                onChange={handleChange}
                className="w-4 h-4 text-jupiter-secondary bg-cosmic-gray border-cosmic-border rounded focus:ring-jupiter-secondary focus:ring-2"
              />
              <label htmlFor="is_owner" className="text-sm text-zinc-300 flex items-center">
                <Crown className="w-4 h-4 mr-2 text-jupiter-warning" />
                Organization Administrator
              </label>
            </div>

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-xl text-sm ${
                  message.includes('successful') 
                    ? 'bg-jupiter-success/20 text-jupiter-success border border-jupiter-success/30'
                    : 'bg-jupiter-danger/20 text-jupiter-danger border border-jupiter-danger/30'
                }`}
              >
                {message}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <span className="text-zinc-400">Already have an account? </span>
            <a href="/login" className="text-jupiter-secondary hover:underline font-medium">
              Sign in here
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;