import { AiInsight } from '../../types/analytics';
import { Sparkles, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

interface InsightsPanelProps {
  insights: AiInsight | null;
  isLoading: boolean;
  onGenerate: () => void;
  title?: string;
  scopeLabel?: string;
}

export function InsightsPanel({
  insights,
  isLoading,
  onGenerate,
  title = 'AI Research Insights & Synthesis',
  scopeLabel = 'Research Synthesis',
}: InsightsPanelProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Statistical pattern extraction synthesized by the analytical model
          </p>
        </div>

        <button
          onClick={onGenerate}
          disabled={isLoading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors self-start sm:self-auto disabled:opacity-50 shadow-xs"
        >
          <Sparkles className={`w-3.5 h-3.5 text-teal-400 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Synthesizing Data...' : insights ? 'Regenerate Insights' : `Generate ${scopeLabel}`}</span>
        </button>
      </div>

      {!insights && !isLoading && (
        <div className="p-8 text-center border border-dashed border-slate-200 rounded-xl space-y-2">
          <p className="text-xs text-slate-600">
            No insight synthesis generated yet. Click &quot;Generate {scopeLabel}&quot; to query the analytics engine.
          </p>
        </div>
      )}

      {isLoading && (
        <div className="space-y-4 py-6">
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-slate-200 rounded w-1/3"></div>
            <div className="h-3 bg-slate-100 rounded w-full"></div>
            <div className="h-3 bg-slate-100 rounded w-5/6"></div>
          </div>
        </div>
      )}

      {insights && !isLoading && (
        <div className="space-y-6 pt-2">
          {/* Key Findings */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5 mb-3">
              <CheckCircle className="w-3.5 h-3.5 text-teal-600" /> Key Empirical Findings
            </h4>
            <div className="space-y-2">
              {insights.key_findings.map((finding, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 flex items-start gap-2.5"
                >
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 font-mono">
                    {idx + 1}
                  </span>
                  <p className="leading-relaxed">{finding}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Supporting Evidence */}
          {insights.supporting_evidence && insights.supporting_evidence.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3">
                Supporting Empirical Evidence
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {insights.supporting_evidence.map((item, idx) => {
                  if (typeof item === 'string') {
                    return (
                      <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-700">
                        {item}
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        {item.metric}
                      </span>
                      <span className="text-base font-bold font-mono text-slate-900 block my-0.5">
                        {item.value}
                      </span>
                      {item.context && (
                        <span className="text-[11px] text-slate-500 block truncate">
                          {item.context}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strategic Recommendations if present */}
          {insights.strategic_recommendations && insights.strategic_recommendations.length > 0 && (
            <div className="p-4 bg-teal-50/50 border border-teal-200 rounded-lg">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1.5 mb-2">
                <Lightbulb className="w-3.5 h-3.5 text-teal-700" /> Strategic Action Items
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {insights.strategic_recommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-teal-600 font-bold shrink-0">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Caveats & Limitations */}
          {insights.caveats_and_limitations && insights.caveats_and_limitations.length > 0 && (
            <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Caveats & Analytical Limitations
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {insights.caveats_and_limitations.map((cav, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold shrink-0">!</span>
                    <span>{cav}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Sample reference: N={insights.sample_size || 'N/A'}</span>
            <span>Generated: {new Date(insights.generated_at || Date.now()).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  );
}
