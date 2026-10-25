import { useState } from 'react';
import { Copy, Check, ExternalLink, Share2, Info, Power, AlertTriangle } from 'lucide-react';
import { useToast } from '../../lib/toast';
import { researchApi } from '../../services/researchApi';

interface SurveyShareCardProps {
  researchId: number | string;
  topic?: string;
  status?: string;
  surveySessionId?: string;
  onStatusChange?: (newStatus: 'active' | 'not_active') => void;
}

export function SurveyShareCard({
  researchId,
  topic,
  status = 'active',
  surveySessionId,
  onStatusChange,
}: SurveyShareCardProps) {
  const [copied, setCopied] = useState(false);
  const initialActive = status === 'active' || status === 'survey_active';
  const [currentStatus, setCurrentStatus] = useState<'active' | 'not_active'>(
    initialActive ? 'active' : 'not_active'
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const toast = useToast();

  const isActive = currentStatus === 'active';

  const publicUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/s/${researchId}`
    : `http://localhost:3000/s/${researchId}`;

  const handleToggleStatus = async (newStatus: 'active' | 'not_active') => {
    if (newStatus === currentStatus || isUpdating) return;
    setIsUpdating(true);
    try {
      await researchApi.updateProjectStatus(researchId, newStatus);
      setCurrentStatus(newStatus);
      onStatusChange?.(newStatus);
      if (newStatus === 'active') {
        toast.success('Survey Activated', 'Public link is now active and accepting responses.');
      } else {
        toast.info('Survey Deactivated', 'Public link is now closed. Respondents will see the survey inactive notice.');
      }
    } catch (err: any) {
      toast.error('Failed to update survey status', err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      if (isActive) {
        toast.success('Public Survey Link Copied', publicUrl);
      } else {
        toast.info('Link Copied (Survey Inactive)', 'Note: The survey is currently Not Active. Respondents will see the survey closed notice.');
      }
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Failed to copy', 'Please manually highlight and copy the link.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Header and Status Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-teal-600" />
            <h3 className="text-sm font-bold text-slate-900">Public Survey Distribution</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Permanent, reusable public entry link for Study #{researchId}
          </p>
        </div>

        {/* Active / Not Active Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-slate-100 p-1 rounded-lg border border-slate-200">
          <span className="text-[11px] font-semibold text-slate-600 px-2 flex items-center gap-1">
            <Power className="w-3 h-3 text-slate-400" /> Survey Status:
          </span>
          <button
            type="button"
            onClick={() => handleToggleStatus('active')}
            disabled={isUpdating}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              isActive
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active
          </button>
          <button
            type="button"
            onClick={() => handleToggleStatus('not_active')}
            disabled={isUpdating}
            className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              !isActive
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Not Active
          </button>
        </div>
      </div>

      {topic && (
        <div className="text-xs text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 flex items-center justify-between">
          <div>
            <span className="font-semibold text-slate-900">Study: </span>
            <span>{topic}</span>
          </div>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isActive
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-slate-200 text-slate-700'
            }`}
          >
            {isActive ? 'Accepting Responses' : 'Responses Paused'}
          </span>
        </div>
      )}

      {/* Inactive Alert Banner */}
      {!isActive && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-amber-900">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Survey is currently Not Active.</strong> The public link will not accept responses until set to Active. Respondents opening this link will see the survey closed notice.
          </p>
        </div>
      )}

      {/* URL Input with Copy & Open */}
      <div className="space-y-2">
        <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-600">
          Reusable Respondent URL
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className={`flex-1 px-3.5 py-2.5 text-xs font-mono border rounded-lg focus:outline-none ${
              isActive
                ? 'bg-slate-50 border-slate-300 text-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-400 line-through'
            }`}
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Link'}</span>
          </button>
          <a
            href={`/s/${researchId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors shrink-0"
            title="Open survey in new tab"
          >
            <span>{isActive ? 'Preview' : 'Test Inactive Page'}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>
      </div>

      {/* Lifecycle Guarantee Notice */}
      <div className="flex items-start gap-2.5 p-3 rounded-lg bg-teal-50/60 border border-teal-200/70 text-xs text-slate-700">
        <Info className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
        <div className="space-y-1 text-[11px]">
          <p className="font-semibold text-teal-900">
            Session Lifecycle & Respondent Isolation
          </p>
          <p className="text-slate-600 leading-relaxed">
            When set to <strong>Active</strong>, every respondent opening this link automatically initiates a fresh respondent session with its own isolated question trajectory. If set to <strong>Not Active</strong>, the survey engine rejects new sessions and responses.
          </p>
        </div>
      </div>

      {/* Share instructions */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <span>Distribute via Email campaigns, WhatsApp groups, or Panel aggregators.</span>
        <span className="font-mono text-[10px] text-slate-400">Target ID: {researchId}</span>
      </div>
    </div>
  );
}
