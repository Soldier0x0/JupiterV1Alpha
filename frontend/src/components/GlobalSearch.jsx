import React, { useState, useEffect, useRef } from 'react';
import { Search, Command, Clock, AlertTriangle, Users, FileText, Settings, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const GlobalSearch = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Mock search data - in real app, this would come from API
  const searchData = {
    alerts: [
      { id: 1, title: 'Multiple failed login attempts', severity: 'high', type: 'alert' },
      { id: 2, title: 'Malware detected', severity: 'critical', type: 'alert' },
      { id: 3, title: 'Suspicious network traffic', severity: 'medium', type: 'alert' }
    ],
    logs: [
      { id: 1, message: 'Failed authentication from 192.168.1.100', timestamp: '2025-01-18T19:42:15Z', type: 'log' },
      { id: 2, message: 'Service restart detected', timestamp: '2025-01-18T19:35:22Z', type: 'log' }
    ],
    cases: [
      { id: 1, title: 'Data Exfiltration Investigation', status: 'active', type: 'case' },
      { id: 2, title: 'Phishing Campaign Analysis', status: 'closed', type: 'case' }
    ],
    users: [
      { id: 1, name: 'John Smith', email: 'john@company.com', type: 'user' },
      { id: 2, name: 'Sarah Jones', email: 'sarah@company.com', type: 'user' }
    ],
    navigation: [
      { name: 'Alert Management', path: '/dashboard/alerts', type: 'page' },
      { name: 'Training Center', path: '/dashboard/training', type: 'page' },
      { name: 'Threat Intelligence', path: '/dashboard/intel', type: 'page' },
      { name: 'Settings', path: '/dashboard/settings', type: 'page' }
    ]
  };

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('jupiter_recent_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => Math.max(prev - 1, 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleResultClick(results[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  // Perform search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = [];
    const lowerQuery = query.toLowerCase();

    // Search alerts
    searchData.alerts.forEach(alert => {
      if (alert.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          ...alert,
          category: 'Alerts',
          icon: AlertTriangle,
          path: `/dashboard/alerts/${alert.id}`
        });
      }
    });

    // Search logs
    searchData.logs.forEach(log => {
      if (log.message.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          ...log,
          category: 'Logs',
          icon: FileText,
          path: `/dashboard/explore?search=${encodeURIComponent(log.message)}`
        });
      }
    });

    // Search cases
    searchData.cases.forEach(caseItem => {
      if (caseItem.title.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          ...caseItem,
          category: 'Cases',
          icon: Users,
          path: `/dashboard/cases/${caseItem.id}`
        });
      }
    });

    // Search navigation
    searchData.navigation.forEach(nav => {
      if (nav.name.toLowerCase().includes(lowerQuery)) {
        searchResults.push({
          ...nav,
          category: 'Navigation',
          icon: Settings,
          title: nav.name
        });
      }
    });

    setResults(searchResults.slice(0, 8)); // Limit results
    setSelectedIndex(0);
  }, [query]);

  const handleResultClick = (result) => {
    try {
      // Save to recent searches
      const newRecent = [query, ...recentSearches.filter(s => s !== query)].slice(0, 5);
      setRecentSearches(newRecent);
      localStorage.setItem('jupiter_recent_searches', JSON.stringify(newRecent));

      // Navigate
      const targetPath = result.path || `/dashboard/${result.type}s/${result.id}`;
      console.log('Navigating to:', targetPath);
      navigate(targetPath);
      onClose();
      setQuery('');
    } catch (error) {
      console.error('Navigation error:', error);
      alert('Navigation failed. Please try again.');
    }
  };

  const handleRecentSearchClick = (searchTerm) => {
    setQuery(searchTerm);
  };

  const getResultIcon = (result) => {
    switch (result.type) {
      case 'alert': return AlertTriangle;
      case 'log': return FileText;
      case 'case': return Users;
      case 'user': return Users;
      case 'page': return Settings;
      default: return Search;
    }
  };

  const getResultSubtitle = (result) => {
    switch (result.type) {
      case 'alert': return `${result.severity} severity`;
      case 'log': return new Date(result.timestamp).toLocaleString();
      case 'case': return result.status;
      case 'user': return result.email;
      default: return result.category;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
      <div className="bg-[#111214] border border-zinc-700 rounded-xl shadow-xl w-full max-w-2xl mx-4">
        {/* Search Input */}
        <div className="flex items-center p-4 border-b border-zinc-700">
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search alerts, logs, cases, users..."
            className="flex-1 bg-transparent text-zinc-200 placeholder-zinc-400 focus:outline-none"
          />
          <div className="flex items-center space-x-2 text-xs text-zinc-500">
            <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-400">↵</kbd>
            <span>to select</span>
            <kbd className="px-1.5 py-0.5 bg-zinc-700 rounded text-zinc-400">esc</kbd>
            <span>to close</span>
          </div>
          <button
            onClick={onClose}
            className="ml-3 p-1 hover:bg-zinc-700 rounded"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        </div>

        {/* Search Results */}
        <div className="max-h-96 overflow-y-auto">
          {query.trim() ? (
            results.length > 0 ? (
              <div className="p-2">
                {results.map((result, index) => {
                  const Icon = getResultIcon(result);
                  return (
                    <div
                      key={`${result.type}-${result.id || result.name}`}
                      onClick={() => handleResultClick(result)}
                      className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                        index === selectedIndex ? 'bg-red-500/20' : 'hover:bg-zinc-800'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center mr-3">
                        <Icon className="w-4 h-4 text-zinc-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-zinc-200 truncate">
                          {result.title || result.message || result.name}
                        </div>
                        <div className="text-sm text-zinc-400 truncate">
                          {getResultSubtitle(result)}
                        </div>
                      </div>
                      <div className="text-xs text-zinc-500 bg-zinc-700 px-2 py-1 rounded">
                        {result.category}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-zinc-400">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No results found for "{query}"</p>
                <p className="text-sm">Try different keywords or check the spelling</p>
              </div>
            )
          ) : (
            <div className="p-4">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-zinc-400 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Recent Searches
                  </h3>
                  <div className="space-y-1">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleRecentSearchClick(search)}
                        className="w-full text-left p-2 rounded-lg hover:bg-zinc-800 text-zinc-300 text-sm"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      console.log('Navigating to alerts');
                      navigate('/dashboard/alerts');
                      onClose();
                    }}
                    className="p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-left"
                  >
                    <AlertTriangle className="w-4 h-4 text-red-400 mb-1" />
                    <div className="text-sm font-medium text-zinc-200">View Alerts</div>
                    <div className="text-xs text-zinc-400">Latest security alerts</div>
                  </button>
                  <button
                    onClick={() => {
                      console.log('Navigating to training');
                      navigate('/dashboard/training');
                      onClose();
                    }}
                    className="p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-left"
                  >
                    <Users className="w-4 h-4 text-blue-400 mb-1" />
                    <div className="text-sm font-medium text-zinc-200">Training</div>
                    <div className="text-xs text-zinc-400">Learn platform features</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearch;