import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ShieldAlert, Cpu, HardDrive, Users, Globe, TrendingUp, Clock } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Security Dashboard</h1>
          <p className="muted">Real-time security monitoring and threat intelligence</p>
        </div>
        <div className="flex items-center gap-2 text-sm muted">
          <Clock className="h-4 w-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 sm:col-span-6 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm muted">Total Events</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-semibold">156,789</div>
            <p className="text-sm muted flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              +12% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-12 sm:col-span-6 lg:col-span-3">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm muted">Active Alerts</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-semibold">342</div>
            <p className="text-sm text-amber-400 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +5 new alerts
            </p>
          </CardContent>
        </Card>

        <Card className="col-span-12 sm:col-span-6 lg:col-span-3">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm muted">Critical Issues</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-400" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-3xl font-semibold text-red-400">23</div>
            <p className="text-sm muted mt-1">Requires immediate attention</p>
          </CardContent>
        </Card>

        <Card className="col-span-12 sm:col-span-6 lg:col-span-3">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm muted">System Health</CardTitle>
            <Activity className="h-4 w-4 text-emerald-400" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-lg font-semibold text-emerald-400">Operational</div>
            <p className="text-sm muted mt-1">All systems running normally</p>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 sm:col-span-6 lg:col-span-4">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm muted">Connected Assets</CardTitle>
            <HardDrive className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-semibold">1,247</div>
            <p className="text-sm muted mt-1">Servers, workstations, IoT devices</p>
          </CardContent>
        </Card>

        <Card className="col-span-12 sm:col-span-6 lg:col-span-4">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm muted">Active Users</CardTitle>
            <Users className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-semibold">89</div>
            <p className="text-sm muted mt-1">Currently authenticated sessions</p>
          </CardContent>
        </Card>

        <Card className="col-span-12 sm:col-span-6 lg:col-span-4">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm muted">Threat Intelligence</CardTitle>
            <Globe className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent className="pb-4">
            <div className="text-2xl font-semibold">6</div>
            <p className="text-sm muted mt-1">Active threat intel feeds</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Sections */}
      <div className="grid grid-cols-12 gap-6">
        {/* Recent Alerts */}
        <Card className="col-span-12 lg:col-span-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              Recent Security Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { severity: 'High', event: 'Suspicious login attempt detected', time: '2 min ago', ip: '192.168.1.100' },
                { severity: 'Medium', event: 'Unusual network traffic pattern', time: '15 min ago', ip: '10.0.0.45' },
                { severity: 'Low', event: 'Failed authentication attempt', time: '32 min ago', ip: '172.16.0.23' },
                { severity: 'Critical', event: 'Malware signature detected', time: '1 hr ago', ip: '192.168.1.200' },
              ].map((alert, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      alert.severity === 'Critical' ? 'bg-red-400' :
                      alert.severity === 'High' ? 'bg-orange-400' :
                      alert.severity === 'Medium' ? 'bg-amber-400' : 'bg-blue-400'
                    }`} />
                    <div>
                      <p className="font-medium">{alert.event}</p>
                      <p className="text-sm muted">Source: {alert.ip}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      alert.severity === 'Critical' ? 'bg-red-400/10 text-red-400' :
                      alert.severity === 'High' ? 'bg-orange-400/10 text-orange-400' :
                      alert.severity === 'Medium' ? 'bg-amber-400/10 text-amber-400' : 'bg-blue-400/10 text-blue-400'
                    }`}>
                      {alert.severity}
                    </span>
                    <p className="text-sm muted mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* System Resources */}
        <Card className="col-span-12 lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5 text-blue-400" />
              System Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'CPU Usage', value: 45, color: 'bg-blue-400' },
                { label: 'Memory', value: 67, color: 'bg-emerald-400' },
                { label: 'Storage', value: 23, color: 'bg-purple-400' },
                { label: 'Network I/O', value: 89, color: 'bg-orange-400' },
              ].map((resource, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{resource.label}</span>
                    <span className="muted">{resource.value}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${resource.color}`}
                      style={{ width: `${resource.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}