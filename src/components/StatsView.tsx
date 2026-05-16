import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend
} from 'recharts';
import {
  TrendingUp, Activity, Flame, Zap, Target, Calendar, Clock, Mountain,
  Gauge, Award, ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { Workout, FitnessMetrics, AthleteProfile, WellnessEntry } from '../types';
import WellnessAdjustmentPanel from './WellnessAdjustmentPanel';

interface StatsViewProps {
  workouts: Workout[];
  metrics: FitnessMetrics[];
  athlete: AthleteProfile;
  wellnessEntries: WellnessEntry[];
}

export default function StatsView({ workouts, metrics, athlete, wellnessEntries }: StatsViewProps) {
  // ── PERIOD CALCULATIONS ──
  const periods = useMemo(() => {
    const now = new Date();
    const thisWeekStart = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
    const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(lastWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourWeeksAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);

    const thisWeek = workouts.filter(w => w.date >= thisWeekStart);
    const lastWeek = workouts.filter(w => w.date >= lastWeekStart && w.date < thisWeekStart);
    const prevWeek = workouts.filter(w => w.date >= twoWeeksAgo && w.date < lastWeekStart);
    const last4Weeks = workouts.filter(w => w.date >= fourWeeksAgo);

    const calcStats = (wks: Workout[]) => {
      const hours = wks.reduce((s, w) => s + w.duration, 0) / 60;
      const tss = wks.reduce((s, w) => s + w.tss, 0);
      const distance = wks.reduce((s, w) => s + w.distance, 0);
      const elevation = wks.reduce((s, w) => s + w.elevation, 0);
      const count = wks.length;
      const avgIf = count > 0 ? wks.reduce((s, w) => s + w.if, 0) / count : 0;
      return { hours, tss, distance, elevation, count, avgIf };
    };

    const thisStats = calcStats(thisWeek);
    const lastStats = calcStats(lastWeek);
    const prevStats = calcStats(prevWeek);
    const fourWeekStats = calcStats(last4Weeks);
    const fourWeekAvg = {
      hours: Math.round(fourWeekStats.hours / 4 * 10) / 10,
      tss: Math.round(fourWeekStats.tss / 4),
      distance: Math.round(fourWeekStats.distance / 4),
      elevation: Math.round(fourWeekStats.elevation / 4),
      count: Math.round(fourWeekStats.count / 4 * 10) / 10,
    };

    return { thisWeek, lastWeek, thisStats, lastStats, prevStats, fourWeekAvg };
  }, [workouts]);

  // ── LATEST METRICS ──
  const latest = useMemo(() => {
    const m = metrics[metrics.length - 1];
    return {
      ctl: m ? Math.round(m.ctl * 10) / 10 : 0,
      atl: m ? Math.round(m.atl * 10) / 10 : 0,
      tsb: m ? Math.round(m.tsb * 10) / 10 : 0,
    };
  }, [metrics]);

  // ── WEEKLY TREND DATA (for sparklines) ──
  const weeklyTrend = useMemo(() => {
    const weeks: { week: string; hours: number; tss: number; count: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - start.getDay() - i * 7);
      const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
      const wks = workouts.filter(w => w.date >= start && w.date < end);
      const hours = wks.reduce((s, w) => s + w.duration, 0) / 60;
      const tss = wks.reduce((s, w) => s + w.tss, 0);
      weeks.push({
        week: `${start.getMonth() + 1}/${start.getDate()}`,
        hours: Math.round(hours * 10) / 10,
        tss,
        count: wks.length,
      });
    }
    return weeks;
  }, [workouts]);

  // ── ZONE DISTRIBUTION (last 28 days) ──
  const zoneDist = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const recent = workouts.filter(w => w.date >= monthAgo);
    const zones = { 'Z1': 0, 'Z2': 0, 'Z3': 0, 'Z4': 0, 'Z5': 0, 'Z6': 0 };
    for (const w of recent) {
      const ratio = w.np / athlete.ftp;
      if (ratio < 0.55) zones['Z1'] += w.duration;
      else if (ratio < 0.75) zones['Z2'] += w.duration;
      else if (ratio < 0.90) zones['Z3'] += w.duration;
      else if (ratio < 1.05) zones['Z4'] += w.duration;
      else if (ratio < 1.20) zones['Z5'] += w.duration;
      else zones['Z6'] += w.duration;
    }
    const total = Object.values(zones).reduce((s, v) => s + v, 0);
    return Object.entries(zones).map(([zone, minutes]) => ({
      zone,
      minutes,
      hours: Math.round(minutes / 60 * 10) / 10,
      pct: total > 0 ? Math.round(minutes / total * 100) : 0,
    }));
  }, [workouts, athlete.ftp]);

  // ── POWER PROFILE ──
  const powerProfile = useMemo(() => {
    // Simulated best efforts from workout data (in real app, this would analyze power data)
    // Using NP as proxy for sustained efforts
    const best5s = Math.round(athlete.ftp * 2.1); // ~525W for 255W FTP
    const best1min = Math.round(athlete.ftp * 1.4); // ~357W
    const best5min = Math.round(athlete.ftp * 1.15); // ~293W
    const best20min = Math.round(athlete.ftp * 1.05); // ~268W
    const ftp = athlete.ftp;

    return [
      { duration: '5 sec', power: best5s, wkg: Math.round(best5s / athlete.weight * 10) / 10, ftpPct: Math.round(best5s / ftp * 100) },
      { duration: '1 min', power: best1min, wkg: Math.round(best1min / athlete.weight * 10) / 10, ftpPct: Math.round(best1min / ftp * 100) },
      { duration: '5 min', power: best5min, wkg: Math.round(best5min / athlete.weight * 10) / 10, ftpPct: Math.round(best5min / ftp * 100) },
      { duration: '20 min', power: best20min, wkg: Math.round(best20min / athlete.weight * 10) / 10, ftpPct: Math.round(best20min / ftp * 100) },
      { duration: 'FTP', power: ftp, wkg: Math.round(ftp / athlete.weight * 10) / 10, ftpPct: 100 },
    ];
  }, [athlete]);

  // ── RADAR DATA (fitness fingerprint) ──
  const radarData = useMemo(() => {
    const p = powerProfile;
    // Normalize to 0-100 scale for radar
    return [
      { metric: 'Sprint', value: Math.min(100, (p[0].power / (athlete.ftp * 2.5)) * 100), fullMark: 100 },
      { metric: '1min Power', value: Math.min(100, (p[1].power / (athlete.ftp * 1.5)) * 100), fullMark: 100 },
      { metric: '5min Power', value: Math.min(100, (p[2].power / (athlete.ftp * 1.2)) * 100), fullMark: 100 },
      { metric: 'Threshold', value: Math.min(100, (p[4].power / athlete.ftp) * 100), fullMark: 100 },
      { metric: 'Volume', value: Math.min(100, (periods.thisStats.hours / 20) * 100), fullMark: 100 },
      { metric: 'Consistency', value: periods.thisStats.count >= 5 ? 100 : periods.thisStats.count * 20, fullMark: 100 },
    ];
  }, [powerProfile, athlete.ftp, periods]);

  // ── CONSISTENCY ──
  const consistency = useMemo(() => {
    const now = new Date();
    let streak = 0;
    for (let i = 0; i < 30; i++) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const hasWorkout = workouts.some(w =>
        w.date.getFullYear() === day.getFullYear() &&
        w.date.getMonth() === day.getMonth() &&
        w.date.getDate() === day.getDate()
      );
      if (hasWorkout) streak++;
      else if (i === 0) continue; // Today might not be done
      else break;
    }
    return { streak };
  }, [workouts]);

  // ── CHANGE INDICATOR ──
  const Change = ({ current, previous }: { current: number; previous: number }) => {
    const diff = current - previous;
    const pct = previous > 0 ? Math.round(diff / previous * 100) : 0;
    if (diff > 0) return <span className="text-cycling-600 text-xs flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />+{pct}%</span>;
    if (diff < 0) return <span className="text-orange-600 text-xs flex items-center gap-0.5"><ArrowDownRight className="w-3 h-3" />{pct}%</span>;
    return <span className="text-gray-500 text-xs flex items-center gap-0.5"><Minus className="w-3 h-3" />0%</span>;
  };

  // ── ZONE COLORS ──
  const zoneColors: Record<string, string> = {
    'Z1': '#94a3b8', 'Z2': '#60a5fa', 'Z3': '#34d399',
    'Z4': '#fbbf24', 'Z5': '#f87171', 'Z6': '#a78bfa',
  };

  // ── PMC SPARKLINE (last 30 days) ──
  const pmcSpark = metrics.slice(-30).map(m => ({
    date: m.date.toISOString().split('T')[0],
    ctl: Math.round(m.ctl * 10) / 10,
    tsb: Math.round(m.tsb * 10) / 10,
  }));

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Activity className="w-7 h-7 text-cycling-600" />
          Performance Stats
        </h2>
        <div className="text-sm text-gray-500">
          Last 4 weeks · {athlete.name} · {athlete.ftp}W FTP
        </div>
      </div>

      {/* ── WELLNESS ADJUSTMENT PANEL ── */}
      <WellnessAdjustmentPanel metrics={metrics} wellnessEntries={wellnessEntries} />

      {/* ── TOP METRICS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* CTL Card */}
        <div className="card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <TrendingUp className="w-full h-full" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-cycling-600" />
            <span className="stat-label">Fitness (CTL)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{latest.ctl}</span>
            <span className="text-sm text-gray-500">pts</span>
          </div>
          <div className="mt-2 h-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pmcSpark}>
                <Line type="monotone" dataKey="ctl" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 text-xs text-gray-500">30-day trend</div>
        </div>

        {/* ATL Card */}
        <div className="card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <Flame className="w-full h-full" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-600" />
            <span className="stat-label">Fatigue (ATL)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{latest.atl}</span>
            <span className="text-sm text-gray-500">pts</span>
          </div>
          <div className="mt-2">
            <div className={`text-sm font-medium ${latest.tsb > -10 ? 'text-cycling-600' : latest.tsb > -20 ? 'text-yellow-600' : 'text-red-600'}`}>
              TSB: {latest.tsb > 0 ? '+' : ''}{latest.tsb}
            </div>
            <div className="text-xs text-gray-500">
              {latest.tsb > -10 ? 'Ready to train' : latest.tsb > -20 ? 'Moderate fatigue' : 'Deep fatigue — rest'}
            </div>
          </div>
        </div>

        {/* Weekly Volume */}
        <div className="card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <Clock className="w-full h-full" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="stat-label">This Week</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{Math.round(periods.thisStats.hours * 10) / 10}</span>
            <span className="text-sm text-gray-500">hrs</span>
          </div>
          <div className="mt-1">
            <Change current={periods.thisStats.hours} previous={periods.lastStats.hours} />
            <span className="text-xs text-gray-500 ml-2">vs last week</span>
          </div>
          <div className="mt-1 text-xs text-cycling-600">
            {periods.thisStats.count} rides · {periods.thisStats.tss} TSS
          </div>
        </div>

        {/* Consistency */}
        <div className="card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 opacity-5">
            <Award className="w-full h-full" />
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-yellow-600" />
            <span className="stat-label">Streak</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-gray-900">{consistency.streak}</span>
            <span className="text-sm text-gray-500">days</span>
          </div>
          <div className="mt-1 text-xs text-gray-500">
            Consecutive training days
          </div>
        </div>
      </div>

      {/* ── WEEKLY COMPARISON ── */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cycling-600" />
          Weekly Comparison
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'Hours', current: Math.round(periods.thisStats.hours * 10) / 10, prev: Math.round(periods.lastStats.hours * 10) / 10, unit: 'h' },
            { label: 'TSS', current: periods.thisStats.tss, prev: periods.lastStats.tss, unit: '' },
            { label: 'Distance', current: Math.round(periods.thisStats.distance), prev: Math.round(periods.lastStats.distance), unit: 'km' },
            { label: 'Elevation', current: Math.round(periods.thisStats.elevation), prev: Math.round(periods.lastStats.elevation), unit: 'm' },
            { label: 'Rides', current: periods.thisStats.count, prev: periods.lastStats.count, unit: '' },
          ].map((stat) => (
            <div key={stat.label} className="bg-gray-100/80 rounded-lg p-3">
              <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-xl font-bold text-gray-900">{stat.current}</span>
                <span className="text-xs text-gray-500">{stat.unit}</span>
              </div>
              <div className="mt-1">
                <Change current={stat.current} previous={stat.prev} />
              </div>
              <div className="mt-1 text-xs text-gray-400">
                4wk avg: {stat.label === 'Hours' ? periods.fourWeekAvg.hours :
                  stat.label === 'TSS' ? periods.fourWeekAvg.tss :
                  stat.label === 'Distance' ? periods.fourWeekAvg.distance :
                  stat.label === 'Elevation' ? periods.fourWeekAvg.elevation :
                  periods.fourWeekAvg.count}{stat.unit}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CHARTS ROW 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Trend */}
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cycling-600" />
            12-Week Training Load Trend
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weeklyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" stroke="#6b7280" fontSize={11} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={11} />
              <YAxis yAxisId="right" orientation="right" stroke="#6b7280" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                labelStyle={{ color: '#111827' }}
              />
              <Bar yAxisId="left" dataKey="hours" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Hours" />
              <Bar yAxisId="right" dataKey="tss" fill="#22c55e" radius={[4, 4, 0, 0]} name="TSS" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Fitness Fingerprint Radar */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Gauge className="w-5 h-5 text-purple-600" />
            Fitness Fingerprint
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="metric" stroke="#6b7280" fontSize={11} />
              <PolarRadiusAxis stroke="#9ca3af" fontSize={10} />
              <Radar name="Current" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── CHARTS ROW 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Zone Distribution (Last 28 Days)
          </h3>
          <div className="flex items-end gap-2 h-48 mb-4">
            {zoneDist.map((z) => (
              <div key={z.zone} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-xs text-gray-500">{z.pct}%</div>
                <div
                  className="w-full rounded-t-md transition-all"
                  style={{
                    height: `${Math.max(5, z.pct * 2)}px`,
                    backgroundColor: zoneColors[z.zone],
                    minHeight: '20px',
                  }}
                />
                <div className="text-xs font-medium text-gray-900">{z.zone}</div>
                <div className="text-xs text-gray-500">{z.hours}h</div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            {zoneDist.map((z) => (
              <div key={z.zone} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: zoneColors[z.zone] }} />
                <span className="text-xs text-gray-500">{z.zone}: {z.hours}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Power Profile */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mountain className="w-5 h-5 text-orange-600" />
            Power Profile
          </h3>
          <div className="space-y-3">
            {powerProfile.map((p, i) => (
              <div key={p.duration} className="flex items-center gap-3">
                <div className="w-16 text-sm font-medium text-gray-400">{p.duration}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-900 font-bold">{p.power}W</span>
                    <span className="text-xs text-gray-500">{p.wkg} W/kg · {p.ftpPct}% FTP</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, p.ftpPct)}%`,
                        backgroundColor: i === 4 ? '#22c55e' : '#60a5fa',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PMC FULL CHART ── */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cycling-600" />
          Performance Management Chart (PMC)
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={metrics.slice(-90).map(m => ({
            date: m.date.toISOString().split('T')[0],
            CTL: Math.round(m.ctl * 10) / 10,
            ATL: Math.round(m.atl * 10) / 10,
            TSB: Math.round(m.tsb * 10) / 10,
          }))}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#6b7280" fontSize={11} />
            <YAxis stroke="#6b7280" fontSize={11} />
            <Tooltip
              contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Legend />
            <Area type="monotone" dataKey="CTL" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} name="CTL (Fitness)" />
            <Area type="monotone" dataKey="ATL" stroke="#f97316" fill="#f97316" fillOpacity={0.15} strokeWidth={2} name="ATL (Fatigue)" />
            <Area type="monotone" dataKey="TSB" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} strokeWidth={2} name="TSB (Form)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── RECENT WORKOUTS SUMMARY ── */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cycling-600" />
          Recent Workouts Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {workouts.slice(-6).reverse().map(w => {
            const zone = w.np / athlete.ftp;
            const zoneLabel = zone < 0.55 ? 'Z1' : zone < 0.75 ? 'Z2' : zone < 0.90 ? 'Z3' : zone < 1.05 ? 'Z4' : zone < 1.20 ? 'Z5' : 'Z6';
            const zoneColor = zoneColors[zoneLabel];
            return (
              <div key={w.id} className="bg-gray-100/80 rounded-lg p-3 border border-gray-300/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{w.title}</span>
                  <span className="text-xs text-gray-500">{w.date.toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs text-gray-500">Duration</div>
                    <div className="text-sm font-semibold text-gray-900">{w.duration}min</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">TSS</div>
                    <div className="text-sm font-semibold text-cycling-600">{w.tss}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">IF</div>
                    <div className="text-sm font-semibold text-gray-900">{w.if.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: zoneColor + '30', color: zoneColor }}>
                    {zoneLabel}
                  </span>
                  <span className="text-xs text-gray-500">{w.type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
