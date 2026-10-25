import { ResearchProject, ResearchPlan, GenerateResearchPlanPayload, GenerateSurveyPayload, GenerateSurveyResponse } from '../types/research';
import { AdaptiveQuestion, NextQuestionResponse, SubmitResponsePayload, SubmitResponseResult } from '../types/survey';
import { SessionReport, ResearchAnalytics, AiInsight } from '../types/analytics';

const STORAGE_PROJECTS = 'pm_studio_projects';
const STORAGE_SESSIONS = 'pm_studio_sessions';
const STORAGE_RESPONSES = 'pm_studio_session_responses';

// Seed initial project matching the prompt example
const INITIAL_PROJECTS: ResearchProject[] = [
  {
    id: 1,
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
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    status: 'active',
    max_questions: 7,
    survey_session_id: 'gen-sess-101',
    research_plan: {
      research_id: 1,
      topic: 'Instant self-heating hot chocolate market assessment',
      objectives: [
        'Evaluate consumer awareness and initial intrigue toward flameless self-heating beverage packaging.',
        'Determine willingness-to-pay elasticity across collegiate and working professional cohorts.',
        'Assess perceived chemical/thermal safety risks during on-the-go consumption.',
        'Map primary consumption occasions (late-night studying, winter commutes, outdoor trekking).',
      ],
      hypotheses: [
        'H1: College students show 2x higher willingness to purchase for late-night exam sessions if priced below ₹120.',
        'H2: Safety skepticism regarding exothermal reaction mechanisms is higher among female professionals aged 23–26.',
        'H3: Premium cocoa origin messaging mitigates taste compromise concerns by >35%.',
      ],
      constructs: [
        {
          dimension: 'Product Interest',
          description: 'Initial curiosity and resonance with instant push-button self-heating canister.',
          measurable_variables: ['Novelty rating', 'Feature intrigue', 'Comparison vs traditional sachets'],
          suggested_question_types: ['likert', 'single_choice'],
        },
        {
          dimension: 'Purchase Intent',
          description: 'Likelihood to buy under standard retail and instant grocery conditions.',
          measurable_variables: ['1-month trial probability', 'Repeat purchase projection'],
          suggested_question_types: ['single_choice', 'likert'],
        },
        {
          dimension: 'Price Sensitivity',
          description: 'Van Westendorp price thresholds (Too Cheap, Bargain, Expensive, Too Expensive).',
          measurable_variables: ['Acceptable price point', 'Price ceiling'],
          suggested_question_types: ['price_input', 'numeric'],
        },
        {
          dimension: 'Safety Perception',
          description: 'Degree of comfort holding a heated container reaching 65°C.',
          measurable_variables: ['Thermal trust', 'Chemical residue concern'],
          suggested_question_types: ['likert', 'multiple_choice'],
        },
        {
          dimension: 'Consumption Occasions',
          description: 'Contextual environment and timing for usage.',
          measurable_variables: ['Peak hours', 'Social vs solo', 'Location'],
          suggested_question_types: ['multiple_choice', 'ranking'],
        },
      ],
      methodology_notes: 'Adaptive sequential Bayesian question selection optimized for dimensional entropy reduction.',
      key_metrics: ['WTP Index', 'Safety Confidence Score', 'Trial Intent Coefficient'],
    },
  },
  {
    id: 2,
    topic: 'B2B Procurement Automation for Specialty Chemicals',
    target_audience: 'Procurement Heads and Plant Directors in EU manufacturing',
    geography: 'Germany, Netherlands, France',
    dimensions: ['Workflow Bottlenecks', 'ERP Integration Trust', 'Supplier Reliability', 'Budget Authority'],
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
    status: 'not_active',
    max_questions: 8,
  },
];

function getStoredProjects(): ResearchProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_PROJECTS);
    if (!raw) {
      localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(INITIAL_PROJECTS));
      return INITIAL_PROJECTS;
    }
    const parsed: ResearchProject[] = JSON.parse(raw);
    // Normalize any legacy statuses to strictly 'active' or 'not_active'
    let modified = false;
    const normalized = parsed.map((p) => {
      const isAct = p.status === 'active' || p.status === 'survey_active';
      const stdStatus = isAct ? 'active' : 'not_active';
      if (p.status !== stdStatus) {
        modified = true;
        return { ...p, status: stdStatus };
      }
      return p;
    });
    if (modified) {
      localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(normalized));
    }
    return normalized;
  } catch {
    return INITIAL_PROJECTS;
  }
}

function saveProjects(projects: ResearchProject[]): void {
  try {
    localStorage.setItem(STORAGE_PROJECTS, JSON.stringify(projects));
  } catch (err) {
    console.error('Failed to save projects to storage', err);
  }
}

// Adaptive questions bank for simulation
const QUESTIONS_BANK: Record<string, AdaptiveQuestion[]> = {
  '1': [
    {
      question_id: 'q1',
      text: 'How frequently do you consume hot chocolate or premium warm beverages during the week?',
      dimension: 'Consumption Occasions',
      type: 'single_choice',
      options: [
        { value: 'daily', label: 'Daily or almost daily' },
        { value: 'few_weekly', label: '2 to 4 times a week' },
        { value: 'weekly', label: 'About once a week' },
        { value: 'monthly', label: '1 to 3 times a month' },
        { value: 'rarely', label: 'Rarely or seasonally only' },
      ],
      question_number: 1,
      total_estimate: 7,
    },
    {
      question_id: 'q2',
      text: 'Imagine a beverage can that heats hot chocolate to 65°C in 2 minutes upon twisting the base, without any microwave or kettle. What is your initial interest level?',
      dimension: 'Product Interest',
      type: 'likert',
      scale_min: 1,
      scale_max: 5,
      scale_labels: { min: 'Not at all interested', max: 'Extremely interested' },
      question_number: 2,
      total_estimate: 7,
    },
    {
      question_id: 'q3',
      text: 'What would be a reasonable and attractive price (in INR) for a single 250ml self-heating hot chocolate can?',
      dimension: 'Price Sensitivity',
      type: 'price_input',
      currency_symbol: '₹',
      min_value: 40,
      max_value: 350,
      step: 10,
      question_number: 3,
      total_estimate: 7,
    },
    {
      question_id: 'q4',
      text: 'Which safety factors would be most critical for you before holding and drinking from a self-heating can?',
      dimension: 'Safety Perception',
      type: 'multiple_choice',
      options: [
        { value: 'cool_grip', label: 'Exterior grip remains comfortably warm, never scalding' },
        { value: 'food_grade', label: 'Heating reaction element completely sealed from the liquid' },
        { value: 'spill_proof', label: 'Leak-proof pressure release vent' },
        { value: 'eco_friendly', label: 'Safe and non-toxic disposal of heating core' },
        { value: 'certifications', label: 'Clear FSSAI & ISO food-grade safety certifications' },
      ],
      question_number: 4,
      total_estimate: 7,
    },
    {
      question_id: 'q5',
      text: 'Please rank the occasions where you are most likely to use an instant self-heating hot beverage (Drag or use arrows to prioritize):',
      dimension: 'Consumption Occasions',
      type: 'ranking',
      options: [
        { value: 'late_study', label: 'Late-night study sessions or remote work' },
        { value: 'travel_transit', label: 'Road trips, highway drives, or train travel' },
        { value: 'outdoor_winter', label: 'Outdoor camping, morning walks, or monsoon outings' },
        { value: 'office_desk', label: 'Office or library where hot water is unavailable' },
      ],
      question_number: 5,
      total_estimate: 7,
    },
    {
      question_id: 'q6',
      text: 'If this product was available today on quick commerce (e.g., Blinkit, Zepto, Instamart), how likely would you be to purchase a 2-pack this month?',
      dimension: 'Purchase Intent',
      type: 'likert',
      scale_min: 1,
      scale_max: 5,
      scale_labels: { min: 'Definitely would not buy', max: 'Definitely would buy' },
      question_number: 6,
      total_estimate: 7,
    },
    {
      question_id: 'q7',
      text: 'What is one specific flavor variant or feature that would make this an instant must-buy for you?',
      dimension: 'Product Interest',
      type: 'short_text',
      placeholder: 'e.g. Belgian Dark Chocolate 70%, Hazelnut Praline, Vegan Oat Milk formulation...',
      question_number: 7,
      total_estimate: 7,
    },
  ],
};

export const MockBackend = {
  getProjects(): ResearchProject[] {
    return getStoredProjects();
  },

  getProject(id: number | string): ResearchProject | undefined {
    return getStoredProjects().find((p) => String(p.id) === String(id));
  },

  createProject(payload: { topic: string; target_audience: string; geography: string; dimensions: string[] }): ResearchProject {
    const list = getStoredProjects();
    const newId = list.length > 0 ? Math.max(...list.map((p) => Number(p.id) || 0)) + 1 : 1;
    const project: ResearchProject = {
      id: newId,
      topic: payload.topic,
      target_audience: payload.target_audience,
      geography: payload.geography,
      dimensions: payload.dimensions,
      created_at: new Date().toISOString(),
      status: 'not_active',
    };
    list.unshift(project);
    saveProjects(list);
    return project;
  },

  updateProjectStatus(id: number | string, status: 'active' | 'not_active'): ResearchProject | null {
    const list = getStoredProjects();
    const idx = list.findIndex((p) => String(p.id) === String(id));
    if (idx !== -1) {
      list[idx].status = status;
      saveProjects(list);
      return list[idx];
    }
    return null;
  },

  deleteProject(id: number | string): boolean {
    const list = getStoredProjects();
    const filtered = list.filter((p) => String(p.id) !== String(id));
    if (filtered.length !== list.length) {
      saveProjects(filtered);
      return true;
    }
    return false;
  },

  generateResearchPlan(payload: GenerateResearchPlanPayload): ResearchPlan {
    const plan: ResearchPlan = {
      research_id: payload.research_id,
      topic: payload.topic,
      objectives: [
        `Evaluate target segment responsiveness among ${payload.target_audience} in ${payload.geography}.`,
        `Quantify demand elasticity and acceptance across defined research dimensions.`,
        `Identify dominant behavioral drivers and critical adoption barriers.`,
        `Synthesize directional go-to-market priorities.`,
      ],
      hypotheses: [
        `H1: Higher familiarity with premium alternatives correlates with 40%+ willingness to pay.`,
        `H2: Convenience benefits outweigh price hesitation in high-density urban corridors.`,
        `H3: Trust certifications reduce drop-off rates across hesitant respondent cohorts.`,
      ],
      constructs: payload.dimensions.map((dim) => ({
        dimension: dim,
        description: `Operational construct assessing ${dim.toLowerCase()} dynamics for ${payload.topic}.`,
        measurable_variables: [`${dim} Acceptance Index`, `${dim} Frequency`, `${dim} Confidence`],
        suggested_question_types: ['single_choice', 'likert', 'numeric'],
      })),
      methodology_notes: 'Sequential Bayesian adaptive sampling with real-time entropy minimization per dimension.',
      key_metrics: ['Dimensional Coverage Index', 'Net Affinity Score', 'Price Threshold Margin'],
    };

    // Update project in store if exists
    const list = getStoredProjects();
    const idx = list.findIndex((p) => String(p.id) === String(payload.research_id));
    if (idx !== -1) {
      list[idx].research_plan = plan;
      saveProjects(list);
    }

    return plan;
  },

  generateSurvey(payload: GenerateSurveyPayload): GenerateSurveyResponse {
    const sessionId = `gen-survey-${payload.research_id}-${Date.now().toString(36)}`;
    const list = getStoredProjects();
    const idx = list.findIndex((p) => String(p.id) === String(payload.research_id));
    if (idx !== -1) {
      list[idx].survey_session_id = sessionId;
      list[idx].max_questions = payload.max_questions || 10;
      list[idx].status = 'active';
      saveProjects(list);
    }

    return {
      session_id: sessionId,
      survey_session_id: sessionId,
      status: 'active',
      message: 'Adaptive survey model compiled and distribution session ready.',
      total_questions_pool: (payload.dimensions.length * 3),
    };
  },

  createRespondentSession(researchId: number | string): { session_id: string; research_id: number | string } {
    const sessionId = `resp-${researchId}-${Math.random().toString(36).substring(2, 8)}`;
    const sessionsRaw = localStorage.getItem(STORAGE_SESSIONS) || '{}';
    const sessions = JSON.parse(sessionsRaw);
    sessions[sessionId] = {
      session_id: sessionId,
      research_id: researchId,
      started_at: new Date().toISOString(),
      current_question_index: 0,
      status: 'active',
      responses: [],
    };
    localStorage.setItem(STORAGE_SESSIONS, JSON.stringify(sessions));
    return { session_id: sessionId, research_id: researchId };
  },

  getNextQuestion(sessionId: string): NextQuestionResponse {
    const sessionsRaw = localStorage.getItem(STORAGE_SESSIONS) || '{}';
    const sessions = JSON.parse(sessionsRaw);
    const session = sessions[sessionId] || {
      session_id: sessionId,
      research_id: 1,
      current_question_index: 0,
      responses: [],
    };

    const researchId = String(session.research_id || 1);
    const pool = QUESTIONS_BANK[researchId] || QUESTIONS_BANK['1'];
    const currentIndex = session.current_question_index || 0;

    if (currentIndex >= pool.length) {
      session.status = 'completed';
      session.completed_at = new Date().toISOString();
      sessions[sessionId] = session;
      localStorage.setItem(STORAGE_SESSIONS, JSON.stringify(sessions));
      return {
        is_completed: true,
        status: 'completed',
      };
    }

    const question = pool[currentIndex];
    return {
      is_completed: false,
      status: 'in_progress',
      question,
      question_id: question.question_id,
      text: question.text,
      dimension: question.dimension,
      type: question.type,
      options: question.options,
      scale_min: question.scale_min,
      scale_max: question.scale_max,
      currency_symbol: question.currency_symbol,
      placeholder: question.placeholder,
    };
  },

  submitResponse(sessionId: string, payload: SubmitResponsePayload): SubmitResponseResult {
    const sessionsRaw = localStorage.getItem(STORAGE_SESSIONS) || '{}';
    const sessions = JSON.parse(sessionsRaw);
    const session = sessions[sessionId] || {
      session_id: sessionId,
      research_id: 1,
      current_question_index: 0,
      responses: [],
    };

    const researchId = String(session.research_id || 1);
    const pool = QUESTIONS_BANK[researchId] || QUESTIONS_BANK['1'];
    const currentQ = pool[session.current_question_index || 0];

    session.responses.push({
      question_id: payload.question_id,
      question_text: currentQ ? currentQ.text : `Question ${payload.question_id}`,
      dimension: currentQ ? currentQ.dimension : (payload.dimension || 'General'),
      question_type: currentQ ? currentQ.type : 'single_choice',
      response: payload.answer,
      answered_at: new Date().toISOString(),
      latency_ms: payload.time_spent_ms || 3200,
    });

    session.current_question_index = (session.current_question_index || 0) + 1;
    const isCompleted = session.current_question_index >= pool.length;
    if (isCompleted) {
      session.status = 'completed';
      session.completed_at = new Date().toISOString();
    }

    sessions[sessionId] = session;
    localStorage.setItem(STORAGE_SESSIONS, JSON.stringify(sessions));

    return {
      status: 'success',
      is_completed: isCompleted,
      next_question_available: !isCompleted,
    };
  },

  getSessionReport(sessionId: string): SessionReport {
    const sessionsRaw = localStorage.getItem(STORAGE_SESSIONS) || '{}';
    const sessions = JSON.parse(sessionsRaw);
    const session = sessions[sessionId];

    if (!session) {
      // Return a populated sample report if looking at a seed session
      return {
        session_id: sessionId,
        research_id: 1,
        status: 'completed',
        started_at: new Date(Date.now() - 600000).toISOString(),
        completed_at: new Date(Date.now() - 360000).toISOString(),
        total_questions_answered: 7,
        dimension_coverage: [
          { dimension: 'Product Interest', target_questions: 2, questions_answered: 2, coverage_percentage: 100, attainment_status: 'optimal' },
          { dimension: 'Purchase Intent', target_questions: 1, questions_answered: 1, coverage_percentage: 100, attainment_status: 'optimal' },
          { dimension: 'Price Sensitivity', target_questions: 1, questions_answered: 1, coverage_percentage: 100, attainment_status: 'optimal' },
          { dimension: 'Safety Perception', target_questions: 1, questions_answered: 1, coverage_percentage: 100, attainment_status: 'optimal' },
          { dimension: 'Consumption Occasions', target_questions: 2, questions_answered: 2, coverage_percentage: 100, attainment_status: 'optimal' },
        ],
        answers: [
          { question_id: 'q1', question_text: 'How frequently do you consume hot chocolate?', dimension: 'Consumption Occasions', question_type: 'single_choice', response: '2 to 4 times a week' },
          { question_id: 'q2', question_text: 'Intrigue in 2-minute 65°C self-heating can?', dimension: 'Product Interest', question_type: 'likert', response: '5 (Extremely interested)' },
          { question_id: 'q3', question_text: 'Attractive price in INR?', dimension: 'Price Sensitivity', question_type: 'price_input', response: '₹140' },
          { question_id: 'q4', question_text: 'Critical safety factors?', dimension: 'Safety Perception', question_type: 'multiple_choice', response: ['Food-grade sealed element', 'Cool exterior grip'] },
          { question_id: 'q5', question_text: 'Rank occasions for use', dimension: 'Consumption Occasions', question_type: 'ranking', response: ['Late-night study sessions', 'Road trips', 'Office desk', 'Winter camping'] },
          { question_id: 'q6', question_text: 'Likelihood to purchase 2-pack this month?', dimension: 'Purchase Intent', question_type: 'likert', response: '4 (Likely)' },
          { question_id: 'q7', question_text: 'Must-buy variant?', dimension: 'Product Interest', question_type: 'short_text', response: 'Belgian Dark Chocolate with salted caramel' },
        ],
        summary: 'High-intent respondent exhibiting strong price tolerance (₹140) and priority need for exam/late-night productivity contexts.',
      };
    }

    const answers = session.responses || [];
    const dimensionMap: Record<string, number> = {};
    answers.forEach((a: any) => {
      dimensionMap[a.dimension] = (dimensionMap[a.dimension] || 0) + 1;
    });

    const dimension_coverage = Object.keys(dimensionMap).map((dim) => ({
      dimension: dim,
      target_questions: 2,
      questions_answered: dimensionMap[dim],
      coverage_percentage: Math.min(100, Math.round((dimensionMap[dim] / 2) * 100)),
      attainment_status: (dimensionMap[dim] >= 2 ? 'optimal' : 'under_represented') as 'optimal' | 'under_represented',
    }));

    return {
      session_id: sessionId,
      research_id: session.research_id || 1,
      status: session.status || 'in_progress',
      started_at: session.started_at,
      completed_at: session.completed_at,
      total_questions_answered: answers.length,
      dimension_coverage,
      answers,
      summary: `Completed ${answers.length} adaptive inquiries across ${Object.keys(dimensionMap).length} dimensions.`,
    };
  },

  exportSessionCsv(sessionId: string): string {
    const report = this.getSessionReport(sessionId);
    const headers = ['Session ID', 'Question ID', 'Dimension', 'Question Type', 'Question Text', 'Response'];
    const rows = report.answers.map((a) => {
      const respStr = Array.isArray(a.response) ? a.response.join('; ') : String(a.response);
      return [
        `"${report.session_id}"`,
        `"${a.question_id}"`,
        `"${a.dimension}"`,
        `"${a.question_type}"`,
        `"${a.question_text.replace(/"/g, '""')}"`,
        `"${respStr.replace(/"/g, '""')}"`,
      ].join(',');
    });

    return [headers.join(','), ...rows].join('\n');
  },

  generateSessionInsights(sessionId: string): AiInsight {
    const report = this.getSessionReport(sessionId);
    return {
      key_findings: [
        'Respondent demonstrates high purchase readiness with an acceptable WTP baseline of ₹130–₹150.',
        'Primary utility is rooted in speed-of-access during late night hours when brewing equipment is inaccessible.',
        'Thermal safety assurances (sealed reaction chamber) serve as an unconditional prerequisite.',
      ],
      supporting_evidence: [
        { metric: 'Intrigue Score', value: '5 / 5', context: 'High curiosity on exothermal twist mechanism' },
        { metric: 'Stated Price Tolerance', value: '₹140', context: 'Within target unit economic viability band' },
        { metric: 'Top Consumption Context', value: 'Late-night study/work', context: 'Ranked #1 priority' },
      ],
      caveats_and_limitations: [
        'Single session interview: Represents an individual perspective, not statistically aggregated behavior.',
        'Self-reported WTP frequently suffers from hypothetical bias (actual purchase conversion may be 15–20% lower).',
      ],
      sample_size: 1,
      confidence_assessment: 'High individual coherence; requires cross-session cohort validation.',
      generated_at: new Date().toISOString(),
    };
  },

  getResearchAnalytics(researchId: number | string): ResearchAnalytics {
    const project = this.getProject(researchId);
    return {
      research_id: researchId,
      topic: project?.topic || 'Research Project Analytics',
      total_sessions: 42,
      completed_sessions: 38,
      completion_rate: 90.5,
      average_completion_time_seconds: 164,
      dimension_coverage: [
        { dimension: 'Product Interest', target_questions: 84, questions_answered: 76, coverage_percentage: 90.5, attainment_status: 'optimal' },
        { dimension: 'Purchase Intent', target_questions: 42, questions_answered: 38, coverage_percentage: 90.5, attainment_status: 'optimal' },
        { dimension: 'Price Sensitivity', target_questions: 42, questions_answered: 38, coverage_percentage: 90.5, attainment_status: 'optimal' },
        { dimension: 'Safety Perception', target_questions: 42, questions_answered: 36, coverage_percentage: 85.7, attainment_status: 'adequate' },
        { dimension: 'Consumption Occasions', target_questions: 84, questions_answered: 74, coverage_percentage: 88.1, attainment_status: 'adequate' },
      ],
      distribution: [
        {
          question_id: 'q2',
          question_text: 'Initial Interest in Self-Heating Can',
          dimension: 'Product Interest',
          type: 'likert',
          total_answers: 38,
          options_breakdown: [
            { label: '5 - Extremely Interested', count: 18, percentage: 47.4 },
            { label: '4 - Very Interested', count: 12, percentage: 31.6 },
            { label: '3 - Moderately Interested', count: 5, percentage: 13.2 },
            { label: '2 - Slightly Interested', count: 2, percentage: 5.3 },
            { label: '1 - Not Interested', count: 1, percentage: 2.5 },
          ],
        },
        {
          question_id: 'q3',
          question_text: 'Willingness to Pay (INR)',
          dimension: 'Price Sensitivity',
          type: 'price_input',
          total_answers: 38,
          numeric_stats: { mean: 128.5, median: 125.0, min: 80.0, max: 200.0 },
        },
        {
          question_id: 'q4',
          question_text: 'Priority Safety Concerns',
          dimension: 'Safety Perception',
          type: 'multiple_choice',
          total_answers: 38,
          options_breakdown: [
            { label: 'Sealed chemical reaction element', count: 32, percentage: 84.2 },
            { label: 'Cool exterior touch surface', count: 27, percentage: 71.1 },
            { label: 'Food-grade safety certifications', count: 22, percentage: 57.9 },
            { label: 'Eco-safe disposal of core', count: 19, percentage: 50.0 },
          ],
        },
        {
          question_id: 'q5',
          question_text: 'Top Consumption Occasions',
          dimension: 'Consumption Occasions',
          type: 'ranking',
          total_answers: 38,
          options_breakdown: [
            { label: 'Late-night study / remote shift', count: 21, percentage: 55.3 },
            { label: 'Travel & Highway transit', count: 10, percentage: 26.3 },
            { label: 'Winter / monsoon outings', count: 5, percentage: 13.2 },
            { label: 'Office desk without pantry', count: 2, percentage: 5.2 },
          ],
        },
      ],
      objective_findings: [
        { objective: 'Evaluate packaging novelty awareness', status: 'Validated', notes: '79% rated interest at 4 or 5 out of 5.' },
        { objective: 'Quantify willingness to pay threshold', status: 'Validated', notes: 'Median ₹125/can. Above ₹150 resistance increases sharply.' },
        { objective: 'Identify dominant safety skepticism', status: 'Validated', notes: '84.2% demand chemical hermetic sealing confirmation on can labeling.' },
      ],
    };
  },

  exportResearchCsv(researchId: number | string): string {
    const analytics = this.getResearchAnalytics(researchId);
    const lines = [
      `"Dentsu Research Studio - Aggregate Export"`,
      `"Research ID",${analytics.research_id}`,
      `"Topic","${analytics.topic}"`,
      `"Total Sessions",${analytics.total_sessions}`,
      `"Completed Sessions",${analytics.completed_sessions}`,
      `"Completion Rate","${analytics.completion_rate}%"`,
      `""`,
      `"Dimension","Target Questions","Questions Answered","Coverage %","Attainment Status"`,
      ...analytics.dimension_coverage.map(
        (d) => `"${d.dimension}",${d.target_questions || 0},${d.questions_answered},${d.coverage_percentage}%,"${d.attainment_status || 'optimal'}"`
      ),
      `""`,
      `"Question Breakdown","Dimension","Total Answers"`,
      ...analytics.distribution!.map((dist) => `"${dist.question_text.replace(/"/g, '""')}","${dist.dimension}",${dist.total_answers}`),
    ];
    return lines.join('\n');
  },

  generateResearchInsights(researchId: number | string): AiInsight {
    const analytics = this.getResearchAnalytics(researchId);
    return {
      key_findings: [
        'Strong initial market demand: 79.0% of respondents in the target cohort express high or very high interest in self-heating hot beverages.',
        'Clear price ceiling identified at ₹150: Price elasticity indicates a sweet spot around ₹120–₹130, where conversion probability exceeds 68%.',
        'Late-night consumption is the anchor wedge: 55.3% of respondents ranked late-night studying or working as their primary target usage context.',
        'Labeling transparency is paramount: 84.2% identified sealed chemical core safety as a mandatory purchase precondition.',
      ],
      supporting_evidence: [
        { metric: 'Total Respondent Sample', value: analytics.completed_sessions, context: 'Completed adaptive interview sessions' },
        { metric: 'Median WTP', value: '₹125.00', context: 'Standardized 250ml can unit economics' },
        { metric: 'Top Use Case Share', value: '55.3%', context: 'Late-night study and work' },
        { metric: 'Safety Priority Share', value: '84.2%', context: 'Chemical core isolation requirement' },
      ],
      caveats_and_limitations: [
        'Sample size (N=38 completed) represents an exploratory early-stage sample; expand to N=250+ for regional sub-segmentation.',
        'Data skew towards Tier 1 and Tier 2 tech/university hubs; rural or semi-urban acceptance may vary.',
        'Price findings reflect stated intent prior to physical product handling and taste trial.',
      ],
      sample_size: analytics.completed_sessions,
      confidence_assessment: 'Robust directional signal with high consistency across dimensional constructs.',
      generated_at: new Date().toISOString(),
      strategic_recommendations: [
        'Launch packaging with bold "100% Hermetically Sealed Heating Cell" visual badge on the outer carton.',
        'Target quick-commerce dark stores near university clusters with late-night delivery promotions (11 PM - 3 AM).',
        'Pilot pricing at introductory ₹129 with a 2-pack bundle at ₹240.',
      ],
    };
  },
};
