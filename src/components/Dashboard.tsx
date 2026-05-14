import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, Legend
} from 'recharts';
import { TrendingUp, Activity, Flame, Zap } from 'lucide-react';
import { Workout, FitnessMetrics, AthleteProfile } from '../types';

interface DashboardProps {
  workouts: Workout[];
  metrics: FitnessMetrics[];
  athlete: AthleteProfile;
}

export default function Dashboard({ workouts, metrics, athlete }: DashboardProps) {
  const stats = useMemo(() => {
    const totalTss = workouts.reduce((sum, w) => sum + w.tss, 0);
    const totalHours = workouts.reduce((sum, w) => sum + w.duration, 0) / 60;
    const totalDistance = workouts.reduce((sum, w) => sum + w.distance, 0);
    const totalElevation = workouts.reduce((sum, w) => sum + w.elevation, 0);
    const avgIf = workouts.reduce((sum, w) => sum + w.if, 0) / workouts.length;
    
    // This week
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeekWorkouts = workouts.filter(w => w.date >= weekAgo);
    const weeklyTss = thisWeekWorkouts.reduce((sum, w) => sum + w.tss, 0);
    const weeklyHours = thisWeekWorkouts.reduce((sum, w) => sum + w.duration, 0) / 60;
    
    // Latest metrics
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

  // Chart data for PMC (Performance Management Chart)
  const pmcData = metrics.map(m => ({
    date: m.date.toISOString().split('T')[0],
    CTL: Math.round(m.ctl * 10) / 10,
    ATL: Math.round(m.atl * 10) / 10,
    TSB: Math.round(m.tsb * 10) / 10,
  }));

  // Weekly TSS chart
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

  // Zone distribution
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
    'Z1': '#94a3b8',
    'Z2': '#60a5fa',
    'Z3': '#34d399',
    'Z4': '#fbbf24',
    'Z5': '#f87171',
    'Z6': '#a78bfa',
  };

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="card">
          <p className="stat-label">Fitness (CTL)</p>
          <p className="stat-value text-cycling-400">{stats.ctl}</p>
        </div>
        <div className="card">
          <p className="stat-label">Fatigue (ATL)</p>
          <p className="stat-value text-orange-400">{stats.atl}</p>
        </div>
        <div className="card">
          <p className="stat-label">Form (TSB)</p>
          <p className={`stat-value ${stats.tsb > 0 ? 'text-cycling-400' : 'text-orange-400'}`}>
            {stats.tsb}
          </p>
        </div>
        <div className="card">
          <p className="stat-label">Weekly TSS</p>
          <p className="stat-value text-blue-400">{stats.weeklyTss}</p>
        </div>
        <div className="card">
          <p className="stat-label">Weekly Hours</p>
          <p className="stat-value text-purple-400">{stats.weeklyHours}h</p>
        </div>
        <div className="card">
          <p className="stat-label">Intensity Factor</p>
          <p className="stat-value text-yellow-400">{stats.avgIf}</p>
        </div>
      </div>

      {/* PMC Chart */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cycling-400" />
          Performance Management Chart
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={pmcData.slice(-90)}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
            <YAxis stroke="#9ca3af" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#fff' }}
            />
            <Area type="monotone" dataKey="CTL" stroke="#22c55e" fill="#22c55e" fillOpacity={0.2} strokeWidth={2} name="CTL (Fitness)" />
            <Area type="monotone" dataKey="ATL" stroke="#f97316" fill="#f97316" fillOpacity={0.2} strokeWidth={2} name="ATL (Fatigue)" />
            <Area type="monotone" dataKey="TSB" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.1} strokeWidth={2} name="TSB (Form)" />
            <Legend />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly TSS */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Weekly Training Load (TSS)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyTssData.slice(-12)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="tss" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Zone Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            Time in Power Zones
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={zoneData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="zone" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="hours" radius={[4, 4, 0, 0]}>
                {zoneData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={zoneColors[entry.zone]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Workouts Table */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cycling-400" />
          Recent Workouts
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="text-left py-2">Date</th>
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Type</th>
                <th className="text-right py-2">Duration</th>
                <th className="text-right py-2">TSS</th>
                <th className="text-right py-2">NP</th>
                <th className="text-right py-2">IF</th>
              </tr>
            </thead>
            <tbody>
              {workouts.slice(-10).reverse().map(w => (
                <tr key={w.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                  <td className="py-2 text-gray-300">{w.date.toLocaleDateString()}</td>
                  <td className="py-2 text-white font-medium">{w.title}</td>
                  <td className="py-2">
                    <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300">
                      {w.type}
                    </span>
                  </td>
                  <td className="py-2 text-right text-gray-300">{w.duration}min</td>
                  <td className="py-2 text-right text-cycling-400 font-medium">{w.tss}</td>
                  <td className="py-2 text-right text-gray-300">{w.np}W</td>
                  <td className="py-2 text-right text-gray-300">{w.if.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
