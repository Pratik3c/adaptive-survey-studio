export interface DimensionCoverage {
  dimension: string;
  target_questions?: number;
  questions_answered: number;
  coverage_percentage: number;
  attainment_status?: 'adequate' | 'under_represented' | 'optimal';
}

export interface SessionAnswerRecord {
  question_id: string | number;
  question_text: string;
  dimension: string;
  question_type: string;
  response: string | number | string[] | Record<string, unknown>;
  answered_at?: string;
  latency_ms?: number;
}

export interface SessionReport {
  session_id: string;
  research_id: number | string;
  status: 'completed' | 'in_progress' | 'terminated';
  started_at?: string;
  completed_at?: string;
  total_questions_answered: number;
  dimension_coverage: DimensionCoverage[];
  answers: SessionAnswerRecord[];
  summary?: string;
  quality_score?: number;
  raw_data?: Record<string, unknown>;
}

export interface ResponseDistributionItem {
  question_id: string | number;
  question_text: string;
  dimension: string;
  type: string;
  total_answers: number;
  options_breakdown?: { label: string; count: number; percentage: number }[];
  numeric_stats?: { mean: number; median: number; min: number; max: number };
}

export interface ResearchAnalytics {
  research_id: number | string;
  topic?: string;
  total_sessions: number;
  completed_sessions: number;
  completion_rate: number;
  average_completion_time_seconds?: number;
  dimension_coverage: DimensionCoverage[];
  distribution?: ResponseDistributionItem[];
  objective_findings?: { objective: string; status: string; notes?: string }[];
  raw_analytics?: Record<string, unknown>;
}

export interface InsightEvidence {
  metric: string;
  value: string | number;
  context?: string;
}

export interface AiInsight {
  key_findings: string[];
  supporting_evidence: InsightEvidence[] | string[];
  caveats_and_limitations: string[];
  sample_size?: number;
  confidence_assessment?: string;
  generated_at?: string;
  executive_summary?: string;
  strategic_recommendations?: string[];
  raw_insight?: Record<string, unknown>;
}
