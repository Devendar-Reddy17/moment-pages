export interface ApiError {
  status: number;
  message: string;
  details?: Record<string, string>;
}

export interface UploadUrlRequest {
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  mediaId: string;
  fileKey: string;
}

export interface MediaItem {
  id: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  width?: number;
  height?: number;
  durationSecs?: number;
  publicUrl: string;
  uploadedAt: string;
}

export interface AITextRequest {
  projectId: string;
  eventType: string;
  tone: 'formal' | 'casual' | 'playful' | 'romantic';
  recipientName?: string;
  additionalContext?: string;
}

export interface AITextSuggestion {
  title: string;
  body: string;
  cta: string;
}

export interface AITextResponse {
  suggestions: AITextSuggestion[];
}

export interface AIThemeRequest {
  projectId: string;
  description: string;
}

export interface AIThemeResponse {
  colorPalette: string[];
  typography: {
    heading: string;
    body: string;
  };
  layoutSuggestion: string;
  backgroundPrompt: string;
}

export interface AIPageRequest {
  projectId?: string;
  prompt: string;
}

export interface AIPageResponse {
  canvas: {
    width: number;
    height: number;
    backgroundColor: string;
    backgroundImagePrompt?: string;
  };
  pages: Array<{
    name: string;
    elements: Array<Record<string, unknown>>;
  }>;
}

export interface AIEditRequest {
  projectId: string;
  prompt: string;
  canvasState: string;
}

export interface AIEditResponse {
  operations: Array<{
    type: 'add' | 'delete' | 'modify' | 'add-page' | 'delete-page' | 'move-to-page' | 'set-background-image';
    elementId: string;
    element?: Record<string, unknown>;
    targetPage?: number;
    pageName?: string;
    imagePrompt?: string;
  }>;
}

export interface AIImageRequest {
  prompt: string;
  projectId?: string;
}

export interface AIImageResponse {
  imageUrl: string;
}

export interface Template {
  id: string;
  slug: string;
  name: string;
  eventType: string;
  category: string;
  thumbnailUrl: string;
  layoutDefinition: object;
}

export interface PublicPageData {
  canvasJson: object;
  title?: string;
  eventType: string;
  requiresPassword: boolean;
}
