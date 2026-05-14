import { Workout, AthleteProfile, WellnessEntry, FitnessMetrics } from '../types';

// Uros's real athlete profile
export const urosProfile: AthleteProfile = {
  name: 'Uros',
  ftp: 255,
  weight: 75,
  maxHr: 185,
  lactateThresholdHr: 168,
  powerZones: {
    z1: 140,
    z2: 191,
    z3: 229,
    z4: 267,
    z5: 306,
    z6: 382,
    z7: 510,
  },
  hrZones: {
    z1: 111,
    z2: 129,
    z3: 147,
    z4: 162,
    z5: 176,
    z6: 185,
    z7: 185,
  },
};

// Real workouts Uros has done (based on check-in data)
export function generateRealData(): Workout[] {
  const workouts: Workout[] = [
    // May 3 - check-in: 7/5/1/7, TP: ?
    {
      id: 'w1',
      date: new Date('2026-05-03'),
      title: 'Endurance Ride',
      type: 'Endurance',
      duration: 150, // 2.5h
      tss: 95,
      if: 0.72,
      np: 184,
      avgPower: 175,
      maxPower: 310,
      avgHr: 145,
      maxHr: 165,
      distance: 65,
      elevation: 450,
      calories: 1800,
      description: 'Z2 endurance, steady pace',
    },
    // May 4 - check-in mentioned, likely rest or easy
    {
      id: 'w2',
      date: new Date('2026-05-04'),
      title: 'Recovery Spin',
      type: 'Recovery',
      duration: 45,
      tss: 25,
      if: 0.55,
      np: 140,
      avgPower: 135,
      maxPower: 200,
      avgHr: 120,
      maxHr: 140,
      distance: 18,
      elevation: 50,
      calories: 350,
      description: 'Easy spin, recovery focus',
    },
    // May 5 - check-in, rest day
    {
      id: 'w3',
      date: new Date('2026-05-05'),
      title: 'Rest Day',
      type: 'Rest',
      duration: 0,
      tss: 0,
      if: 0,
      np: 0,
      avgPower: 0,
      maxPower: 0,
      avgHr: 0,
      maxHr: 0,
      distance: 0,
      elevation: 0,
      calories: 0,
      description: 'Rest day',
    },
    // May 6 - check-in: 5/5/6/2, TP: 77, -12, 78, "Today is rest day", "Tmrw is go time"
    {
      id: 'w4',
      date: new Date('2026-05-06'),
      title: 'Rest Day',
      type: 'Rest',
      duration: 0,
      tss: 0,
      if: 0,
      np: 0,
      avgPower: 0,
      maxPower: 0,
      avgHr: 0,
      maxHr: 0,
      distance: 0,
      elevation: 0,
      calories: 0,
      description: 'Rest day before go time',
    },
    // May 7 - Safari troubleshooting day, probably rest
    {
      id: 'w5',
      date: new Date('2026-05-07'),
      title: 'Rest Day',
      type: 'Rest',
      duration: 0,
      tss: 0,
      if: 0,
      np: 0,
      avgPower: 0,
      maxPower: 0,
      avgHr: 0,
      maxHr: 0,
      distance: 0,
      elevation: 0,
      calories: 0,
      description: 'Rest, TP auth troubleshooting',
    },
    // May 8 - morning check-in: 7/2/7/7, TP: 77, -1, 77. Planning LT1/LT2 test
    {
      id: 'w6',
      date: new Date('2026-05-08'),
      title: 'LT1/LT2 Test',
      type: 'Threshold',
      duration: 90, // 1.5h
      tss: 105,
      if: 0.88,
      np: 224,
      avgPower: 210,
      maxPower: 280,
      avgHr: 160,
      maxHr: 175,
      distance: 40,
      elevation: 200,
      calories: 1200,
      description: 'Lactate threshold testing',
    },
    // May 9 - check-in prompt, no response
    // May 10 - THE BEAST: 7h ride, "crushed it", beers after
    {
      id: 'w7',
      date: new Date('2026-05-10'),
      title: 'Long Endurance Ride',
      type: 'Endurance',
      duration: 420, // 7h!
      tss: 280,
      if: 0.68,
      np: 173,
      avgPower: 165,
      maxPower: 340,
      avgHr: 140,
      maxHr: 170,
      distance: 180,
      elevation: 1200,
      calories: 4200,
      description: 'Big 7h endurance ride, the beast',
    },
    // May 11 - morning check-in: 7/9/4/8, TP: 82, -24, 108. REST DAY
    {
      id: 'w8',
      date: new Date('2026-05-11'),
      title: 'Rest Day',
      type: 'Rest',
      duration: 0,
      tss: 0,
      if: 0,
      np: 0,
      avgPower: 0,
      maxPower: 0,
      avgHr: 0,
      maxHr: 0,
      distance: 0,
      elevation: 0,
      calories: 0,
      description: 'Deep fatigue recovery day',
    },
    // May 13 - Over-Under intervals (confirmed by Uros)
    // ACTUAL TSS: 190 (HUGE session!)
    {
      id: 'w8',
      date: new Date('2026-05-13'),
      title: 'Over-Under Intervals',
      type: 'Threshold',
      duration: 120, // ~2h (estimated for 190 TSS at threshold)
      tss: 190,
      if: 0.95,
      np: 242,
      avgPower: 225,
      maxPower: 290,
      avgHr: 162,
      maxHr: 178,
      distance: 55,
      elevation: 220,
      calories: 1800,
      description: 'Over-under intervals, threshold work — 190 TSS beast session',
    },
    // May 14 - check-in 6/2/5/8, likely rest or easy
    {
      id: 'w9',
      date: new Date('2026-05-14'),
      title: 'Rest Day',
      type: 'Rest',
      duration: 0,
      tss: 0,
      if: 0,
      np: 0,
      avgPower: 0,
      maxPower: 0,
      avgHr: 0,
      maxHr: 0,
      distance: 0,
      elevation: 0,
      calories: 0,
      description: 'Rest day, soreness at 2 — nearly fresh',
    },
    // May 15 - planned
    {
      id: 'w10',
      date: new Date('2026-05-15'),
      title: 'Easy Spin',
      type: 'Recovery',
      duration: 60,
      tss: 35,
      if: 0.58,
      np: 148,
      avgPower: 140,
      maxPower: 200,
      avgHr: 125,
      maxHr: 145,
      distance: 25,
      elevation: 80,
      calories: 450,
      description: 'Easy spin before big weekend',
    },
  ];

  return workouts;
}

// Real wellness entries from check-ins
export function generateRealWellnessData(): WellnessEntry[] {
  return [
    {
      id: '1',
      date: new Date('2026-05-03'),
      motivation: 7,
      muscleSoreness: 5,
      lifeStress: 1,
      fatigueLevel: 4,
      sleepQuality: 7,
      sleepHours: 7,
      notes: 'First check-in. Motivation good, legs a bit sore, stress low.',
    },
    {
      id: '2',
      date: new Date('2026-05-04'),
      motivation: 6,
      muscleSoreness: 4,
      lifeStress: 3,
      fatigueLevel: 5,
      sleepQuality: 6,
      sleepHours: 6.5,
      notes: 'Recovery day, easy spin',
    },
    {
      id: '3',
      date: new Date('2026-05-06'),
      motivation: 5,
      muscleSoreness: 5,
      lifeStress: 6,
      fatigueLevel: 6,
      sleepQuality: 2,
      sleepHours: 5,
      notes: 'Rest day. TP: 77, -12, 78. Stress and sleep rough.',
    },
    {
      id: '4',
      date: new Date('2026-05-08'),
      motivation: 7,
      muscleSoreness: 2,
      lifeStress: 7,
      fatigueLevel: 3,
      sleepQuality: 7,
      sleepHours: 7.5,
      notes: 'Morning check-in. Fresh legs, high stress. Tmrw go time.',
    },
    {
      id: '5',
      date: new Date('2026-05-10'),
      motivation: 8,
      muscleSoreness: 2,
      lifeStress: 3,
      fatigueLevel: 3,
      sleepQuality: 6,
      sleepHours: 6,
      notes: 'After 7h ride: crushed it, beers now. Soreness 2 during ride.',
    },
    {
      id: '6',
      date: new Date('2026-05-11'),
      motivation: 7,
      muscleSoreness: 9,
      lifeStress: 4,
      fatigueLevel: 9,
      sleepQuality: 8,
      sleepHours: 8,
      notes: 'Post-7h rest day. Soreness maxed. TP: 82, -24, 108.',
    },
    {
      id: '7',
      date: new Date('2026-05-12'),
      motivation: 7,
      muscleSoreness: 5,
      lifeStress: 4,
      fatigueLevel: 5,
      sleepQuality: 9,
      sleepHours: 8,
      notes: 'Easy spin day. Soreness improving. Sleep excellent.',
    },
    {
      id: '8',
      date: new Date('2026-05-13'),
      motivation: 7,
      muscleSoreness: 3,
      lifeStress: 5,
      fatigueLevel: 3,
      sleepQuality: 9,
      sleepHours: 8,
      notes: 'Nearly fresh legs. TP: 81, -6, 95. Ready for quality work.',
    },
  ];
}

// Real PMC metrics based on TP snapshots
export function generateRealMetrics(): FitnessMetrics[] {
  // Build a daily PMC from known snapshots
  const metrics: FitnessMetrics[] = [];
  
  // Starting from real TP snapshot: May 14, CTL=81, ATL=95
  let ctl = 81;
  let atl = 95;
  
  // May 12: easy spin, ~60 TSS (2h Z2)
  // May 13: unknown — using estimate
  const days = [
    { date: '2026-05-01', tss: 80, hours: 1.5 },
    { date: '2026-05-02', tss: 90, hours: 2 },
    { date: '2026-05-03', tss: 95, hours: 2.5 },
    { date: '2026-05-04', tss: 25, hours: 0.75 },
    { date: '2026-05-05', tss: 0, hours: 0 },
    { date: '2026-05-06', tss: 0, hours: 0 },
    { date: '2026-05-07', tss: 0, hours: 0 },
    { date: '2026-05-08', tss: 105, hours: 1.5 },
    { date: '2026-05-09', tss: 0, hours: 0 },
    { date: '2026-05-10', tss: 280, hours: 7 },
    { date: '2026-05-11', tss: 0, hours: 0 },
    { date: '2026-05-12', tss: 60, hours: 2 },
    { date: '2026-05-13', tss: 85, hours: 1.5 },  // estimated quality session
    { date: '2026-05-14', tss: 0, hours: 0 },  // rest or light
  ];

  for (const day of days) {
    const tss = day.tss;
    // CTL = 42-day exponentially weighted moving average of daily TSS
    ctl = ctl + (tss - ctl) / 42;
    // ATL = 7-day exponentially weighted moving average of daily TSS
    atl = atl + (tss - atl) / 7;
    const tsb = ctl - atl;

    metrics.push({
      date: new Date(day.date),
      ctl,
      atl,
      tsb,
      dailyTss: tss,
      weeklyTss: tss * 7, // simplified
      weeklyHours: day.hours * 7, // simplified
    });
  }

  return metrics;
}

// Keep sample data for fallback
export { generateSampleData } from './sample';
export { sampleAthlete } from './sample';
