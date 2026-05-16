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
  const trendColor = trend === 'improving' ? 'text-emerald-700' : trend === 'declining' ? 'text-terracotta-600' : 'text-warmgray-500';

  const readinessColorMap: Record<string, { text: string; border: string; label: string }> = {
    high: { text: 'text-emerald-700', border: 'border-emerald-700', label: '🔥 High' },
    moderate: { text: 'text-amber-600', border: 'border-amber-600', label: '✓ Moderate' },
    low: { text: 'text-terracotta-600', border: 'border-terracotta-600', label: '⚠ Low' },
    rest: { text: 'text-violet-700', border: 'border-violet-700', label: '🛑 Rest' },
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-0">
        {[
          { label: "Today's Readiness", value: latestReadiness ? readinessColorMap[latestReadiness.readiness]?.label || latestReadiness.readiness : '-', color: latestReadiness ? readinessColorMap[latestReadiness.readiness]?.text || 'text-warmgray-900' : 'text-warmgray-900' },
          { label: 'Wellness Score', value: `${latestReadiness?.score || 0}/25`, color: 'text-violet-700' },
          { label: '7-Day Average', value: String(avgScore), color: 'text-warmgray-900' },
          { label: 'Trend', value: (
            <span className={`flex items-center gap-2 ${trendColor}`}>
              <TrendIcon className="w-4 h-4" strokeWidth={1.5} />
              {trend.charAt(0).toUpperCase() + trend.slice(1)}
            </span>
          ), color: '' },
        ].map((stat, i) => (
          <div key={stat.label} className={`data-grid-item ${i > 0 ? 'border-l-0' : ''}`}>
            <p className="big-number-label">{stat.label}</p>
            <div className={`text-2xl font-serif font-medium mt-3 ${typeof stat.value === 'string' ? stat.color : ''}`}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Readiness Chart */}
      <section>
        <div className="accent-line" />
        <h2 className="section-title flex items-center gap-2">
          <Heart className="w-5 h-5 text-terracotta-500" strokeWidth={1.5} />
          Wellness & Readiness
        </h2>
        <div className="card">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E2E0DA" vertical={false} />
              <XAxis dataKey="date" stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#B5B0A6" fontSize={11} domain={[0, 25]} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FDFCFA', border: '1px solid #D1CEC6', borderRadius: '0', fontFamily: 'Inter' }}
                labelStyle={{ color: '#3D3A35', fontFamily: 'Playfair Display' }}
                formatter={(value: number, name: string) => {
                  if (name === 'readiness') return [`${value}/25`, 'Readiness'];
                  return [value, name];
                }}
              />
              <Area type="monotone" dataKey="readiness" stroke="#6B2C91" fill="#6B2C91" fillOpacity={0.1} strokeWidth={2} name="Readiness" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Component Breakdown */}
      <section>
        <div className="accent-line" />
        <h2 className="section-title">Wellness Components</h2>
        <div className="card">
          <div className="grid grid-cols-5 gap-0 mb-4">
            {latest && (
              <>
                {[
                  { label: 'Motivation', value: latest.motivation, color: 'text-terracotta-500' },
                  { label: 'Soreness', value: latest.muscleSoreness, color: 'text-violet-600' },
                  { label: 'Stress', value: latest.lifeStress, color: 'text-emerald-600' },
                  { label: 'Fatigue', value: latest.fatigueLevel, color: 'text-sky-600' },
                  { label: 'Sleep', value: latest.sleepQuality, color: 'text-amber-600' },
                ].map((item, i) => (
                  <div key={item.label} className={`bg-cream-50 p-4 text-center border border-warmgray-200 ${i > 0 ? 'border-l-0' : ''}`}>
                    <p className="text-xs text-warmgray-500 uppercase tracking-wider">{item.label}</p>
                    <p className={`text-2xl font-serif font-medium mt-1 ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </>
            )}
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData.slice(-7)}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E2E0DA" vertical={false} />
              <XAxis dataKey="date" stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#B5B0A6" fontSize={11} domain={[0, 5]} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FDFCFA', border: '1px solid #D1CEC6', borderRadius: '0', fontFamily: 'Inter' }}
                labelStyle={{ color: '#3D3A35', fontFamily: 'Playfair Display' }}
              />
              <Bar dataKey="motivation" fill="#C75B3A" name="Motivation" radius={[0, 0, 0, 0]} />
              <Bar dataKey="sleepQuality" fill="#6B2C91" name="Sleep" radius={[0, 0, 0, 0]} />
              <Bar dataKey="muscleSoreness" fill="#D4A843" name="Soreness" radius={[0, 0, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Recommendation */}
      {latestReadiness && (
        <section className={`card border-l-4 ${readinessColorMap[latestReadiness.readiness]?.border || 'border-warmgray-400'}`}>
          <h4 className="text-xs font-medium text-warmgray-500 mb-2 uppercase tracking-[0.2em]">
            Today's Recommendation
          </h4>
          <p className="text-lg font-serif text-warmgray-900">
            {latestReadiness.recommendation}
          </p>
          <p className="text-sm text-warmgray-500 mt-2 font-serif italic">
            Based on your wellness score of {latestReadiness.score}/25
          </p>
        </section>
      )}
    </div>
  );
}
