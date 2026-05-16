import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Heart, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { WellnessEntry } from '../types';
import { calculateReadiness, getWellnessTrend } from '../utils/wellness';

interface WellnessChartProps {
  entries: WellnessEntry[];
}

export default function WellnessChart({ entries }: WellnessChartProps) {
  const { trend, avgScore } = getWellnessTrend(entries);
  
  const chartData = useMemo(() => {
    return entries.slice(-14).map(e => {
      const readiness = calculateReadiness(e);
      return {
        date: e.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        motivation: e.motivation,
        muscleSoreness: e.muscleSoreness,
        lifeStress: e.lifeStress,
        fatigueLevel: e.fatigueLevel,
        sleepQuality: e.sleepQuality,
        totalScore: e.motivation + e.sleepQuality + (6 - e.muscleSoreness) + (6 - e.lifeStress) + (6 - e.fatigueLevel),
        readiness: readiness.score,
        readinessLabel: readiness.readiness,
      };
    });
  }, [entries]);

  const latest = entries[entries.length - 1];
  const latestReadiness = latest ? calculateReadiness(latest) : null;

  const TrendIcon = trend === 'improving' ? TrendingUp : trend === 'declining' ? TrendingDown : Minus;
  const trendColor = trend === 'improving' ? 'text-cycling-600' : trend === 'declining' ? 'text-orange-600' : 'text-gray-500';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="stat-label">Today's Readiness</p>
          <p className={`stat-value ${latestReadiness?.readiness === 'high' ? 'text-cycling-600' : latestReadiness?.readiness === 'moderate' ? 'text-yellow-600' : latestReadiness?.readiness === 'low' ? 'text-orange-600' : 'text-red-600'}`}>
            {latestReadiness?.readiness === 'high' ? '🔥 High' : latestReadiness?.readiness === 'moderate' ? '✓ Moderate' : latestReadiness?.readiness === 'low' ? '⚠ Low' : '🛑 Rest'}
          </p>
        </div>
        
        <div className="card">
          <p className="stat-label">Wellness Score</p>
          <p className="stat-value text-blue-600">
            {latestReadiness?.score || 0}/25
          </p>
        </div>
        
        <div className="card">
          <p className="stat-label">7-Day Average</p>
          <p className="stat-value text-purple-600">
            {avgScore}
          </p>
        </div>
        
        <div className="card">
          <p className="stat-label">Trend</p>
          <p className={`stat-value ${trendColor} flex items-center gap-2`}>
            <TrendIcon className="w-5 h-5" />
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </p>
        </div>
      </div>

      {/* Readiness Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-red-600" />
          Wellness & Readiness (14 Days)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} domain={[0, 25]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
              formatter={(value: number, name: string) => {
                if (name === 'readiness') return [`${value}/25`, 'Readiness'];
                return [value, name];
              }}
            />
            <Area type="monotone" dataKey="readiness" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} name="Readiness" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Component Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Wellness Components</h3>
        <div className="grid grid-cols-5 gap-2 mb-4">
          {latest && (
            <>
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Motivation</p>
                <p className="text-xl font-bold text-yellow-600">{latest.motivation}</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Soreness</p>
                <p className="text-xl font-bold text-orange-600">{latest.muscleSoreness}</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Stress</p>
                <p className="text-xl font-bold text-purple-600">{latest.lifeStress}</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Fatigue</p>
                <p className="text-xl font-bold text-blue-600">{latest.fatigueLevel}</p>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500">Sleep</p>
                <p className="text-xl font-bold text-indigo-400">{latest.sleepQuality}</p>
              </div>
            </>
          )}
        </div>
        
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData.slice(-7)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} domain={[0, 5]} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Bar dataKey="motivation" fill="#fbbf24" name="Motivation" />
            <Bar dataKey="sleepQuality" fill="#818cf8" name="Sleep" />
            <Bar dataKey="muscleSoreness" fill="#f97316" name="Soreness" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recommendation */}
      {latestReadiness && (
        <div className={`card ${
          latestReadiness.readiness === 'high' ? 'bg-cycling-500/5 border-cycling-500/20' :
          latestReadiness.readiness === 'moderate' ? 'bg-yellow-500/5 border-yellow-500/20' :
          latestReadiness.readiness === 'low' ? 'bg-orange-500/5 border-orange-500/20' :
          'bg-red-500/5 border-red-500/20'
        }`}>
          <h4 className="text-sm font-medium mb-2 uppercase tracking-wider">
            Today's Recommendation
          </h4>
          <p className="text-lg text-gray-900">
            {latestReadiness.recommendation}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Based on your wellness score of {latestReadiness.score}/25
          </p>
        </div>
      )}
    </div>
  );
}
