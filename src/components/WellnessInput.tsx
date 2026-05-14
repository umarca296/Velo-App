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
      className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${
        current === value
          ? `${color} text-white scale-110`
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
    >
      {value}
    </button>
  );

  const ScoreRow = ({ icon: Icon, label, value, onChange, color, description }: {
    icon: any; label: string; value: number; onChange: (v: number) => void; color: string; description: string;
  }) => (
    <div className="flex items-center gap-4 py-3 border-b border-gray-800 last:border-0">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color} bg-opacity-20`}>
        <Icon className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-white">{label}</span>
          <span className="text-xs text-gray-400">{description}</span>
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
      <h3 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
        <Heart className="w-5 h-5 text-red-400" />
        Daily Wellness Check
      </h3>
      <p className="text-sm text-gray-400 mb-4">Rate how you're feeling today (1 = poor, 5 = excellent)</p>

      <ScoreRow
        icon={Zap}
        label="Motivation"
        value={motivation}
        onChange={setMotivation}
        color="bg-yellow-500"
        description="Ready to train?"
      />
      <ScoreRow
        icon={AlertCircle}
        label="Muscle Soreness"
        value={muscleSoreness}
        onChange={setMuscleSoreness}
        color="bg-orange-500"
        description="1 = fresh, 5 = very sore"
      />
      <ScoreRow
        icon={Brain}
        label="Life Stress"
        value={lifeStress}
        onChange={setLifeStress}
        color="bg-purple-500"
        description="Work/life pressure"
      />
      <ScoreRow
        icon={Battery}
        label="Fatigue Level"
        value={fatigueLevel}
        onChange={setFatigueLevel}
        color="bg-blue-500"
        description="Physical tiredness"
      />
      <ScoreRow
        icon={BedDouble}
        label="Sleep Quality"
        value={sleepQuality}
        onChange={setSleepQuality}
        color="bg-indigo-500"
        description="How well did you sleep?"
      />

      <div className="mt-4 flex items-center gap-4">
        <div className="flex-1">
          <label className="text-sm text-gray-400 block mb-1">Sleep Hours</label>
          <input
            type="number"
            value={sleepHours}
            onChange={(e) => setSleepHours(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
            step="0.5"
            min="0"
            max="24"
          />
        </div>
        <div className="flex-[2]">
          <label className="text-sm text-gray-400 block mb-1">Notes (optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any aches, issues, etc."
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm"
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className={`mt-4 w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
          submitted
            ? 'bg-cycling-500 text-white'
            : 'bg-cycling-600 hover:bg-cycling-500 text-white'
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
