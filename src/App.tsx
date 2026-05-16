import { useState, useMemo, useCallback } from 'react';
import { Activity, TrendingUp, Calendar, Settings, Heart } from 'lucide-react';
import { generateRealData, urosProfile, generateRealWellnessData, generateRealMetrics } from './data/realData';
import Dashboard from './components/Dashboard';
import TrainingPlanView from './components/TrainingPlanView';
import DataImport from './components/DataImport';
import WellnessInput from './components/WellnessInput';
import WellnessChart from './components/WellnessChart';
import StatsView from './components/StatsView';
import { WellnessEntry } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'stats' | 'plan' | 'import' | 'wellness'>('dashboard');
  const [workouts] = useState(() => generateRealData());
  const [wellnessEntries, setWellnessEntries] = useState(() => generateRealWellnessData());
  const metrics = useMemo(() => generateRealMetrics(), [workouts]);

  const handleWellnessSubmit = useCallback((entry: WellnessEntry) => {
    setWellnessEntries(prev => {
      const filtered = prev.filter(e => e.date.toDateString() !== entry.date.toDateString());
      return [...filtered, entry].sort((a, b) => a.date.getTime() - b.date.getTime());
    });
  }, []);

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: TrendingUp },
    { id: 'plan' as const, label: 'Training Plan', icon: Calendar },
    { id: 'stats' as const, label: 'Stats', icon: Activity },
    { id: 'wellness' as const, label: 'Wellness', icon: Heart },
    { id: 'import' as const, label: 'Data Import', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-cream-100">
      {/* ── Elegant Header ── */}
      <header className="gradient-hero text-cream-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Top bar */}
          <div className="flex items-center justify-between py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border border-white/30 flex items-center justify-center">
                <Activity className="w-4 h-4 text-white" strokeWidth={1.5} />
              </div>
              <span className="text-sm font-medium tracking-[0.2em] uppercase text-white/80">VeloCommand</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{urosProfile.name}</p>
                <p className="text-xs text-white/60 tracking-wide">FTP {urosProfile.ftp}W</p>
              </div>
              <button className="w-8 h-8 border border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                <Settings className="w-4 h-4 text-white/80" strokeWidth={1.5} />
              </button>
            </div>
          </div>
          
          {/* Hero Title */}
          <div className="py-12 md:py-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium text-white leading-tight tracking-tight">
              Cycling Analytics
            </h1>
            <p className="mt-3 text-lg text-white/70 font-serif italic max-w-xl">
              Performance, wellness, and training intelligence for the dedicated athlete.
            </p>
          </div>
        </div>
      </header>

      {/* ── Navigation ── */}
      <nav className="bg-white border-b border-warmgray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex gap-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                >
                  <Icon className="w-4 h-4 inline mr-2" strokeWidth={1.5} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {activeTab === 'stats' && <StatsView workouts={workouts} metrics={metrics} athlete={urosProfile} wellnessEntries={wellnessEntries} />}
        {activeTab === 'dashboard' && <Dashboard workouts={workouts} metrics={metrics} athlete={urosProfile} wellnessEntries={wellnessEntries} />}
        {activeTab === 'plan' && <TrainingPlanView athlete={urosProfile} metrics={metrics} wellnessEntries={wellnessEntries} />}
        {activeTab === 'wellness' && (
          <div className="space-y-8">
            <WellnessInput onSubmit={handleWellnessSubmit} lastEntry={wellnessEntries[wellnessEntries.length - 1]} />
            <WellnessChart entries={wellnessEntries} />
          </div>
        )}
        {activeTab === 'import' && <DataImport />}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-warmgray-900 text-warmgray-400 py-8 mt-16 border-t border-warmgray-800">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border border-warmgray-600 flex items-center justify-center">
              <Activity className="w-3 h-3 text-warmgray-500" strokeWidth={1.5} />
            </div>
            <span className="text-xs tracking-[0.2em] uppercase text-warmgray-500">VeloCommand</span>
          </div>
          <p className="text-xs text-warmgray-600 tracking-wide">Built for Uros · {new Date().getFullYear()}</p>
        </div>
      </footer>
    </div>
  );
}
