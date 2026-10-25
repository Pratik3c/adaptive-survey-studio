import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { ResearchForm } from '../components/research/ResearchForm';
import { ResearchPlanViewer } from '../components/research/ResearchPlanViewer';
import { SurveyConfiguration } from '../components/research/SurveyConfiguration';
import { SurveyShareCard } from '../components/research/SurveyShareCard';
import { researchApi } from '../services/researchApi';
import { ResearchProject, ResearchPlan } from '../types/research';
import { useToast } from '../lib/toast';
import { Check } from 'lucide-react';

export function CreateResearchPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [projectData, setProjectData] = useState<Partial<ResearchProject>>({
    topic: 'Instant self-heating hot chocolate market assessment',
    target_audience: 'College students and young professionals aged 18–26',
    geography: 'Tier 1 and Tier 2 cities in India',
    dimensions: [
      'Product Interest',
      'Purchase Intent',
      'Price Sensitivity',
      'Safety Perception',
      'Consumption Occasions',
    ],
  });

  const [researchPlan, setResearchPlan] = useState<ResearchPlan | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<number | string>(1);
  const [createdSessionId, setCreatedSessionId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 1: Brief Submitted -> Call createProject and POST /api/v1/llm/research-plan
  const handleBriefSubmit = async (values: {
    topic: string;
    target_audience: string;
    geography: string;
    dimensions: string[];
  }) => {
    setIsLoading(true);
    try {
      // 1. Create or register the research project
      const project = await researchApi.createProject(values);
      setProjectData(project);
      setCreatedProjectId(project.id);

      // 2. Call POST /api/v1/llm/research-plan
      const plan = await researchApi.generateResearchPlan({
        research_id: project.id,
        topic: values.topic,
        target_audience: values.target_audience,
        geography: values.geography,
        dimensions: values.dimensions,
      });

      setResearchPlan(plan);
      setStep(2);
      toast.success('Research Plan Generated', 'Synthesized via POST /api/v1/llm/research-plan');
    } catch (err: any) {
      toast.error('Failed to generate research plan', err.message || 'Check API backend connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Accept Plan -> Proceed to Survey Configuration
  const handlePlanAccepted = () => {
    setStep(3);
  };

  // Step 3: Configure Survey -> Call POST /api/v1/llm/sessions
  const handleGenerateSurvey = async (maxQuestions: number) => {
    if (!researchPlan) return;
    setIsLoading(true);

    try {
      const response = await researchApi.generateSurvey({
        research_id: createdProjectId,
        topic: projectData.topic || '',
        target_audience: projectData.target_audience || '',
        geography: projectData.geography || '',
        dimensions: projectData.dimensions || [],
        research_plan: (researchPlan as unknown) as Record<string, unknown>,
        max_questions: maxQuestions,
      });

      const sessionId = response.session_id || response.survey_session_id || `gen-${createdProjectId}`;
      setCreatedSessionId(sessionId);
      setStep(4);
      toast.success('Adaptive Survey Model Compiled', `Session ${sessionId} created via POST /api/v1/llm/sessions`);
    } catch (err: any) {
      toast.error('Survey generation failed', err.message || 'Check API backend connectivity.');
    } finally {
      setIsLoading(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Research Brief' },
    { num: 2, title: 'Plan Synthesis' },
    { num: 3, title: 'Adaptive Config' },
    { num: 4, title: 'Public Distribution' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Adaptive Research Study"
        description="Define analytical scope, synthesize theoretical framework, and compile the adaptive survey model."
        kicker="New Study Pipeline"
      />

      {/* Stepper Progress Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {stepsList.map((s, idx) => {
            const isCompleted = step > s.num;
            const isCurrent = step === s.num;

            return (
              <div key={s.num} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-teal-600 text-white'
                      : isCurrent
                      ? 'bg-slate-900 text-white ring-4 ring-slate-100'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : s.num}
                </div>
                <span
                  className={`text-xs font-medium hidden sm:inline ${
                    isCurrent ? 'text-slate-900 font-semibold' : 'text-slate-500'
                  }`}
                >
                  {s.title}
                </span>
                {idx < stepsList.length - 1 && (
                  <div className="w-6 sm:w-12 h-px bg-slate-200 mx-1 sm:mx-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      {step === 1 && (
        <ResearchForm
          initialValues={{
            topic: projectData.topic || '',
            target_audience: projectData.target_audience || '',
            geography: projectData.geography || '',
            dimensions: projectData.dimensions || [],
          }}
          onSubmit={handleBriefSubmit}
          isLoading={isLoading}
        />
      )}

      {step === 2 && researchPlan && (
        <ResearchPlanViewer
          plan={researchPlan}
          onProceed={handlePlanAccepted}
          onBack={() => setStep(1)}
          isLoading={isLoading}
        />
      )}

      {step === 3 && researchPlan && (
        <SurveyConfiguration
          project={projectData}
          plan={researchPlan}
          onGenerate={handleGenerateSurvey}
          onBack={() => setStep(2)}
          isLoading={isLoading}
        />
      )}

      {step === 4 && (
        <div className="space-y-6">
          <SurveyShareCard
            researchId={createdProjectId}
            topic={projectData.topic}
            status="active"
            surveySessionId={createdSessionId}
          />

          <div className="flex justify-end gap-3">
            <button
              onClick={() => navigate(`/research/${createdProjectId}`)}
              className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              Go to Study Overview
            </button>
            <button
              onClick={() => navigate(`/research/${createdProjectId}/analytics`)}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
            >
              Open Analytics Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
