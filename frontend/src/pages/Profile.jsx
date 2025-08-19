import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { authAPI } from '../utils/api';

const Profile = () => {
  const { login: setAuthUser, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Parse session ID from URL fragment
        const fragment = window.location.hash.substring(1);
        const params = new URLSearchParams(fragment);
        const sessionId = params.get('session_id');

        if (!sessionId) {
          setError('No session ID found in URL');
          setLoading(false);
          return;
        }

        console.log('Processing OAuth callback with session ID:', sessionId);

        // Call backend to process OAuth session
        const response = await authAPI.oauthProfile(sessionId);
        
        if (response.data.success) {
          const userData = response.data.user;
          
          // Set user data in localStorage for AuthProvider
          localStorage.setItem('JWT', response.data.session_token);
          localStorage.setItem('TENANT_ID', userData.tenant_id);
          localStorage.setItem('USER_DATA', JSON.stringify(userData));
          
          // Update auth context
          setAuthUser(userData);
          
          console.log('OAuth authentication successful:', userData);
        } else {
          setError('Authentication failed');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        setError(error.response?.data?.detail || 'Authentication failed');
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [setAuthUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Completing Authentication</h2>
          <p className="text-neutral-400">Please wait while we log you in...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-500 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">⚠</span>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Failed</h2>
          <p className="text-neutral-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // If authenticated successfully, redirect to dashboard
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  // Fallback redirect to login
  return <Navigate to="/login" replace />;
};

export default Profile;