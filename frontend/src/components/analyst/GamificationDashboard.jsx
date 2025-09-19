import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Star, 
  Target, 
  Zap, 
  Shield, 
  Award, 
  TrendingUp,
  Users,
  Crown,
  Medal,
  Flame,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import EnhancedCard from '../ui/EnhancedCard';
import { SkeletonCard, EmptyState } from '../ui/LoadingStates';

const GamificationDashboard = () => {
  const [analystData, setAnalystData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    loadAnalystData();
    loadLeaderboard();
  }, []);

  const loadAnalystData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyst/points', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAnalystData(data.points);
      }
    } catch (error) {
      console.error('Error loading analyst data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const response = await fetch('/api/analyst/leaderboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || []);
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const getBadgeIcon = (badge) => {
    switch (badge.toLowerCase()) {
      case 'level_1': return <Star className="w-4 h-4 text-yellow-400" />;
      case 'level_5': return <Crown className="w-4 h-4 text-purple-400" />;
      case 'level_10': return <Trophy className="w-4 h-4 text-gold-400" />;
      case 'streak_7': return <Flame className="w-4 h-4 text-orange-400" />;
      case 'reports_10': return <Target className="w-4 h-4 text-blue-400" />;
      case 'flags_5': return <Shield className="w-4 h-4 text-red-400" />;
      default: return <Award className="w-4 h-4 text-zinc-400" />;
    }
  };

  const getBadgeColor = (badge) => {
    switch (badge.toLowerCase()) {
      case 'level_1': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'level_5': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'level_10': return 'bg-gold-500/20 text-gold-400 border-gold-500/30';
      case 'streak_7': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'reports_10': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'flags_5': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-400" />;
      default: return <span className="w-5 h-5 text-zinc-400 text-sm font-bold">{rank}</span>;
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: Target },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'achievements', label: 'Achievements', icon: Award }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard lines={4} />
        <SkeletonCard lines={3} />
        <SkeletonCard lines={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-700">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'text-white bg-zinc-800 border-b-2 border-yellow-400'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'profile' && analystData && (
            <div className="space-y-6">
              {/* Profile Overview */}
              <EnhancedCard
                title="Analyst Profile"
                subtitle="Your security analyst journey"
                priority="high"
                count={analystData.level}
              >
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-white">L{analystData.level}</span>
                    </div>
                    <div className="text-lg font-semibold text-white">Level {analystData.level}</div>
                    <div className="text-sm text-zinc-400">Security Analyst</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">{analystData.xp}</div>
                    <div className="text-sm text-zinc-400">Experience Points</div>
                    <div className="w-full bg-zinc-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(analystData.xp % 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {analystData.xp % 100}/100 to next level
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">{analystData.streak_count}</div>
                    <div className="text-sm text-zinc-400">Day Streak</div>
                    <div className="flex items-center justify-center mt-2">
                      <Flame className="w-4 h-4 text-orange-400" />
                    </div>
                  </div>
                </div>
              </EnhancedCard>

              {/* Badges */}
              <EnhancedCard
                title="Badges & Achievements"
                subtitle="Your security expertise badges"
                priority="medium"
                count={analystData.badges.length}
              >
                {analystData.badges.length === 0 ? (
                  <EmptyState
                    icon={Award}
                    title="No Badges Yet"
                    description="Complete actions to earn your first badge"
                  />
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {analystData.badges.map((badge, index) => (
                      <motion.div
                        key={badge}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border text-center ${getBadgeColor(badge)}`}
                      >
                        <div className="flex justify-center mb-2">
                          {getBadgeIcon(badge)}
                        </div>
                        <div className="text-sm font-medium capitalize">
                          {badge.replace('_', ' ')}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </EnhancedCard>

              {/* Recent Activity */}
              <EnhancedCard
                title="Recent Activity"
                subtitle="Your latest security actions"
                priority="low"
              >
                <div className="space-y-3">
                  {analystData.achievements.slice(-5).map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-zinc-800 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white">{achievement.action}</div>
                        <div className="text-xs text-zinc-400">
                          {new Date(achievement.timestamp).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-green-400">+{achievement.points} XP</div>
                    </div>
                  ))}
                </div>
              </EnhancedCard>
            </div>
          )}

          {activeTab === 'leaderboard' && (
            <div className="space-y-6">
              <EnhancedCard
                title="Analyst Leaderboard"
                subtitle="Top performing security analysts"
                priority="high"
                count={leaderboard.length}
              >
                {leaderboard.length === 0 ? (
                  <EmptyState
                    icon={Trophy}
                    title="No Leaderboard Data"
                    description="Analysts need to earn points to appear on the leaderboard"
                  />
                ) : (
                  <div className="space-y-3">
                    {leaderboard.map((analyst, index) => (
                      <motion.div
                        key={analyst.analyst_id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border transition-all ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' :
                          index === 1 ? 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 border-gray-500/30' :
                          index === 2 ? 'bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30' :
                          'bg-zinc-800 border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-8 h-8">
                              {getRankIcon(index + 1)}
                            </div>
                            <div>
                              <div className="font-medium text-white">
                                {analyst.analyst_id}
                              </div>
                              <div className="text-sm text-zinc-400">
                                Level {analyst.level} • {analyst.badges.length} badges
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">{analyst.xp}</div>
                            <div className="text-sm text-zinc-400">XP</div>
                          </div>
                        </div>
                        
                        {index < 3 && (
                          <div className="mt-3 pt-3 border-t border-zinc-700">
                            <div className="flex items-center space-x-4 text-sm">
                              <div className="flex items-center space-x-1">
                                <Flame className="w-4 h-4 text-orange-400" />
                                <span className="text-zinc-300">{analyst.streak_count} day streak</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-4 h-4 text-blue-400" />
                                <span className="text-zinc-300">
                                  Last active: {new Date(analyst.last_activity).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </EnhancedCard>

              {/* Leaderboard Stats */}
              <EnhancedCard
                title="Leaderboard Statistics"
                subtitle="Analyst performance metrics"
                priority="medium"
              >
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {leaderboard.length > 0 ? leaderboard[0].xp : 0}
                    </div>
                    <div className="text-sm text-zinc-400">Highest XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {leaderboard.reduce((sum, analyst) => sum + analyst.xp, 0)}
                    </div>
                    <div className="text-sm text-zinc-400">Total XP</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">
                      {leaderboard.length > 0 ? Math.round(leaderboard.reduce((sum, analyst) => sum + analyst.xp, 0) / leaderboard.length) : 0}
                    </div>
                    <div className="text-sm text-zinc-400">Average XP</div>
                  </div>
                </div>
              </EnhancedCard>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-6">
              <EnhancedCard
                title="Available Achievements"
                subtitle="Unlock new badges and rewards"
                priority="medium"
              >
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { id: 'first_report', name: 'First Report', description: 'Create your first security report', points: 50, icon: Target },
                    { id: 'flag_master', name: 'Flag Master', description: 'Flag 10 items to admin', points: 100, icon: Shield },
                    { id: 'streak_warrior', name: 'Streak Warrior', description: 'Maintain 7-day activity streak', points: 200, icon: Flame },
                    { id: 'level_5', name: 'Level 5', description: 'Reach analyst level 5', points: 500, icon: Crown },
                    { id: 'explanation_expert', name: 'Explanation Expert', description: 'Use AI explanations 50 times', points: 150, icon: Zap },
                    { id: 'noise_hunter', name: 'Noise Hunter', description: 'Resolve 25 noise buckets', points: 300, icon: Filter }
                  ].map((achievement) => (
                    <div key={achievement.id} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="flex items-center space-x-3">
                        <achievement.icon className="w-8 h-8 text-blue-400" />
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{achievement.name}</h4>
                          <p className="text-sm text-zinc-400">{achievement.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-400">+{achievement.points} XP</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </EnhancedCard>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default GamificationDashboard;
