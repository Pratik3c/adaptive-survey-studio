import { ResearchPlan } from '../../types/research';
import { Target, Lightbulb, Layers, BarChart3, ArrowRight, ArrowLeft } from 'lucide-react';

interface ResearchPlanViewerProps {
  plan: ResearchPlan;
  onProceed: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function ResearchPlanViewer({ plan, onProceed, onBack, isLoading }: ResearchPlanViewerProps) {
  const hasObjectives = plan.objectives && plan.objectives.length > 0;
  const hasHypotheses = plan.hypotheses && plan.hypotheses.length > 0;
  const hasConstructs = plan.constructs && plan.constructs.length > 0;
  const hasKeyMetrics = plan.key_metrics && plan.key_metrics.length > 0;

  return (
    <div className="space-y-6 bg-white p-6 md:p-8 rounded-xl border border-slate-200">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Step 2: Generated Research Plan</h2>
            <p className="text-xs text-slate-500 mt-1">
              Engineered via <code className="font-mono text-slate-700 font-semibold">POST /api/v1/llm/research-plan</code>. Review objectives, hypotheses, and operational constructs.
            </p>
          </div>
          <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-md">
            Plan Ready
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Objectives Section */}
        {hasObjectives && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-teal-600" />
              <span>Core Research Objectives</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {plan.objectives!.map((obj, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{obj}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Hypotheses Section */}
        {hasHypotheses && (
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-600" />
              <span>Theoretical Hypotheses to Validate</span>
            </h3>
            <ul className="space-y-2 text-xs text-slate-700">
              {plan.hypotheses!.map((hypo, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="text-teal-700 font-semibold shrink-0">H{i + 1}.</span>
                  <span className="leading-relaxed">{hypo.replace(/^H\d+:\s*/, '')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Operational Constructs */}
        {hasConstructs && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2 mb-3">
              <Layers className="w-4 h-4 text-slate-700" />
              <span>Dimensional Constructs & Measurable Variables</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plan.constructs!.map((c, i) => (
                <div key={i} className="p-3.5 bg-white border border-slate-200 rounded-lg shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900">{c.dimension}</span>
                    {c.suggested_question_types && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {c.suggested_question_types.join(', ')}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">{c.description}</p>
                  {c.measurable_variables && c.measurable_variables.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {c.measurable_variables.map((v, vIdx) => (
                        <span key={vIdx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                          {v}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics and Methodology */}
        {(hasKeyMetrics || plan.methodology_notes) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hasKeyMetrics && (
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 mb-2">
                  <BarChart3 className="w-3.5 h-3.5 text-slate-600" /> Key Output Metrics
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {plan.key_metrics!.map((metric, idx) => (
                    <span key={idx} className="text-xs font-medium text-slate-800 bg-white border border-slate-200 px-2.5 py-1 rounded">
                      {metric}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {plan.methodology_notes && (
              <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Adaptive Methodology
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {plan.methodology_notes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Edit Brief</span>
        </button>

        <button
          type="button"
          onClick={onProceed}
          disabled={isLoading}
          className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <span>{isLoading ? 'Configuring Model...' : 'Accept Plan & Configure Survey'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
