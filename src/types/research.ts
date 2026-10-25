export interface ResearchProject {
  id: number | string;
  topic: string;
  target_audience: string;
  geography: string;
  dimensions: string[];
  created_at?: string;
  status?: 'active' | 'not_active' | 'survey_active' | 'draft' | 'plan_generated' | 'completed' | string;
  research_plan?: ResearchPlan;
  survey_session_id?: string;
  max_questions?: number;
}

export interface ResearchPlan {
  research_id?: number | string;
  topic?: string;
  objectives?: string[];
  hypotheses?: string[];
  constructs?: {
    dimension: string;
    description: string;
    measurable_variables: string[];
    suggested_question_types?: string[];
  }[];
  methodology_notes?: string;
  key_metrics?: string[];
  target_coverage_goals?: Record<string, number>;
  raw_plan?: Record<string, unknown>;
}

export interface GenerateResearchPlanPayload {
  research_id: number | string;
  topic: string;
  target_audience: string;
  geography: string;
  dimensions: string[];
}

export interface GenerateSurveyPayload {
  research_id: number | string;
  topic: string;
  target_audience: string;
  geography: string;
  dimensions: string[];
  research_plan: Record<string, unknown>;
  max_questions: number;
}

export interface GenerateSurveyResponse {
  session_id?: string;
  survey_session_id?: string;
  id?: string;
  status?: string;
  message?: string;
  total_questions_pool?: number;
  [key: string]: unknown;
}
