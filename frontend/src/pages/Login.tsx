import React, { useState } from 'react';
import { Shield, Mail, Building, Key, ArrowRight, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: 'harsha@projectjupiter.in',
    tenant: 'MainTenant',
    otp: ''
  });

  const requestOTP = async () => {
    if (!formData.email || !formData.tenant) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          tenant_id: formData.tenant
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(`✅ ${data.message}${data.dev_otp ? ` (Dev OTP: ${data.dev_otp})` : ''}`);
        setStep('otp');
        if (data.dev_otp) {
          setFormData(prev => ({ ...prev, otp: data.dev_otp }));
        }
      } else {
        setMessage(`❌ ${data.detail || 'Failed to send OTP'}`);
      }
    } catch (error) {
      setMessage('❌ Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const login = async () => {
    if (!formData.otp) {
      setMessage('Please enter the OTP code');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          tenant_id: formData.tenant,
          otp: formData.otp
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('jupiter_token', data.token);
        localStorage.setItem('jupiter_user', JSON.stringify(data.user));
        setMessage('🎉 Login successful! Welcome to Jupiter SIEM');
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setMessage(`❌ ${data.detail || 'Login failed'}`);
      }
    } catch (error) {
      setMessage('❌ Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    setStep('credentials');
    setFormData(prev => ({ ...prev, otp: '' }));
    setMessage('');
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20">
              <Shield className="h-8 w-8 text-brand" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Jupiter SIEM</h1>
          <p className="muted">Security Information and Event Management</p>
        </div>

        {/* Login Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {step === 'credentials' ? 'Sign In to Your Account' : 'Enter Verification Code'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === 'credentials' ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand focus:outline-none transition-colors"
                    placeholder="Enter your email"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Organization / Tenant
                  </label>
                  <input
                    type="text"
                    value={formData.tenant}
                    onChange={(e) => setFormData(prev => ({ ...prev, tenant: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand focus:outline-none transition-colors"
                    placeholder="Enter your organization name"
                    disabled={loading}
                  />
                </div>

                <button
                  onClick={requestOTP}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Request OTP
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="text-center space-y-2 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm muted">OTP sent to</p>
                  <p className="font-medium">{formData.email}</p>
                  <p className="text-sm muted">Organization: {formData.tenant}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={formData.otp}
                    onChange={(e) => setFormData(prev => ({ ...prev, otp: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand focus:outline-none transition-colors text-center text-lg tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <button
                    onClick={login}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={goBack}
                    disabled={loading}
                    className="w-full px-4 py-2 bg-white/5 hover:bg-white/10 text-muted hover:text-text rounded-lg transition-colors disabled:opacity-50"
                  >
                    Back to Credentials
                  </button>
                </div>
              </>
            )}

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('✅') || message.includes('🎉')
                  ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                  : 'bg-red-400/10 text-red-400 border border-red-400/20'
              }`}>
                {message}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm muted space-x-4">
          <a href="/api/docs" target="_blank" className="hover:text-brand transition-colors">
            API Documentation
          </a>
          <a href="/api/health" target="_blank" className="hover:text-brand transition-colors">
            System Health
          </a>
        </div>
      </div>
    </div>
  );
}