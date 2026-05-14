import { Workout, AthleteProfile } from '../types';

// Generate realistic sample data for 3 months of training
export function generateSampleData(): Workout[] {
  const workouts: Workout[] = [];
  const startDate = new Date('2026-01-01');
  const endDate = new Date('2026-04-25');
  
  const workoutTypes = [
    { type: 'Endurance', duration: [90, 180], tss: [60, 120], np: [0.65, 0.75] },
    { type: 'Tempo', duration: [60, 90], tss: [70, 100], np: [0.80, 0.88] },
    { type: 'Threshold', duration: [60, 75], tss: [80, 110], np: [0.88, 0.95] },
    { type: 'VO2Max', duration: [45, 75], tss: [70, 100], np: [0.95, 1.05] },
    { type: 'Recovery', duration: [45, 75], tss: [30, 50], np: [0.50, 0.60] },
    { type: 'Sweet Spot', duration: [60, 120], tss: [75, 110], np: [0.85, 0.93] },
  ];
  
  let id = 1;
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    
    // Rest day on Monday usually
    if (dayOfWeek === 1 && Math.random() > 0.3) continue;
    
    // 1-2 workouts per day on weekends, 1 on weekdays
    const numWorkouts = (dayOfWeek === 0 || dayOfWeek === 6) 
      ? (Math.random() > 0.5 ? 2 : 1)
      : 1;
    
    for (let w = 0; w < numWorkouts; w++) {
      const template = workoutTypes[Math.floor(Math.random() * workoutTypes.length)];
      const duration = template.duration[0] + Math.random() * (template.duration[1] - template.duration[0]);
      const tss = template.tss[0] + Math.random() * (template.tss[1] - template.tss[0]);
      const npRatio = template.np[0] + Math.random() * (template.np[1] - template.np[0]);
      
      const np = Math.round(255 * npRatio);
      const if_ = np / 255;
      
      workouts.push({
        id: `w${id++}`,
        date: new Date(d),
        title: `${template.type} Ride`,
        type: template.type,
        duration: Math.round(duration),
        tss: Math.round(tss),
        if: Math.round(if_ * 100) / 100,
        np,
        avgPower: Math.round(np * (0.85 + Math.random() * 0.1)),
        maxPower: Math.round(np * (1.2 + Math.random() * 0.3)),
        avgHr: Math.round(130 + Math.random() * 40),
        maxHr: Math.round(170 + Math.random() * 15),
        distance: Math.round((duration / 60) * (25 + Math.random() * 10) * 10) / 10,
        elevation: Math.round(Math.random() * 800),
        calories: Math.round(duration * (5 + Math.random() * 3)),
      });
    }
  }
  
  return workouts;
}

export const sampleAthlete: AthleteProfile = {
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
