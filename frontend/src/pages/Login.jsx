import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Mail, Key, Building, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';

const Login = () => {
  const { login, requestOTP } = useAuth();
  const [step, setStep] = useState(1); // 1: email/tenant, 2: OTP
  const [formData, setFormData] = useState({
    email: '',
    tenant_id: '',
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await requestOTP(formData.email, formData.tenant_id);
      if (result.success) {
        setStep(2);
        // Show OTP in development mode
        if (result.dev_otp) {
          setMessage(`OTP sent! For testing, use: ${result.dev_otp}`);
        } else {
          setMessage('OTP sent to your email. Check your inbox.');
        }
      } else {
        setMessage(result.error);
      }
    } catch (error) {
      setMessage('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await login(formData.email, formData.otp, formData.tenant_id);
      if (result.success) {
        window.location.href = '/dashboard';
      } else {
        setMessage(result.error);
      }
    } catch (error) {
      setMessage('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
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
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div 
              className="w-16 h-16 bg-gradient-to-br from-jupiter-secondary to-jupiter-primary rounded-2xl flex items-center justify-center mx-auto mb-4"
              whileHover={{ scale: 1.1, rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Shield className="w-8 h-8 text-cosmic-black" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gradient">Welcome Back</h1>
            <p className="text-zinc-400 mt-2">
              {step === 1 ? 'Enter your credentials to continue' : 'Enter the OTP sent to your email'}
            </p>
          </div>

          {/* Step 1: Email & Tenant */}
          {step === 1 && (
            <motion.form 
              onSubmit={handleEmailSubmit}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
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
                  Tenant ID
                </label>
                <input
                  type="text"
                  name="tenant_id"
                  value={formData.tenant_id}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="your-organization-id"
                  required
                />
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-cosmic-black border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>
            </motion.form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <motion.form 
              onSubmit={handleOTPSubmit}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium mb-2 text-zinc-300">
                  <Key className="w-4 h-4 inline mr-2" />
                  One-Time Password
                </label>
                <input
                  type="text"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  required
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-ghost flex-1"
                >
                  Back
                </button>
                <motion.button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-cosmic-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>
          )}

          {/* Message Display */}
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-xl text-sm flex items-center space-x-2 ${
                message.includes('successful') || message.includes('sent')
                  ? 'bg-jupiter-success/20 text-jupiter-success border border-jupiter-success/30'
                  : 'bg-jupiter-danger/20 text-jupiter-danger border border-jupiter-danger/30'
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{message}</span>
            </motion.div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <span className="text-zinc-400">New to Project Jupiter? </span>
            <a href="/register" className="text-jupiter-secondary hover:underline font-medium">
              Create account
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;