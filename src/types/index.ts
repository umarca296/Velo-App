export interface WellnessEntry {
  id: string;
  date: Date;
  motivation: number; // 1-5
  muscleSoreness: number; // 1-5
  lifeStress: number; // 1-5
  fatigueLevel: number; // 1-5
  sleepQuality: number; // 1-5
  sleepHours?: number;
  notes?: string;
}

export interface WellnessMetrics {
  date: Date;
  totalScore: number; // out of 25
  average: number; // historical average
  readiness: 'high' | 'moderate' | 'low' | 'rest'; // calculated
}

export interface Workout {
  id: string;
  date: Date;
  title: string;
  type: string;
  duration: number; // minutes
  tss: number;
  if: number;
  np: number;
  avgPower: number;
  maxPower: number;
  avgHr: number;
  maxHr: number;
  distance: number; // km
  elevation: number; // meters
  calories: number;
  description?: string;
}

export interface FitnessMetrics {
  date: Date;
  ctl: number; // Chronic Training Load
  atl: number; // Acute Training Load
  tsb: number; // Training Stress Balance
  
  dailyTss: number;
  weeklyTss: number;
  weeklyHours: number;
}

export interface PowerZones {
  z1: number; // Active Recovery
  z2: number; // Endurance
  z3: number; // Tempo
  z4: number; // Threshold
  z5: number; // VO2Max
  z6: number; // Anaerobic
  z7: number; // Neuromuscular
}

export interface AthleteProfile {
  name: string;
  ftp: number; // Watts
  weight: number; // kg
  maxHr: number;
  lactateThresholdHr: number;
  powerZones: PowerZones;
  hrZones: PowerZones;
}

export interface TrainingPlan {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  goalEvent: string;
  weeks: TrainingWeek[];
}

export interface TrainingWeek {
  weekNumber: number;
  phase: string; // base, build, peak, taper, race
  workouts: PlannedWorkout[];
  targetTss: number;
  targetHours: number;
}

export interface PlannedWorkout {
  id: string;
  dayOfWeek: number; // 0-6
  title: string;
  type: string;
  duration: number;
  targetTss: number;
  targetPower?: number;
  targetZone?: string;
  description: string;
  completed?: boolean;
}
