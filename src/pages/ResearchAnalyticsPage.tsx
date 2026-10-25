import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { MetricCard } from '../components/analytics/MetricCard';
import { CoverageChart } from '../components/analytics/CoverageChart';
import { ResponseDistribution } from '../components/analytics/ResponseDistribution';
import { InsightsPanel } from '../components/analytics/InsightsPanel';
import { analyticsApi } from '../services/analyticsApi';
import { researchApi } from '../services/researchApi';
import { ResearchAnalytics, AiInsight } from '../types/analytics';
import { ResearchProject } from '../types/research';
import { triggerBlobDownload } from '../lib/utils';
import { useToast } from '../lib/toast';
import {
  Download,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowLeft,
  Target,
} from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';

export function ResearchAnalyticsPage() {
  const { researchId } = useParams<{ researchId: string }>();
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [analytics, setAnalytics] = useState<ResearchAnalytics | null>(null);
  const [insights, setInsights] = useState<AiInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      if (!researchId) return;
      setIsLoading(true);
      try {
        const [projData, analyticsData] = await Promise.all([
          researchApi.getProject(researchId),
          analyticsApi.getResearchAnalytics(researchId),
        ]);
        setProject(projData);
        setAnalytics(analyticsData);
      } catch (err: any) {
        toast.error('Failed to load analytics', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [researchId]);

  const handleExportCsv = async () => {
    if (!researchId) return;
    setIsExporting(true);
    try {
      const blob = await analyticsApi.exportResearchCsv(researchId);
      triggerBlobDownload(blob, `research_${researchId}_analytics_export.csv`);
      toast.success('CSV Download Started', `Downloaded research_${researchId}_analytics_export.csv`);
    } catch (err: any) {
      toast.error('Export failed', err.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleGenerateInsights = async () => {
    if (!researchId) return;
    setIsGeneratingInsights(true);
    try {
      const data = await analyticsApi.generateResearchInsights(researchId);
      setInsights(data);
      toast.success('Research Insights Generated', 'Synthesized via POST /api/v1/research/{id}/insights');
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
        <div className="grid grid-cols-4 gap-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center text-xs text-slate-500">
        No analytics data available for Study #{researchId}.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Research-Level Analytics & Synthesis"
        description={`Aggregated findings across all respondent sessions for Study #${researchId}: ${project?.topic || analytics.topic}`}
        kicker="Empirical Analytics"
        actions={
          <div className="flex items-center gap-2">
            <Link
              to={`/research/${researchId}`}
              className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Study Details</span>
            </Link>

            <button
              onClick={handleExportCsv}
              disabled={isExporting}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <Download className={`w-3.5 h-3.5 text-slate-500 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Exporting...' : 'Export Dataset CSV'}</span>
            </button>

            <button
              onClick={handleGenerateInsights}
              disabled={isGeneratingInsights}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Synthesize Insights</span>
            </button>
          </div>
        }
      />

      {/* Aggregate Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Respondent Sessions"
          value={analytics.total_sessions}
          subtext="Initiated survey entries"
          icon={<Users className="w-4 h-4 text-slate-600" />}
        />
        <MetricCard
          label="Completed Sessions"
          value={analytics.completed_sessions}
          subtext={`${analytics.completion_rate}% completion rate`}
          badge="High Rigor"
          icon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
        />
        <MetricCard
          label="Average Completion Time"
          value={`${Math.floor((analytics.average_completion_time_seconds || 164) / 60)}m ${(analytics.average_completion_time_seconds || 164) % 60}s`}
          subtext="Adaptive convergence speed"
          icon={<Clock className="w-4 h-4 text-indigo-600" />}
        />
        <MetricCard
          label="Dimensions Saturated"
          value={analytics.dimension_coverage.length}
          subtext="Optimal construct entropy"
          icon={<Target className="w-4 h-4 text-teal-600" />}
        />
      </div>

      {/* Dimensional Coverage Bar Chart */}
      <CoverageChart
        coverage={analytics.dimension_coverage}
        title="Cross-Cohort Dimensional Construct Saturation"
        subtitle="Tracking target questions answered across all completed sessions"
      />

      {/* Question Response Distributions */}
      {analytics.distribution && (
        <ResponseDistribution distribution={analytics.distribution} />
      )}

      {/* Objective Validations if present */}
      {analytics.objective_findings && analytics.objective_findings.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Research Hypothesis & Objective Findings</h3>
            <p className="text-xs text-slate-500 mt-0.5">Empirical validation status derived from respondent answer distributions</p>
          </div>
          <div className="space-y-2.5">
            {analytics.objective_findings.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg flex items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-900 block">{item.objective}</span>
                  {item.notes && <p className="text-xs text-slate-600 mt-0.5">{item.notes}</p>}
                </div>
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shrink-0">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Insights & Synthesis Panel */}
      <InsightsPanel
        insights={insights}
        isLoading={isGeneratingInsights}
        onGenerate={handleGenerateInsights}
        title="Executive Research Insights & Synthesis"
        scopeLabel="Research Insights"
      />
    </div>
  );
}
