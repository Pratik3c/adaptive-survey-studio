import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { SurveyShareCard } from '../components/research/SurveyShareCard';
import { researchApi } from '../services/researchApi';
import { ResearchProject } from '../types/research';
import { useToast } from '../lib/toast';
import { Send, RefreshCw, ArrowLeft } from 'lucide-react';
import { Skeleton } from '../components/common/Skeleton';

export function SurveySetupPage() {
  const { researchId } = useParams<{ researchId: string }>();
  const [project, setProject] = useState<ResearchProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [maxQuestions, setMaxQuestions] = useState<number>(10);
  const toast = useToast();

  useEffect(() => {
    async function load() {
      if (!researchId) return;
      setIsLoading(true);
      try {
        const data = await researchApi.getProject(researchId);
        setProject(data);
        if (data?.max_questions) setMaxQuestions(data.max_questions);
      } catch (err) {
        console.error('Failed to load project', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [researchId]);

  const handleRegenerate = async () => {
    if (!project) return;
    setIsGenerating(true);
    try {
      const response = await researchApi.generateSurvey({
        research_id: project.id,
        topic: project.topic,
        target_audience: project.target_audience,
        geography: project.geography,
        dimensions: project.dimensions,
        research_plan: (project.research_plan as unknown) as Record<string, unknown> || {},
        max_questions: maxQuestions,
      });

      const updated = await researchApi.getProject(project.id);
      setProject(updated);
      toast.success('Adaptive Survey Model Updated', `Session ID: ${response.session_id}`);
    } catch (err: any) {
      toast.error('Survey compilation failed', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
        <p className="text-sm text-slate-600 mb-4">Study not found.</p>
        <Link to="/research" className="text-xs font-semibold text-teal-700">
          Back to studies
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Adaptive Survey Configuration & Distribution"
        description={`Configure parameters and monitor public distribution for Study #${project.id}`}
        kicker="Survey Engine"
        actions={
          <Link
            to={`/research/${project.id}`}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Overview</span>
          </Link>
        }
      />

      <SurveyShareCard
        researchId={project.id}
        topic={project.topic}
        status={project.status}
        surveySessionId={project.survey_session_id}
        onStatusChange={(newStatus) => {
          setProject((prev) => (prev ? { ...prev, status: newStatus } : null));
        }}
      />

      {/* Model Re-Compilation Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Adaptive Parameter Tuning</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Update maximum question ceilings or re-invoke <code className="font-mono text-slate-700 font-semibold">POST /api/v1/llm/sessions</code> to rebuild the distribution session.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Maximum Questions Limit
            </label>
            <input
              type="number"
              min={3}
              max={30}
              value={maxQuestions}
              onChange={(e) => setMaxQuestions(Math.max(3, parseInt(e.target.value) || 10))}
              className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Current setting: {project.max_questions || 10} questions max
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Active Dimensions Covered
            </label>
            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 truncate">
              {project.dimensions?.join(' · ')}
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={handleRegenerate}
            disabled={isGenerating}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Compiling Model...' : 'Recompile Adaptive Survey'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
