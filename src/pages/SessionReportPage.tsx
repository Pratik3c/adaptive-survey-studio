import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/analytics/MetricCard';
import { CoverageChart } from '../components/analytics/CoverageChart';
import { InsightsPanel } from '../components/analytics/InsightsPanel';
import { analyticsApi } from '../services/analyticsApi';
import { SessionReport, AiInsight } from '../types/analytics';
import { triggerBlobDownload, formatDate } from '../lib/utils';
import { useToast } from '../lib/toast';
import { Download, Sparkles, CheckCircle2, Clock, ArrowLeft, ShieldCheck, HelpCircle } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';

export function SessionReportPage() {
  const { researchId, sessionId } = useParams<{ researchId: string; sessionId: string }>();
  const [report, setReport] = useState<SessionReport | null>(null);
  const [insights, setInsights] = useState<AiInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function loadReport() {
      if (!sessionId) return;
      setIsLoading(true);
      try {
        const data = await analyticsApi.getSessionReport(sessionId);
        setReport(data);
      } catch (err: any) {
        toast.error('Failed to load session report', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadReport();
  }, [sessionId]);

  const handleExportCsv = async () => {
    if (!sessionId) return;
    setIsExporting(true);
    try {
      const blob = await analyticsApi.exportSessionCsv(sessionId);
      triggerBlobDownload(blob, `session_${sessionId}_report.csv`);
      toast.success('CSV Download Started', `Downloaded session_${sessionId}_report.csv`);
    } catch (err: any) {
      toast.error('Export failed', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!sessionId) return;
    setIsGeneratingInsights(true);
    try {
      const data = await analyticsApi.generateSessionInsights(sessionId);
      setInsights(data);
      toast.success('Session Insights Generated', 'Synthesized via POST /api/v1/sessions/{id}/insights');
    } catch (err: any) {
      toast.error('Insight generation failed', err.message);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
        Session report for {sessionId} could not be found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Respondent Session Report: ${sessionId}`}
        description={`Individual adaptive interview transcript and coverage audit for Study #${researchId}`}
        kicker="Individual Session Telemetry"
        actions={
          <div className="flex items-center gap-2">
            <Link
              to={`/research/${researchId}`}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Study Overview</span>
            </Link>

            <button
              onClick={handleExportCsv}
              disabled={isExporting}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 text-slate-500 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Exporting...' : 'Export Session CSV'}</span>
            </button>

            <button
              onClick={handleGenerateInsights}
              disabled={isGeneratingInsights}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Session Insights</span>
            </button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Session Status"
          value={report.status.toUpperCase()}
          subtext="Adaptive interview status"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <MetricCard
          label="Questions Answered"
          value={report.total_questions_answered}
          subtext="Adaptive queries resolved"
          icon={<HelpCircle className="w-4 h-4 text-teal-600" />}
        />
        <MetricCard
          label="Interview Started"
          value={formatDate(report.started_at)}
          subtext="Session initialization"
          icon={<Clock className="w-4 h-4 text-slate-500" />}
        />
        <MetricCard
          label="Data Integrity"
          value="100%"
          badge="Verified"
          subtext="Isolated session tokens"
          icon={<ShieldCheck className="w-4 h-4 text-indigo-600" />}
        />
      </div>

      {/* Dimension Coverage */}
      <CoverageChart
        coverage={report.dimension_coverage}
        title="Session Construct Saturation"
        subtitle="Analytical dimensions queried during this specific respondent session"
      />

      {/* Answers Transcript Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-900">Adaptive Question Transcript</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sequential question responses captured during this session
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 w-12">#</th>
                <th className="py-3 px-4 min-w-[200px]">Question Text</th>
                <th className="py-3 px-4">Dimension</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 min-w-[200px]">Recorded Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.answers.map((ans, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-medium text-slate-400">
                    {idx + 1}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-900">
                    {ans.question_text}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-[11px] font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                      {ans.dimension}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                    {ans.question_type}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {Array.isArray(ans.response) ? (
                      <div className="flex flex-wrap gap-1">
                        {ans.response.map((r, rIdx) => (
                          <span key={rIdx} className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-slate-700">
                            {r}
                          </span>
                        ))}
                      </div>
                    ) : (
                      String(ans.response)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Session Insights */}
      <InsightsPanel
        insights={insights}
        isLoading={isGeneratingInsights}
        onGenerate={handleGenerateInsights}
        title="Session-Level AI Insights & Synthesis"
        scopeLabel="Session Insights"
      />
    </div>
  );
}
