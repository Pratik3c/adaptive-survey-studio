import { ResponseDistributionItem } from '../../types/analytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

interface ResponseDistributionProps {
  distribution: ResponseDistributionItem[];
}

export function ResponseDistribution({ distribution }: ResponseDistributionProps) {
  if (!distribution || distribution.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 text-center text-xs text-slate-500">
        No response distribution data available yet.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Aggregate Response Distributions</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Breakdowns across respondent answers gathered via adaptive question triggers
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {distribution.map((item) => (
          <div
            key={item.question_id}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
          >
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  {item.dimension}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {item.total_answers} answers
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                {item.question_text}
              </h4>
            </div>

            {/* If Option Breakdown is present, render bar chart */}
            {item.options_breakdown && item.options_breakdown.length > 0 && (
              <div className="h-48 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={item.options_breakdown}
                    margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                  >
                    <XAxis type="number" domain={[0, 100]} unit="%" tick={{ fontSize: 10, fill: '#64748b' }} />
                    <YAxis
                      type="category"
                      dataKey="label"
                      width={120}
                      tick={{ fontSize: 10, fill: '#334155' }}
                      tickFormatter={(val) => (val.length > 20 ? `${val.substring(0, 18)}...` : val)}
                    />
                    <Tooltip
                      formatter={(val: any) => [`${val}%`, 'Respondent Share']}
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="percentage" fill="#0d9488" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* If Numeric Stats is present, render summary metrics */}
            {item.numeric_stats && (
              <div className="pt-2">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">Mean</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      ₹{item.numeric_stats.mean.toFixed(1)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">Median</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      ₹{item.numeric_stats.median.toFixed(1)}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">Min</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      ₹{item.numeric_stats.min}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] uppercase font-semibold text-slate-400">Max</span>
                    <span className="text-sm font-bold font-mono text-slate-900">
                      ₹{item.numeric_stats.max}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
