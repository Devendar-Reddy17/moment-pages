import type {
  UploadUrlRequest,
  UploadUrlResponse,
  MediaItem,
  AITextRequest,
  AITextResponse,
  AIThemeRequest,
  AIThemeResponse,
  AIPageRequest,
  AIPageResponse,
  AIEditRequest,
  AIEditResponse,
  AIImageRequest,
  AIImageResponse,
  Template,
  PublicPageData,
} from '@/types/api';
import type {
  ProjectCreateRequest,
  ProjectCreateResponse,
  ProjectSettings,
  Project,
  AnalyticsSummary,
  ResponsesData,
} from '@/types/project';
import type { CanvasData } from '@/types/editor';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    managementToken?: string
  ): Promise<T> {
    const headers: HeadersInit = { ...options.headers };

    // Only set JSON content-type for actual JSON bodies, not FormData
    if (!(options.body instanceof FormData)) {
      (headers as Record<string, string>)['Content-Type'] = 'application/json';
    }

    if (managementToken) {
      (headers as Record<string, string>)['X-Management-Token'] = managementToken;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  }

  // === Projects ===

  async createProject(data: ProjectCreateRequest): Promise<ProjectCreateResponse> {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getProject(projectId: string, token: string): Promise<Project> {
    return this.request(`/projects/${projectId}`, {}, token);
  }

  async getProjectByToken(token: string): Promise<Project> {
    return this.request('/projects/by-token', {}, token);
  }

  async getProjectContent(projectId: string, token: string): Promise<{ canvasJson: CanvasData }> {
    return this.request(`/projects/${projectId}/content`, {}, token);
  }

  async updateProjectContent(
    projectId: string,
    token: string,
    canvasJson: CanvasData
  ): Promise<{ version: number; savedAt: string }> {
    return this.request(
      `/projects/${projectId}/content`,
      {
        method: 'PUT',
        body: JSON.stringify({ canvasJson }),
      },
      token
    );
  }

  async updateProjectSettings(
    projectId: string,
    token: string,
    settings: ProjectSettings
  ): Promise<Project> {
    return this.request(
      `/projects/${projectId}/settings`,
      {
        method: 'PATCH',
        body: JSON.stringify(settings),
      },
      token
    );
  }

  async publishProject(
    projectId: string,
    token: string
  ): Promise<{ stripeCheckoutUrl: string; sessionId: string }> {
    return this.request(
      `/projects/${projectId}/publish`,
      { method: 'POST' },
      token
    );
  }

  async reactivateProject(
    projectId: string,
    token: string
  ): Promise<{ stripeCheckoutUrl: string }> {
    return this.request(
      `/projects/${projectId}/reactivate`,
      { method: 'POST' },
      token
    );
  }

  async saveAsTemplate(
    projectId: string,
    token: string
  ): Promise<{ templateId: string }> {
    return this.request(
      `/projects/${projectId}/template`,
      { method: 'POST' },
      token
    );
  }

  // === Public Pages ===

  async getPublicPage(slug: string): Promise<PublicPageData> {
    return this.request(`/public/pages/${slug}`);
  }

  async unlockPage(slug: string, password: string): Promise<PublicPageData> {
    return this.request(`/public/pages/${slug}/unlock`, {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
  }

  async submitResponse(
    slug: string,
    fields: Record<string, unknown>,
    visitorName?: string
  ): Promise<{ id: string }> {
    return this.request(`/public/pages/${slug}/responses`, {
      method: 'POST',
      body: JSON.stringify({ fields, visitorName }),
    });
  }

  async recordAnalyticsEvent(slug: string, eventType: string): Promise<void> {
    return this.request(`/public/pages/${slug}/analytics`, {
      method: 'POST',
      body: JSON.stringify({ eventType }),
    });
  }

  // === Media ===

  async requestUploadUrl(
    projectId: string,
    token: string,
    data: UploadUrlRequest
  ): Promise<UploadUrlResponse> {
    return this.request(
      `/projects/${projectId}/media/upload-url`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async confirmUpload(
    projectId: string,
    token: string,
    mediaId: string
  ): Promise<{ publicUrl: string }> {
    return this.request(
      `/projects/${projectId}/media/${mediaId}/confirm`,
      { method: 'POST' },
      token
    );
  }

  async uploadDirect(
    projectId: string,
    token: string,
    file: File
  ): Promise<{ publicUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.request(
      `/projects/${projectId}/media/upload`,
      {
        method: 'POST',
        body: formData,
      },
      token
    );
  }

  async listMedia(projectId: string, token: string): Promise<MediaItem[]> {
    return this.request(`/projects/${projectId}/media`, {}, token);
  }

  async deleteMedia(projectId: string, token: string, mediaId: string): Promise<void> {
    return this.request(
      `/projects/${projectId}/media/${mediaId}`,
      { method: 'DELETE' },
      token
    );
  }

  // === AI ===

  async generateText(token: string, data: AITextRequest): Promise<AITextResponse> {
    return this.request(
      '/ai/generate-text',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async generateTheme(token: string, data: AIThemeRequest): Promise<AIThemeResponse> {
    return this.request(
      '/ai/generate-theme',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async generatePage(data: AIPageRequest, token?: string): Promise<AIPageResponse> {
    return this.request(
      '/ai/generate-page',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async editCanvas(data: AIEditRequest, token: string): Promise<AIEditResponse> {
    return this.request(
      '/ai/edit-canvas',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token
    );
  }

  async generateImage(data: AIImageRequest, token?: string): Promise<AIImageResponse> {
    return this.request(
      '/ai/generate-image',
      {
        method: 'POST',
        body: JSON.stringify(data),
      },
      token || ''
    );
  }

  async getBackgrounds(search?: string): Promise<Array<{ id: string; fileName: string; publicUrl: string }>> {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/backgrounds${query}`);
  }

  // === Analytics ===

  async getAnalytics(projectId: string, token: string): Promise<AnalyticsSummary> {
    return this.request(`/projects/${projectId}/analytics`, {}, token);
  }

  // === Responses ===

  async getResponses(projectId: string, token: string): Promise<ResponsesData> {
    return this.request(`/projects/${projectId}/responses`, {}, token);
  }

  // === Templates ===

  async listTemplates(eventType?: string): Promise<Template[]> {
    const query = eventType ? `?eventType=${eventType}` : '';
    return this.request(`/templates${query}`);
  }

  // === Convenience aliases ===

  async saveContent(projectId: string, token: string, canvasData: CanvasData) {
    return this.updateProjectContent(projectId, token, canvasData);
  }

  async createCheckout(
    projectId: string,
    token: string
  ): Promise<{ checkoutUrl: string }> {
    return this.request(
      `/projects/${projectId}/checkout`,
      { method: 'POST' },
      token
    );
  }
}

export const api = new ApiClient(API_BASE);
