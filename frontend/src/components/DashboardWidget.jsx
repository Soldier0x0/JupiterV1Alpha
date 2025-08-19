import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  Shield, 
  Users, 
  Database, 
  Server, 
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  PieChart
} from 'lucide-react';

const DashboardWidget = ({ widget, onRemove, onEdit }) => {
  const { id, type, title, data, config } = widget;

  const renderWidget = () => {
    switch (type) {
      case 'metric':
        return <MetricWidget data={data} config={config} />;
      case 'chart':
        return <ChartWidget data={data} config={config} />;
      case 'list':
        return <ListWidget data={data} config={config} />;
      case 'status':
        return <StatusWidget data={data} config={config} />;
      case 'progress':
        return <ProgressWidget data={data} config={config} />;
      default:
        return <div className="p-4 text-neutral-400">Unknown widget type</div>;
    }
  };

  return (
    <div className="card-elevated h-full flex flex-col">
      {/* Widget Header */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-700/50">
        <h3 className="text-sm font-medium text-white">{title}</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(id)}
            className="p-1 text-neutral-400 hover:text-white transition-colors"
            title="Edit widget"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onRemove(id)}
            className="p-1 text-neutral-400 hover:text-red-400 transition-colors"
            title="Remove widget"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Widget Content */}
      <div className="flex-1 p-4">
        {renderWidget()}
      </div>
    </div>
  );
};

// Metric Widget Component
const MetricWidget = ({ data, config }) => {
  const { value, label, change, icon: iconName, color = 'blue' } = data;
  
  const getIcon = (name) => {
    const icons = {
      activity: Activity,
      alert: AlertTriangle,
      shield: Shield,
      users: Users,
      database: Database,
      server: Server,
      trending: TrendingUp,
      check: CheckCircle,
      clock: Clock
    };
    return icons[name] || Activity;
  };

  const Icon = getIcon(iconName);
  
  const colorClasses = {
    blue: 'text-blue-400 bg-blue-500/10',
    green: 'text-green-400 bg-green-500/10',
    red: 'text-red-400 bg-red-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    purple: 'text-purple-400 bg-purple-500/10'
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <div className="text-2xl font-bold text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-sm text-neutral-400 mb-2">{label}</div>
        {change && (
          <div className={`text-xs flex items-center ${
            change > 0 ? 'text-green-400' : change < 0 ? 'text-red-400' : 'text-neutral-400'
          }`}>
            {change > 0 ? '↗' : change < 0 ? '↘' : '→'} {Math.abs(change)}%
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg ${colorClasses[color] || colorClasses.blue}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

// Chart Widget Component
const ChartWidget = ({ data, config }) => {
  const { chartType = 'bar', datasets = [] } = data;
  
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="mb-4">
        {chartType === 'bar' ? <BarChart3 className="w-12 h-12 text-neutral-500" /> : 
         chartType === 'pie' ? <PieChart className="w-12 h-12 text-neutral-500" /> :
         <TrendingUp className="w-12 h-12 text-neutral-500" />}
      </div>
      <div className="text-sm text-neutral-400 text-center">
        Chart visualization
        <br />
        <span className="text-xs">({datasets.length} datasets)</span>
      </div>
    </div>
  );
};

// List Widget Component
const ListWidget = ({ data, config }) => {
  const { items = [], maxItems = 5 } = data;
  
  return (
    <div className="space-y-3">
      {items.slice(0, maxItems).map((item, index) => (
        <div key={index} className="flex items-center justify-between py-2 border-b border-neutral-700/30 last:border-b-0">
          <div className="flex items-center space-x-3">
            {item.status && (
              <div className={`w-2 h-2 rounded-full ${
                item.status === 'success' ? 'bg-green-400' :
                item.status === 'warning' ? 'bg-yellow-400' :
                item.status === 'error' ? 'bg-red-400' : 'bg-neutral-400'
              }`} />
            )}
            <div>
              <div className="text-sm text-white">{item.title}</div>
              {item.subtitle && (
                <div className="text-xs text-neutral-400">{item.subtitle}</div>
              )}
            </div>
          </div>
          {item.value && (
            <div className="text-sm text-neutral-300">{item.value}</div>
          )}
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-center text-neutral-400 py-8">
          No items to display
        </div>
      )}
    </div>
  );
};

// Status Widget Component
const StatusWidget = ({ data, config }) => {
  const { status, message, details = [] } = data;
  
  const statusConfig = {
    healthy: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10' },
    warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
    unknown: { icon: Clock, color: 'text-neutral-400', bg: 'bg-neutral-500/10' }
  };
  
  const config_status = statusConfig[status] || statusConfig.unknown;
  const Icon = config_status.icon;
  
  return (
    <div className="text-center">
      <div className={`inline-flex p-4 rounded-full ${config_status.bg} mb-4`}>
        <Icon className={`w-8 h-8 ${config_status.color}`} />
      </div>
      <div className={`text-lg font-medium mb-2 ${config_status.color}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
      <div className="text-sm text-neutral-400 mb-4">{message}</div>
      {details.length > 0 && (
        <div className="space-y-1">
          {details.map((detail, index) => (
            <div key={index} className="text-xs text-neutral-500">
              {detail}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Progress Widget Component
const ProgressWidget = ({ data, config }) => {
  const { value, max = 100, label, color = 'blue' } = data;
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    red: 'bg-red-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500'
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-neutral-300">{label}</span>
        <span className="text-sm text-white">{Math.round(percentage)}%</span>
      </div>
      <div className="w-full bg-neutral-700 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${colorClasses[color] || colorClasses.blue}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className="text-xs text-neutral-500">{value}</span>
        <span className="text-xs text-neutral-500">{max}</span>
      </div>
    </div>
  );
};

export default DashboardWidget;