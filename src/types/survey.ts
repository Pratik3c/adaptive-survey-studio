export type QuestionType =
  | 'single_choice'
  | 'multiple_choice'
  | 'likert'
  | 'numeric'
  | 'price_input'
  | 'short_text'
  | 'ranking';

export interface QuestionOption {
  id?: string | number;
  value: string;
  label: string;
  description?: string;
}

export interface AdaptiveQuestion {
  question_id: string | number;
  text: string;
  dimension?: string;
  type: QuestionType | string;
  options?: (string | QuestionOption)[];
  scale_min?: number;
  scale_max?: number;
  scale_labels?: { min?: string; max?: string };
  currency_symbol?: string;
  min_value?: number;
  max_value?: number;
  step?: number;
  placeholder?: string;
  is_required?: boolean;
  question_number?: number;
  total_estimate?: number;
  is_completed?: boolean;
  metadata?: Record<string, unknown>;
}

export interface NextQuestionResponse {
  is_completed?: boolean;
  status?: 'in_progress' | 'completed' | 'terminated';
  question?: AdaptiveQuestion;
  // If returned directly at top level:
  question_id?: string | number;
  text?: string;
  dimension?: string;
  type?: QuestionType | string;
  options?: (string | QuestionOption)[];
  scale_min?: number;
  scale_max?: number;
  currency_symbol?: string;
  [key: string]: unknown;
}

export interface SubmitResponsePayload {
  question_id: string | number;
  answer: string | number | string[] | Record<string, unknown>;
  dimension?: string;
  time_spent_ms?: number;
  [key: string]: unknown;
}

export interface SubmitResponseResult {
  status?: string;
  message?: string;
  is_completed?: boolean;
  next_question_available?: boolean;
  [key: string]: unknown;
}

export interface RespondentSession {
  session_id: string;
  research_id: number | string;
  started_at: string;
  completed_at?: string;
  current_question_index?: number;
  status?: 'active' | 'completed' | 'abandoned';
}
