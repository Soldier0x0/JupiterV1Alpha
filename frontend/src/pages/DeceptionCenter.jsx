import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Eye, 
  EyeOff, 
  Target, 
  Shield,
  Network,
  Server,
  Database,
  Globe,
  Activity,
  AlertTriangle,
  CheckCircle,
  Brain,
  Zap,
  Clock,
  TrendingUp
} from 'lucide-react';
import Card from '../components/Card';

const DeceptionCenter = () => {
  const [activeHoneypots, setActiveHoneypots] = useState([]);
  const [deceptionMetrics, setDeceptionMetrics] = useState({
    total_decoys: 47,
    active_engagements: 3,
    attacker_confusion_time: 847, // minutes
    intelligence_gathered: 156,
    false_positives_prevented: 89
  });
  
  const [attackerPsychology, setAttackerPsychology] = useState({
    patience_level: 73,
    skill_assessment: 'Advanced',
    behavioral_pattern: 'Methodical Scanner',
    likely_motivation: 'Financial Gain',
    stress_indicators: ['Increased dwell time', 'Repeated same commands', 'Tool switching']
  });

  // Honeypot types and their configurations
  const honeypotTypes = [
    {
      type: 'Web Server',
      icon: Globe,
      description: 'Fake web applications with realistic vulnerabilities',
      difficulty: 'Easy',
      engagement_rate: 87,
      color: 'from-green-500 to-emerald-500'
    },
    {
      type: 'Database',
      icon: Database,
      description: 'Decoy databases with synthetic customer data',
      difficulty: 'Medium', 
      engagement_rate: 62,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      type: 'File Server',
      icon: Server,
      description: 'Network shares with enticing fake documents',
      difficulty: 'Easy',
      engagement_rate: 91,
      color: 'from-purple-500 to-pink-500'
    },
    {
      type: 'IoT Device',
      icon: Network,
      description: 'Simulated cameras, sensors, and smart devices',
      difficulty: 'Hard',
      engagement_rate: 34,
      color: 'from-orange-500 to-red-500'
    }
  ];

  // Active deception campaigns
  const [campaigns, setCampaigns] = useState([
    {
      id: 1,
      name: 'Operation Mirage',
      type: 'Financial Data Honeypot',
      status: 'active',
      attacker_engaged: true,
      engagement_time: '2h 47m',
      intelligence_collected: [
        'C2 server: 194.147.85.23',
        'Tool: Cobalt Strike',
        'TTPs: Lateral movement via WMI',
        'Target: /finance/customers.db'
      ],
      psychology_profile: 'Patient, systematic - likely experienced APT'
    },
    {
      id: 2,
      name: 'Honey Trap Alpha',
      type: 'Web Application',
      status: 'monitoring',
      attacker_engaged: false,
      last_interaction: '4h ago',
      intelligence_collected: [
        'Automated scanner detected',
        'User-Agent: sqlmap/1.7.2',
        'Focus: SQL injection attempts'
      ]
    }
  ]);

  // Reality distortion metrics
  const [realityDistortion, setRealityDistortion] = useState({
    confusion_score: 89,
    misdirection_success: 74,
    false_confidence_induced: 91,
    time_wasted: '12h 23m',
    attack_path_derailed: true
  });

  // Generate fake data that looks realistic
  const generateDeceptiveData = (type) => {
    const fakeData = {
      'customer_data': [
        'John Smith - SSN: 555-01-XXXX - Credit: 850',
        'Sarah Johnson - SSN: 555-02-XXXX - Credit: 720', 
        'Michael Brown - SSN: 555-03-XXXX - Credit: 680'
      ],
      'financial_records': [
        'Q4_Revenue_2024.xlsx - $47.2M',
        'PayrollData_December.csv - 847 employees',
        'TaxReturns_2024_CONFIDENTIAL.pdf'
      ],
      'network_shares': [
        '\\\\finance-srv\\customers\\database_backup.sql',
        '\\\\hr-srv\\salaries\\executive_compensation.xlsx',
        '\\\\legal\\contracts\\merger_docs_RESTRICTED\\'
      ]
    };
    
    return fakeData[type] || ['No data generated'];
  };

  useEffect(() => {
    // Simulate real-time deception intelligence
    const interval = setInterval(() => {
      setDeceptionMetrics(prev => ({
        ...prev,
        attacker_confusion_time: prev.attacker_confusion_time + Math.floor(Math.random() * 3),
        intelligence_gathered: prev.intelligence_gathered + (Math.random() > 0.7 ? 1 : 0)
      }));

      // Update attacker psychology based on interactions
      setAttackerPsychology(prev => ({
        ...prev,
        patience_level: Math.max(20, prev.patience_level + (Math.random() - 0.6) * 5)
      }));

    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const deployHoneypot = (type) => {
    const newHoneypot = {
      id: Date.now(),
      type: type.type,
      status: 'deploying',
      deployment_time: new Date(),
      location: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      fake_data: generateDeceptiveData(type.type.toLowerCase().replace(' ', '_'))
    };
    
    setActiveHoneypots(prev => [newHoneypot, ...prev.slice(0, 9)]);
    
    // Simulate deployment completion
    setTimeout(() => {
      setActiveHoneypots(prev => 
        prev.map(hp => 
          hp.id === newHoneypot.id 
            ? { ...hp, status: 'active' }
            : hp
        )
      );
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="display-text text-3xl mb-2 flex items-center space-x-3">
            <Eye className="w-8 h-8 text-amber-400" />
            <span>Deception Technology Center</span>
          </h1>
          <p className="body-text text-zinc-400">Advanced honeypot orchestration and attacker psychology analysis</p>
        </div>
      </div>

      {/* Deception Metrics Overview */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Shield className="w-5 h-5 text-amber-400" />
              <span className="text-2xl font-bold text-amber-400">{deceptionMetrics.total_decoys}</span>
            </div>
            <p className="text-sm text-zinc-400">Active Decoys</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Activity className="w-5 h-5 text-red-400" />
              <span className="text-2xl font-bold text-red-400">{deceptionMetrics.active_engagements}</span>
            </div>
            <p className="text-sm text-zinc-400">Live Engagements</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="text-2xl font-bold text-purple-400">{Math.floor(deceptionMetrics.attacker_confusion_time / 60)}h</span>
            </div>
            <p className="text-sm text-zinc-400">Time Wasted</p>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-5 h-5 text-green-400" />
              <span className="text-2xl font-bold text-green-400">{deceptionMetrics.intelligence_gathered}</span>
            </div>
            <p className="text-sm text-zinc-400">Intel Collected</p>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-cyan-500/30">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-cyan-400" />
              <span className="text-2xl font-bold text-cyan-400">{realityDistortion.confusion_score}%</span>
            </div>
            <p className="text-sm text-zinc-400">Confusion Rate</p>
          </div>
        </Card>
      </div>

      {/* Active Campaigns and Psychology Analysis */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Target className="w-5 h-5 text-red-400" />
              <h3 className="font-semibold">Active Deception Campaigns</h3>
              <div className="ml-auto flex items-center space-x-1 text-xs text-zinc-400">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>Live</span>
              </div>
            </div>
            
            <div className="space-y-4">
              {campaigns.map((campaign) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border ${
                    campaign.attacker_engaged 
                      ? 'bg-red-500/10 border-red-500/30' 
                      : 'bg-[#0b0c10] border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{campaign.name}</h4>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      campaign.attacker_engaged 
                        ? 'bg-red-500/20 text-red-400' 
                        : 'bg-zinc-600/50 text-zinc-400'
                    }`}>
                      {campaign.attacker_engaged ? 'ENGAGED' : 'MONITORING'}
                    </div>
                  </div>
                  <p className="text-sm text-zinc-400 mb-3">{campaign.type}</p>
                  
                  {campaign.attacker_engaged && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-3 h-3 text-amber-400" />
                        <span className="text-zinc-300">Engaged for {campaign.engagement_time}</span>
                      </div>
                      <div className="bg-red-500/5 p-2 rounded text-xs">
                        <div className="text-red-400 font-medium mb-1">Psychology: {campaign.psychology_profile}</div>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-3">
                    <h5 className="text-xs text-zinc-500 mb-1">Intelligence Collected:</h5>
                    <div className="space-y-1">
                      {campaign.intelligence_collected.slice(0, 2).map((intel, index) => (
                        <div key={index} className="text-xs font-mono bg-[#0b0c10] p-1 rounded text-green-400">
                          {intel}
                        </div>
                      ))}
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
              <Brain className="w-5 h-5 text-purple-400" />
              <h3 className="font-semibold">Attacker Psychology Profile</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-[#0b0c10] rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-400">Patience Level</span>
                  <span className="font-bold text-purple-400">{Math.round(attackerPsychology.patience_level)}%</span>
                </div>
                <div className="w-full bg-zinc-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-400 to-pink-400 h-2 rounded-full transition-all duration-1000"
                    style={{ width: `${attackerPsychology.patience_level}%` }}
                  ></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#0b0c10] rounded-lg">
                  <div className="text-xs text-zinc-400">Skill Level</div>
                  <div className="font-semibold text-orange-400">{attackerPsychology.skill_assessment}</div>
                </div>
                <div className="p-3 bg-[#0b0c10] rounded-lg">
                  <div className="text-xs text-zinc-400">Motivation</div>
                  <div className="font-semibold text-blue-400">{attackerPsychology.likely_motivation}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-zinc-400 mb-2">Behavioral Pattern</div>
                <div className="p-3 bg-[#0b0c10] rounded-lg">
                  <div className="font-medium text-cyan-400">{attackerPsychology.behavioral_pattern}</div>
                </div>
              </div>

              <div>
                <div className="text-sm text-zinc-400 mb-2">Stress Indicators</div>
                <div className="space-y-1">
                  {attackerPsychology.stress_indicators.map((indicator, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <span className="text-zinc-300">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Honeypot Deployment Center */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Trap className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold">Honeypot Deployment Center</h3>
            </div>
            <div className="text-sm text-zinc-400">
              Deploy strategic deceptions to confuse and gather intelligence on attackers
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            {honeypotTypes.map((type, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                onClick={() => deployHoneypot(type)}
                className={`cursor-pointer p-4 rounded-lg bg-gradient-to-br ${type.color}/10 border border-transparent hover:border-orange-500/30 transition-all duration-200`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <type.icon className="w-6 h-6 text-orange-400" />
                  <h4 className="font-medium">{type.type}</h4>
                </div>
                <p className="text-sm text-zinc-400 mb-3">{type.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-500">Difficulty: {type.difficulty}</span>
                  <span className="text-green-400">{type.engagement_rate}% success</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recently Deployed Honeypots */}
          {activeHoneypots.length > 0 && (
            <div>
              <h4 className="font-medium mb-3">Recently Deployed</h4>
              <div className="space-y-2">
                {activeHoneypots.slice(0, 3).map((honeypot) => (
                  <div key={honeypot.id} className="flex items-center justify-between p-3 bg-[#0b0c10] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        honeypot.status === 'active' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'
                      }`}></div>
                      <span className="text-sm font-medium">{honeypot.type}</span>
                      <span className="text-xs text-zinc-400">{honeypot.location}</span>
                    </div>
                    <div className="text-xs text-zinc-500">
                      {honeypot.status === 'deploying' ? 'Deploying...' : 'Active'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Reality Distortion Engine */}
      <Card>
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <EyeOff className="w-5 h-5 text-pink-400" />
            <h3 className="font-semibold">Reality Distortion Engine</h3>
            <div className="ml-auto bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-sm">
              Active
            </div>
          </div>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-pink-400 mb-1">{realityDistortion.confusion_score}%</div>
              <div className="text-sm text-zinc-400">Confusion Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">{realityDistortion.misdirection_success}%</div>
              <div className="text-sm text-zinc-400">Misdirection Success</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">{realityDistortion.false_confidence_induced}%</div>
              <div className="text-sm text-zinc-400">False Confidence</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">{realityDistortion.time_wasted}</div>
              <div className="text-sm text-zinc-400">Attacker Time Wasted</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-4 h-4 text-pink-400" />
              <span className="font-medium text-pink-400">Reality Distortion Status</span>
            </div>
            <p className="text-sm text-zinc-300">
              Attackers are experiencing {realityDistortion.confusion_score}% confusion rate. 
              Successfully derailed {realityDistortion.attack_path_derailed ? '1 attack path' : '0 attack paths'} 
              and induced false confidence in {realityDistortion.false_confidence_induced}% of interactions.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DeceptionCenter;