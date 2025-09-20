import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  FileText, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Brain, 
  Database,
  Plus,
  Tag,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import Card from '../components/Card';

const KnowledgeBase = () => {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [newDocument, setNewDocument] = useState({
    content: '',
    document_type: 'ioc',
    tags: [],
    metadata: {}
  });

  const documentTypes = [
    { value: 'ioc', label: 'Indicators of Compromise', icon: '🎯', color: 'text-red-400' },
    { value: 'alert', label: 'Security Alerts', icon: '⚠️', color: 'text-yellow-400' },
    { value: 'report', label: 'Threat Reports', icon: '📊', color: 'text-blue-400' },
    { value: 'policy', label: 'Security Policies', icon: '📋', color: 'text-green-400' },
    { value: 'playbook', label: 'Response Playbooks', icon: '📖', color: 'text-purple-400' },
    { value: 'intelligence', label: 'Threat Intelligence', icon: '🧠', color: 'text-cyan-400' }
  ];

  const [stats, setStats] = useState({
    total_documents: 0,
    processed_today: 0,
    search_queries: 0,
    vector_embeddings: 0
  });

  useEffect(() => {
    loadDocuments();
    loadStats();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadDocuments = async () => {
    try {
      // Mock data for now - will be replaced with real API
      const mockDocs = [
        {
          id: '1',
          content: 'Malicious IP addresses detected in network traffic: 192.168.1.50, 10.0.0.25. Associated with APT29 campaign.',
          document_type: 'ioc',
          tags: ['apt29', 'malicious-ip', 'network-traffic'],
          created_at: '2024-01-15T10:30:00Z',
          added_by: 'security-analyst',
          metadata: { source: 'network-monitoring', confidence: 'high' }
        },
        {
          id: '2', 
          content: 'Incident response playbook for ransomware attacks. Step 1: Isolate affected systems. Step 2: Activate backup systems.',
          document_type: 'playbook',
          tags: ['ransomware', 'incident-response', 'backup'],
          created_at: '2024-01-14T15:20:00Z',
          added_by: 'incident-team',
          metadata: { classification: 'confidential', version: '2.1' }
        },
        {
          id: '3',
          content: 'Security policy update: All external USB devices must be scanned before connection to corporate network.',
          document_type: 'policy',
          tags: ['usb-security', 'endpoint-protection'],
          created_at: '2024-01-13T09:15:00Z',
          added_by: 'policy-team',
          metadata: { effective_date: '2024-02-01', approval_status: 'approved' }
        }
      ];
      setDocuments(mockDocs);
    } catch (error) {
      console.error('Error loading documents:', error);
    }
  };

  const loadStats = () => {
    setStats({
      total_documents: 156,
      processed_today: 12,
      search_queries: 847,
      vector_embeddings: 3420
    });
  };

  const performSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/knowledge/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 10
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      } else {
        // Fallback to mock search
        const filteredDocs = documents.filter(doc => 
          doc.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        );
        setSearchResults(filteredDocs.map(doc => ({
          id: doc.id,
          content: doc.content,
          metadata: doc
        })));
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = async (event) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    for (const file of files) {
      try {
        const content = await readFileContent(file);
        const documentData = {
          content,
          document_type: getDocumentTypeFromFile(file),
          tags: extractTagsFromContent(content),
          metadata: {
            filename: file.name,
            size: file.size,
            type: file.type,
            uploaded_at: new Date().toISOString()
          }
        };

        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(progress);
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        await addDocument(documentData);
      } catch (error) {
        console.error('File upload failed:', error);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
    event.target.value = '';
  };

  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsText(file);
    });
  };

  const getDocumentTypeFromFile = (file) => {
    const filename = file.name.toLowerCase();
    if (filename.includes('ioc') || filename.includes('indicator')) return 'ioc';
    if (filename.includes('alert')) return 'alert';
    if (filename.includes('report')) return 'report';
    if (filename.includes('policy')) return 'policy';
    if (filename.includes('playbook')) return 'playbook';
    return 'intelligence';
  };

  const extractTagsFromContent = (content) => {
    const commonTags = ['malware', 'phishing', 'apt', 'ransomware', 'network', 'endpoint', 'threat'];
    return commonTags.filter(tag => 
      content.toLowerCase().includes(tag)
    );
  };

  const addDocument = async (documentData) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/knowledge/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(documentData)
      });

      if (response.ok) {
        const result = await response.json();
        loadDocuments();
        loadStats();
        return result;
      }
    } catch (error) {
      console.error('Error adding document:', error);
    }
  };

  const handleManualAdd = async () => {
    if (!newDocument.content.trim()) return;

    try {
      await addDocument(newDocument);
      setNewDocument({
        content: '',
        document_type: 'ioc',
        tags: [],
        metadata: {}
      });
      setShowUploadModal(false);
    } catch (error) {
      console.error('Error adding manual document:', error);
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (selectedFilter === 'all') return true;
    return doc.document_type === selectedFilter;
  });

  const getTypeInfo = (type) => {
    return documentTypes.find(t => t.value === type) || documentTypes[0];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="display-text text-3xl mb-2 flex items-center space-x-3">
            <Database className="w-8 h-8 text-blue-400" />
            <span>Knowledge Base</span>
          </h1>
          <p className="body-text text-zinc-400">AI-powered security intelligence repository with RAG capabilities</p>
        </div>
        
        <div className="flex space-x-3">
          <motion.button
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-4 h-4" />
            <span>Add Document</span>
          </motion.button>
          
          <motion.label
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg flex items-center space-x-2 cursor-pointer transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
            <input
              type="file"
              multiple
              accept=".txt,.md,.pdf,.doc,.docx,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </motion.label>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-blue-400">Total Documents</h3>
              <FileText className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-blue-400 mb-2">{stats.total_documents}</div>
            <p className="text-sm text-zinc-400">In knowledge base</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-green-400">Processed Today</h3>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">{stats.processed_today}</div>
            <p className="text-sm text-zinc-400">New documents</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-purple-400">Search Queries</h3>
              <Search className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">{stats.search_queries}</div>
            <p className="text-sm text-zinc-400">This month</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-orange-400">Vector Embeddings</h3>
              <Brain className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-orange-400 mb-2">{stats.vector_embeddings}</div>
            <p className="text-sm text-zinc-400">Generated</p>
          </div>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card>
        <div className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search knowledge base with AI-powered semantic search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#0b0c10] border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500"
                />
                {isSearching && (
                  <Loader className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400 animate-spin" />
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-zinc-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">All Types</option>
                {documentTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-4 flex items-center space-x-2">
                <Brain className="w-4 h-4 text-blue-400" />
                <span>AI Search Results</span>
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-sm">
                  {searchResults.length}
                </span>
              </h3>
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4"
                  >
                    <p className="text-zinc-300 mb-2 line-clamp-2">{result.content}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {result.metadata && (
                          <span className={`text-sm px-2 py-1 rounded-full bg-zinc-700 ${getTypeInfo(result.metadata.document_type).color}`}>
                            {getTypeInfo(result.metadata.document_type).label}
                          </span>
                        )}
                        {result.distance && (
                          <span className="text-xs text-zinc-500">
                            Similarity: {Math.round((1 - result.distance) * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Documents List */}
      <Card>
        <div className="p-6">
          <h3 className="font-semibold mb-4 flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>Knowledge Documents</span>
            <span className="bg-zinc-700 text-zinc-300 px-2 py-1 rounded-full text-sm">
              {filteredDocuments.length}
            </span>
          </h3>
          
          <div className="space-y-4">
            {filteredDocuments.map((doc, index) => {
              const typeInfo = getTypeInfo(doc.document_type);
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-[#0b0c10] border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-lg">{typeInfo.icon}</span>
                        <span className={`font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                        <span className="text-sm text-zinc-500">•</span>
                        <span className="text-sm text-zinc-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <p className="text-zinc-300 mb-3 line-clamp-2">{doc.content}</p>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Tag className="w-3 h-3 text-zinc-500" />
                          <div className="flex space-x-1">
                            {doc.tags.slice(0, 3).map(tag => (
                              <span key={tag} className="text-xs bg-zinc-700 text-zinc-400 px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            {doc.tags.length > 3 && (
                              <span className="text-xs text-zinc-500">+{doc.tags.length - 3}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1 text-sm text-zinc-500">
                          <User className="w-3 h-3" />
                          <span>{doc.added_by}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-zinc-400" />
                      </button>
                      <button className="p-2 hover:bg-zinc-700 rounded-lg transition-colors">
                        <Download className="w-4 h-4 text-zinc-400" />
                      </button>
                      <button className="p-2 hover:bg-red-600/20 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Upload Progress */}
      {isUploading && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-[#111214] border border-zinc-700 rounded-xl p-4 min-w-80"
        >
          <div className="flex items-center space-x-3 mb-3">
            <Loader className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="font-medium">Processing Documents</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-zinc-400 mt-2">Generating vector embeddings...</p>
        </motion.div>
      )}

      {/* Manual Add Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#111214] border border-zinc-700 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Add Security Document</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-zinc-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Document Type</label>
                  <select
                    value={newDocument.document_type}
                    onChange={(e) => setNewDocument({...newDocument, document_type: e.target.value})}
                    className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  >
                    {documentTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content</label>
                  <textarea
                    value={newDocument.content}
                    onChange={(e) => setNewDocument({...newDocument, content: e.target.value})}
                    className="w-full bg-[#0b0c10] border border-zinc-700 rounded-lg px-3 py-2 h-40 focus:outline-none focus:border-blue-500 resize-none"
                    placeholder="Enter security intelligence, IOCs, policies, or other relevant content..."
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 bg-zinc-600 hover:bg-zinc-500 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <motion.button
                    onClick={handleManualAdd}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Add Document
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KnowledgeBase;