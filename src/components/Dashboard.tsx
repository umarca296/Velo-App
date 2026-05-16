import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { calculateReadiness, getWellnessTrend } from '../utils/wellness';
import { Smile, Frown, Battery, Brain, BedDouble } from 'lucide-react';
import { Workout, FitnessMetrics, AthleteProfile, WellnessEntry } from '../types';

interface DashboardProps {
  workouts: Workout[];
  metrics: FitnessMetrics[];
  athlete: AthleteProfile;
  wellnessEntries?: WellnessEntry[];
}

export default function Dashboard({ workouts, metrics, athlete, wellnessEntries = [] }: DashboardProps) {
  const stats = useMemo(() => {
    const totalTss = workouts.reduce((sum, w) => sum + w.tss, 0);
    const totalHours = workouts.reduce((sum, w) => sum + w.duration, 0) / 60;
    const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);
    const totalElevation = workouts.reduce((sum, w) => sum + w.elevation, 0);
    const avgIf = workouts.reduce((sum, w) => sum + w.if, 0) / workouts.length;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekWorkouts = workouts.filter(w => w.date >= weekAgo);
    const weeklyTss = thisWeekWorkouts.reduce((sum, w) => sum + w.tss, 0);
    const weeklyHours = thisWeekWorkouts.reduce((sum, w) => sum + w.duration, 0) / 60;

    const latest = metrics[metrics.length - 1];

    return {
      totalWorkouts: workouts.length,
      totalTss,
      totalHours,
      totalDistance: Math.round(totalDistance),
      totalElevation: Math.round(totalElevation),
      avgIf: Math.round(avgIf * 100) / 100,
      weeklyTss,
      weeklyHours: Math.round(weeklyHours * 10) / 10,
      ctl: latest ? Math.round(latest.ctl * 10) / 10 : 0,
      atl: latest ? Math.round(latest.atl * 10) / 10 : 0,
      tsb: latest ? Math.round(latest.tsb * 10) / 10 : 0,
    };
  }, [workouts, metrics]);

  const pmcData = metrics.map(m => ({
    date: m.date.toISOString().split('T')[0],
    CTL: Math.round(m.ctl * 10) / 10,
    ATL: Math.round(m.atl * 10) / 10,
    TSB: Math.round(m.tsb * 10) / 10,
  }));

  const weeklyTssData = useMemo(() => {
    const weeks = new Map<string, number>();
    for (const w of workouts) {
      const weekStart = new Date(w.date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      weeks.set(weekKey, (weeks.get(weekKey) || 0) + w.tss);
    }
    return Array.from(weeks.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, tss]) => ({ date, tss }));
  }, [workouts]);

  const zoneData = useMemo(() => {
    const zones = { 'Z1': 0, 'Z2': 0, 'Z3': 0, 'Z4': 0, 'Z5': 0, 'Z6': 0 };
    for (const w of workouts) {
      const ratio = w.np / athlete.ftp;
      if (ratio < 0.55) zones['Z1'] += w.duration;
      else if (ratio < 0.75) zones['Z2'] += w.duration;
      else if (ratio < 0.90) zones['Z3'] += w.duration;
      else if (ratio < 1.05) zones['Z4'] += w.duration;
      else if (ratio < 1.20) zones['Z5'] += w.duration;
      else zones['Z6'] += w.duration;
    }
    return Object.entries(zones).map(([zone, minutes]) => ({
      zone,
      hours: Math.round(minutes / 60 * 10) / 10,
    }));
  }, [workouts, athlete.ftp]);

  const zoneColors: Record<string, string> = {
    'Z1': '#B5B0A6',
    'Z2': '#7BAFD4',
    'Z3': '#6BBF9A',
    'Z4': '#D4A843',
    'Z5': '#D97D5F',
    'Z6': '#A970D0',
  };

  const wellnessChartData = useMemo(() => {
    if (!wellnessEntries.length) return [];
    return wellnessEntries.slice(-14).map(e => {
      const readiness = calculateReadiness(e);
      return {
        date: e.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        readiness: readiness.score,
        motivation: e.motivation,
        soreness: e.muscleSoreness,
        stress: e.lifeStress,
        fatigue: e.fatigueLevel,
        sleep: e.sleepQuality,
      };
    });
  }, [wellnessEntries]);

  const { trend } = getWellnessTrend(wellnessEntries);
  const latestWellness = wellnessEntries[wellnessEntries.length - 1];

  return (
    <div className="space-y-10">
      {/* ── Big Number Hero Grid (reference site style) ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-0">
        {[
          { label: 'Fitness', value: stats.ctl, unit: 'CTL', color: 'text-violet-700' },
          { label: 'Fatigue', value: stats.atl, unit: 'ATL', color: 'text-terracotta-600' },
          { label: 'Form', value: stats.tsb > 0 ? `+${stats.tsb}` : stats.tsb, unit: 'TSB', color: stats.tsb > 0 ? 'text-emerald-600' : 'text-amber-600' },
          { label: 'Weekly TSS', value: stats.weeklyTss, unit: 'pts', color: 'text-warmgray-900' },
          { label: 'Hours', value: stats.weeklyHours, unit: 'h', color: 'text-warmgray-900' },
          { label: 'Intensity', value: stats.avgIf, unit: 'IF', color: 'text-warmgray-900' },
        ].map((stat, i) => (
          <div key={stat.label} className={`data-grid-item ${i > 0 ? 'border-l-0' : ''}`}>
            <div className="big-number-label">{stat.label}</div>
            <div className={`big-number mt-3 ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-warmgray-400 mt-2 tracking-wider uppercase">{stat.unit}</div>
          </div>
        ))}
      </div>

      {/* ── Wellness Section ── */}
      {wellnessEntries.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between mb-6">
            <div>
              <div className="accent-line" />
              <h2 className="section-title !mb-0">Wellness Check-ins</h2>
            </div>
            <span className="text-sm text-warmgray-500 tracking-wide">{wellnessEntries.length} entries</span>
          </div>

          {latestWellness && (
            <div className="grid grid-cols-5 gap-0 mb-6">
              {[
                { label: 'Motivation', value: latestWellness.motivation, icon: Smile, color: 'border-terracotta-400' },
                { label: 'Soreness', value: latestWellness.muscleSoreness, icon: Battery, color: 'border-violet-400' },
                { label: 'Stress', value: latestWellness.lifeStress, icon: Brain, color: 'border-emerald-400' },
                { label: 'Fatigue', value: latestWellness.fatigueLevel, icon: Frown, color: 'border-amber-400' },
                { label: 'Sleep', value: latestWellness.sleepQuality, icon: BedDouble, color: 'border-sky-400' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`bg-white p-6 border border-warmgray-200 ${i > 0 ? 'border-l-0' : ''} ${item.color} border-t-4`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className="w-4 h-4 text-warmgray-500" strokeWidth={1.5} />
                      <span className="text-xs text-warmgray-500 uppercase tracking-wider">{item.label}</span>
                    </div>
                    <div className="text-3xl font-serif font-medium text-warmgray-900">{item.value}<span className="text-base text-warmgray-400 ml-1">/10</span></div>
                  </div>
                );
              })}
            </div>
          )}

          {wellnessChartData.length > 1 && (
            <div className="card">
              <p className="text-sm text-warmgray-500 mb-4 font-serif italic">Readiness Trend — {trend}</p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={wellnessChartData}>
                  <CartesianGrid strokeDasharray="3 6" stroke="#E2E0DA" vertical={false} />
                  <XAxis dataKey="date" stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#B5B0A6" fontSize={11} domain={[0, 25]} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#FDFCFA', border: '1px solid #D1CEC6', borderRadius: '0', fontFamily: 'Inter' }}
                    labelStyle={{ color: '#3D3A35', fontFamily: 'Playfair Display' }}
                    formatter={(value: number) => [`${value}/25`, 'Readiness']}
                  />
                  <Area type="monotone" dataKey="readiness" stroke="#6B2C91" fill="#6B2C91" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="table-elegant">
              <thead>
                <tr>
                  <th>Date</th>
                  <th className="text-center">Motivation</th>
                  <th className="text-center">Soreness</th>
                  <th className="text-center">Stress</th>
                  <th className="text-center">Fatigue</th>
                  <th className="text-center">Sleep</th>
                  <th className="text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {wellnessEntries.slice(-7).reverse().map(e => {
                  const r = calculateReadiness(e);
                  return (
                    <tr key={e.id}>
                      <td className="text-warmgray-500">{e.date.toLocaleDateString()}</td>
                      <td className="text-center text-warmgray-900">{e.motivation}</td>
                      <td className="text-center text-warmgray-900">{e.muscleSoreness}</td>
                      <td className="text-center text-warmgray-900">{e.lifeStress}</td>
                      <td className="text-center text-warmgray-900">{e.fatigueLevel}</td>
                      <td className="text-center text-warmgray-900">{e.sleepQuality}</td>
                      <td className="text-right">
                        <span className={`font-medium ${r.readiness === 'high' ? 'text-emerald-600' : r.readiness === 'moderate' ? 'text-amber-600' : 'text-terracotta-600'}`}>
                          {r.score}/25
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ── PMC Chart ── */}
      <section>
        <div className="accent-line" />
        <h2 className="section-title">Performance Management Chart</h2>
        <div className="card">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={pmcData.slice(-90)}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E2E0DA" vertical={false} />
              <XAxis dataKey="date" stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FDFCFA', border: '1px solid #D1CEC6', borderRadius: '0' }}
                labelStyle={{ color: '#3D3A35', fontFamily: 'Playfair Display' }}
              />
              <Area type="monotone" dataKey="CTL" stroke="#6B2C91" fill="#6B2C91" fillOpacity={0.15} strokeWidth={2} name="CTL (Fitness)" />
              <Area type="monotone" dataKey="ATL" stroke="#C75B3A" fill="#C75B3A" fillOpacity={0.15} strokeWidth={2} name="ATL (Fatigue)" />
              <Area type="monotone" dataKey="TSB" stroke="#7BAFD4" fill="#7BAFD4" fillOpacity={0.08} strokeWidth={2} name="TSB (Form)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        <section>
          <div className="accent-line" />
          <h2 className="section-title">Weekly Training Load</h2>
          <div className="card border-r-0">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={weeklyTssData.slice(-12)}>
                <CartesianGrid strokeDasharray="3 6" stroke="#E2E0DA" vertical={false} />
                <XAxis dataKey="date" stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FDFCFA', border: '1px solid #D1CEC6', borderRadius: '0' }}
                  labelStyle={{ color: '#3D3A35', fontFamily: 'Playfair Display' }}
                />
                <Bar dataKey="tss" fill="#6B2C91" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section>
          <div className="accent-line" />
          <h2 className="section-title">Time in Power Zones</h2>
          <div className="card">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={zoneData}>
                <CartesianGrid strokeDasharray="3 6" stroke="#E2E0DA" vertical={false} />
                <XAxis dataKey="zone" stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FDFCFA', border: '1px solid #D1CEC6', borderRadius: '0' }}
                  labelStyle={{ color: '#3D3A35', fontFamily: 'Playfair Display' }}
                />
                <Bar dataKey="hours" radius={[0, 0, 0, 0]}>
                  {zoneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={zoneColors[entry.zone]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* ── Recent Workouts ── */}
      <section>
        <div className="accent-line" />
        <h2 className="section-title">Recent Workouts</h2>
        <div className="overflow-x-auto">
          <table className="table-elegant">
            <thead>
              <tr>
                <th>Date</th>
                <th>Title</th>
                <th>Type</th>
                <th className="text-right">Duration</th>
                <th className="text-right">TSS</th>
                <th className="text-right">NP</th>
                <th className="text-right">IF</th>
              </tr>
            </thead>
            <tbody>
              {workouts.slice(-10).reverse().map(w => (
                <tr key={w.id}>
                  <td className="text-warmgray-500">{w.date.toLocaleDateString()}</td>
                  <td className="text-warmgray-900 font-medium">{w.title}</td>
                  <td>
                    <span className="px-2 py-1 text-xs font-medium bg-cream-200 text-warmgray-600 tracking-wide">
                      {w.type}
                    </span>
                  </td>
                  <td className="text-right text-warmgray-500">{w.duration}min</td>
                  <td className="text-right text-violet-700 font-semibold">{w.tss}</td>
                  <td className="text-right text-warmgray-500">{w.np}W</td>
                  <td className="text-right text-warmgray-500">{w.if.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
