import { useState } from 'react';
import { Calendar, Target, Check, Clock, AlertTriangle, Heart } from 'lucide-react';
import { AthleteProfile, FitnessMetrics, TrainingPlan, TrainingWeek, PlannedWorkout, WellnessEntry } from '../types';
import { calculateReadiness, adjustWorkoutBasedOnWellness } from '../utils/wellness';

interface TrainingPlanViewProps {
  athlete: AthleteProfile;
  metrics: FitnessMetrics[];
  wellnessEntries: WellnessEntry[];
}

export default function TrainingPlanView({ athlete, metrics, wellnessEntries }: TrainingPlanViewProps) {
  const [plan, setPlan] = useState<TrainingPlan | null>(() => generateSamplePlan(athlete));

  // Helper functions
  const getWellnessForDate = (date: Date): WellnessEntry | undefined => {
    return wellnessEntries.find(e => e.date.toDateString() === date.toDateString());
  };

  const getTPFatigueForDate = (date: Date): number => {
    const metric = metrics.find(m => m.date.toDateString() === date.toDateString());
    return metric?.atl || 0;
  };

  const getWorkoutDate = (week: TrainingWeek, dayOfWeek: number): Date => {
    if (!plan) return new Date();
    const planStart = new Date(plan.startDate);
    const weekStart = new Date(planStart);
    weekStart.setDate(weekStart.getDate() + (week.weekNumber - 1) * 7);
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayOfWeek);
    return date;
  };

  const toggleWorkoutComplete = (weekIndex: number, workoutId: string) => {
    if (!plan) return;
    const newWeeks = [...plan.weeks];
    const week = newWeeks[weekIndex];
    const workout = week.workouts.find(w => w.id === workoutId);
    if (workout) {
      workout.completed = !workout.completed;
    }
    setPlan({ ...plan, weeks: newWeeks });
  };

  if (!plan) return null;

  return (
    <div className="space-y-6">
      {/* Plan Header */}
      <div className="card">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{plan.name}</h2>
            <p className="text-gray-500 mt-1">Goal: {plan.goalEvent}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {plan.startDate.toLocaleDateString()} — {plan.endDate.toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                {plan.weeks.length} weeks
              </span>
            </div>
          </div>
          <div className="bg-cycling-500/20 text-cycling-600 px-4 py-2 rounded-lg font-medium">
            {athlete.ftp}W FTP
          </div>
        </div>
      </div>

      {/* Weeks */}
      <div className="space-y-4">
        {plan.weeks.map((week, wi) => (
          <div key={week.weekNumber} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold text-gray-900">W{week.weekNumber}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  week.phase === 'base' ? 'bg-blue-500/20 text-blue-600' :
                  week.phase === 'build' ? 'bg-orange-500/20 text-orange-600' :
                  week.phase === 'peak' ? 'bg-red-500/20 text-red-600' :
                  'bg-purple-500/20 text-purple-600'
                }`}>
                  {week.phase.toUpperCase()}
                </span>
                <span className="text-sm text-gray-500">
                  Target: {week.targetTss} TSS / {week.targetHours}h
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {week.workouts.filter(w => w.completed).length}/{week.workouts.length} done
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {week.workouts.map(workout => {
                const workoutDate = getWorkoutDate(week, workout.dayOfWeek);
                const wellnessForDay = getWellnessForDate(workoutDate);
                const wellnessReadiness = wellnessForDay ? calculateReadiness(wellnessForDay) : null;
                const wellnessAdjustment = wellnessForDay ? adjustWorkoutBasedOnWellness(
                  { duration: workout.duration, targetTss: workout.targetTss, targetZone: workout.targetZone },
                  wellnessForDay,
                  getTPFatigueForDate(workoutDate)
                ) : null;
                
                const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
                return (
                  <div 
                    key={workout.id}
                    onClick={() => toggleWorkoutComplete(wi, workout.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      workout.completed 
                        ? 'bg-cycling-500/10 border-cycling-500/30' 
                        : 'bg-gray-100/80 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs text-gray-500">{days[workout.dayOfWeek]}</span>
                      <div className="flex items-center gap-1">
                        {wellnessAdjustment && wellnessAdjustment.adjustedZone === 'Rest' && (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        {wellnessAdjustment && wellnessAdjustment.adjustedZone !== 'Rest' && wellnessAdjustment.adjustedDuration < workout.duration && (
                          <Heart className="w-4 h-4 text-orange-600" />
                        )}
                        {workout.completed && <Check className="w-4 h-4 text-cycling-600" />}
                      </div>
                    </div>
                    <h4 className={`font-medium mt-1 ${workout.completed ? 'text-cycling-600' : 'text-gray-900'}`}>
                      {wellnessAdjustment?.adjustedZone === 'Rest' ? '⛔ REST DAY' : workout.title}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {wellnessAdjustment ? wellnessAdjustment.reason : workout.type}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      {wellnessAdjustment && wellnessAdjustment.adjustedZone !== 'Rest' ? (
                        <>
                          <span className="text-gray-500 line-through">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {workout.duration}min
                          </span>
                          <span className="text-orange-600">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {wellnessAdjustment.adjustedDuration}min
                          </span>
                          <span className="text-gray-500 line-through">TSS: {workout.targetTss}</span>
                          <span className="text-orange-600">TSS: {wellnessAdjustment.adjustedTss}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-400">
                            <Clock className="w-3 h-3 inline mr-1" />
                            {workout.duration}min
                          </span>
                          <span className="text-gray-400">TSS: {workout.targetTss}</span>
                        </>
                      )}
                    </div>
                    {wellnessAdjustment ? (
                      <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs font-medium ${
                        wellnessAdjustment.adjustedZone === 'Z2' ? 'bg-blue-500/20 text-blue-600' :
                        wellnessAdjustment.adjustedZone === 'Rest' ? 'bg-red-500/20 text-red-600' :
                        wellnessAdjustment.adjustedZone === 'Z3-Z4' ? 'bg-yellow-500/20 text-yellow-600' :
                        wellnessAdjustment.adjustedZone === 'Z3' ? 'bg-green-500/20 text-green-600' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {wellnessAdjustment.adjustedZone}
                      </span>
                    ) : (
                      workout.targetZone && (
                        <span className={`inline-block mt-2 px-2 py-0.5 rounded text-xs ${
                          workout.targetZone === 'Z2' ? 'bg-blue-500/20 text-blue-600' :
                          workout.targetZone === 'Z3' ? 'bg-green-500/20 text-green-600' :
                          workout.targetZone === 'Z4' ? 'bg-yellow-500/20 text-yellow-600' :
                          workout.targetZone === 'Z5' ? 'bg-red-500/20 text-red-600' :
                          'bg-gray-700 text-gray-400'
                        }`}>
                          {workout.targetZone}
                        </span>
                      )
                    )}
                    {wellnessForDay && (
                      <div className="mt-2 flex items-center gap-1 text-xs">
                        <Heart className="w-3 h-3 text-red-600" />
                        <span className={`${
                          wellnessReadiness?.readiness === 'high' ? 'text-cycling-600' :
                          wellnessReadiness?.readiness === 'moderate' ? 'text-yellow-600' :
                          'text-orange-600'
                        }`}>
                          {wellnessReadiness?.score}/25
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function generateSamplePlan(_athlete: AthleteProfile): TrainingPlan {
  const startDate = new Date('2026-04-27');
  const endDate = new Date('2026-08-15');
  const weeks: TrainingWeek[] = [];
  
  const phases = [
    { phase: 'base', weeks: 4, hours: [10, 11, 11, 12], tss: [400, 450, 450, 500] },
    { phase: 'build', weeks: 4, hours: [11, 12, 12, 13], tss: [500, 550, 550, 600] },
    { phase: 'peak', weeks: 2, hours: [12, 13], tss: [550, 600] },
    { phase: 'taper', weeks: 1, hours: [8], tss: [300] },
    { phase: 'race', weeks: 1, hours: [6], tss: [200] },
  ];
  
  let weekNum = 1;
  for (const phase of phases) {
    for (let i = 0; i < phase.weeks; i++) {
      const workouts: PlannedWorkout[] = [
        { id: `w${weekNum}-1`, dayOfWeek: 0, title: 'Long Endurance Ride', type: 'Endurance', duration: 180, targetTss: 120, targetZone: 'Z2', description: 'Steady aerobic base miles' },
        { id: `w${weekNum}-2`, dayOfWeek: 2, title: 'Sweet Spot Intervals', type: 'Sweet Spot', duration: 75, targetTss: 85, targetZone: 'Z3-Z4', description: '2x20min @ 88-93% FTP' },
        { id: `w${weekNum}-3`, dayOfWeek: 3, title: 'Tempo Ride', type: 'Tempo', duration: 90, targetTss: 90, targetZone: 'Z3', description: 'Steady tempo effort' },
        { id: `w${weekNum}-4`, dayOfWeek: 4, title: 'Recovery Spin', type: 'Recovery', duration: 45, targetTss: 30, targetZone: 'Z1', description: 'Easy spin, flush the legs' },
        { id: `w${weekNum}-5`, dayOfWeek: 5, title: 'Threshold Intervals', type: 'Threshold', duration: 75, targetTss: 95, targetZone: 'Z4', description: '4x8min @ 95-105% FTP' },
        { id: `w${weekNum}-6`, dayOfWeek: 6, title: 'Group Ride / Race Sim', type: 'Group', duration: 120, targetTss: 110, targetZone: 'Z2-Z5', description: 'Variable intensity group ride' },
      ];
      
      weeks.push({
        weekNumber: weekNum,
        phase: phase.phase,
        workouts,
        targetTss: phase.tss[i],
        targetHours: phase.hours[i],
      });
      weekNum++;
    }
  }
  
  return {
    id: 'plan-1',
    name: 'Summer Race Season Prep',
    startDate,
    endDate,
    goalEvent: 'A-Race Block (August)',
    weeks,
  };
}
