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
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cycling-500 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">VeloCommand</h1>
              <p className="text-xs text-gray-400">Cycling Analytics Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium text-white">{urosProfile.name}</p>
              <p className="text-xs text-gray-400">FTP: {urosProfile.ftp}W</p>
            </div>
            <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-cycling-500 text-cycling-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'plan'
                  ? 'border-cycling-500 text-cycling-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Training Plan
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'stats'
                  ? 'border-cycling-500 text-cycling-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Activity className="w-4 h-4 inline mr-2" />
              Stats
            </button>
            <button
              onClick={() => setActiveTab('wellness')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'wellness'
                  ? 'border-cycling-500 text-cycling-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              <Heart className="w-4 h-4 inline mr-2" />
              Wellness
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'import'
                  ? 'border-cycling-500 text-cycling-400'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
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
        {activeTab === 'dashboard' && <Dashboard workouts={workouts} metrics={metrics} athlete={urosProfile} />}
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
