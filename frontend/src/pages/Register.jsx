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
};

export default Register;