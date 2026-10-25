import { apiFetch } from './apiClient';
import { isSandboxMode } from './apiConfig';
import { MockBackend } from './mockBackend';
import {
  ResearchProject,
  ResearchPlan,
  GenerateResearchPlanPayload,
  GenerateSurveyPayload,
  GenerateSurveyResponse,
} from '../types/research';

export const researchApi = {
  /**
   * Retrieves all research projects.
   * If the backend does not expose a research-list endpoint, falls back to local workspace cache.
   */
  async listProjects(): Promise<ResearchProject[]> {
    if (isSandboxMode()) {
      return MockBackend.getProjects();
    }

    try {
      // Attempt backend retrieval if available
      return await apiFetch<ResearchProject[]>('/api/v1/research');
    } catch {
      // Backend doesn't support list endpoint; use workspace local storage cache
      return MockBackend.getProjects();
    }
  },

  /**
   * Retrieves single research project by ID.
   */
  async getProject(id: number | string): Promise<ResearchProject | null> {
    if (isSandboxMode()) {
      return MockBackend.getProject(id) || null;
    }

    try {
      return await apiFetch<ResearchProject>(`/api/v1/research/${id}`);
    } catch {
      return MockBackend.getProject(id) || null;
    }
  },

  /**
   * Creates a new research project definition.
   */
  async createProject(payload: {
    topic: string;
    target_audience: string;
    geography: string;
    dimensions: string[];
  }): Promise<ResearchProject> {
    if (isSandboxMode()) {
      return MockBackend.createProject(payload);
    }

    try {
      return await apiFetch<ResearchProject>('/api/v1/research', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch {
      // If backend creation endpoint not present, save to local workspace so flow continues
      return MockBackend.createProject(payload);
    }
  },

  /**
   * Generates a comprehensive research plan using AI.
   * Calls POST /api/v1/llm/research-plan
   */
  async generateResearchPlan(payload: GenerateResearchPlanPayload): Promise<ResearchPlan> {
    if (isSandboxMode()) {
      // Brief simulated latency for realism
      await new Promise((r) => setTimeout(r, 600));
      return MockBackend.generateResearchPlan(payload);
    }

    return await apiFetch<ResearchPlan>('/api/v1/llm/research-plan', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Configures and generates the adaptive survey session.
   * Calls POST /api/v1/llm/sessions
   */
  async generateSurvey(payload: GenerateSurveyPayload): Promise<GenerateSurveyResponse> {
    if (isSandboxMode()) {
      await new Promise((r) => setTimeout(r, 700));
      return MockBackend.generateSurvey(payload);
    }

    return await apiFetch<GenerateSurveyResponse>('/api/v1/llm/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Updates study survey status (active vs not_active).
   */
  async updateProjectStatus(id: number | string, status: 'active' | 'not_active'): Promise<ResearchProject | null> {
    if (isSandboxMode()) {
      return MockBackend.updateProjectStatus(id, status);
    }

    try {
      return await apiFetch<ResearchProject>(`/api/v1/research/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch {
      // Fallback to local workspace store
      return MockBackend.updateProjectStatus(id, status);
    }
  },

  /**
   * Deletes a research study from the registry.
   */
  async deleteProject(id: number | string): Promise<boolean> {
    if (isSandboxMode()) {
      return MockBackend.deleteProject(id);
    }

    try {
      await apiFetch(`/api/v1/research/${id}`, {
        method: 'DELETE',
      });
      MockBackend.deleteProject(id);
      return true;
    } catch {
      return MockBackend.deleteProject(id);
    }
  },
};
