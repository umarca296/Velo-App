import { useMemo } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, Activity, Heart, Zap, Battery } from 'lucide-react';
import { WellnessEntry, FitnessMetrics } from '../types';
import { calculateWellnessAdjustment } from '../utils/wellnessAdjustment';

interface WellnessAdjustmentPanelProps {
  metrics: FitnessMetrics[];
  wellnessEntries: WellnessEntry[];
}

export default function WellnessAdjustmentPanel({ metrics, wellnessEntries }: WellnessAdjustmentPanelProps) {
  // Get latest metrics and wellness
  const latestMetrics = metrics[metrics.length - 1];
  const latestWellness = wellnessEntries[wellnessEntries.length - 1];

  const adjustment = useMemo(() => {
    if (!latestMetrics) return null;
    return calculateWellnessAdjustment(latestMetrics, latestWellness || null);
  }, [latestMetrics, latestWellness]);

  if (!adjustment) return null;

  const readinessColor = {
    high: 'text-green-400',
    moderate: 'text-yellow-400',
    low: 'text-orange-400',
    rest: 'text-red-400',
  }[adjustment.readiness];

  const readinessBg = {
    high: 'bg-green-400/10 border-green-400/30',
    moderate: 'bg-yellow-400/10 border-yellow-400/30',
    low: 'bg-orange-400/10 border-orange-400/30',
    rest: 'bg-red-400/10 border-red-400/30',
  }[adjustment.readiness];

  const recIcon = {
    go: <Activity className="w-5 h-5 text-green-400" />,
    quality: <Zap className="w-5 h-5 text-blue-400" />,
    caution: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    rest: <Heart className="w-5 h-5 text-red-400" />,
  }[adjustment.recommendationType];

  return (
    <div className="space-y-4">
      {/* Main Readiness Card */}
      <div className={`card ${readinessBg} border-2`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">Coach's Assessment</h3>
          <div className="flex items-center gap-2">
            <Battery className="w-5 h-5" />
            <span className={`text-2xl font-bold ${readinessColor}`}>
              {adjustment.readinessScore}/100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 uppercase">Raw TP ATL</p>
            <p className="text-xl font-bold text-white">{adjustment.rawAtl.toFixed(1)}</p>
          </div>
          <div className={`bg-gray-800/50 rounded-lg p-3 ${adjustment.adjustmentPercent !== 0 ? 'border border-yellow-400/30' : ''}`}>
            <p className="text-xs text-gray-400 uppercase">Adjusted ATL</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-white">{adjustment.adjustedAtl.toFixed(1)}</p>
              {adjustment.adjustmentPercent !== 0 && (
                <span className={`text-xs ${adjustment.adjustmentPercent > 0 ? 'text-red-400' : 'text-green-400'}`}>
                  {adjustment.adjustmentPercent > 0 ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />}
                  {Math.abs(adjustment.adjustmentPercent)}%
                </span>
              )}
            </div>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-3">
            <p className="text-xs text-gray-400 uppercase">Raw TSB</p>
            <p className="text-xl font-bold text-white">{adjustment.rawTsb.toFixed(1)}</p>
          </div>
          <div className={`bg-gray-800/50 rounded-lg p-3 ${adjustment.adjustmentPercent !== 0 ? 'border border-yellow-400/30' : ''}`}>
            <p className="text-xs text-gray-400 uppercase">Adjusted TSB</p>
            <div className="flex items-center gap-2">
              <p className="text-xl font-bold text-white">{adjustment.adjustedTsb.toFixed(1)}</p>
              {adjustment.adjustmentPercent !== 0 && (
                <span className={`text-xs ${adjustment.adjustedTsb < adjustment.rawTsb ? 'text-red-400' : 'text-green-400'}`}>
                  {adjustment.adjustedTsb < adjustment.rawTsb ? <ArrowDown className="w-3 h-3 inline" /> : <ArrowUp className="w-3 h-3 inline" />}
                  {Math.abs(adjustment.adjustedTsb - adjustment.rawTsb).toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <div className="flex items-start gap-3 bg-gray-800/50 rounded-lg p-3">
          {recIcon}
          <div>
            <p className="text-sm font-medium text-white">{adjustment.recommendation}</p>
            <p className="text-xs text-gray-400 mt-1">
              Readiness: <span className={readinessColor}>{adjustment.readiness.toUpperCase()}</span>
              {' • '}
              {latestWellness && `Latest check-in: ${latestWellness.motivation}/${latestWellness.muscleSoreness}/${latestWellness.lifeStress}/${latestWellness.sleepQuality}`}
            </p>
          </div>
        </div>
      </div>

      {/* Adjustment Factors */}
      {adjustment.factors.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-medium text-gray-300 mb-3">Why the Adjustment?</h3>
          <div className="space-y-2">
            {adjustment.factors.map((factor) => (
              <div key={factor.name} className="flex items-center gap-3">
                <div className="w-24 text-xs text-gray-400">{factor.name}</div>
                <div className="flex-1">
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        factor.impact === 'negative' ? 'bg-red-400' :
                        factor.impact === 'positive' ? 'bg-green-400' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${factor.score * 10}%` }}
                    />
                  </div>
                </div>
                <div className="w-8 text-xs font-medium text-white text-right">{factor.score}</div>
                <div className="w-32 text-xs text-gray-500">{factor.description}</div>
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">
              Adjustment capped at ±20% of TP ATL. Your inputs modify fatigue estimates to account for subjective recovery state.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
