import { apiFetch, apiFetchBlob } from './apiClient';
import { isSandboxMode } from './apiConfig';
import { MockBackend } from './mockBackend';
import { SessionReport, ResearchAnalytics, AiInsight } from '../types/analytics';

export const analyticsApi = {
  /**
   * Retrieves individual session report and dimension coverage.
   * Calls GET /api/v1/sessions/{session_id}/report
   */
  async getSessionReport(sessionId: string): Promise<SessionReport> {
    if (isSandboxMode()) {
      return MockBackend.getSessionReport(sessionId);
    }

    const encodedSessionId = encodeURIComponent(sessionId);
    return await apiFetch<SessionReport>(`/api/v1/sessions/${encodedSessionId}/report`);
  },

  /**
   * Downloads session responses as CSV file blob.
   * Calls GET /api/v1/sessions/{session_id}/export.csv
   */
  async exportSessionCsv(sessionId: string): Promise<Blob> {
    if (isSandboxMode()) {
      const csvData = MockBackend.exportSessionCsv(sessionId);
      return new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    }

    const encodedSessionId = encodeURIComponent(sessionId);
    return await apiFetchBlob(`/api/v1/sessions/${encodedSessionId}/export.csv`);
  },

  /**
   * Generates AI insights for an individual survey session.
   * Calls POST /api/v1/sessions/{session_id}/insights
   */
  async generateSessionInsights(sessionId: string): Promise<AiInsight> {
    if (isSandboxMode()) {
      await new Promise((r) => setTimeout(r, 600));
      return MockBackend.generateSessionInsights(sessionId);
    }

    const encodedSessionId = encodeURIComponent(sessionId);
    return await apiFetch<AiInsight>(`/api/v1/sessions/${encodedSessionId}/insights`, {
      method: 'POST',
    });
  },

  /**
   * Retrieves research-level aggregate analytics.
   * Calls GET /api/v1/research/{research_id}/analytics
   */
  async getResearchAnalytics(researchId: number | string): Promise<ResearchAnalytics> {
    if (isSandboxMode()) {
      return MockBackend.getResearchAnalytics(researchId);
    }

    const encodedId = encodeURIComponent(String(researchId));
    return await apiFetch<ResearchAnalytics>(`/api/v1/research/${encodedId}/analytics`);
  },

  /**
   * Downloads research-level dataset as CSV file blob.
   * Calls GET /api/v1/research/{research_id}/export.csv
   */
  async exportResearchCsv(researchId: number | string): Promise<Blob> {
    if (isSandboxMode()) {
      const csvData = MockBackend.exportResearchCsv(researchId);
      return new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    }

    const encodedId = encodeURIComponent(String(researchId));
    return await apiFetchBlob(`/api/v1/research/${encodedId}/export.csv`);
  },

  /**
   * Generates research-level AI insights and executive findings.
   * Calls POST /api/v1/research/{research_id}/insights
   */
  async generateResearchInsights(researchId: number | string): Promise<AiInsight> {
    if (isSandboxMode()) {
      await new Promise((r) => setTimeout(r, 700));
      return MockBackend.generateResearchInsights(researchId);
    }

    const encodedId = encodeURIComponent(String(researchId));
    return await apiFetch<AiInsight>(`/api/v1/research/${encodedId}/insights`, {
      method: 'POST',
    });
  },
};
