import { useMemo } from 'react';
import { AlertTriangle, ArrowDown, ArrowUp, Activity, Heart, Zap, Battery } from 'lucide-react';
import { WellnessEntry, FitnessMetrics } from '../types';
import { calculateWellnessAdjustment } from '../utils/wellnessAdjustment';

interface WellnessAdjustmentPanelProps {
  metrics: FitnessMetrics[];
  wellnessEntries: WellnessEntry[];
}

export default function WellnessAdjustmentPanel({ metrics, wellnessEntries }: WellnessAdjustmentPanelProps) {
  const latestMetrics = metrics[metrics.length - 1];
  const latestWellness = wellnessEntries[wellnessEntries.length - 1];

  const adjustment = useMemo(() => {
    if (!latestMetrics) return null;
    return calculateWellnessAdjustment(latestMetrics, latestWellness || null);
  }, [latestMetrics, latestWellness]);

  if (!adjustment) return null;

  const readinessColor: Record<string, string> = {
    high: 'text-emerald-700',
    moderate: 'text-amber-600',
    low: 'text-terracotta-600',
    rest: 'text-violet-700',
  };

  const readinessBorder: Record<string, string> = {
    high: 'border-emerald-700',
    moderate: 'border-amber-600',
    low: 'border-terracotta-600',
    rest: 'border-violet-700',
  };

  const recIcon: Record<string, React.ReactNode> = {
    go: <Activity className="w-5 h-5 text-emerald-700" strokeWidth={1.5} />,
    quality: <Zap className="w-5 h-5 text-violet-700" strokeWidth={1.5} />,
    caution: <AlertTriangle className="w-5 h-5 text-amber-600" strokeWidth={1.5} />,
    rest: <Heart className="w-5 h-5 text-terracotta-600" strokeWidth={1.5} />,
  };

  return (
    <div className="space-y-6">
      {/* Main Readiness Card */}
      <div className={`card border-l-4 ${readinessBorder[adjustment.readiness] || 'border-warmgray-400'}`}>
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <div className="accent-line" />
            <h3 className="section-title !mb-0">Coach's Assessment</h3>
          </div>
          <div className="flex items-center gap-2">
            <Battery className="w-5 h-5 text-warmgray-500" strokeWidth={1.5} />
            <span className={`text-3xl font-serif font-medium ${readinessColor[adjustment.readiness] || 'text-warmgray-900'}`}>
              {adjustment.readinessScore}/100
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 mb-6">
          {[
            { label: 'Raw TP ATL', value: adjustment.rawAtl.toFixed(1), highlight: false },
            { label: 'Adjusted ATL', value: adjustment.adjustedAtl.toFixed(1), highlight: true, change: adjustment.adjustmentPercent },
            { label: 'Raw TSB', value: adjustment.rawTsb.toFixed(1), highlight: false },
            { label: 'Adjusted TSB', value: adjustment.adjustedTsb.toFixed(1), highlight: true, diff: adjustment.adjustedTsb - adjustment.rawTsb },
          ].map((item, i) => (
            <div key={item.label} className={`bg-cream-50 p-4 border border-warmgray-200 ${i > 0 ? 'border-l-0' : ''} ${item.highlight ? 'border-t-4 border-t-terracotta-400' : ''}`}>
              <p className="text-xs text-warmgray-500 uppercase tracking-wider">{item.label}</p>
              <div className="flex items-baseline gap-2 mt-2">
                <p className="text-2xl font-serif font-medium text-warmgray-900">{item.value}</p>
                {item.change !== undefined && item.change !== 0 && (
                  <span className={`text-xs ${item.change > 0 ? 'text-terracotta-600' : 'text-emerald-700'}`}>
                    {item.change > 0 ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />}
                    {Math.abs(item.change)}%
                  </span>
                )}
                {item.diff !== undefined && item.diff !== 0 && (
                  <span className={`text-xs ${item.diff < 0 ? 'text-terracotta-600' : 'text-emerald-700'}`}>
                    {item.diff < 0 ? <ArrowDown className="w-3 h-3 inline" /> : <ArrowUp className="w-3 h-3 inline" />}
                    {Math.abs(item.diff).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Recommendation */}
        <div className="flex items-start gap-4 bg-cream-50 border border-warmgray-200 p-4">
          {recIcon[adjustment.recommendationType] || <Activity className="w-5 h-5 text-warmgray-500" />}
          <div>
            <p className="text-sm font-medium text-warmgray-900">{adjustment.recommendation}</p>
            <p className="text-xs text-warmgray-500 mt-1 font-serif italic">
              Readiness: <span className={readinessColor[adjustment.readiness] || 'text-warmgray-900'}>{adjustment.readiness.toUpperCase()}</span>
              {' · '}
              {latestWellness && `Latest check-in: ${latestWellness.motivation}/${latestWellness.muscleSoreness}/${latestWellness.lifeStress}/${latestWellness.sleepQuality}`}
            </p>
          </div>
        </div>
      </div>

      {/* Adjustment Factors */}
      {adjustment.factors.length > 0 && (
        <div className="card">
          <div className="mb-5">
            <div className="accent-line" />
            <h3 className="section-title !mb-0">Why the Adjustment?</h3>
          </div>
          <div className="space-y-3">
            {adjustment.factors.map((factor) => (
              <div key={factor.name} className="flex items-center gap-4">
                <div className="w-24 text-xs text-warmgray-500 tracking-wide">{factor.name}</div>
                <div className="flex-1">
                  <div className="h-1.5 bg-cream-200 overflow-hidden">
                    <div
                      className={`h-full ${
                        factor.impact === 'negative' ? 'bg-terracotta-400' :
                        factor.impact === 'positive' ? 'bg-emerald-500' :
                        'bg-warmgray-400'
                      }`}
                      style={{ width: `${factor.score * 10}%` }}
                    />
                  </div>
                </div>
                <div className="w-8 text-xs font-medium text-warmgray-900 text-right">{factor.score}</div>
                <div className="w-32 text-xs text-warmgray-500">{factor.description}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-warmgray-200">
            <p className="text-xs text-warmgray-500 font-serif italic">
              Adjustment capped at ±20% of TP ATL. Your inputs modify fatigue estimates to account for subjective recovery state.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
