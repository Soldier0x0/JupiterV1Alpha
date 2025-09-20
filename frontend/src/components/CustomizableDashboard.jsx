import React, { useState, useEffect } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import DashboardWidget from './DashboardWidget';
import { Plus, Settings, Save, RotateCcw } from 'lucide-react';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const CustomizableDashboard = () => {
  const [layouts, setLayouts] = useState({});
  const [widgets, setWidgets] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);

  // Default widget configurations
  const defaultWidgets = [
    {
      id: 'total-events',
      type: 'metric',
      title: 'Total Events',
      data: {
        value: 156789,
        label: 'Events Today',
        change: 12.5,
        icon: 'activity',
        color: 'blue'
      }
    },
    {
      id: 'active-alerts',
      type: 'metric',
      title: 'Active Alerts',
      data: {
        value: 342,
        label: 'Requiring Attention',
        change: -8.2,
        icon: 'alert',
        color: 'yellow'
      }
    },
    {
      id: 'critical-issues',
      type: 'metric',
      title: 'Critical Issues',
      data: {
        value: 23,
        label: 'High Priority',
        change: -15.3,
        icon: 'shield',
        color: 'red'
      }
    },
    {
      id: 'system-health',
      type: 'status',
      title: 'System Health',
      data: {
        status: 'healthy',
        message: 'All systems operational',
        details: ['API Gateway: Online', 'Database: Healthy', 'Services: 12/12 Running']
      }
    },
    {
      id: 'recent-alerts',
      type: 'list',
      title: 'Recent Alerts',
      data: {
        items: [
          { title: 'Suspicious Login Attempt', subtitle: '2 minutes ago', status: 'warning', value: 'Medium' },
          { title: 'DDoS Attack Blocked', subtitle: '5 minutes ago', status: 'error', value: 'High' },
          { title: 'System Update Complete', subtitle: '10 minutes ago', status: 'success', value: 'Info' },
          { title: 'Storage Usage Alert', subtitle: '15 minutes ago', status: 'warning', value: 'Medium' },
          { title: 'Backup Completed', subtitle: '30 minutes ago', status: 'success', value: 'Info' }
        ]
      }
    },
    {
      id: 'cpu-usage',
      type: 'progress',
      title: 'CPU Usage',
      data: {
        value: 45,
        max: 100,
        label: 'Current Usage',
        color: 'green'
      }
    },
    {
      id: 'memory-usage',
      type: 'progress',
      title: 'Memory Usage',
      data: {
        value: 68,
        max: 100,
        label: 'RAM Usage',
        color: 'yellow'
      }
    },
    {
      id: 'events-chart',
      type: 'chart',
      title: 'Events Trend',
      data: {
        chartType: 'line',
        datasets: ['events', 'alerts', 'threats']
      }
    }
  ];

  // Default layout configuration
  const defaultLayouts = {
    lg: [
      { i: 'total-events', x: 0, y: 0, w: 3, h: 2 },
      { i: 'active-alerts', x: 3, y: 0, w: 3, h: 2 },
      { i: 'critical-issues', x: 6, y: 0, w: 3, h: 2 },
      { i: 'system-health', x: 9, y: 0, w: 3, h: 2 },
      { i: 'recent-alerts', x: 0, y: 2, w: 6, h: 4 },
      { i: 'events-chart', x: 6, y: 2, w: 6, h: 4 },
      { i: 'cpu-usage', x: 0, y: 6, w: 3, h: 2 },
      { i: 'memory-usage', x: 3, y: 6, w: 3, h: 2 }
    ],
    md: [
      { i: 'total-events', x: 0, y: 0, w: 3, h: 2 },
      { i: 'active-alerts', x: 3, y: 0, w: 3, h: 2 },
      { i: 'critical-issues', x: 6, y: 0, w: 3, h: 2 },
      { i: 'system-health', x: 0, y: 2, w: 3, h: 2 },
      { i: 'recent-alerts', x: 3, y: 2, w: 6, h: 4 },
      { i: 'events-chart', x: 0, y: 4, w: 9, h: 3 },
      { i: 'cpu-usage', x: 0, y: 7, w: 4, h: 2 },
      { i: 'memory-usage', x: 4, y: 7, w: 4, h: 2 }
    ],
    sm: [
      { i: 'total-events', x: 0, y: 0, w: 6, h: 2 },
      { i: 'active-alerts', x: 0, y: 2, w: 6, h: 2 },
      { i: 'critical-issues', x: 0, y: 4, w: 6, h: 2 },
      { i: 'system-health', x: 0, y: 6, w: 6, h: 2 },
      { i: 'recent-alerts', x: 0, y: 8, w: 6, h: 4 },
      { i: 'events-chart', x: 0, y: 12, w: 6, h: 3 },
      { i: 'cpu-usage', x: 0, y: 15, w: 6, h: 2 },
      { i: 'memory-usage', x: 0, y: 17, w: 6, h: 2 }
    ]
  };

  // Load saved configuration from localStorage
  useEffect(() => {
    const savedLayouts = localStorage.getItem('dashboard-layouts');
    const savedWidgets = localStorage.getItem('dashboard-widgets');
    
    if (savedLayouts) {
      setLayouts(JSON.parse(savedLayouts));
    } else {
      setLayouts(defaultLayouts);
    }
    
    if (savedWidgets) {
      setWidgets(JSON.parse(savedWidgets));
    } else {
      setWidgets(defaultWidgets);
    }
  }, []);

  // Save configuration to localStorage
  const saveConfiguration = () => {
    localStorage.setItem('dashboard-layouts', JSON.stringify(layouts));
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
    setIsEditing(false);
    
    // Show success message
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-opacity';
    notification.textContent = 'Dashboard configuration saved!';
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 2000);
  };

  // Reset to default configuration
  const resetToDefault = () => {
    if (window.confirm('Are you sure you want to reset the dashboard to default layout? This will remove all customizations.')) {
      setLayouts(defaultLayouts);
      setWidgets(defaultWidgets);
      localStorage.removeItem('dashboard-layouts');
      localStorage.removeItem('dashboard-widgets');
    }
  };

  // Handle layout changes
  const handleLayoutChange = (layout, layouts) => {
    setLayouts(layouts);
  };

  // Handle widget removal
  const handleRemoveWidget = (widgetId) => {
    if (window.confirm('Are you sure you want to remove this widget?')) {
      setWidgets(widgets.filter(widget => widget.id !== widgetId));
      
      // Remove from layouts
      const newLayouts = {};
      Object.keys(layouts).forEach(breakpoint => {
        newLayouts[breakpoint] = layouts[breakpoint].filter(item => item.i !== widgetId);
      });
      setLayouts(newLayouts);
    }
  };

  // Handle widget editing (placeholder for future implementation)
  const handleEditWidget = (widgetId) => {
    // TODO: Implement widget editing modal
    console.log('Edit widget:', widgetId);
  };

  // Available widget types for adding
  const availableWidgetTypes = [
    { type: 'metric', label: 'Metric Card', icon: '📊' },
    { type: 'chart', label: 'Chart', icon: '📈' },
    { type: 'list', label: 'List', icon: '📋' },
    { type: 'status', label: 'Status', icon: '🟢' },
    { type: 'progress', label: 'Progress Bar', icon: '▫️' }
  ];

  // Handle adding new widget
  const handleAddWidget = (type) => {
    const newWidgetId = `widget-${Date.now()}`;
    const newWidget = {
      id: newWidgetId,
      type: type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)} Widget`,
      data: getDefaultDataForType(type)
    };

    setWidgets([...widgets, newWidget]);

    // Add to layouts
    const newLayouts = { ...layouts };
    Object.keys(newLayouts).forEach(breakpoint => {
      const layout = newLayouts[breakpoint];
      const maxY = Math.max(...layout.map(item => item.y + item.h), 0);
      
      newLayouts[breakpoint] = [
        ...layout,
        { 
          i: newWidgetId, 
          x: 0, 
          y: maxY, 
          w: breakpoint === 'sm' ? 6 : 3, 
          h: 2 
        }
      ];
    });
    
    setLayouts(newLayouts);
    setShowAddWidget(false);
  };

  // Get default data for widget type
  const getDefaultDataForType = (type) => {
    switch (type) {
      case 'metric':
        return {
          value: 0,
          label: 'New Metric',
          icon: 'activity',
          color: 'blue'
        };
      case 'chart':
        return {
          chartType: 'bar',
          datasets: []
        };
      case 'list':
        return {
          items: []
        };
      case 'status':
        return {
          status: 'unknown',
          message: 'Status not configured'
        };
      case 'progress':
        return {
          value: 0,
          max: 100,
          label: 'Progress',
          color: 'blue'
        };
      default:
        return {};
    }
  };

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white mb-2">Dashboard</h1>
          <p className="text-neutral-400">
            {isEditing ? 'Customize your dashboard layout' : 'Real-time security overview'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          {isEditing && (
            <>
              <button
                onClick={() => setShowAddWidget(true)}
                className="btn-secondary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Widget</span>
              </button>
              
              <button
                onClick={resetToDefault}
                className="btn-ghost flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
              
              <button
                onClick={saveConfiguration}
                className="btn-primary flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
            </>
          )}
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`flex items-center space-x-2 ${
              isEditing ? 'btn-ghost' : 'btn-secondary'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>{isEditing ? 'Exit Edit' : 'Customize'}</span>
          </button>
        </div>
      </div>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-lg p-6 w-full max-w-md border border-neutral-700">
            <h3 className="text-lg font-semibold text-white mb-4">Add Widget</h3>
            
            <div className="space-y-2 mb-6">
              {availableWidgetTypes.map(({ type, label, icon }) => (
                <button
                  key={type}
                  onClick={() => handleAddWidget(type)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg bg-neutral-800 hover:bg-neutral-700 transition-colors text-left"
                >
                  <span className="text-xl">{icon}</span>
                  <span className="text-white">{label}</span>
                </button>
              ))}
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddWidget(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Grid */}
      <div className={isEditing ? 'border-2 border-dashed border-neutral-600 rounded-lg p-4' : ''}>
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          onLayoutChange={handleLayoutChange}
          breakpoints={{ lg: 1200, md: 996, sm: 768 }}
          cols={{ lg: 12, md: 9, sm: 6 }}
          rowHeight={60}
          isDraggable={isEditing}
          isResizable={isEditing}
          margin={[16, 16]}
          containerPadding={[0, 0]}
          useCSSTransforms={true}
        >
          {widgets.map(widget => (
            <div key={widget.id}>
              <DashboardWidget
                widget={widget}
                onRemove={handleRemoveWidget}
                onEdit={handleEditWidget}
              />
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>

      {/* Edit Mode Indicator */}
      {isEditing && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Edit Mode Active - Drag and resize widgets</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizableDashboard;