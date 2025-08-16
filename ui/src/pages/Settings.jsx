import React, { useState, useEffect } from 'react';

const Settings = () => {
  const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || '#22d3ee');
  const [apiBase, setApiBase] = useState(localStorage.getItem('API_BASE') || 'https://projectjupiter');
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', accentColor);
  }, [accentColor]);

  const handleColorChange = (color) => {
    setAccentColor(color);
    localStorage.setItem('accentColor', color);
  };

  const handleApiBaseChange = (e) => {
    const newApiBase = e.target.value;
    setApiBase(newApiBase);
    localStorage.setItem('API_BASE', newApiBase);
  };

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Settings</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Accent Color</h2>
          <div className="flex space-x-2">
            {['#22d3ee', '#34d399', '#a78bfa', '#f59e0b', '#ef4444'].map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: color }}
                onClick={() => handleColorChange(color)}
              />
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-lg font-medium">API Base</h2>
          <input
            type="text"
            value={apiBase}
            onChange={handleApiBaseChange}
            className="w-full p-3 rounded-xl bg-zinc-800 text-zinc-200 focus:outline-none"
          />
        </div>
        <div>
          <h2 className="text-lg font-medium">Language</h2>
          <select
            value={language}
            onChange={handleLanguageChange}
            className="w-full p-3 rounded-xl bg-zinc-800 text-zinc-200 focus:outline-none"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default Settings;
