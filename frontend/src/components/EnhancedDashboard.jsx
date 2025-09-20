import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Grid3X3, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Settings, 
  Trash2, 
  Move,
  BarChart3,
  Activity,
  Shield,
  AlertTriangle,
  Brain,
  Eye,
  Clock,
  TrendingUp,
  Users,
  Database,
  Zap,
  Monitor
} from 'lucide-react';

const EnhancedDashboard = () => {
  const [widgets, setWidgets] = useState([]);
  const [draggedWidget, setDraggedWidget] = useState(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [availableWidgets, setAvailableWidgets] = useState([]);

  // Available widget types
  const widgetTypes = [
    {
      id: 'threat-overview',
      name: 'Threat Overview',
      icon: Shield,
      defaultSize: { width: 2, height: 1 },
      color: 'from-red-500 to-orange-500'
    },
    {
      id: 'ai-analysis',
      name: 'AI Analysis',
      icon: Brain,
      defaultSize: { width: 2, height: 1 },
      color: 'from-purple-500 to-blue-500'
    },
    {
      id: 'system-health',
      name: 'System Health',
      icon: Activity,
      defaultSize: { width: 1, height: 1 },
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'recent-alerts',
      name: 'Recent Alerts',
      icon: AlertTriangle,
      defaultSize: { width: 2, height: 2 },
      color: 'from-yellow-500 to-red-500'
    },
    {
      id: 'deception-metrics',
      name: 'Deception Metrics',
      icon: Eye,
      defaultSize: { width: 1, height: 1 },
      color: 'from-amber-500 to-orange-500'
    },
    {
      id: 'performance-chart',
      name: 'Performance Chart',
      icon: BarChart3,
      defaultSize: { width: 2, height: 1 },
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'user-activity',
      name: 'User Activity',
      icon: Users,
      defaultSize: { width: 1, height: 1 },
      color: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'automation-status',
      name: 'Automation Status',
      icon: Zap,
      defaultSize: { width: 1, height: 1 },
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  useEffect(() => {
    loadDashboardLayout();
    setAvailableWidgets(widgetTypes);
  }, []);

  const loadDashboardLayout = () => {
    // Load saved layout or use default
    const savedLayout = localStorage.getItem('dashboard_layout');
    if (savedLayout) {
      setWidgets(JSON.parse(savedLayout));
    } else {
      // Default layout
      const defaultWidgets = [
        {
          id: 'widget-1',
          type: 'threat-overview',
          position: { x: 0, y: 0 },
          size: { width: 2, height: 1 },
          config: {}
        },
        {
          id: 'widget-2',
          type: 'ai-analysis',
          position: { x: 2, y: 0 },
          size: { width: 2, height: 1 },
          config: {}
        },
        {
          id: 'widget-3',
          type: 'system-health',
          position: { x: 0, y: 1 },
          size: { width: 1, height: 1 },
          config: {}
        },
        {
          id: 'widget-4',
          type: 'recent-alerts',
          position: { x: 1, y: 1 },
          size: { width: 2, height: 2 },
          config: {}
        },
        {
          id: 'widget-5',
          type: 'deception-metrics',
          position: { x: 3, y: 1 },
          size: { width: 1, height: 1 },
          config: {}
        }
      ];
      setWidgets(defaultWidgets);
    }
  };

  const saveDashboardLayout = (newWidgets) => {
    localStorage.setItem('dashboard_layout', JSON.stringify(newWidgets));
  };

  const addWidget = (widgetType) => {
    const newWidget = {
      id: `widget-${Date.now()}`,
      type: widgetType.id,
      position: { x: 0, y: 0 },
      size: widgetType.defaultSize,
      config: {}
    };
    
    const updatedWidgets = [...widgets, newWidget];
    setWidgets(updatedWidgets);
    saveDashboardLayout(updatedWidgets);
  };

  const removeWidget = (widgetId) => {
    const updatedWidgets = widgets.filter(w => w.id !== widgetId);
    setWidgets(updatedWidgets);
    saveDashboardLayout(updatedWidgets);
  };

  const updateWidgetPosition = (widgetId, newPosition) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId 
        ? { ...widget, position: newPosition }
        : widget
    );
    setWidgets(updatedWidgets);
    saveDashboardLayout(updatedWidgets);
  };

  const resizeWidget = (widgetId, newSize) => {
    const updatedWidgets = widgets.map(widget =>
      widget.id === widgetId 
        ? { ...widget, size: newSize }
        : widget
    );
    setWidgets(updatedWidgets);
    saveDashboardLayout(updatedWidgets);
  };

  const renderWidget = (widget) => {
    const widgetType = widgetTypes.find(t => t.id === widget.type);
    if (!widgetType) return null;

    const WidgetIcon = widgetType.icon;

    return (
      <motion.div
        key={widget.id}
        className={`bg-gradient-to-br ${widgetType.color}/10 border border-zinc-700 rounded-xl p-4 relative group`}
        style={{
          gridColumn: `span ${widget.size.width}`,
          gridRow: `span ${widget.size.height}`
        }}
        layout
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        {/* Widget Controls */}
        {isCustomizing && (
          <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => resizeWidget(widget.id, { 
                width: Math.min(4, widget.size.width + 1), 
                height: widget.size.height 
              })}
              className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            >
              <Maximize2 className="w-3 h-3 text-zinc-400" />
            </button>
            <button
              onClick={() => resizeWidget(widget.id, { 
                width: Math.max(1, widget.size.width - 1), 
                height: widget.size.height 
              })}
              className="p-1 bg-zinc-800 hover:bg-zinc-700 rounded transition-colors"
            >
              <Minimize2 className="w-3 h-3 text-zinc-400" />
            </button>
            <button
              onClick={() => removeWidget(widget.id)}
              className="p-1 bg-red-600 hover:bg-red-700 rounded transition-colors"
            >
              <Trash2 className="w-3 h-3 text-white" />
            </button>
          </div>
        )}

        {/* Widget Content */}
        <div className="flex items-center space-x-3 mb-4">
          <WidgetIcon className={`w-6 h-6 bg-gradient-to-br ${widgetType.color} bg-clip-text text-transparent`} />
          <h3 className="font-semibold text-white">{widgetType.name}</h3>
        </div>

        <WidgetContent type={widget.type} size={widget.size} config={widget.config} />
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="display-text text-3xl mb-2">Enhanced Dashboard</h1>
          <p className="body-text text-zinc-400">Customizable widgets and real-time security monitoring</p>
        </div>
        
        <div className="flex space-x-3">
          <motion.button
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`px-6 py-3 rounded-lg flex items-center space-x-2 transition-colors ${
              isCustomizing 
                ? 'bg-orange-500 hover:bg-orange-600 text-white'
                : 'bg-zinc-700 hover:bg-zinc-600 text-zinc-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Grid3X3 className="w-4 h-4" />
            <span>{isCustomizing ? 'Finish Customizing' : 'Customize Dashboard'}</span>
          </motion.button>
        </div>
      </div>

      {/* Widget Palette */}
      <AnimatePresence>
        {isCustomizing && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#111214] border border-zinc-700 rounded-xl p-6"
          >
            <h3 className="font-semibold mb-4 flex items-center space-x-2">
              <Plus className="w-5 h-5 text-blue-400" />
              <span>Add Widgets</span>
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availableWidgets.map((widgetType) => {
                const WidgetIcon = widgetType.icon;
                return (
                  <motion.button
                    key={widgetType.id}
                    onClick={() => addWidget(widgetType)}
                    className={`flex items-center space-x-2 p-3 bg-gradient-to-r ${widgetType.color}/10 border border-zinc-600 hover:border-zinc-500 rounded-lg transition-colors`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <WidgetIcon className="w-5 h-5 text-white" />
                    <span className="text-sm text-white">{widgetType.name}</span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-4 gap-4 auto-rows-[200px]">
        <AnimatePresence>
          {widgets.map(renderWidget)}
        </AnimatePresence>
      </div>

      {/* Instructions */}
      {isCustomizing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
          <div className="flex items-start space-x-3">
            <Monitor className="w-5 h-5 text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-400 mb-2">Customization Tips</h4>
              <ul className="text-sm text-blue-300 space-y-1">
                <li>• Hover over widgets to see resize and delete controls</li>
                <li>• Click widget titles to configure individual settings</li>
                <li>• Use the expand/shrink buttons to adjust widget sizes</li>
                <li>• Add new widgets from the palette above</li>
                <li>• Your layout is automatically saved</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// Widget Content Components
const WidgetContent = ({ type, size, config }) => {
  switch (type) {
    case 'threat-overview':
      return <ThreatOverviewWidget size={size} config={config} />;
    case 'ai-analysis':
      return <AIAnalysisWidget size={size} config={config} />;
    case 'system-health':
      return <SystemHealthWidget size={size} config={config} />;
    case 'recent-alerts':
      return <RecentAlertsWidget size={size} config={config} />;
    case 'deception-metrics':
      return <DeceptionMetricsWidget size={size} config={config} />;
    case 'performance-chart':
      return <PerformanceChartWidget size={size} config={config} />;
    case 'user-activity':
      return <UserActivityWidget size={size} config={config} />;
    case 'automation-status':
      return <AutomationStatusWidget size={size} config={config} />;
    default:
      return <DefaultWidget type={type} />;
  }
};

// Individual Widget Components
const ThreatOverviewWidget = ({ size }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-2xl font-bold text-red-400">12</span>
      <span className="text-sm text-zinc-400">Active Threats</span>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">High Priority</span>
        <span className="text-red-400 font-medium">3</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">Medium Priority</span>
        <span className="text-yellow-400 font-medium">7</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">Low Priority</span>
        <span className="text-green-400 font-medium">2</span>
      </div>
    </div>
  </div>
);

const AIAnalysisWidget = ({ size }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-2xl font-bold text-purple-400">47</span>
      <span className="text-sm text-zinc-400">AI Analyses Today</span>
    </div>
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-400">Confidence</span>
        <span className="text-purple-400 font-medium">94.2%</span>
      </div>
      <div className="w-full bg-zinc-700 rounded-full h-2">
        <div className="bg-purple-400 h-2 rounded-full" style={{ width: '94.2%' }}></div>
      </div>
    </div>
  </div>
);

const SystemHealthWidget = ({ size }) => (
  <div className="space-y-3">
    <div className="text-center">
      <div className="text-3xl font-bold text-green-400 mb-1">98%</div>
      <div className="text-sm text-zinc-400">System Health</div>
    </div>
    <div className="flex justify-center">
      <div className="w-16 h-16 rounded-full border-4 border-green-400 flex items-center justify-center">
        <Activity className="w-6 h-6 text-green-400" />
      </div>
    </div>
  </div>
);

const RecentAlertsWidget = ({ size }) => {
  const alerts = [
    { title: 'Suspicious Network Activity', severity: 'high', time: '2m ago' },
    { title: 'Failed Authentication', severity: 'medium', time: '5m ago' },
    { title: 'System Update Available', severity: 'low', time: '1h ago' }
  ];

  return (
    <div className="space-y-3">
      {alerts.map((alert, index) => (
        <div key={index} className="flex items-center space-x-3 p-2 bg-zinc-800/50 rounded-lg">
          <div className={`w-2 h-2 rounded-full ${
            alert.severity === 'high' ? 'bg-red-400' :
            alert.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
          }`}></div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{alert.title}</p>
            <p className="text-xs text-zinc-400">{alert.time}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

const DeceptionMetricsWidget = ({ size }) => (
  <div className="space-y-3">
    <div className="text-center">
      <div className="text-3xl font-bold text-amber-400 mb-1">23</div>
      <div className="text-sm text-zinc-400">Active Honeypots</div>
    </div>
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">Engaged</span>
        <span className="text-amber-400 font-medium">3</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-zinc-400">Intelligence</span>
        <span className="text-green-400 font-medium">156</span>
      </div>
    </div>
  </div>
);

const PerformanceChartWidget = ({ size }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center">
      <span className="text-lg font-bold text-blue-400">Performance</span>
      <TrendingUp className="w-4 h-4 text-green-400" />
    </div>
    <div className="flex items-end space-x-1 h-16">
      {[40, 65, 45, 80, 60, 90, 75].map((height, index) => (
        <div
          key={index}
          className="flex-1 bg-blue-400 rounded-t"
          style={{ height: `${height}%` }}
        ></div>
      ))}
    </div>
  </div>
);

const UserActivityWidget = ({ size }) => (
  <div className="space-y-3">
    <div className="text-center">
      <div className="text-3xl font-bold text-indigo-400 mb-1">24</div>
      <div className="text-sm text-zinc-400">Active Users</div>
    </div>
    <div className="flex justify-center space-x-2">
      {[1, 2, 3, 4].map((_, index) => (
        <div key={index} className="w-8 h-8 bg-indigo-400 rounded-full flex items-center justify-center">
          <Users className="w-4 h-4 text-white" />
        </div>
      ))}
    </div>
  </div>
);

const AutomationStatusWidget = ({ size }) => (
  <div className="space-y-3">
    <div className="text-center">
      <div className="text-3xl font-bold text-yellow-400 mb-1">12</div>
      <div className="text-sm text-zinc-400">Active Rules</div>
    </div>
    <div className="flex items-center justify-center">
      <Zap className="w-8 h-8 text-yellow-400" />
    </div>
  </div>
);

const DefaultWidget = ({ type }) => (
  <div className="flex items-center justify-center h-full text-zinc-400">
    <div className="text-center">
      <Settings className="w-8 h-8 mx-auto mb-2" />
      <p className="text-sm">Widget: {type}</p>
    </div>
  </div>
);

export default EnhancedDashboard;