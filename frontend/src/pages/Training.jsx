import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Users, 
  Settings, 
  Target, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  ArrowLeft,
  Star,
  Award,
  Brain,
  Shield,
  Search,
  Zap
} from 'lucide-react';
import Card from '../components/Card';

const Training = () => {
  const [selectedPath, setSelectedPath] = useState(null);
  const [currentModule, setCurrentModule] = useState(0);
  const [completedModules, setCompletedModules] = useState([]);
  const [progress, setProgress] = useState({});
  const [showCertificate, setShowCertificate] = useState(false);

  // Training paths with different complexity levels
  const trainingPaths = {
    normal: {
      title: "Security Analyst Path",
      subtitle: "Essential skills for daily security operations",
      icon: Shield,
      duration: "2-3 hours",
      difficulty: "Beginner to Intermediate",
      color: "from-blue-500 to-cyan-500",
      modules: [
        {
          id: 1,
          title: "Platform Overview",
          duration: "15 min",
          description: "Navigate the Jupiter interface and understand key concepts",
          topics: ["Dashboard navigation", "Menu structure", "User interface", "Basic terminology"],
          interactive: true
        },
        {
          id: 2, 
          title: "Alert Management",
          duration: "25 min",
          description: "Respond to security alerts effectively",
          topics: ["Alert triage", "Severity levels", "Response actions", "Documentation"],
          interactive: true
        },
        {
          id: 3,
          title: "Log Analysis Basics",
          duration: "30 min", 
          description: "Search and analyze security logs",
          topics: ["Log search", "Filters", "Timeline analysis", "Export options"],
          interactive: true
        },
        {
          id: 4,
          title: "Case Management",
          duration: "20 min",
          description: "Create and manage security incidents",
          topics: ["Case creation", "Evidence collection", "Status updates", "Collaboration"],
          interactive: true
        },
        {
          id: 5,
          title: "Threat Intelligence",
          duration: "25 min",
          description: "Utilize threat feeds and IOCs",
          topics: ["IOC lookup", "Threat feeds", "Indicator analysis", "Enrichment"],
          interactive: true
        }
      ]
    },
    power: {
      title: "SOC Engineer Path", 
      subtitle: "Advanced techniques for security professionals",
      icon: Brain,
      duration: "4-5 hours",
      difficulty: "Advanced",
      color: "from-purple-500 to-pink-500",
      modules: [
        {
          id: 1,
          title: "Advanced Search & Correlation",
          duration: "45 min",
          description: "Master complex queries and alert correlation",
          topics: ["Regex patterns", "Complex filters", "Cross-correlation", "Statistical analysis"],
          interactive: true
        },
        {
          id: 2,
          title: "SOAR Automation",
          duration: "50 min",
          description: "Build and deploy automation playbooks", 
          topics: ["Playbook design", "Trigger configuration", "Action chains", "Testing & validation"],
          interactive: true
        },
        {
          id: 3,
          title: "Threat Hunting",
          duration: "60 min",
          description: "Proactive threat detection techniques",
          topics: ["Hunting hypotheses", "IOC pivoting", "Behavior analysis", "Campaign tracking"],
          interactive: true
        },
        {
          id: 4,
          title: "API Integration",
          duration: "35 min",
          description: "Integrate external tools and data sources",
          topics: ["API configuration", "Custom connectors", "Webhook setup", "Data mapping"],
          interactive: true
        },
        {
          id: 5,
          title: "Advanced Analytics",
          duration: "40 min",
          description: "Statistical analysis and machine learning",
          topics: ["Anomaly detection", "Trend analysis", "Predictive models", "Custom metrics"],
          interactive: true
        },
        {
          id: 6,
          title: "Multi-Tenant Administration",
          duration: "30 min",
          description: "Manage multiple tenant environments",
          topics: ["Tenant configuration", "Resource allocation", "Cross-tenant analysis", "Reporting"],
          interactive: true
        }
      ]
    }
  };

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('jupiter_training_progress');
    if (savedProgress) {
      const parsed = JSON.parse(savedProgress);
      setProgress(parsed);
      setCompletedModules(parsed.completedModules || []);
    }
  }, []);

  // Save progress to localStorage
  const saveProgress = (pathId, moduleId, completed = false) => {
    const newProgress = {
      ...progress,
      [pathId]: {
        ...progress[pathId],
        currentModule: moduleId,
        completedModules: completed ? 
          [...(progress[pathId]?.completedModules || []), moduleId] : 
          progress[pathId]?.completedModules || [],
        lastAccessed: new Date().toISOString()
      }
    };
    setProgress(newProgress);
    localStorage.setItem('jupiter_training_progress', JSON.stringify(newProgress));
  };

  // Calculate completion percentage
  const getCompletionPercentage = (pathId) => {
    if (!progress[pathId]) return 0;
    const completedCount = progress[pathId].completedModules?.length || 0;
    const totalModules = trainingPaths[pathId].modules.length;
    return Math.round((completedCount / totalModules) * 100);
  };

  // Get next recommended module
  const getNextModule = (pathId) => {
    if (!progress[pathId]) return 0;
    const completed = progress[pathId].completedModules || [];
    const modules = trainingPaths[pathId].modules;
    for (let i = 0; i < modules.length; i++) {
      if (!completed.includes(modules[i].id)) return i;
    }
    return modules.length - 1;
  };

  const completeModule = (pathId, moduleId) => {
    const pathProgress = progress[pathId] || {};
    const completedModules = pathProgress.completedModules || [];
    
    if (!completedModules.includes(moduleId)) {
      saveProgress(pathId, moduleId, true);
      setCompletedModules([...completedModules, moduleId]);
      
      // Check if path is complete
      if (completedModules.length + 1 === trainingPaths[pathId].modules.length) {
        setShowCertificate(true);
      }
    }
  };

  if (!selectedPath) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="display-text text-4xl mb-4">Security Training Center</h1>
          <p className="body-text text-xl text-zinc-400 max-w-3xl mx-auto">
            Master the Jupiter Security Platform with interactive training paths designed for your expertise level
          </p>
        </div>

        {/* Training Path Selection */}
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {Object.entries(trainingPaths).map(([pathId, path]) => {
            const completionPct = getCompletionPercentage(pathId);
            const hasProgress = progress[pathId];
            
            return (
              <motion.div
                key={pathId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -5 }}
                className="cursor-pointer"
                onClick={() => setSelectedPath(pathId)}
              >
                <Card className="h-full hover:shadow-lg hover:shadow-red-500/10 border-2 hover:border-red-500/30 transition-all duration-300">
                  <div className="p-8">
                    {/* Icon and Title */}
                    <div className="flex items-center space-x-4 mb-6">
                      <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${path.color} flex items-center justify-center`}>
                        <path.icon className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h3 className="display-text text-2xl">{path.title}</h3>
                        <p className="body-text text-zinc-400">{path.subtitle}</p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {hasProgress && (
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-zinc-400">Progress</span>
                          <span className="text-sm font-semibold">{completionPct}%</span>
                        </div>
                        <div className="w-full bg-zinc-700 rounded-full h-2">
                          <div 
                            className={`bg-gradient-to-r ${path.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${completionPct}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Course Details */}
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center space-x-4 text-sm text-zinc-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{path.duration}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Target className="w-4 h-4" />
                          <span>{path.difficulty}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-zinc-400">
                        <BookOpen className="w-4 h-4" />
                        <span>{path.modules.length} modules</span>
                      </div>
                    </div>

                    {/* Module Preview */}
                    <div className="space-y-2 mb-6">
                      <h4 className="font-semibold text-sm text-zinc-300">You'll learn:</h4>
                      <ul className="space-y-1">
                        {path.modules.slice(0, 3).map((module, index) => (
                          <li key={index} className="text-sm text-zinc-400 flex items-center space-x-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <span>{module.title}</span>
                          </li>
                        ))}
                        {path.modules.length > 3 && (
                          <li className="text-sm text-zinc-500">
                            + {path.modules.length - 3} more modules
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Action Button */}
                    <button className={`w-full bg-gradient-to-r ${path.color} hover:opacity-90 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2`}>
                      {hasProgress ? (
                        <>
                          <span>Continue Training</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Start Training</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Progress Summary */}
        {Object.keys(progress).length > 0 && (
          <Card className="max-w-4xl mx-auto">
            <div className="p-6">
              <h3 className="display-text text-xl mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5 text-yellow-500" />
                <span>Your Training Progress</span>
              </h3>
              <div className="space-y-4">
                {Object.entries(progress).map(([pathId, pathProgress]) => (
                  <div key={pathId} className="flex items-center justify-between p-4 bg-[#0b0c10] rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${trainingPaths[pathId].color} flex items-center justify-center`}>
                        {React.createElement(trainingPaths[pathId].icon, { className: "w-5 h-5 text-white" })}
                      </div>
                      <div>
                        <h4 className="font-semibold">{trainingPaths[pathId].title}</h4>
                        <p className="text-sm text-zinc-400">
                          Last accessed: {new Date(pathProgress.lastAccessed).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">{getCompletionPercentage(pathId)}%</div>
                      <div className="text-sm text-zinc-400">
                        {pathProgress.completedModules?.length || 0} / {trainingPaths[pathId].modules.length} modules
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Training module content view
  const currentPath = trainingPaths[selectedPath];
  const module = currentPath.modules[currentModule];
  const isCompleted = progress[selectedPath]?.completedModules?.includes(module.id) || false;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back button and progress */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => setSelectedPath(null)}
          className="flex items-center space-x-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Training Paths</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-zinc-400">
            Module {currentModule + 1} of {currentPath.modules.length}
          </span>
          <div className="w-32 bg-zinc-700 rounded-full h-2">
            <div 
              className={`bg-gradient-to-r ${currentPath.color} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${((currentModule + 1) / currentPath.modules.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Module Content */}
      <Card>
        <div className="p-8">
          {/* Module Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="display-text text-3xl mb-2">{module.title}</h1>
              <p className="body-text text-zinc-400 text-lg mb-4">{module.description}</p>
              <div className="flex items-center space-x-4 text-sm text-zinc-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{module.duration}</span>
                </div>
                {isCompleted && (
                  <div className="flex items-center space-x-1 text-green-500">
                    <CheckCircle className="w-4 h-4" />
                    <span>Completed</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="mb-8">
            <h3 className="font-semibold mb-4">What you'll learn:</h3>
            <div className="grid md:grid-cols-2 gap-2">
              {module.topics.map((topic, index) => (
                <div key={index} className="flex items-center space-x-2 text-zinc-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Training Content */}
          <div className="bg-[#0b0c10] border border-zinc-700 rounded-lg p-6 mb-8">
            <h4 className="font-semibold mb-4">Interactive Training Module</h4>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <p className="text-zinc-400 mb-4">Interactive training content would be loaded here</p>
              <p className="text-sm text-zinc-500">
                This would include step-by-step tutorials, simulated environments, 
                hands-on exercises, and knowledge checks.
              </p>
            </div>
          </div>

          {/* Navigation and Completion */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentModule(Math.max(0, currentModule - 1))}
              disabled={currentModule === 0}
              className="flex items-center space-x-2 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-4">
              {!isCompleted && (
                <button
                  onClick={() => completeModule(selectedPath, module.id)}
                  className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Mark Complete</span>
                </button>
              )}
              
              <button
                onClick={() => setCurrentModule(Math.min(currentPath.modules.length - 1, currentModule + 1))}
                disabled={currentModule === currentPath.modules.length - 1}
                className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Certificate Modal */}
      <AnimatePresence>
        {showCertificate && (
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
              className="bg-[#111214] border border-zinc-700 rounded-xl p-8 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
                <p className="text-zinc-400 mb-6">
                  You've completed the {currentPath.title} training path!
                </p>
                <button
                  onClick={() => setShowCertificate(false)}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Continue Training
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Training;