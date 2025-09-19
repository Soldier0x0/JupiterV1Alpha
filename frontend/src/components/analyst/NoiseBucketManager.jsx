import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  AlertTriangle, 
  Users, 
  Globe, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import EnhancedCard from '../ui/EnhancedCard';
import { SkeletonCard, EmptyState } from '../ui/LoadingStates';

const NoiseBucketManager = () => {
  const [buckets, setBuckets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [showResolved, setShowResolved] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadNoiseBuckets();
  }, []);

  const loadNoiseBuckets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analyst/noise-buckets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('JWT')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBuckets(data.buckets || []);
      }
    } catch (error) {
      console.error('Error loading noise buckets:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolveBucket = async (bucketId) => {
    try {
      // Mock API call
      setBuckets(prev => prev.map(bucket => 
        bucket.id === bucketId 
          ? { ...bucket, resolved: true }
          : bucket
      ));
    } catch (error) {
      console.error('Error resolving bucket:', error);
    }
  };

  const getBucketIcon = (alertType) => {
    switch (alertType.toLowerCase()) {
      case 'brute_force':
        return <Users className="w-5 h-5 text-red-400" />;
      case 'port_scan':
        return <Globe className="w-5 h-5 text-blue-400" />;
      case 'malware':
        return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default:
        return <Filter className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low': return 'text-green-400 bg-green-500/20 border-green-500/30';
      default: return 'text-zinc-400 bg-zinc-500/20 border-zinc-500/30';
    }
  };

  const filteredBuckets = buckets.filter(bucket => {
    if (!showResolved && bucket.resolved) return false;
    if (filterType !== 'all' && bucket.alert_type !== filterType) return false;
    return true;
  });

  const bucketStats = {
    total: buckets.length,
    resolved: buckets.filter(b => b.resolved).length,
    critical: buckets.filter(b => b.severity === 'critical').length,
    high: buckets.filter(b => b.severity === 'high').length
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <EnhancedCard
        title="Noise Bucket Manager"
        subtitle="Aggregated alert management"
        priority="high"
        count={bucketStats.total}
        actions={
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowResolved(!showResolved)}
              className={`p-2 rounded-lg transition-colors ${
                showResolved ? 'bg-green-500/20 text-green-400' : 'bg-zinc-700 text-zinc-400'
              }`}
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={loadNoiseBuckets}
              disabled={loading}
              className="p-2 hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 text-zinc-400 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{bucketStats.total}</div>
            <div className="text-sm text-zinc-400">Total Buckets</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">{bucketStats.resolved}</div>
            <div className="text-sm text-zinc-400">Resolved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-400">{bucketStats.critical}</div>
            <div className="text-sm text-zinc-400">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-400">{bucketStats.high}</div>
            <div className="text-sm text-zinc-400">High</div>
          </div>
        </div>
      </EnhancedCard>

      {/* Filters */}
      <EnhancedCard
        title="Filters"
        subtitle="Filter noise buckets by type"
        priority="info"
      >
        <div className="flex flex-wrap gap-2">
          {['all', 'brute_force', 'port_scan', 'malware', 'injection'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filterType === type
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
              }`}
            >
              {type.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </EnhancedCard>

      {/* Noise Buckets */}
      <EnhancedCard
        title="Noise Buckets"
        subtitle="Aggregated alerts grouped by similarity"
        priority="medium"
        count={filteredBuckets.length}
      >
        {loading ? (
          <div className="space-y-3">
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
            <SkeletonCard lines={3} />
          </div>
        ) : filteredBuckets.length === 0 ? (
          <EmptyState
            icon={Filter}
            title="No Noise Buckets"
            description="No aggregated alerts found matching your filters"
          />
        ) : (
          <div className="space-y-3">
            {filteredBuckets.map((bucket) => (
              <motion.div
                key={bucket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  bucket.resolved 
                    ? 'bg-zinc-800/50 border-zinc-700 opacity-60' 
                    : 'bg-zinc-800 border-zinc-700 hover:border-zinc-600'
                }`}
                onClick={() => setSelectedBucket(selectedBucket === bucket.id ? null : bucket.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getBucketIcon(bucket.alert_type)}
                    <div>
                      <h4 className="font-medium text-white capitalize">
                        {bucket.alert_type.replace('_', ' ')}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-zinc-400">
                        <span>Count: {bucket.count}</span>
                        {bucket.source_ip && <span>• IP: {bucket.source_ip}</span>}
                        {bucket.user_id && <span>• User: {bucket.user_id}</span>}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(bucket.severity)}`}>
                      {bucket.severity}
                    </span>
                    {bucket.resolved ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resolveBucket(bucket.id);
                        }}
                        className="p-1 hover:bg-zinc-700 rounded transition-colors"
                      >
                        <XCircle className="w-4 h-4 text-zinc-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {selectedBucket === bucket.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-zinc-700"
                    >
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="text-sm font-medium text-zinc-300 mb-2">Timeline</h5>
                          <div className="space-y-1 text-sm text-zinc-400">
                            <div className="flex justify-between">
                              <span>First Seen:</span>
                              <span>{new Date(bucket.first_seen).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Last Seen:</span>
                              <span>{new Date(bucket.last_seen).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Duration:</span>
                              <span>
                                {Math.round((new Date(bucket.last_seen) - new Date(bucket.first_seen)) / 1000 / 60)} min
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-zinc-300 mb-2">Sample Alerts</h5>
                          <div className="space-y-1">
                            {bucket.sample_alerts.slice(0, 3).map((alert, index) => (
                              <div key={index} className="text-sm text-zinc-400 p-2 bg-zinc-700 rounded">
                                {alert.activity_name || 'Unknown Activity'}
                              </div>
                            ))}
                            {bucket.sample_alerts.length > 3 && (
                              <div className="text-xs text-zinc-500">
                                +{bucket.sample_alerts.length - 3} more alerts
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center space-x-2">
                        <button className="px-3 py-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors text-sm">
                          View Details
                        </button>
                        <button className="px-3 py-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition-colors text-sm">
                          Create Rule
                        </button>
                        {!bucket.resolved && (
                          <button
                            onClick={() => resolveBucket(bucket.id)}
                            className="px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors text-sm"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </EnhancedCard>

      {/* Trend Analysis */}
      <EnhancedCard
        title="Trend Analysis"
        subtitle="Noise bucket trends over time"
        priority="low"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Brute Force Attacks</span>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">+23%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Port Scans</span>
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-green-400" />
              <span className="text-sm text-green-400">-12%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-zinc-300">Malware Detection</span>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-orange-400">+8%</span>
            </div>
          </div>
        </div>
      </EnhancedCard>
    </div>
  );
};

export default NoiseBucketManager;
