import React from 'react';
import { Home, Puzzle, Image as ImageIcon, Settings, Calendar, Bell, User, ClipboardList, BarChart3, TrendingUp } from 'lucide-react';
import { PatientTab, FamilyCaregiverTab, AshaTab } from '../../types';

interface PatientNavProps {
  activeTab: PatientTab;
  onSelectTab: (tab: PatientTab) => void;
}

export const PatientBottomNav: React.FC<PatientNavProps> = ({ activeTab, onSelectTab }) => {
  const tabs: { key: PatientTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'play', label: 'Play', icon: Puzzle },
    { key: 'memories', label: 'Memories', icon: ImageIcon },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-30 bg-white/95 backdrop-blur-md border-t border-[#E0DCD3] px-3 py-2 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onSelectTab(tab.key)}
            className={`flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all ${
              isActive
                ? 'text-[#5B825B] font-extrabold scale-105 bg-[#EAF1E8]'
                : 'text-[#5A6E5D] font-bold hover:text-[#2D3A2F]'
            }`}
          >
            <Icon className={`w-6 h-6 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[11px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

interface FamilyNavProps {
  activeTab: FamilyCaregiverTab;
  onSelectTab: (tab: FamilyCaregiverTab) => void;
  alertCount?: number;
}

export const FamilyBottomNav: React.FC<FamilyNavProps> = ({ activeTab, onSelectTab, alertCount = 0 }) => {
  const tabs: { key: FamilyCaregiverTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'progress', label: 'Progress', icon: TrendingUp },
    { key: 'calendar', label: 'Calendar', icon: Calendar },
    { key: 'alerts', label: 'Alerts', icon: Bell, badge: alertCount },
    { key: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-30 bg-white/95 backdrop-blur-md border-t border-[#E0DCD3] px-3 py-2 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onSelectTab(tab.key)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all ${
              isActive
                ? 'text-[#5B825B] font-extrabold scale-105 bg-[#EAF1E8]'
                : 'text-[#5A6E5D] font-bold hover:text-[#2D3A2F]'
            }`}
          >
            <div className="relative">
              <Icon className={`w-6 h-6 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1 -right-2 bg-[#C46A66] text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[11px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

interface AshaNavProps {
  activeTab: AshaTab;
  onSelectTab: (tab: AshaTab) => void;
  pendingTasksCount?: number;
}

export const AshaBottomNav: React.FC<AshaNavProps> = ({ activeTab, onSelectTab, pendingTasksCount = 0 }) => {
  const tabs: { key: AshaTab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { key: 'home', label: 'Home', icon: Home },
    { key: 'report', label: 'Report', icon: BarChart3 },
    { key: 'tasks', label: 'Tasks', icon: ClipboardList, badge: pendingTasksCount },
    { key: 'alerts', label: 'Alerts', icon: Bell },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-30 bg-white/95 backdrop-blur-md border-t border-[#E0DCD3] px-3 py-2 flex items-center justify-around shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onSelectTab(tab.key)}
            className={`relative flex flex-col items-center justify-center py-1.5 px-4 rounded-2xl transition-all ${
              isActive
                ? 'text-[#5B825B] font-extrabold scale-105 bg-[#EAF1E8]'
                : 'text-[#5A6E5D] font-bold hover:text-[#2D3A2F]'
            }`}
          >
            <div className="relative">
              <Icon className={`w-6 h-6 mb-0.5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
              {tab.badge && tab.badge > 0 ? (
                <span className="absolute -top-1 -right-2 bg-[#E8B25C] text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </div>
            <span className="text-[11px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
