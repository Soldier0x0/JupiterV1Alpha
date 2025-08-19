import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import TopBar from './TopBar';
import SideNav from './SideNav';
import Home from '../pages/Home';
import Alerts from '../pages/Alerts';
import Explore from '../pages/Explore';
import Intel from '../pages/Intel';
import Entities from '../pages/Entities';
import Cases from '../pages/Cases';
import Models from '../pages/Models';
import Settings from '../pages/Settings';
import Automations from '../pages/Automations';
import TenantManagement from '../pages/TenantManagement';
import Training from '../pages/Training';
import AIConsole from '../pages/AIConsole';
import DeceptionCenter from '../pages/DeceptionCenter';
import KnowledgeBase from '../pages/KnowledgeBase';
import LocalModels from '../pages/LocalModels';

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
    window.location.href = '/login';
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0b0c10]">
      <div className="flex">
        <SideNav />
        <div className="flex-1">
          <TopBar />
          <main className="p-6">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/intel" element={<Intel />} />
              <Route path="/entities" element={<Entities />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/models" element={<Models />} />
              <Route path="/automations" element={<Automations />} />
              <Route path="/ai-console" element={<AIConsole />} />
              <Route path="/deception" element={<DeceptionCenter />} />
              <Route path="/training" element={<Training />} />
              <Route path="/settings" element={<Settings />} />
              {user.is_owner && (
                <Route path="/admin/tenants" element={<TenantManagement />} />
              )}
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;