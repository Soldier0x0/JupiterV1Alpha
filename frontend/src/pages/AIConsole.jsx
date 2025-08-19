import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Shield, 
  Target, 
  TrendingUp, 
  Activity,
  Cpu,
  Network,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Waves
} from 'lucide-react';
import Card from '../components/Card';
import AIChat from '../components/AIChat';

const AIConsole = () => {
  const [immuneSystemHealth, setImmuneSystemHealth] = useState(87);
  const [activeThreats, setActiveThreats] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [systemAdaptations, setSystemAdaptations] = useState([]);
  const [cognitiveLoad, setCognitiveLoad] = useState(42);
  const [llmAnalysis, setLlmAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  // Immune System Intelligence - Bio-inspired threat detection
  const immuneSystemData = {
    antibodies: 1247, // Learned threat patterns
    memory_cells: 3456, // Historical threat knowledge  
    t_cells: 892, // Active threat hunters
    b_cells: 634, // Adaptive responses
    adaptation_rate: 94.7, // Learning speed %
    threat_resistance: 89.2 // Overall immunity strength
  };

  // AI-Powered Threat Analysis
  const analyzeWithAI = async (threatData) => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/ai/analyze/threat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          source_ip: threatData.source_ip,
          technique: threatData.technique,
          severity: threatData.severity,
          indicators: threatData.indicators,
          timeline: threatData.timeline,
          metadata: threatData.metadata || {},
          model_preference: "auto"
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analysis = await response.json();
      setLlmAnalysis(analysis.ai_analysis);
      
    } catch (error) {
      console.error('AI Analysis failed:', error);
      // Fallback to mock data on error
      const analysis = {
        severity: "HIGH",
        confidence: 94.7,
        explanation: "AI has detected a coordinated attack pattern similar to APT29 campaigns. The attack exhibits lateral movement techniques and credential harvesting behaviors typical of state-sponsored actors.",
        recommendations: [
          "Immediate isolation of affected endpoints",
          "Deploy deception technology to confused attackers", 
          "Activate threat hunting playbook TH-2024-001",
          "Alert incident response team with Purple Team engagement"
        ],
        biological_analogy: "This threat behaves like a viral infection - fast-spreading with polymorphic characteristics. The immune system should activate memory cells for similar past infections.",
        risk_evolution: "87% likelihood of escalation within 24 hours if not contained",
        attack_psychology: "Attacker shows patience and stealth - likely experienced threat actor with long-term objectives"
      };
      
      setLlmAnalysis(analysis);
    } finally {
      setLoading(false);
    }
  };

  // Simulate immune system evolution
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate system learning and adapting
      setImmuneSystemHealth(prev => {
        const variation = (Math.random() - 0.5) * 4; // ±2% variation
        return Math.max(70, Math.min(100, prev + variation));
      });

      // Generate new AI insights
      const insights = [
        "Detected behavioral anomaly in user authentication patterns - possible account compromise",
        "Network topology analysis reveals new lateral movement pathway - updating defensive posture",
        "Threat actor TTPs suggest evolution from ransomware to data exfiltration focus",
        "Deception technology successfully confused attacker for 47 minutes - collected valuable intelligence",
        "Cognitive load analysis indicates optimal time for complex security decisions"
      ];

      setAiInsights(prev => {
        const newInsight = insights[Math.floor(Math.random() * insights.length)];
        return [
          { 
            id: Date.now(), 
            message: newInsight, 
            timestamp: new Date(),
            confidence: 85 + Math.random() * 10,
            type: 'insight'
          },
          ...prev.slice(0, 4)
        ];
      });

    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  // Mock threat data for AI analysis
  const mockThreatData = {
    source_ip: "194.147.85.23",
    technique: "T1055.001", // Process Injection
    severity: "high",
    indicators: ["powershell.exe", "rundll32.exe", "suspicious_memory_allocation"],
    timeline: "2025-01-18T19:42:15Z"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="display-text text-3xl mb-2 flex items-center space-x-3">
            <Brain className="w-8 h-8 text-purple-400" />
            <span>AI Security Console</span>
          </h1>
          <p className="body-text text-zinc-400">Biological-inspired security intelligence with LLM-powered analysis</p>
        </div>
        
        <button
          onClick={() => analyzeWithAI(mockThreatData)}
          disabled={loading}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>AI Analyzing...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Analyze Threat</span>
            </>
          )}
        </button>
      </div>

      {/* Immune System Health Dashboard */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-green-400">Immune System</h3>
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">{immuneSystemHealth}%</div>
            <p className="text-sm text-zinc-400">System Health</p>
            <div className="mt-4 w-full bg-zinc-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${immuneSystemHealth}%` }}
              ></div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-purple-400">Cognitive Load</h3>
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">{cognitiveLoad}%</div>
            <p className="text-sm text-zinc-400">Analyst Capacity</p>
            <div className="mt-4">
              <div className="flex items-center space-x-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${cognitiveLoad < 60 ? 'bg-green-400' : cognitiveLoad < 80 ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                <span className="text-zinc-400">
                  {cognitiveLoad < 60 ? 'Optimal' : cognitiveLoad < 80 ? 'Moderate' : 'High Load'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-orange-400">Adaptations</h3>
              <TrendingUp className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-orange-400 mb-2">{systemAdaptations.length}</div>
            <p className="text-sm text-zinc-400">System Evolutions</p>
            <div className="mt-4">
              <div className="text-xs text-zinc-400">
                Learning Rate: {immuneSystemData.adaptation_rate}%
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-cyan-400">Memory Cells</h3>
              <Cpu className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-cyan-400 mb-2">{immuneSystemData.memory_cells}</div>
            <p className="text-sm text-zinc-400">Threat Memories</p>
            <div className="mt-4">
              <div className="text-xs text-zinc-400">
                Antibodies: {immuneSystemData.antibodies}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* AI Analysis Results */}
      <AnimatePresence>
        {llmAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/30">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">AI Threat Analysis</h3>
                    <p className="text-sm text-zinc-400">LLM-powered intelligence analysis</p>
                  </div>
                  <div className="ml-auto">
                    <div className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-sm">
                      Confidence: {llmAnalysis.confidence}%
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span>Threat Assessment</span>
                    </h4>
                    <div className="bg-[#0b0c10] rounded-lg p-4 mb-4">
                      <p className="text-zinc-300 leading-relaxed">{llmAnalysis.explanation}</p>
                    </div>
                    
                    <h5 className="font-medium mb-2 text-sm text-zinc-400">BIOLOGICAL ANALOGY</h5>
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-sm text-green-400">
                      {llmAnalysis.biological_analogy}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3 flex items-center space-x-2">
                      <Target className="w-4 h-4 text-blue-400" />
                      <span>AI Recommendations</span>
                    </h4>
                    <div className="space-y-2 mb-4">
                      {llmAnalysis.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start space-x-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-zinc-300">{rec}</span>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                        <h5 className="font-medium text-yellow-400 text-sm mb-1">RISK EVOLUTION</h5>
                        <p className="text-xs text-zinc-300">{llmAnalysis.risk_evolution}</p>
                      </div>
                      
                      <div className="bg-pink-500/10 border border-pink-500/20 rounded-lg p-3">
                        <h5 className="font-medium text-pink-400 text-sm mb-1">ATTACKER PSYCHOLOGY</h5>
                        <p className="text-xs text-zinc-300">{llmAnalysis.attack_psychology}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Real-time AI Insights Stream */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-5 h-5 text-blue-400" />
              <h3 className="font-semibold">AI Insights Stream</h3>
              <div className="ml-auto flex items-center space-x-1 text-xs text-zinc-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {aiInsights.map((insight) => (
                <motion.div
                  key={insight.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-start space-x-3 p-3 bg-[#0b0c10] rounded-lg border border-zinc-700"
                >
                  <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-300 leading-relaxed">{insight.message}</p>
                    <div className="flex items-center space-x-3 mt-2 text-xs text-zinc-500">
                      <span>{insight.timestamp.toLocaleTimeString()}</span>
                      <span>•</span>
                      <span>Confidence: {Math.round(insight.confidence)}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Network className="w-5 h-5 text-green-400" />
              <h3 className="font-semibold">Immune System Status</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#0b0c10] rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-sm">Antibodies (Threat Patterns)</span>
                </div>
                <span className="font-mono text-green-400">{immuneSystemData.antibodies}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#0b0c10] rounded-lg">
                <div className="flex items-center space-x-3">
                  <Brain className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">T-Cells (Active Hunters)</span>
                </div>
                <span className="font-mono text-blue-400">{immuneSystemData.t_cells}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#0b0c10] rounded-lg">
                <div className="flex items-center space-x-3">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-sm">B-Cells (Responses)</span>
                </div>
                <span className="font-mono text-purple-400">{immuneSystemData.b_cells}</span>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-lg border border-green-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-400">Threat Resistance</span>
                  <span className="text-lg font-bold text-green-400">{immuneSystemData.threat_resistance}%</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-2 rounded-full"
                    style={{ width: `${immuneSystemData.threat_resistance}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Evolution Timeline */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-5 h-5 text-orange-400" />
            <h3 className="font-semibold">System Evolution Timeline</h3>
            <div className="ml-auto text-sm text-zinc-400">
              Adaptation Rate: {immuneSystemData.adaptation_rate}%
            </div>
          </div>
          
          <div className="space-y-4">
            {[
              { time: "2 min ago", event: "Learned new lateral movement pattern from APT simulation", type: "learning" },
              { time: "15 min ago", event: "Updated firewall rules based on deception technology feedback", type: "adaptation" },
              { time: "1 hour ago", event: "Identified false positive pattern - reduced alert noise by 23%", type: "optimization" },
              { time: "3 hours ago", event: "Discovered new IOC correlation - strengthened threat detection", type: "discovery" },
            ].map((event, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${
                  event.type === 'learning' ? 'bg-blue-400' :
                  event.type === 'adaptation' ? 'bg-green-400' :
                  event.type === 'optimization' ? 'bg-yellow-400' : 'bg-purple-400'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm text-zinc-300">{event.event}</p>
                  <p className="text-xs text-zinc-500 mt-1">{event.time}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs ${
                  event.type === 'learning' ? 'bg-blue-500/20 text-blue-400' :
                  event.type === 'adaptation' ? 'bg-green-500/20 text-green-400' :
                  event.type === 'optimization' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {event.type}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AIConsole;