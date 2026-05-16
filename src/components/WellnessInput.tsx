import { useState } from 'react';
import { Heart, Battery, Brain, BedDouble, Zap, AlertCircle, Check } from 'lucide-react';
import { WellnessEntry } from '../types';

interface WellnessInputProps {
  onSubmit: (entry: WellnessEntry) => void;
  lastEntry?: WellnessEntry;
}

export default function WellnessInput({ onSubmit, lastEntry }: WellnessInputProps) {
  const [motivation, setMotivation] = useState(lastEntry?.motivation || 3);
  const [muscleSoreness, setMuscleSoreness] = useState(lastEntry?.muscleSoreness || 3);
  const [lifeStress, setLifeStress] = useState(lastEntry?.lifeStress || 3);
  const [fatigueLevel, setFatigueLevel] = useState(lastEntry?.fatigueLevel || 3);
  const [sleepQuality, setSleepQuality] = useState(lastEntry?.sleepQuality || 3);
  const [sleepHours, setSleepHours] = useState(lastEntry?.sleepHours?.toString() || '7');
  const [notes, setNotes] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    const entry: WellnessEntry = {
      id: `w${new Date().toISOString().split('T')[0]}`,
      date: new Date(),
      motivation,
      muscleSoreness,
      lifeStress,
      fatigueLevel,
      sleepQuality,
      sleepHours: parseFloat(sleepHours) || 7,
      notes,
    };
    onSubmit(entry);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const ScoreButton = ({ value, current, onChange, color }: { value: number; current: number; onChange: (v: number) => void; color: string }) => (
    <button
      onClick={() => onChange(value)}
      className={`w-10 h-10 font-medium text-sm transition-all ${
        current === value
          ? `${color} bg-cream-200 scale-110`
          : 'bg-cream-100 text-warmgray-400 hover:bg-cream-200 border border-warmgray-200'
      }`}
    >
      {value}
    </button>
  );

  const ScoreRow = ({ icon: Icon, label, value, onChange, color, description }: {
    icon: any; label: string; value: number; onChange: (v: number) => void; color: string; description: string;
  }) => (
    <div className="flex items-center gap-4 py-4 border-b border-warmgray-200 last:border-0">
      <div className={`w-10 h-10 border border-warmgray-200 flex items-center justify-center ${color}`}>
        <Icon className={`w-5 h-5 ${color.replace('text-', 'text-')}`} strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-warmgray-900">{label}</span>
          <span className="text-xs text-warmgray-400">{description}</span>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map(v => (
            <ScoreButton key={v} value={v} current={value} onChange={onChange} color={color} />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="card max-w-2xl mx-auto">
      <div className="mb-5">
        <div className="accent-line" />
        <h3 className="section-title !mb-0 flex items-center gap-2">
          <Heart className="w-5 h-5 text-terracotta-500" strokeWidth={1.5} />
          Daily Wellness Check
        </h3>
        <p className="text-sm text-warmgray-500 font-serif italic">Rate how you're feeling today (1 = poor, 5 = excellent)</p>
      </div>

      <ScoreRow
        icon={Zap}
        label="Motivation"
        value={motivation}
        onChange={setMotivation}
        color="text-terracotta-500"
        description="Ready to train?"
      />
      <ScoreRow
        icon={AlertCircle}
        label="Muscle Soreness"
        value={muscleSoreness}
        onChange={setMuscleSoreness}
        color="text-violet-500"
        description="1 = fresh, 5 = very sore"
      />
      <ScoreRow
        icon={Brain}
        label="Life Stress"
        value={lifeStress}
        onChange={setLifeStress}
        color="text-emerald-600"
        description="Work/life pressure"
      />
      <ScoreRow
        icon={Battery}
        label="Fatigue Level"
        value={fatigueLevel}
        onChange={setFatigueLevel}
        color="text-sky-600"
        description="Physical tiredness"
      />
      <ScoreRow
        icon={BedDouble}
        label="Sleep Quality"
        value={sleepQuality}
        onChange={setSleepQuality}
        color="text-amber-600"
        description="How well did you sleep?"
      />

      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm text-warmgray-500 block mb-1 tracking-wide">Sleep Hours</label>
          <input
            type="number"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            className="w-full bg-cream-100 border border-warmgray-200 px-3 py-2 text-warmgray-900 text-sm focus:border-terracotta-400 focus:outline-none transition-colors"
            step="0.5"
            min="0"
            max="24"
          />
        </div>
        <div className="flex-[2]">
          <label className="text-sm text-warmgray-500 block mb-1 tracking-wide">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any aches, issues, etc."
            className="w-full bg-cream-100 border border-warmgray-200 px-3 py-2 text-warmgray-900 text-sm focus:border-terracotta-400 focus:outline-none transition-colors"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className={`mt-6 w-full py-3 font-medium transition-all flex items-center justify-center gap-2 tracking-wide ${
          submitted
            ? 'bg-emerald-700 text-white'
            : 'bg-warmgray-900 hover:bg-terracotta-600 text-white'
        }`}
      >
        {submitted ? (
          <>
            <Check className="w-5 h-5" />
            Saved! Training adjusted.
          </>
        ) : (
          'Log Wellness & Update Training'
        )}
      </button>
    </div>
  );
}
