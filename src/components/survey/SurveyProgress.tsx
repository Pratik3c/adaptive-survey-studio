interface SurveyProgressProps {
  currentNumber: number;
  totalEstimate?: number;
  dimension?: string;
}

export function SurveyProgress({ currentNumber, totalEstimate, dimension }: SurveyProgressProps) {
  // If no total estimate provided by backend, calculate dynamic reasonable estimate
  const total = totalEstimate || Math.max(currentNumber + 1, 7);
  const percent = Math.min(100, Math.round((currentNumber / total) * 100));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
        <span className="font-mono">
          Question <strong className="text-slate-900">{currentNumber}</strong>
          {totalEstimate ? ` of ~${totalEstimate}` : ''}
        </span>
        {dimension && (
          <span className="text-[11px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-medium truncate max-w-[200px]">
            {dimension}
          </span>
        )}
      </div>

      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-teal-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
