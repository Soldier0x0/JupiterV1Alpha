import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Lightbulb, 
  MessageSquare, 
  Sparkles, 
  TrendingUp,
  Shield,
  Search,
  AlertTriangle,
  Clock,
  Zap
} from 'lucide-react';
import Card from './Card';

const AIQueryAssistant = ({ onQueryGenerated, currentQuery = '' }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);

  // Initialize with welcome message and suggestions
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          type: 'assistant',
          content: "Hi! I'm your AI query assistant. I can help you build OCSF queries for security analysis. What would you like to investigate?",
          timestamp: new Date()
        }
      ]);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Simulate AI response (replace with real AI API call)
    setTimeout(() => {
      const aiResponse = generateAIResponse(inputMessage, currentQuery);
      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1500);
  };

  const generateAIResponse = (userInput, currentQuery) => {
    const input = userInput.toLowerCase();
    
    // Security scenario detection
    if (input.includes('failed login') || input.includes('authentication')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "I'll help you create a query for failed login attempts. Here's what I suggest:",
        suggestions: [
          {
            title: "Failed Login Attempts",
            query: 'activity_name = "failed_login" AND severity = "medium"',
            description: "Find failed authentication attempts with medium severity"
          },
          {
            title: "Multiple Failed Logins from Same IP",
            query: 'activity_name = "failed_login" AND src_endpoint_ip = "192.168.1.100"',
            description: "Detect potential brute force attacks from specific IPs"
          },
          {
            title: "Failed Logins for Admin Accounts",
            query: 'activity_name = "failed_login" AND user_name CONTAINS "admin"',
            description: "Monitor failed login attempts targeting admin accounts"
          }
        ],
        timestamp: new Date()
      };
    }

    if (input.includes('malware') || input.includes('suspicious') || input.includes('process')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Let me help you detect suspicious process activities:",
        suggestions: [
          {
            title: "Suspicious Process Execution",
            query: 'process_name IN ("powershell.exe", "cmd.exe", "wscript.exe") AND severity = "high"',
            description: "Find potentially malicious process executions"
          },
          {
            title: "Process Injection Attempts",
            query: 'activity_name = "process_injection" AND severity = "critical"',
            description: "Detect process injection techniques"
          },
          {
            title: "Lateral Movement Tools",
            query: 'process_name IN ("psexec.exe", "wmic.exe", "sc.exe")',
            description: "Identify tools commonly used for lateral movement"
          }
        ],
        timestamp: new Date()
      };
    }

    if (input.includes('network') || input.includes('connection') || input.includes('external')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Here are some network monitoring queries:",
        suggestions: [
          {
            title: "External Network Connections",
            query: 'dst_endpoint_ip NOT IN ("192.168.0.0/16", "10.0.0.0/8")',
            description: "Find connections to external IP addresses"
          },
          {
            title: "Suspicious DNS Queries",
            query: 'activity_name = "dns_query" AND dns_question_name CONTAINS "suspicious"',
            description: "Monitor DNS queries for malicious domains"
          },
          {
            title: "Port Scanning Activities",
            query: 'activity_name = "network_connection" AND dst_endpoint_port > 1000',
            description: "Detect potential port scanning attempts"
          }
        ],
        timestamp: new Date()
      };
    }

    if (input.includes('file') || input.includes('ransomware') || input.includes('encryption')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Let me help you monitor file activities:",
        suggestions: [
          {
            title: "File Creation Events",
            query: 'activity_name = "file_created" AND file_name CONTAINS ".exe"',
            description: "Monitor executable file creation"
          },
          {
            title: "Ransomware Indicators",
            query: 'file_name IN ("*.encrypted", "*.locked", "*.crypto")',
            description: "Detect potential ransomware file encryption"
          },
          {
            title: "Suspicious File Extensions",
            query: 'file_name REGEX ".*\\.(bat|ps1|vbs|scr)$"',
            description: "Find files with potentially malicious extensions"
          }
        ],
        timestamp: new Date()
      };
    }

    if (input.includes('registry') || input.includes('persistence') || input.includes('startup')) {
      return {
        id: Date.now() + 1,
        type: 'assistant',
        content: "Here are some registry monitoring queries:",
        suggestions: [
          {
            title: "Registry Modifications",
            query: 'activity_name = "registry_modified" AND registry_key CONTAINS "Run"',
            description: "Monitor Windows registry changes"
          },
          {
            title: "Persistence Mechanisms",
            query: 'registry_key IN ("Run", "RunOnce", "Services") AND activity_name = "registry_created"',
            description: "Detect persistence techniques in registry"
          },
          {
            title: "Startup Program Changes",
            query: 'registry_key = "HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Run"',
            description: "Monitor changes to startup programs"
          }
        ],
        timestamp: new Date()
      };
    }

    // Default response for general queries
    return {
      id: Date.now() + 1,
      type: 'assistant',
      content: "I can help you create queries for various security scenarios. Try asking about:",
      suggestions: [
        {
          title: "Failed Login Attempts",
          query: 'activity_name = "failed_login"',
          description: "Find authentication failures"
        },
        {
          title: "High Severity Events",
          query: 'severity IN ("high", "critical")',
          description: "Get all high priority security events"
        },
        {
          title: "Network Anomalies",
          query: 'activity_name = "network_connection" AND dst_endpoint_ip = "external"',
          description: "Monitor external network connections"
        }
      ],
      timestamp: new Date()
    };
  };

  const handleSuggestionClick = (suggestion) => {
    onQueryGenerated?.(suggestion.query);
    
    // Add a message showing the applied suggestion
    const appliedMessage = {
      id: Date.now(),
      type: 'assistant',
      content: `Applied query: "${suggestion.title}"`,
      query: suggestion.query,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, appliedMessage]);
  };

  const quickSuggestions = [
    { icon: Shield, label: "Authentication Issues", query: "failed login attempts" },
    { icon: AlertTriangle, label: "Malware Detection", query: "suspicious process execution" },
    { icon: Search, label: "Network Monitoring", query: "external network connections" },
    { icon: Clock, label: "File Activities", query: "file creation and modification" },
    { icon: Zap, label: "Registry Changes", query: "registry modifications and persistence" }
  ];

  return (
    <Card>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center space-x-2 text-white">
            <Bot className="w-5 h-5 text-blue-400" />
            <span>AI Query Assistant</span>
            <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
              Beta
            </span>
          </h3>
          <button
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {showSuggestions ? 'Hide' : 'Show'} Quick Actions
          </button>
        </div>

        {/* Quick Suggestions */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <p className="text-sm text-zinc-400">Quick Actions:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {quickSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    onClick={() => setInputMessage(suggestion.query)}
                    className="flex items-center space-x-2 p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg border border-zinc-700 hover:border-blue-400/50 transition-all text-left"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <suggestion.icon className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm text-zinc-300">{suggestion.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Chat Messages */}
        <div className="h-64 overflow-y-auto space-y-3 border border-zinc-700 rounded-lg p-3 bg-zinc-900/50">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                message.type === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-zinc-800 text-zinc-200'
              }`}>
                <p className="text-sm">{message.content}</p>
                
                {/* Query Suggestions */}
                {message.suggestions && (
                  <div className="mt-2 space-y-2">
                    {message.suggestions.map((suggestion, index) => (
                      <div key={index} className="p-2 bg-zinc-700/50 rounded border border-zinc-600">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-medium text-white">{suggestion.title}</h4>
                          <button
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Use
                          </button>
                        </div>
                        <p className="text-xs text-zinc-400 mb-1">{suggestion.description}</p>
                        <code className="text-xs text-zinc-300 bg-zinc-800 p-1 rounded block">
                          {suggestion.query}
                        </code>
                      </div>
                    ))}
                  </div>
                )}

                {/* Applied Query */}
                {message.query && (
                  <div className="mt-2 p-2 bg-green-500/20 border border-green-500/30 rounded">
                    <code className="text-xs text-green-300">{message.query}</code>
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="bg-zinc-800 text-zinc-200 px-3 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Input */}
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask me to help build a query... (e.g., 'Find failed login attempts')"
            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white rounded-lg transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Tips */}
        <div className="text-xs text-zinc-500 space-y-1">
          <p><strong>Tips:</strong></p>
          <p>• Describe what you want to find (e.g., "failed logins", "suspicious processes")</p>
          <p>• Ask for specific scenarios (e.g., "lateral movement", "ransomware indicators")</p>
          <p>• Request query variations (e.g., "show me different ways to detect malware")</p>
        </div>
      </div>
    </Card>
  );
};

export default AIQueryAssistant;
