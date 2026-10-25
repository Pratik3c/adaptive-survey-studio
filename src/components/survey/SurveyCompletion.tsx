import { CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface SurveyCompletionProps {
  sessionId?: string;
  topic?: string;
  onRestart?: () => void;
}

export function SurveyCompletion({ sessionId, topic, onRestart }: SurveyCompletionProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm space-y-6">
      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-teal-700">
          Survey Complete
        </span>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Thank you for your valuable feedback!
        </h1>
        {topic && (
          <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
            {topic}
          </p>
        )}
      </div>

      <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
        Your answers have been securely recorded into the adaptive market research model. The research team at <strong>Dentsu Organisation</strong> appreciates your participation.
      </p>

      {sessionId && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs space-y-1">
          <div className="flex items-center gap-1.5 text-slate-700 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Respondent Session Reference:</span>
          </div>
          <code className="block font-mono text-[11px] text-slate-500 truncate">
            {sessionId}
          </code>
        </div>
      )}

      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-3">
        {onRestart && (
          <button
            onClick={onRestart}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>Take Another Session</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
