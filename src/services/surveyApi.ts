import { apiFetch } from './apiClient';
import { isSandboxMode } from './apiConfig';
import { MockBackend } from './mockBackend';
import {
  NextQuestionResponse,
  SubmitResponsePayload,
  SubmitResponseResult,
} from '../types/survey';

export const surveyApi = {
  /**
   * Creates a dedicated, unique respondent session for an anonymous public respondent.
   * If the backend exposes POST /api/v1/sessions, calls it.
   */
  async createRespondentSession(researchId: number | string): Promise<{ session_id: string; research_id: number | string }> {
    if (isSandboxMode()) {
      return MockBackend.createRespondentSession(researchId);
    }

    try {
      const response = await apiFetch<{ session_id?: string; id?: string; research_id?: number | string }>('/api/v1/sessions', {
        method: 'POST',
        body: JSON.stringify({ research_id: Number(researchId) || researchId }),
      });

      const sessionId = response.session_id || response.id;
      if (!sessionId) {
        throw new Error('Backend response did not include a valid session_id.');
      }

      return {
        session_id: String(sessionId),
        research_id: response.research_id || researchId,
      };
    } catch {
      // If endpoint is not exposed yet on live backend, fallback to client-side session generator
      return MockBackend.createRespondentSession(researchId);
    }
  },

  /**
   * Fetches the next adaptive question for the given respondent session.
   * Calls GET /api/v1/sessions/{session_id}/next
   */
  async getNextQuestion(sessionId: string): Promise<NextQuestionResponse> {
    if (isSandboxMode()) {
      await new Promise((r) => setTimeout(r, 250));
      return MockBackend.getNextQuestion(sessionId);
    }

    const encodedSessionId = encodeURIComponent(sessionId);
    return await apiFetch<NextQuestionResponse>(`/api/v1/sessions/${encodedSessionId}/next`);
  },

  /**
   * Submits respondent answer to the adaptive engine.
   * Calls POST /api/v1/sessions/{session_id}/responses
   */
  async submitResponse(sessionId: string, payload: SubmitResponsePayload): Promise<SubmitResponseResult> {
    if (isSandboxMode()) {
      await new Promise((r) => setTimeout(r, 200));
      return MockBackend.submitResponse(sessionId, payload);
    }

    const encodedSessionId = encodeURIComponent(sessionId);
    return await apiFetch<SubmitResponseResult>(`/api/v1/sessions/${encodedSessionId}/responses`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
