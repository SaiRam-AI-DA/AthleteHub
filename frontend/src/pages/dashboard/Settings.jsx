import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { User, Palette, Shield, Bell, Lock, Sliders, Info, Activity } from 'lucide-react';
import { GeneralSettings } from './settings/GeneralSettings';
import { AppearanceSettings } from './settings/AppearanceSettings';
import { SecuritySettings } from './settings/SecuritySettings';
import { NotificationSettings } from './settings/NotificationSettings';
import { PrivacySettings } from './settings/PrivacySettings';
import { PreferenceSettings } from './settings/PreferenceSettings';
import { AboutSettings } from './settings/AboutSettings';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const SETTINGS_SECTIONS = [
  { id: 'general', label: 'General', icon: User, component: GeneralSettings },
  { id: 'appearance', label: 'Appearance', icon: Palette, component: AppearanceSettings },
  { id: 'security', label: 'Security', icon: Shield, component: SecuritySettings },
  { id: 'notifications', label: 'Notifications', icon: Bell, component: NotificationSettings },
  { id: 'privacy', label: 'Privacy', icon: Lock, component: PrivacySettings },
  { id: 'preferences', label: 'Preferences', icon: Sliders, component: PreferenceSettings },
  { id: 'about', label: 'About', icon: Info, component: AboutSettings },
];

export default function Settings() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab && SETTINGS_SECTIONS.find(s => s.id === tab)) {
      setActiveTab(tab);
    }
  }, [location]);

  const handleTabChange = (id) => {
    setActiveTab(id);
    navigate(`/dashboard/settings?tab=${id}`, { replace: true });
  };

  const ActiveComponent = SETTINGS_SECTIONS.find(s => s.id === activeTab)?.component || GeneralSettings;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto flex flex-col md:flex-row gap-8 pb-12 pt-4">
      <div className="w-full md:w-64 shrink-0">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <nav className="flex flex-col space-y-1">
          {SETTINGS_SECTIONS.map((section) => (
            <button
              key={section.id}
              onClick={() => handleTabChange(section.id)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors text-left",
                activeTab === section.id 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <section.icon className="w-4 h-4" />
              {section.label}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="flex-1 min-w-0 md:pt-[52px]">
        <ErrorBoundary>
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl shadow-sm border border-gray-100 text-center h-[500px]">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Activity className="h-8 w-8 text-gray-400 opacity-50" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Feature Coming Soon</h2>
            <p className="text-gray-500 max-w-md">
              The <strong>{SETTINGS_SECTIONS.find(s => s.id === activeTab)?.label}</strong> module is currently under development. 
              This functionality will be enabled in a future AthleteHub update.
            </p>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  );
}
