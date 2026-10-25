import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { surveyApi } from '../services/surveyApi';
import { researchApi } from '../services/researchApi';
import { AdaptiveQuestion, NextQuestionResponse } from '../types/survey';
import { ResearchProject } from '../types/research';
import { QuestionRenderer } from '../components/survey/QuestionRenderer';
import { SurveyProgress } from '../components/survey/SurveyProgress';
import { SurveyCompletion } from '../components/survey/SurveyCompletion';
import { ArrowRight, RefreshCw, AlertCircle, Shield, PauseCircle } from 'lucide-react';

export function PublicSurveyPage() {
  const { researchId } = useParams<{ researchId: string }>();

  const [project, setProject] = useState<ResearchProject | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<AdaptiveQuestion | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [totalEstimate, setTotalEstimate] = useState<number | undefined>(undefined);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isInactive, setIsInactive] = useState<boolean>(false);

  const [currentAnswer, setCurrentAnswer] = useState<any>(null);
  const [isAnswerValid, setIsAnswerValid] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Track time spent on question
  const questionStartTimeRef = useRef<number>(Date.now());
  const initStartedRef = useRef<boolean>(false);

  // Initialize or resume respondent session
  useEffect(() => {
    if (!researchId || initStartedRef.current) return;
    initStartedRef.current = true;

    async function initializeSurvey() {
      setIsLoading(true);
      setErrorMessage(null);
      setIsInactive(false);

      if (!researchId) return;
      try {
        // Fetch project metadata for title and branding
        const proj = await researchApi.getProject(researchId);
        setProject(proj);
        if (proj?.max_questions) setTotalEstimate(proj.max_questions);

        // Check if survey is active - if not, block access completely!
        const isProjectActive = proj && (proj.status === 'active' || proj.status === 'survey_active');
        if (proj && !isProjectActive) {
          setIsInactive(true);
          setIsLoading(false);
          return;
        }

        // Check for session storage to survive refresh
        const storageKey = `pm_respondent_sess_${researchId}`;
        let activeSessionId = sessionStorage.getItem(storageKey);

        if (!activeSessionId) {
          // Acquire NEW respondent session
          const session = await surveyApi.createRespondentSession(researchId);
          activeSessionId = session.session_id;
          sessionStorage.setItem(storageKey, activeSessionId);
        }

        setSessionId(activeSessionId);

        // Fetch first question
        await loadNextQuestion(activeSessionId);
      } catch (err: any) {
        console.error('Initialization error', err);
        setErrorMessage(
          err.message || 'Unable to connect to the survey engine. Please verify the link or try again.'
        );
      } finally {
        setIsLoading(false);
      }
    }

    initializeSurvey();
  }, [researchId]);

  const loadNextQuestion = async (sessId: string) => {
    try {
      const resp: NextQuestionResponse = await surveyApi.getNextQuestion(sessId);

      if (resp.is_completed || resp.status === 'completed') {
        setIsCompleted(true);
        // Clear active session upon completion
        if (researchId) sessionStorage.removeItem(`pm_respondent_sess_${researchId}`);
        return;
      }

      const q = resp.question || (resp.question_id ? (resp as AdaptiveQuestion) : null);

      if (!q || !q.text) {
        setIsCompleted(true);
        if (researchId) sessionStorage.removeItem(`pm_respondent_sess_${researchId}`);
        return;
      }

      setCurrentQuestion(q);
      if (q.question_number) setQuestionCount(q.question_number);
      if (q.total_estimate) setTotalEstimate(q.total_estimate);
      questionStartTimeRef.current = Date.now();
      setCurrentAnswer(null);
      setIsAnswerValid(false);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to fetch the next question from the backend.');
    }
  };

  const handleAnswerChange = (answer: any, isValid: boolean) => {
    setCurrentAnswer(answer);
    setIsAnswerValid(isValid);
  };

  const handleContinue = async () => {
    if (!sessionId || !currentQuestion || !isAnswerValid) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    const timeSpentMs = Date.now() - questionStartTimeRef.current;

    try {
      const result = await surveyApi.submitResponse(sessionId, {
        question_id: currentQuestion.question_id,
        answer: currentAnswer,
        dimension: currentQuestion.dimension,
        time_spent_ms: timeSpentMs,
      });

      if (result.is_completed) {
        setIsCompleted(true);
        if (researchId) sessionStorage.removeItem(`pm_respondent_sess_${researchId}`);
      } else {
        setQuestionCount((prev) => prev + 1);
        await loadNextQuestion(sessionId);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit response. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartFreshSession = async () => {
    if (!researchId) return;
    setIsLoading(true);
    setErrorMessage(null);
    setIsCompleted(false);
    setQuestionCount(1);
    sessionStorage.removeItem(`pm_respondent_sess_${researchId}`);

    try {
      const session = await surveyApi.createRespondentSession(researchId);
      setSessionId(session.session_id);
      sessionStorage.setItem(`pm_respondent_sess_${researchId}`, session.session_id);
      await loadNextQuestion(session.session_id);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between selection:bg-teal-500 selection:text-white">
      {/* Public Header */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white overflow-hidden p-0.5 border border-slate-200 shadow-xs flex items-center justify-center">
            <img
              src="/src/assets/images/logo.png"
              alt="Dentsu Organisation Logo"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 tracking-tight block">
              Dentsu Research Studio
            </span>
            <span className="text-[10px] text-teal-700 font-medium block">
              Dentsu Organisation
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Shield className="w-3.5 h-3.5 text-teal-600" />
          <span className="hidden sm:inline">Verified Research Inquiry</span>
        </div>
      </header>

      {/* Main Survey Viewport */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-xl mx-auto">
          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-4">
              <RefreshCw className="w-6 h-6 text-teal-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-600 font-medium">
                Initializing adaptive survey session...
              </p>
            </div>
          )}

          {/* Inactive Survey State */}
          {!isLoading && isInactive && (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-xs space-y-5 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
                <PauseCircle className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Survey Currently Not Active
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Responses Are Not Being Accepted
                </h1>
                {project?.topic && (
                  <p className="text-xs text-slate-500 font-medium max-w-sm mx-auto">
                    {project.topic}
                  </p>
                )}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                This research survey is currently set to <strong>Not Active</strong> by the study team at <strong>Dentsu Organisation</strong>. Access and response collection are paused.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Check Availability</span>
                </button>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && !isInactive && errorMessage && (
            <div className="bg-white rounded-2xl border border-rose-200 p-6 sm:p-8 shadow-xs space-y-4 text-center">
              <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Survey Engine Notice</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">{errorMessage}</p>
              </div>
              <div className="flex justify-center gap-3 pt-2">
                <button
                  onClick={handleStartFreshSession}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  Retry Session
                </button>
              </div>
            </div>
          )}

          {/* Completed State */}
          {!isLoading && !errorMessage && isCompleted && (
            <SurveyCompletion
              sessionId={sessionId || undefined}
              topic={project?.topic}
              onRestart={handleStartFreshSession}
            />
          )}

          {/* Active Question State */}
          {!isLoading && !isInactive && !errorMessage && !isCompleted && currentQuestion && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-xs space-y-6">
              {/* Progress */}
              <SurveyProgress
                currentNumber={questionCount}
                totalEstimate={totalEstimate}
                dimension={currentQuestion.dimension}
              />

              {/* Dynamic Question Renderer */}
              <QuestionRenderer
                question={currentQuestion}
                onAnswerChange={handleAnswerChange}
              />

              {/* Navigation Action */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">
                  Session: {sessionId?.substring(0, 14)}...
                </span>

                <button
                  type="button"
                  onClick={handleContinue}
                  disabled={!isAnswerValid || isSubmitting}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
                >
                  <span>{isSubmitting ? 'Recording...' : 'Continue'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Public Footer */}
      <footer className="py-4 text-center text-[11px] text-slate-400 border-t border-slate-200/60 bg-white">
        <div className="max-w-xl mx-auto px-4 flex items-center justify-between">
          <span>Powered by Dentsu Research Studio · Dentsu Organisation</span>
          <Link to="/dashboard" className="text-slate-400 hover:text-slate-600">
            Owner Portal
          </Link>
        </div>
      </footer>
    </div>
  );
}
