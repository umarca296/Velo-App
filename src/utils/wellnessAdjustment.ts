import { WellnessEntry, FitnessMetrics } from '../types';

// Calculate wellness-based adjustment to TP metrics
// As agreed: adjust ATL up to 20% based on subjective inputs

export interface WellnessAdjustment {
  rawAtl: number;
  adjustedAtl: number;
  adjustmentPercent: number;
  rawTsb: number;
  adjustedTsb: number;
  readiness: 'high' | 'moderate' | 'low' | 'rest';
  readinessScore: number; // 0-100
  factors: AdjustmentFactor[];
  recommendation: string;
  recommendationType: 'go' | 'caution' | 'rest' | 'quality';
}

interface AdjustmentFactor {
  name: string;
  score: number; // 1-10
  weight: number;
  impact: 'positive' | 'negative' | 'neutral';
  description: string;
}

export function calculateWellnessAdjustment(
  metrics: FitnessMetrics,
  wellness: WellnessEntry | null
): WellnessAdjustment {
  if (!wellness) {
    return {
      rawAtl: metrics.atl,
      adjustedAtl: metrics.atl,
      adjustmentPercent: 0,
      rawTsb: metrics.tsb,
      adjustedTsb: metrics.tsb,
      readiness: 'moderate',
      readinessScore: 50,
      factors: [],
      recommendation: 'No wellness data — follow TP metrics',
      recommendationType: 'caution',
    };
  }

  const rawAtl = metrics.atl;
  const rawTsb = metrics.tsb;
  const ctl = metrics.ctl;

  // Build adjustment factors
  // Soreness: high soreness = +fatigue (up to +8%)
  const sorenessFactor: AdjustmentFactor = {
    name: 'Muscle Soreness',
    score: wellness.muscleSoreness,
    weight: 0.25,
    impact: wellness.muscleSoreness > 6 ? 'negative' : wellness.muscleSoreness < 3 ? 'positive' : 'neutral',
    description: wellness.muscleSoreness > 6 
      ? `Soreness ${wellness.muscleSoreness}/10 — legs need recovery` 
      : wellness.muscleSoreness < 3 
        ? `Soreness ${wellness.muscleSoreness}/10 — legs feel fresh`
        : `Soreness ${wellness.muscleSoreness}/10 — moderate`
  };

  // Sleep: low sleep = +fatigue (up to +6%)
  const sleepFactor: AdjustmentFactor = {
    name: 'Sleep Quality',
    score: wellness.sleepQuality,
    weight: 0.20,
    impact: wellness.sleepQuality < 5 ? 'negative' : wellness.sleepQuality > 7 ? 'positive' : 'neutral',
    description: wellness.sleepQuality < 5
      ? `Sleep ${wellness.sleepQuality}/10 — poor recovery`
      : wellness.sleepQuality > 7
        ? `Sleep ${wellness.sleepQuality}/10 — great recovery`
        : `Sleep ${wellness.sleepQuality}/10 — adequate`
  };

  // Stress: high stress = +fatigue (up to +4%)
  const stressFactor: AdjustmentFactor = {
    name: 'Life Stress',
    score: wellness.lifeStress,
    weight: 0.15,
    impact: wellness.lifeStress > 6 ? 'negative' : wellness.lifeStress < 3 ? 'positive' : 'neutral',
    description: wellness.lifeStress > 6
      ? `Stress ${wellness.lifeStress}/10 — elevated, affects recovery`
      : wellness.lifeStress < 3
        ? `Stress ${wellness.lifeStress}/10 — low, good for training`
        : `Stress ${wellness.lifeStress}/10 — moderate`
  };

  // Motivation: low motivation = might need easier session (up to +2%)
  const motivationFactor: AdjustmentFactor = {
    name: 'Motivation',
    score: wellness.motivation,
    weight: 0.10,
    impact: wellness.motivation < 4 ? 'negative' : wellness.motivation > 7 ? 'positive' : 'neutral',
    description: wellness.motivation < 4
      ? `Motivation ${wellness.motivation}/10 — consider easy day`
      : wellness.motivation > 7
        ? `Motivation ${wellness.motivation}/10 — ready to work`
        : `Motivation ${wellness.motivation}/10 — steady`
  };

  // Calculate total adjustment (capped at 20%)
  // Each factor contributes based on how "bad" it is (above threshold)
  const sorenessContribution = wellness.muscleSoreness > 5 
    ? ((wellness.muscleSoreness - 5) / 5) * 8 * sorenessFactor.weight
    : wellness.muscleSoreness < 3 
      ? -((3 - wellness.muscleSoreness) / 3) * 4 * sorenessFactor.weight
      : 0;

  const sleepContribution = wellness.sleepQuality < 5
    ? ((5 - wellness.sleepQuality) / 5) * 6 * sleepFactor.weight
    : wellness.sleepQuality > 7
      ? -((wellness.sleepQuality - 7) / 3) * 3 * sleepFactor.weight
      : 0;

  const stressContribution = wellness.lifeStress > 5
    ? ((wellness.lifeStress - 5) / 5) * 4 * stressFactor.weight
    : wellness.lifeStress < 3
      ? -((3 - wellness.lifeStress) / 3) * 2 * stressFactor.weight
      : 0;

  const motivationContribution = wellness.motivation < 5
    ? ((5 - wellness.motivation) / 5) * 2 * motivationFactor.weight
    : 0;

  const totalAdjustmentPercent = Math.max(-10, Math.min(20, 
    sorenessContribution + sleepContribution + stressContribution + motivationContribution
  ));

  const adjustedAtl = rawAtl * (1 + totalAdjustmentPercent / 100);
  const adjustedTsb = ctl - adjustedAtl;

  // Calculate readiness score (0-100)
  // Based on adjusted TSB + wellness composite
  const wellnessComposite = (
    (10 - wellness.muscleSoreness) * 3 +
    wellness.sleepQuality * 2.5 +
    (10 - wellness.lifeStress) * 2 +
    wellness.motivation * 1.5
  ) / 9; // max = 10

  const tsbScore = Math.max(0, Math.min(100, (adjustedTsb + 30) / 60 * 100));
  const readinessScore = Math.round((tsbScore * 0.6) + (wellnessComposite * 10 * 0.4));

  // Determine readiness category
  let readiness: 'high' | 'moderate' | 'low' | 'rest';
  if (readinessScore >= 75) readiness = 'high';
  else if (readinessScore >= 50) readiness = 'moderate';
  else if (readinessScore >= 25) readiness = 'low';
  else readiness = 'rest';

  // Generate recommendation
  let recommendation: string;
  let recommendationType: 'go' | 'caution' | 'rest' | 'quality';

  if (readiness === 'high') {
    recommendation = adjustedTsb > 10 
      ? 'Fully fresh — perfect for quality work or long ride'
      : 'Good form — quality session recommended';
    recommendationType = 'quality';
  } else if (readiness === 'moderate') {
    recommendation = adjustedTsb > -10
      ? 'Moderate fatigue — Z2 endurance or tempo'
      : 'Building fatigue — keep it easy or moderate';
    recommendationType = 'go';
  } else if (readiness === 'low') {
    recommendation = 'Elevated fatigue — easy spin or rest recommended';
    recommendationType = 'caution';
  } else {
    recommendation = 'Deep fatigue — mandatory rest day';
    recommendationType = 'rest';
  }

  return {
    rawAtl,
    adjustedAtl: Math.round(adjustedAtl * 10) / 10,
    adjustmentPercent: Math.round(totalAdjustmentPercent * 10) / 10,
    rawTsb,
    adjustedTsb: Math.round(adjustedTsb * 10) / 10,
    readiness,
    readinessScore,
    factors: [sorenessFactor, sleepFactor, stressFactor, motivationFactor],
    recommendation,
    recommendationType,
  };
}

// Get latest wellness entry for a date
export function getWellnessForDate(
  entries: WellnessEntry[],
  date: Date
): WellnessEntry | null {
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  
  return entries.find(e => {
    const eDate = new Date(e.date);
    eDate.setHours(0, 0, 0, 0);
    return eDate.getTime() === targetDate.getTime();
  }) || null;
}
