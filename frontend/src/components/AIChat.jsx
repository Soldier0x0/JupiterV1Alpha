import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Brain, 
  User, 
  Bot, 
  Copy, 
  RefreshCw, 
  Settings, 
  Loader,
  CheckCircle,
  AlertTriangle,
  Info,
  Zap,
  Shield,
  Clock
} from 'lucide-react';

const AIChat = ({ onAnalysisRequest }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [selectedModel, setSelectedModel] = useState('auto');
  const [contextType, setContextType] = useState('security');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Generate session ID
    setSessionId(`chat-session-${Date.now()}`);
    
    // Add welcome message
    setMessages([{
      id: '1',
      type: 'ai',
      content: "👋 Hello! I'm your AI Security Analyst. I can help you with:\n\n• **Threat Analysis** - Analyze suspicious activities and IOCs\n• **Incident Investigation** - Guide you through security incidents\n• **Log Analysis** - Help interpret security logs and alerts\n• **Best Practices** - Security recommendations and procedures\n\nHow can I assist you today?",
      timestamp: new Date(),
      confidence: 100
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          message: inputMessage,
          session_id: sessionId,
          model_preference: selectedModel,
          context_type: contextType
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          id: Date.now().toString(),
          type: 'ai',
          content: data.response.response,
          timestamp: new Date(),
          confidence: data.response.confidence,
          model: data.response.model,
          contextUsed: data.context_used
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
        confidence: 0,
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = (content) => {
    navigator.clipboard.writeText(content);
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'ai',
      content: "Chat cleared! I'm ready to help with your security questions.",
      timestamp: new Date(),
      confidence: 100
    }]);
    setSessionId(`chat-session-${Date.now()}`);
  };

  const quickPrompts = [
    { text: "Analyze this suspicious IP: 192.168.1.50", icon: Shield, category: "threat" },
    { text: "Explain this PowerShell activity", icon: AlertTriangle, category: "analysis" },
    { text: "Best practices for incident response", icon: Info, category: "guidance" },
    { text: "How to investigate phishing emails?", icon: Zap, category: "procedure" }
  ];

  const handleQuickPrompt = (prompt) => {
    setInputMessage(prompt.text);
  };

  const formatMessage = (content) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="bg-zinc-700 px-1 rounded text-green-400">$1</code>')
      .replace(/\n/g, '<br>');
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-400';
    if (confidence >= 70) return 'text-yellow-400';
    if (confidence >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="flex flex-col h-[600px] bg-[#0b0c10] border border-zinc-700 rounded-xl">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-zinc-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">AI Security Assistant</h3>
            <p className="text-sm text-zinc-400">
              Model: {selectedModel === 'auto' ? 'Auto-Select' : selectedModel}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={contextType}
            onChange={(e) => setContextType(e.target.value)}
            className="bg-zinc-800 border border-zinc-600 rounded-lg px-3 py-1 text-sm"
          >
            <option value="security">Security Analysis</option>
            <option value="threat_intel">Threat Intelligence</option>
            <option value="general">General Help</option>
          </select>

          <button
            onClick={clearChat}
            className="p-2 hover:bg-zinc-700 rounded-lg transition-colors"
            title="Clear Chat"
          >
            <RefreshCw className="w-4 h-4 text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-start space-x-3 ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-blue-500' 
                  : message.error 
                    ? 'bg-red-500' 
                    : 'bg-gradient-to-br from-purple-500 to-blue-500'
              }`}>
                {message.type === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>

              <div className={`flex-1 max-w-[80%] ${message.type === 'user' ? 'items-end' : 'items-start'}`}>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-500 text-white ml-auto' 
                    : message.error
                      ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                      : 'bg-zinc-800 text-zinc-200'
                }`}>
                  <div 
                    className="text-sm leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-700">
                    <div className="flex items-center space-x-2 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      <span>{message.timestamp.toLocaleTimeString()}</span>
                      
                      {message.confidence !== undefined && !message.error && (
                        <>
                          <span>•</span>
                          <span className={getConfidenceColor(message.confidence)}>
                            {message.confidence.toFixed(1)}% confident
                          </span>
                        </>
                      )}
                      
                      {message.contextUsed && (
                        <>
                          <span>•</span>
                          <span className="text-blue-400">{message.contextUsed} sources</span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => copyMessage(message.content)}
                      className="p-1 hover:bg-zinc-600 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3 text-zinc-400" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-zinc-800 rounded-lg p-3">
              <div className="flex items-center space-x-2 text-zinc-400">
                <Loader className="w-4 h-4 animate-spin" />
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 1 && (
        <div className="p-4 border-t border-zinc-700">
          <p className="text-sm text-zinc-500 mb-3">Quick prompts to get started:</p>
          <div className="grid grid-cols-2 gap-2">
            {quickPrompts.map((prompt, index) => (
              <motion.button
                key={index}
                onClick={() => handleQuickPrompt(prompt)}
                className="flex items-center space-x-2 p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors text-left"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <prompt.icon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-zinc-300">{prompt.text}</span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-zinc-700">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about security threats, analysis, or best practices..."
              className="w-full bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-white placeholder-zinc-400 focus:outline-none focus:border-blue-500 resize-none"
              rows="1"
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>
          
          <motion.button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-zinc-600 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>

        <p className="text-xs text-zinc-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default AIChat;