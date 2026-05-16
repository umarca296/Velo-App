import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, Legend
} from 'recharts';
import { Target, Clock, Award, ArrowUpRight, ArrowDownRight, Minus, Flame } from 'lucide-react';
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

  // ── WEEKLY TREND DATA ──
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

  // ── ZONE DISTRIBUTION ──
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
    const best5s = Math.round(athlete.ftp * 2.1);
    const best1min = Math.round(athlete.ftp * 1.4);
    const best5min = Math.round(athlete.ftp * 1.15);
    const best20min = Math.round(athlete.ftp * 1.05);
    const ftp = athlete.ftp;

    return [
      { duration: '5 sec', power: best5s, wkg: Math.round(best5s / athlete.weight * 10) / 10, ftpPct: Math.round(best5s / ftp * 100) },
      { duration: '1 min', power: best1min, wkg: Math.round(best1min / athlete.weight * 10) / 10, ftpPct: Math.round(best1min / ftp * 100) },
      { duration: '5 min', power: best5min, wkg: Math.round(best5min / athlete.weight * 10) / 10, ftpPct: Math.round(best5min / ftp * 100) },
      { duration: '20 min', power: best20min, wkg: Math.round(best20min / athlete.weight * 10) / 10, ftpPct: Math.round(best20min / ftp * 100) },
      { duration: 'FTP', power: ftp, wkg: Math.round(ftp / athlete.weight * 10) / 10, ftpPct: 100 },
    ];
  }, [athlete]);

  // ── RADAR DATA ──
  const radarData = useMemo(() => {
    const p = powerProfile;
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
      else if (i === 0) continue;
      else break;
    }
    return { streak };
  }, [workouts]);

  // ── CHANGE INDICATOR ──
  const Change = ({ current, previous }: { current: number; previous: number }) => {
    const diff = current - previous;
    const pct = previous > 0 ? Math.round(diff / previous * 100) : 0;
    if (diff > 0) return <span className="text-emerald-700 text-xs flex items-center gap-0.5"><ArrowUpRight className="w-3 h-3" />+{pct}%</span>;
    if (diff < 0) return <span className="text-terracotta-600 text-xs flex items-center gap-0.5"><ArrowDownRight className="w-3 h-3" />{pct}%</span>;
    return <span className="text-warmgray-500 text-xs flex items-center gap-0.5"><Minus className="w-3 h-3" />0%</span>;
  };

  const zoneColors: Record<string, string> = {
    'Z1': '#B5B0A6', 'Z2': '#7BAFD4', 'Z3': '#6BBF9A',
    'Z4': '#D4A843', 'Z5': '#D97D5F', 'Z6': '#A970D0',
  };

  const pmcSpark = metrics.slice(-30).map(m => ({
    date: m.date.toISOString().split('T')[0],
    ctl: Math.round(m.ctl * 10) / 10,
    tsb: Math.round(m.tsb * 10) / 10,
  }));

  return (
    <div className="space-y-10">
      {/* ── HEADER ── */}
      <div className="flex items-baseline justify-between pb-4 border-b border-warmgray-200">
        <div>
          <div className="accent-line" />
          <h2 className="text-2xl font-serif font-medium text-warmgray-900"
          >Performance Stats</h2>
        </div>
        <p className="text-sm text-warmgray-500 font-serif italic">
          Last 4 weeks · {athlete.name} · {athlete.ftp}W FTP
        </p>
      </div>

      {/* ── WELLNESS ADJUSTMENT PANEL ── */}
      <WellnessAdjustmentPanel metrics={metrics} wellnessEntries={wellnessEntries} />

      {/* ── TOP METRICS ROW ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0">
        {/* CTL Card */}
        <div className="card card-hover border-l-4 border-l-violet-700">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-violet-700" strokeWidth={1.5} />
            <span className="stat-label">Fitness (CTL)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-serif font-medium text-warmgray-900">{latest.ctl}</span>
            <span className="text-sm text-warmgray-400">pts</span>
          </div>
          <div className="mt-3 h-10">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={pmcSpark}>
                <Line type="monotone" dataKey="ctl" stroke="#6B2C91" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-xs text-warmgray-500 tracking-wide">30-day trend</div>
        </div>

        {/* ATL Card */}
        <div className="card card-hover border-l-4 border-l-terracotta-500">
          <div className="flex items-center gap-2 mb-3">
            <Flame className="w-4 h-4 text-terracotta-500" strokeWidth={1.5} />
            <span className="stat-label">Fatigue (ATL)</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-serif font-medium text-warmgray-900">{latest.atl}</span>
            <span className="text-sm text-warmgray-400">pts</span>
          </div>
          <div className="mt-3">
            <div className={`text-sm font-medium ${latest.tsb > -10 ? 'text-emerald-700' : latest.tsb > -20 ? 'text-amber-600' : 'text-terracotta-600'}`}>
              TSB: {latest.tsb > 0 ? '+' : ''}{latest.tsb}
            </div>
            <div className="text-xs text-warmgray-500 mt-1">
              {latest.tsb > -10 ? 'Ready to train' : latest.tsb > -20 ? 'Moderate fatigue' : 'Deep fatigue — rest'}
            </div>
          </div>
        </div>

        {/* Weekly Volume */}
        <div className="card card-hover border-l-4 border-l-sky-600">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-sky-600" strokeWidth={1.5} />
            <span className="stat-label">This Week</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-serif font-medium text-warmgray-900">{Math.round(periods.thisStats.hours * 10) / 10}</span>
            <span className="text-sm text-warmgray-400">hrs</span>
          </div>
          <div className="mt-2">
            <Change current={periods.thisStats.hours} previous={periods.lastStats.hours} />
            <span className="text-xs text-warmgray-400 ml-2">vs last week</span>
          </div>
          <div className="mt-1 text-xs text-emerald-700">
            {periods.thisStats.count} rides · {periods.thisStats.tss} TSS
          </div>
        </div>

        {/* Consistency */}
        <div className="card card-hover border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-amber-500" strokeWidth={1.5} />
            <span className="stat-label">Streak</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-serif font-medium text-warmgray-900">{consistency.streak}</span>
            <span className="text-sm text-warmgray-400">days</span>
          </div>
          <div className="mt-2 text-xs text-warmgray-500">
            Consecutive training days
          </div>
        </div>
      </div>

      {/* ── WEEKLY COMPARISON ── */}
      <section>
        <div className="accent-line" />
        <h2 className="section-title">Weekly Comparison</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-0">
          {[
            { label: 'Hours', current: Math.round(periods.thisStats.hours * 10) / 10, prev: Math.round(periods.lastStats.hours * 10) / 10, unit: 'h' },
            { label: 'TSS', current: periods.thisStats.tss, prev: periods.lastStats.tss, unit: '' },
            { label: 'Distance', current: Math.round(periods.thisStats.distance), prev: Math.round(periods.lastStats.distance), unit: 'km' },
            { label: 'Elevation', current: Math.round(periods.thisStats.elevation), prev: Math.round(periods.lastStats.elevation), unit: 'm' },
            { label: 'Rides', current: periods.thisStats.count, prev: periods.lastStats.count, unit: '' },
          ].map((stat, i) => (
            <div key={stat.label} className={`data-grid-item ${i > 0 ? 'border-l-0' : ''}`}>
              <p className="big-number-label">{stat.label}</p>
              <div className="flex items-baseline gap-1 mt-3 justify-center">
                <span className="text-3xl font-serif font-medium text-warmgray-900">{stat.current}</span>
                <span className="text-xs text-warmgray-400">{stat.unit}</span>
              </div>
              <div className="mt-2">
                <Change current={stat.current} previous={stat.prev} />
              </div>
              <div className="mt-2 text-xs text-warmgray-400">
                4wk avg: {stat.label === 'Hours' ? periods.fourWeekAvg.hours :
                  stat.label === 'TSS' ? periods.fourWeekAvg.tss :
                  stat.label === 'Distance' ? periods.fourWeekAvg.distance :
                  stat.label === 'Elevation' ? periods.fourWeekAvg.elevation :
                  periods.fourWeekAvg.count}{stat.unit}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CHARTS ROW 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Weekly Trend */}
        <section className="lg:col-span-2">
          <div className="accent-line" />
          <h2 className="section-title">12-Week Training Load Trend</h2>
          <div className="card border-r-0">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyTrend}>
                <CartesianGrid strokeDasharray="3 6" stroke="#E2E0DA" vertical={false} />
                <XAxis dataKey="week" stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="left" stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#FDFCFA', border: '1px solid #D1CEC6', borderRadius: '0' }}
                  labelStyle={{ color: '#3D3A35', fontFamily: 'Playfair Display' }}
                />
                <Bar yAxisId="left" dataKey="hours" fill="#7BAFD4" radius={[0, 0, 0, 0]} name="Hours" />
                <Bar yAxisId="right" dataKey="tss" fill="#6BBF9A" radius={[0, 0, 0, 0]} name="TSS" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Fitness Fingerprint Radar */}
        <section>
          <div className="accent-line" />
          <h2 className="section-title">Fitness Fingerprint</h2>
          <div className="card">
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E2E0DA" />
                <PolarAngleAxis dataKey="metric" stroke="#B5B0A6" fontSize={11} />
                <PolarRadiusAxis stroke="#D1CEC6" fontSize={10} />
                <Radar name="Current" dataKey="value" stroke="#6B2C91" fill="#6B2C91" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* ── CHARTS ROW 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
        {/* Zone Distribution */}
        <section>
          <div className="accent-line" />
          <h2 className="section-title">Zone Distribution (28 Days)</h2>
          <div className="card border-r-0">
            <div className="flex items-end gap-1 h-48 mb-4">
              {zoneDist.map((z) => (
                <div key={z.zone} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-warmgray-500 font-medium">{z.pct}%</div>
                  <div
                    className="w-full transition-all"
                    style={{
                      height: `${Math.max(5, z.pct * 2)}px`,
                      backgroundColor: zoneColors[z.zone],
                      minHeight: '20px',
                    }}
                  />
                  <div className="text-xs font-medium text-warmgray-900">{z.zone}</div>
                  <div className="text-xs text-warmgray-500">{z.hours}h</div>
                </div>
              ))}
            </div>
            <div className="flex gap-4 flex-wrap">
              {zoneDist.map((z) => (
                <div key={z.zone} className="flex items-center gap-1.5">
                  <div className="w-2 h-2" style={{ backgroundColor: zoneColors[z.zone] }} />
                  <span className="text-xs text-warmgray-500">{z.zone}: {z.hours}h</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Power Profile */}
        <section>
          <div className="accent-line" />
          <h2 className="section-title">Power Profile</h2>
          <div className="card">
            <div className="space-y-4">
              {powerProfile.map((p, i) => (
                <div key={p.duration} className="flex items-center gap-4">
                  <div className="w-14 text-sm font-medium text-warmgray-500">{p.duration}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-warmgray-900 font-bold font-serif">{p.power}W</span>
                      <span className="text-xs text-warmgray-500">{p.wkg} W/kg · {p.ftpPct}% FTP</span>
                    </div>
                    <div className="h-1.5 bg-cream-200 overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${Math.min(100, p.ftpPct)}%`,
                          backgroundColor: i === 4 ? '#6BBF9A' : '#7BAFD4',
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── PMC FULL CHART ── */}
      <section>
        <div className="accent-line" />
        <h2 className="section-title">Performance Management Chart</h2>
        <div className="card">
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={metrics.slice(-90).map(m => ({
              date: m.date.toISOString().split('T')[0],
              CTL: Math.round(m.ctl * 10) / 10,
              ATL: Math.round(m.atl * 10) / 10,
              TSB: Math.round(m.tsb * 10) / 10,
            }))}>
              <CartesianGrid strokeDasharray="3 6" stroke="#E2E0DA" vertical={false} />
              <XAxis dataKey="date" stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#B5B0A6" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#FDFCFA', border: '1px solid #D1CEC6', borderRadius: '0' }}
                labelStyle={{ color: '#3D3A35', fontFamily: 'Playfair Display' }}
              />
              <Legend wrapperStyle={{ fontFamily: 'Inter', fontSize: '12px' }} />
              <Area type="monotone" dataKey="CTL" stroke="#6B2C91" fill="#6B2C91" fillOpacity={0.15} strokeWidth={2} name="CTL (Fitness)" />
              <Area type="monotone" dataKey="ATL" stroke="#C75B3A" fill="#C75B3A" fillOpacity={0.15} strokeWidth={2} name="ATL (Fatigue)" />
              <Area type="monotone" dataKey="TSB" stroke="#7BAFD4" fill="#7BAFD4" fillOpacity={0.08} strokeWidth={2} name="TSB (Form)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ── RECENT WORKOUTS SUMMARY ── */}
      <section>
        <div className="accent-line" />
        <h2 className="section-title">Recent Workouts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workouts.slice(-6).reverse().map(w => {
            const zone = w.np / athlete.ftp;
            const zoneLabel = zone < 0.55 ? 'Z1' : zone < 0.75 ? 'Z2' : zone < 0.90 ? 'Z3' : zone < 1.05 ? 'Z4' : zone < 1.20 ? 'Z5' : 'Z6';
            const zoneColor = zoneColors[zoneLabel];
            return (
              <div key={w.id} className="card card-hover border-l-4" style={{ borderLeftColor: zoneColor }}>
                <div className="flex items-baseline justify-between mb-3">
                  <span className="text-sm font-medium text-warmgray-900">{w.title}</span>
                  <span className="text-xs text-warmgray-400">{w.date.toLocaleDateString()}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-xs text-warmgray-500 uppercase tracking-wider">Duration</div>
                    <div className="text-sm font-semibold text-warmgray-900 font-serif">{w.duration}min</div>
                  </div>
                  <div>
                    <div className="text-xs text-warmgray-500 uppercase tracking-wider">TSS</div>
                    <div className="text-sm font-semibold text-violet-700 font-serif">{w.tss}</div>
                  </div>
                  <div>
                    <div className="text-xs text-warmgray-500 uppercase tracking-wider">IF</div>
                    <div className="text-sm font-semibold text-warmgray-900 font-serif">{w.if.toFixed(2)}</div>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="px-2 py-0.5 text-xs font-medium tracking-wide" style={{ backgroundColor: zoneColor + '20', color: zoneColor }}>
                    {zoneLabel}
                  </span>
                  <span className="text-xs text-warmgray-400">{w.type}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
