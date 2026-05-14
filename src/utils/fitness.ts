import { FitnessMetrics, Workout } from '../types';

export function calculateCTL(workouts: Workout[], _ftp: number, _days: number = 42): FitnessMetrics[] {
  const sorted = [...workouts].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  if (sorted.length === 0) return [];
  
  const startDate = sorted[0].date;
  const endDate = sorted[sorted.length - 1].date;
  const dayMs = 24 * 60 * 60 * 1000;
  
  const metrics: FitnessMetrics[] = [];
  
  // Build a map of workouts by date
  const workoutsByDate = new Map<string, Workout[]>();
  for (const w of sorted) {
    const dateKey = w.date.toISOString().split('T')[0];
    if (!workoutsByDate.has(dateKey)) {
      workoutsByDate.set(dateKey, []);
    }
    workoutsByDate.get(dateKey)!.push(w);
  }
  
  let ctl = 0;
  let atl = 0;
  
  const daysCount = Math.ceil((endDate.getTime() - startDate.getTime()) / dayMs);
  
  for (let i = 0; i <= daysCount; i++) {
    const currentDate = new Date(startDate.getTime() + i * dayMs);
    const dateKey = currentDate.toISOString().split('T')[0];
    
    const dailyWorkouts = workoutsByDate.get(dateKey) || [];
    const dailyTss = dailyWorkouts.reduce((sum, w) => sum + w.tss, 0);
    
    // CTL = 42-day exponentially weighted average of TSS (tau = 42)
    // ATL = 7-day exponentially weighted average of TSS (tau = 7)
    ctl = ctl + (dailyTss - ctl) * (1 / 42);
    atl = atl + (dailyTss - atl) * (1 / 7);
    
    const tsb = ctl - atl;
    
    // Calculate weekly TSS and hours (last 7 days)
    const weekStart = new Date(currentDate.getTime() - 6 * dayMs);
    let weeklyTss = 0;
    let weeklyHours = 0;
    
    for (let j = 0; j < 7; j++) {
      const checkDate = new Date(weekStart.getTime() + j * dayMs);
      const checkKey = checkDate.toISOString().split('T')[0];
      const dayWorkouts = workoutsByDate.get(checkKey) || [];
      weeklyTss += dayWorkouts.reduce((sum, w) => sum + w.tss, 0);
      weeklyHours += dayWorkouts.reduce((sum, w) => sum + w.duration, 0) / 60;
    }
    
    metrics.push({
      date: currentDate,
      ctl,
      atl,
      tsb,
      dailyTss,
      weeklyTss,
      weeklyHours,
    });
  }
  
  return metrics;
}

export function calculatePowerZones(ftp: number) {
  return {
    z1: Math.round(ftp * 0.55),
    z2: Math.round(ftp * 0.75),
    z3: Math.round(ftp * 0.90),
    z4: Math.round(ftp * 1.05),
    z5: Math.round(ftp * 1.20),
    z6: Math.round(ftp * 1.50),
    z7: Math.round(ftp * 2.00),
  };
}

export function getZoneColor(zone: string): string {
  const colors: Record<string, string> = {
    'Z1': '#94a3b8',
    'Z2': '#60a5fa',
    'Z3': '#34d399',
    'Z4': '#fbbf24',
    'Z5': '#f87171',
    'Z6': '#a78bfa',
    'Z7': '#ef4444',
  };
  return colors[zone] || '#94a3b8';
}
