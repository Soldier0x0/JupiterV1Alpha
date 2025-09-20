import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import TopBar from './TopBar';
import SideNav from './SideNav';
import Breadcrumbs from './Breadcrumbs';
import Home from '../pages/Home';
import Alerts from '../pages/Alerts';
import Logs from '../pages/Logs';
import Entities from '../pages/Entities';
import Intelligence from '../pages/Intelligence';
import Cases from '../pages/Cases';
import Settings from '../pages/Settings';
import FrameworkDashboard from '../pages/FrameworkDashboard';
import ExtendedFrameworks from '../pages/ExtendedFrameworks';
import AnalystFeatures from '../pages/AnalystFeatures';
import SecurityOps from '../pages/SecurityOps'; // New import

const Dashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
        <div className="w-16 h-16 bg-gradient-to-br from-zinc-700 to-zinc-600 rounded-xl flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-zinc-300 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#0b0c10]">
      <div className="flex">
        <SideNav />
        <div className="flex-1">
          <TopBar />
          <main className="p-6">
            <Breadcrumbs />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/logs" element={<Logs />} />
                  <Route path="/frameworks" element={<FrameworkDashboard />} />
                  <Route path="/extended-frameworks" element={<ExtendedFrameworks />} />
                  <Route path="/analyst-features" element={<AnalystFeatures />} />
                  <Route path="/security-ops" element={<SecurityOps />} />
                  <Route path="/entities" element={<Entities />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/cases" element={<Cases />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;