import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Shield, Key, Eye, EyeOff, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface PasswordRequirement {
  text: string;
  regex: RegExp;
  met: boolean;
}

export default function SetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [requirements, setRequirements] = useState<PasswordRequirement[]>([]);
  const [passwordRequirements, setPasswordRequirements] = useState<any>(null);

  useEffect(() => {
    if (!token) {
      setMessage('Invalid or missing password reset token');
      return;
    }

    // Fetch password requirements
    fetchPasswordRequirements();
  }, [token]);

  useEffect(() => {
    if (passwordRequirements) {
      updateRequirements();
    }
  }, [password, passwordRequirements]);

  const fetchPasswordRequirements = async () => {
    try {
      const response = await fetch('/api/auth/password-requirements');
      if (response.ok) {
        const data = await response.json();
        setPasswordRequirements(data.requirements);
      }
    } catch (error) {
      console.error('Error fetching password requirements:', error);
    }
  };

  const updateRequirements = () => {
    if (!passwordRequirements) return;

    const reqs: PasswordRequirement[] = [
      {
        text: `At least ${passwordRequirements.min_length} characters long`,
        regex: new RegExp(`.{${passwordRequirements.min_length},}`),
        met: false
      },
      {
        text: 'Contains uppercase letter (A-Z)',
        regex: /[A-Z]/,
        met: false
      },
      {
        text: 'Contains lowercase letter (a-z)',
        regex: /[a-z]/,
        met: false
      },
      {
        text: 'Contains number (0-9)',
        regex: /\d/,
        met: false
      },
      {
        text: `Contains special character (${passwordRequirements.allowed_special_chars})`,
        regex: new RegExp(`[${passwordRequirements.allowed_special_chars.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}]`),
        met: false
      }
    ];

    // Check which requirements are met
    reqs.forEach(req => {
      req.met = req.regex.test(password);
    });

    setRequirements(reqs);
  };

  const isPasswordValid = () => {
    return requirements.every(req => req.met) && password === confirmPassword;
  };

  const handleSetPassword = async () => {
    if (!isPasswordValid()) {
      setMessage('Please ensure all password requirements are met and passwords match');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/set-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: token,
          password: password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('✅ Password set successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/?password_set=true');
        }, 2000);
      } else {
        setMessage(`❌ ${data.detail || 'Failed to set password'}`);
      }
    } catch (error) {
      setMessage('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Link</h2>
            <p className="muted mb-4">This password reset link is invalid or has expired.</p>
            <button
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg transition-colors"
            >
              Return to Login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20">
              <Lock className="h-8 w-8 text-brand" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">Set Your Password</h1>
          <p className="muted">Create a secure password for your Jupiter SIEM account</p>
        </div>

        {/* Password Requirements Info */}
        {passwordRequirements && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Password Requirements</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {req.met ? (
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-white/20" />
                    )}
                    <span className={req.met ? 'text-emerald-400' : 'muted'}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Password Form */}
        <Card>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg focus:border-brand focus:outline-none transition-colors"
                  placeholder="Enter your new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Key className="h-4 w-4" />
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 bg-white/5 border border-white/10 rounded-lg focus:border-brand focus:outline-none transition-colors"
                  placeholder="Confirm your new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-400 text-sm">Passwords do not match</p>
              )}
            </div>

            <button
              onClick={handleSetPassword}
              disabled={loading || !isPasswordValid()}
              className="w-full px-4 py-2 bg-brand hover:bg-brand/90 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting Password...' : 'Set Password'}
            </button>

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes('✅')
                  ? 'bg-emerald-400/10 text-emerald-400 border border-emerald-400/20'
                  : 'bg-red-400/10 text-red-400 border border-red-400/20'
              }`}>
                {message}
              </div>
            )}

            {/* Security Note */}
            <div className="p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-1">
                <Shield className="h-4 w-4" />
                Security Note
              </div>
              <p className="text-xs muted">
                Choose a strong, unique password. This will be used to access sensitive security information and tools.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm muted">
          <p>Need help? Contact your system administrator</p>
        </div>
      </div>
    </div>
  );
}