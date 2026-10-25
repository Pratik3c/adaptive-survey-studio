import { DimensionCoverage } from '../../types/analytics';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface CoverageChartProps {
  coverage: DimensionCoverage[];
  title?: string;
  subtitle?: string;
}

export function CoverageChart({
  coverage,
  title = 'Dimension-Level Target Coverage',
  subtitle = 'Measured questions answered against analytical construct saturation targets',
}: CoverageChartProps) {
  if (!coverage || coverage.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500">
        No dimension coverage metrics available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="space-y-4">
        {coverage.map((item, idx) => {
          const isOptimal = item.coverage_percentage >= 90;
          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{item.dimension}</span>
                  {item.attainment_status && (
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.2 rounded flex items-center gap-1 ${
                        isOptimal
                          ? 'text-emerald-700 bg-emerald-50'
                          : 'text-amber-700 bg-amber-50'
                      }`}
                    >
                      {isOptimal ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <AlertCircle className="w-3 h-3" />
                      )}
                      {item.attainment_status.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 font-mono tabular-nums text-slate-600">
                  <span>
                    {item.questions_answered}
                    {item.target_questions ? ` / ${item.target_questions} queries` : ' queries'}
                  </span>
                  <span className="font-bold text-slate-900">{item.coverage_percentage}%</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOptimal ? 'bg-teal-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, item.coverage_percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
