import { WellnessEntry } from '../types';

export function generateWellnessData(): WellnessEntry[] {
  const entries: WellnessEntry[] = [];
  const startDate = new Date('2026-04-01');
  const endDate = new Date('2026-04-25');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    
    let motivation = 3 + Math.floor(Math.random() * 3);
    let muscleSoreness = 2 + Math.floor(Math.random() * 3);
    let lifeStress = isWeekend ? 2 + Math.floor(Math.random() * 2) : 3 + Math.floor(Math.random() * 3);
    let fatigueLevel = 2 + Math.floor(Math.random() * 3);
    let sleepQuality = 3 + Math.floor(Math.random() * 3);
    
    if (muscleSoreness >= 4) {
      motivation = Math.max(1, motivation - 1);
      fatigueLevel = Math.min(5, fatigueLevel + 1);
    }
    
    if (lifeStress >= 4) {
      sleepQuality = Math.max(1, sleepQuality - 1);
    }
    
    entries.push({
      id: `w${d.toISOString().split('T')[0]}`,
      date: new Date(d),
      motivation,
      muscleSoreness,
      lifeStress,
      fatigueLevel,
      sleepQuality,
      sleepHours: 6 + Math.floor(Math.random() * 3) + Math.random(),
      notes: '',
    });
  }
  
  return entries;
}

export function calculateWellnessModifier(entry: WellnessEntry): {
  modifier: number; // -20% to +10%
  readiness: 'high' | 'moderate' | 'low' | 'rest';
  recommendation: string;
} {
  // Wellness score: higher = better
  const adjustedScore = 
    entry.motivation + 
    (6 - entry.muscleSoreness) + 
    (6 - entry.lifeStress) + 
    (6 - entry.fatigueLevel) + 
    entry.sleepQuality;
  
  // Map 5-25 score to -20% to +10% modifier
  let modifier: number;
  let readiness: 'high' | 'moderate' | 'low' | 'rest';
  let recommendation: string;
  
  if (adjustedScore >= 20) {
    modifier = 0.05 + ((adjustedScore - 20) / 5) * 0.05; // +5% to +10%
    readiness = 'high';
    recommendation = 'Feeling strong! Push the planned targets. 🔥';
  } else if (adjustedScore >= 15) {
    modifier = ((adjustedScore - 15) / 5) * 0.05; // 0% to +5%
    readiness = 'moderate';
    recommendation = 'Solid. Stick to plan or back off slightly.';
  } else if (adjustedScore >= 10) {
    modifier = -0.10 + ((adjustedScore - 10) / 5) * 0.10; // -10% to 0%
    readiness = 'low';
    recommendation = 'Fatigue building. Reduce volume 10%.';
  } else {
    modifier = -0.20 + ((adjustedScore - 5) / 5) * 0.10; // -20% to -10%
    readiness = 'rest';
    recommendation = 'Very fatigued. Significant reduction needed.';
  }
  
  return { modifier, readiness, recommendation };
}

export function adjustWorkoutBasedOnWellness(
  workout: { duration: number; targetTss: number; targetZone?: string },
  wellness: WellnessEntry,
  tpFatigue: number // TrainingPeaks ATL/TSB-based fatigue score
): { 
  adjustedDuration: number; 
  adjustedTss: number; 
  adjustedZone: string; 
  modifier: number;
  reason: string;
  tpBaseReason: string;
} {
  const wellnessMod = calculateWellnessModifier(wellness);
  
  // Base adjustment from TP fatigue (how hard the training has been)
  let tpModifier = 0;
  let tpBaseReason = '';
  
  if (tpFatigue > 120) {
    tpModifier = -0.15;
    tpBaseReason = `TP Fatigue very high (${Math.round(tpFatigue)}). `;
  } else if (tpFatigue > 100) {
    tpModifier = -0.10;
    tpBaseReason = `TP Fatigue high (${Math.round(tpFatigue)}). `;
  } else if (tpFatigue > 80) {
    tpModifier = -0.05;
    tpBaseReason = `TP Fatigue elevated (${Math.round(tpFatigue)}). `;
  } else {
    tpBaseReason = `TP Fatigue normal (${Math.round(tpFatigue)}). `;
  }
  
  // Combine: TP fatigue base + wellness modifier
  // Cap total adjustment at ±20%
  const totalModifier = Math.max(-0.20, Math.min(0.20, tpModifier + wellnessMod.modifier));
  
  const adjustedDuration = Math.round(workout.duration * (1 + totalModifier));
  const adjustedTss = Math.round(workout.targetTss * (1 + totalModifier));
  
  // Zone adjustments only if significantly negative
  let adjustedZone = workout.targetZone || 'Z2';
  if (totalModifier < -0.15) {
    adjustedZone = 'Z2';
  }
  
  const reason = `${tpBaseReason}Wellness: ${wellnessMod.recommendation} Total adjustment: ${Math.round(totalModifier * 100)}%`;
  
  return { 
    adjustedDuration, 
    adjustedTss, 
    adjustedZone, 
    modifier: totalModifier,
    reason,
    tpBaseReason 
  };
}

export function getWellnessTrend(entries: WellnessEntry[], days: number = 7): {
  trend: 'improving' | 'stable' | 'declining';
  avgScore: number;
} {
  const recent = entries.slice(-days);
  if (recent.length < 3) return { trend: 'stable', avgScore: 0 };
  
  const scores = recent.map(e => {
    return e.motivation + (6 - e.muscleSoreness) + (6 - e.lifeStress) + (6 - e.fatigueLevel) + e.sleepQuality;
  });
  
  const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
  const secondHalf = scores.slice(Math.floor(scores.length / 2));
  
  const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
  
  const diff = avgSecond - avgFirst;
  
  return {
    trend: diff > 1 ? 'improving' : diff < -1 ? 'declining' : 'stable',
    avgScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10,
  };
}

export function calculateReadiness(entry: WellnessEntry): {
  score: number;
  readiness: 'high' | 'moderate' | 'low' | 'rest';
  recommendation: string;
} {
  const adjustedScore = 
    entry.motivation + 
    (6 - entry.muscleSoreness) + 
    (6 - entry.lifeStress) + 
    (6 - entry.fatigueLevel) + 
    entry.sleepQuality;
  
  const readiness: 'high' | 'moderate' | 'low' | 'rest' = 
    adjustedScore >= 20 ? 'high' :
    adjustedScore >= 15 ? 'moderate' :
    adjustedScore >= 10 ? 'low' : 'rest';
  
  const recommendations: Record<string, string> = {
    high: 'Ready to crush it! Hit the targets as planned. 🔥',
    moderate: 'Good to go. Maybe back off intensity 5% if needed.',
    low: 'Easy day recommended. Drop intensity or swap to Z2.',
    rest: 'Rest day! Recovery is training. Take it off.',
  };
  
  return {
    score: adjustedScore,
    readiness,
    recommendation: recommendations[readiness],
  };
}
