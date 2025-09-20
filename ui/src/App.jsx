import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WebGLBackground from './components/WebGLBackground';
import Home from './pages/Home';
import Alerts from './pages/Alerts';
import Explore from './pages/Explore';
import Intel from './pages/Intel';
import Entities from './pages/Entities';
import Cases from './pages/Cases';
import Models from './pages/Models';
import Settings from './pages/Settings';
import Login from './pages/Login';
import TopBar from './components/TopBar';
import SideNav from './components/SideNav';

const defaultAPI = typeof window !== 'undefined'
  ? window.location.origin    // prefer same-origin (https://projectjupiter:<PORT>)
  : 'https://projectjupiter';
const API_BASE = () =>
  (typeof window !== 'undefined' && (localStorage.getItem('API_BASE') || defaultAPI)) || defaultAPI;

const App = () => {
  return (
    <div className="relative">
      <WebGLBackground />
      <div className="flex">
        <SideNav />
        <div className="flex-1">
          <TopBar />
          <main className="p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/explore" element={<Explore />} />
              <Route path="/intel" element={<Intel />} />
              <Route path="/entities" element={<Entities />} />
              <Route path="/cases" element={<Cases />} />
              <Route path="/models" element={<Models />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
};

export { API_BASE };
export default App;
