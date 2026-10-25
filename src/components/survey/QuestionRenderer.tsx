import { useState, useEffect } from 'react';
import { AdaptiveQuestion, QuestionOption } from '../../types/survey';
import { Check, ChevronUp, ChevronDown } from 'lucide-react';

interface QuestionRendererProps {
  question: AdaptiveQuestion;
  onAnswerChange: (answer: any, isValid: boolean) => void;
}

export function QuestionRenderer({ question, onAnswerChange }: QuestionRendererProps) {
  const [selectedSingle, setSelectedSingle] = useState<string>('');
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [likertValue, setLikertValue] = useState<number | null>(null);
  const [numericValue, setNumericValue] = useState<string>('');
  const [priceValue, setPriceValue] = useState<string>('');
  const [textValue, setTextValue] = useState<string>('');
  const [rankedItems, setRankedItems] = useState<string[]>([]);

  // Reset internal state when question changes
  useEffect(() => {
    setSelectedSingle('');
    setSelectedMultiple([]);
    setLikertValue(null);
    setNumericValue('');
    setPriceValue('');
    setTextValue('');

    // If ranking question, initialize items in original order
    if (question.type === 'ranking' && question.options) {
      const items = question.options.map((opt) => (typeof opt === 'string' ? opt : opt.label || opt.value));
      setRankedItems(items);
      onAnswerChange(items, true);
    } else {
      onAnswerChange(null, false);
    }
  }, [question.question_id, question.type]);

  // Normalize options safely
  const options: QuestionOption[] = (question.options || []).map((opt) => {
    if (typeof opt === 'string') {
      return { value: opt, label: opt };
    }
    return {
      value: String(opt.value ?? opt.label),
      label: opt.label || String(opt.value),
      description: opt.description,
    };
  });

  // Handle Single Choice
  const handleSingleSelect = (val: string) => {
    setSelectedSingle(val);
    onAnswerChange(val, true);
  };

  // Handle Multiple Choice
  const handleMultipleToggle = (val: string) => {
    const next = selectedMultiple.includes(val)
      ? selectedMultiple.filter((v) => v !== val)
      : [...selectedMultiple, val];
    setSelectedMultiple(next);
    onAnswerChange(next, next.length > 0);
  };

  // Handle Likert
  const handleLikertSelect = (val: number) => {
    setLikertValue(val);
    onAnswerChange(val, true);
  };

  // Handle Numeric
  const handleNumericChange = (valStr: string) => {
    setNumericValue(valStr);
    const num = parseFloat(valStr);
    const isValid = !isNaN(num) && (question.min_value === undefined || num >= question.min_value);
    onAnswerChange(num, isValid);
  };

  // Handle Price Input
  const handlePriceChange = (valStr: string) => {
    setPriceValue(valStr);
    const num = parseFloat(valStr);
    const isValid = !isNaN(num) && num > 0;
    onAnswerChange(num, isValid);
  };

  // Handle Short Text
  const handleTextChange = (val: string) => {
    setTextValue(val);
    const isValid = question.is_required === false ? true : val.trim().length > 0;
    onAnswerChange(val.trim(), isValid);
  };

  // Handle Ranking Move
  const moveRank = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= rankedItems.length) return;
    const newItems = [...rankedItems];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);
    setRankedItems(newItems);
    onAnswerChange(newItems, true);
  };

  return (
    <div className="space-y-6">
      {/* Question Header */}
      <div>
        {question.dimension && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700 bg-teal-50 border border-teal-200/80 px-2 py-0.5 rounded mb-2 inline-block">
            {question.dimension}
          </span>
        )}
        <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
          {question.text}
        </h2>
        {question.type === 'multiple_choice' && (
          <p className="text-xs text-slate-500 mt-1">Select all options that apply</p>
        )}
        {question.type === 'ranking' && (
          <p className="text-xs text-slate-500 mt-1">Use the arrow buttons to prioritize in order of importance</p>
        )}
      </div>

      {/* Answer Controls */}
      <div className="pt-2">
        {/* SINGLE CHOICE */}
        {question.type === 'single_choice' && (
          <div className="space-y-2.5">
            {options.map((opt) => {
              const isSelected = selectedSingle === opt.value || selectedSingle === opt.label;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => handleSingleSelect(opt.label || opt.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-teal-600 bg-teal-50/50 text-slate-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full border mt-0.5 shrink-0 flex items-center justify-center ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block">{opt.label}</span>
                    {opt.description && (
                      <span className="text-xs text-slate-500 mt-0.5 block">{opt.description}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* MULTIPLE CHOICE */}
        {question.type === 'multiple_choice' && (
          <div className="space-y-2.5">
            {options.map((opt) => {
              const isChecked = selectedMultiple.includes(opt.label || opt.value);
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => handleMultipleToggle(opt.label || opt.value)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3 ${
                    isChecked
                      ? 'border-teal-600 bg-teal-50/50 text-slate-900 shadow-xs'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center ${
                      isChecked
                        ? 'border-teal-600 bg-teal-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block">{opt.label}</span>
                    {opt.description && (
                      <span className="text-xs text-slate-500 mt-0.5 block">{opt.description}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* LIKERT SCALE */}
        {question.type === 'likert' && (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((val) => {
                const isSelected = likertValue === val;
                return (
                  <button
                    type="button"
                    key={val}
                    onClick={() => handleLikertSelect(val)}
                    className={`py-4 px-2 sm:px-4 rounded-xl border flex flex-col items-center justify-center transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-600 text-white shadow-xs scale-102'
                        : 'border-slate-200 bg-white hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <span className="text-base sm:text-lg font-bold font-mono">{val}</span>
                  </button>
                );
              })}
            </div>

            {/* Min and Max scale labels */}
            <div className="flex justify-between items-center text-xs text-slate-500 px-1">
              <span>{question.scale_labels?.min || '1 — Strongly Disagree / Low'}</span>
              <span>{question.scale_labels?.max || '5 — Strongly Agree / High'}</span>
            </div>
          </div>
        )}

        {/* PRICE INPUT */}
        {question.type === 'price_input' && (
          <div className="space-y-4">
            <div className="relative max-w-sm">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-sm font-semibold text-slate-500">
                {question.currency_symbol || '₹'}
              </span>
              <input
                type="number"
                min={question.min_value || 1}
                max={question.max_value || 5000}
                step={question.step || 5}
                value={priceValue}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="120"
                className="w-full pl-8 pr-4 py-3 text-lg font-semibold font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900"
              />
            </div>

            {/* Quick price presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
              <span className="text-slate-400">Quick suggestions:</span>
              {[99, 129, 149, 199].map((amt) => (
                <button
                  type="button"
                  key={amt}
                  onClick={() => handlePriceChange(String(amt))}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded-md font-mono text-slate-700 transition-colors"
                >
                  {question.currency_symbol || '₹'}{amt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* NUMERIC */}
        {question.type === 'numeric' && (
          <div className="max-w-sm">
            <input
              type="number"
              value={numericValue}
              min={question.min_value}
              max={question.max_value}
              step={question.step || 1}
              onChange={(e) => handleNumericChange(e.target.value)}
              placeholder="Enter number..."
              className="w-full px-4 py-3 text-base font-mono border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900"
            />
          </div>
        )}

        {/* SHORT TEXT */}
        {question.type === 'short_text' && (
          <div className="space-y-2">
            <textarea
              rows={3}
              value={textValue}
              onChange={(e) => handleTextChange(e.target.value)}
              placeholder={question.placeholder || 'Type your thoughtful response here...'}
              className="w-full px-4 py-3 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 text-slate-900 resize-none"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Press Continue when finished</span>
              <span className="font-mono">{textValue.length} characters</span>
            </div>
          </div>
        )}

        {/* RANKING */}
        {question.type === 'ranking' && (
          <div className="space-y-2">
            {rankedItems.map((item, idx) => (
              <div
                key={item}
                className="flex items-center justify-between p-3.5 bg-white border border-slate-200 rounded-xl shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 font-bold font-mono text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="text-sm font-medium text-slate-800">{item}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveRank(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    aria-label="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveRank(idx, 'down')}
                    disabled={idx === rankedItems.length - 1}
                    className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 transition-colors"
                    aria-label="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
