import { ReactNode } from "react";
import { Shield, BarChart3, AlertTriangle, Settings, Users, Activity, Search, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon: Icon, label, isActive = false, onClick }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        isActive 
          ? 'bg-brand/10 text-brand border border-brand/20' 
          : 'text-muted hover:text-text hover:bg-white/5'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <div className="container grid grid-cols-12 gap-6 py-6">
        <aside className="col-span-12 md:col-span-3 lg:col-span-2">
          <Card className="panel p-4 sticky top-6">
            {/* Header */}
            <div className="flex items-center gap-2 pb-4 mb-4 border-b border-white/5">
              <Shield className="h-6 w-6 text-brand" />
              <span className="font-bold text-text">Jupiter SIEM</span>
            </div>
            
            {/* Navigation */}
            <nav className="space-y-1">
              <SidebarItem icon={BarChart3} label="Dashboard" isActive={true} />
              <SidebarItem icon={AlertTriangle} label="Alerts" />
              <SidebarItem icon={Activity} label="Incidents" />
              <SidebarItem icon={Search} label="Threat Intel" />
              <SidebarItem icon={Users} label="Users" />
              <SidebarItem icon={Settings} label="Settings" />
            </nav>
            
            {/* Status */}
            <div className="mt-6 pt-4 border-t border-white/5">
              <div className="flex items-center justify-between text-sm">
                <span className="muted">System Status</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                  <span className="text-emerald-400">Online</span>
                </div>
              </div>
            </div>
          </Card>
        </aside>
        
        <main className="col-span-12 md:col-span-9 lg:col-span-10">
          {children}
        </main>
      </div>
    </div>
  );
}