import React, { useState } from 'react';
import { Mail, Key, Building, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '../auth/AuthProvider';
import JupiterIcon from '../components/JupiterIcon';

const Login = () => {
  const { login, requestOTP } = useAuth();
  const [step, setStep] = useState(1); // 1: email/tenant, 2: OTP
  const [formData, setFormData] = useState({
    email: '',
    tenant_id: '',
    tenant_name: '',  // Store the human-readable name separately
    otp: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const result = await requestOTP(formData.email, formData.tenant_name || formData.tenant_id);
      if (result.success) {
        // Store the resolved tenant ID for login
        if (result.tenant_id) {
          setFormData(prev => ({ ...prev, tenant_id: result.tenant_id }));
        }
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
    <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="card">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <JupiterIcon className="w-16 h-16 rounded-full" />
            </div>
            <h1 className="text-2xl font-bold text-red-400">Welcome Back</h1>
            <p className="text-zinc-400 mt-2">
              {step === 1 ? 'Enter your credentials to continue' : 'Enter the OTP sent to your email'}
            </p>
          </div>

          {/* Step 1: Email & Tenant */}
          {step === 1 && (
            <form 
              onSubmit={handleEmailSubmit}
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

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <form 
              onSubmit={handleOTPSubmit}
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
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* OAuth Login Option */}
          {step === 1 && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-neutral-900 text-neutral-400">Or continue with</span>
                </div>
              </div>
              
              <button
                type="button"
                onClick={handleOAuthLogin}
                className="mt-4 w-full flex items-center justify-center px-4 py-3 border border-neutral-700 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Emergent Auth
              </button>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <div className={`mt-4 p-3 rounded-lg text-sm flex items-center space-x-2 ${
                message.includes('successful') || message.includes('sent')
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : 'bg-red-500/20 text-red-400 border border-red-500/30'
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 text-center">
            <span className="text-zinc-400">New to Project Jupiter? </span>
            <a href="/register" className="text-red-400 hover:underline font-medium">
              Create account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;