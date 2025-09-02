import React, { useState } from 'react';
import { Shield, Mail, Building, Key, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    email: 'admin@projectjupiter.in',
    password: '',
    tenant_id: ''
  });

  const login = async () => {
    if (!formData.email || !formData.password) {
      setMessage('Please enter both email and password');
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
          password: formData.password,
          tenant_id: formData.tenant_id || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('jupiter_token', data.access_token);
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      login();
    }
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
            <CardTitle className="text-center">Administrator Access</CardTitle>
            <p className="text-sm muted text-center">
              Enter your credentials to access the security platform
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand focus:outline-none transition-colors"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand focus:outline-none transition-colors"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" />
                Organization (Optional)
              </label>
              <input
                type="text"
                value={formData.tenant_id}
                onChange={(e) => setFormData(prev => ({ ...prev, tenant_id: e.target.value }))}
                onKeyPress={handleKeyPress}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-brand focus:outline-none transition-colors"
                placeholder="Leave blank for default organization"
                disabled={loading}
              />
            </div>

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

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                message.includes('✅') || message.includes('🎉')
                  ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                  : 'bg-red-400/10 text-red-400 border border-red-400/20'
              }`}>
                {message.includes('❌') && <AlertCircle className="h-4 w-4" />}
                {message}
              </div>
            )}

            {/* Admin Notice */}
            <div className="p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-1">
                <Shield className="h-4 w-4" />
                Admin Access Only
              </div>
              <p className="text-xs muted">
                This system requires administrator credentials. New users must be created by an administrator from within the platform.
              </p>
            </div>
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