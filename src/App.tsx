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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="gradient-hero text-white">
        <div className="max-w-7xl mx-auto px-4 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
              <Activity className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">VeloCommand</h1>
              <p className="text-sm text-white/70">Cycling Analytics Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold text-white">{urosProfile.name}</p>
              <p className="text-xs text-white/70">FTP: {urosProfile.ftp}W</p>
            </div>
            <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-primary-600'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'plan'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-primary-600'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Training Plan
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'stats'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-primary-600'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Stats
            </button>
            <button
              onClick={() => setActiveTab('wellness')}
              className={`px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'wellness'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-primary-600'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Wellness
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-5 py-4 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'import'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-primary-600'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Data Import
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'stats' && <StatsView workouts={workouts} metrics={metrics} athlete={urosProfile} wellnessEntries={wellnessEntries} />}
        {activeTab === 'dashboard' && <Dashboard workouts={workouts} metrics={metrics} athlete={urosProfile} wellnessEntries={wellnessEntries} />}
        {activeTab === 'plan' && <TrainingPlanView athlete={urosProfile} metrics={metrics} wellnessEntries={wellnessEntries} />}
        {activeTab === 'wellness' && (
          <div className="space-y-6">
            <WellnessInput onSubmit={handleWellnessSubmit} lastEntry={wellnessEntries[wellnessEntries.length - 1]} />
            <WellnessChart entries={wellnessEntries} />
          </div>
        )}
        {activeTab === 'import' && <DataImport />}
      </main>
    </div>
  );
}
