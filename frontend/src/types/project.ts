export type ProjectStatus = 'draft' | 'published' | 'archived';

export type EventType =
  | 'coffee'
  | 'dinner'
  | 'date'
  | 'birthday'
  | 'proposal'
  | 'anniversary'
  | 'custom';

export interface Project {
  id: string;
  publicSlug?: string;
  managementToken: string;
  title?: string;
  eventType: EventType;
  eventDate?: string;
  status: ProjectStatus;
  hasPassword: boolean;
  customDomain?: string;
  templateId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
}

export interface ProjectCreateRequest {
  eventType: EventType;
  templateId?: string;
  canvasJson?: string;
  projectId?: string;
}

export interface ProjectCreateResponse {
  projectId: string;
  managementToken: string;
  managementUrl: string;
  editorUrl: string;
}

export interface ProjectSettings {
  title?: string;
  eventDate?: string;
  password?: string;
  removePassword?: boolean;
}

export interface AnalyticsSummary {
  totalViews: number;
  uniqueViews: number;
  unlocks: number;
  totalResponses: number;
  viewsByDay: { date: string; count: number }[];
}

export interface PageResponse {
  id: string;
  visitorName?: string;
  submittedAt: string;
  fields: Record<string, unknown>;
}

export interface ResponsesData {
  totalResponses: number;
  formFields: {
    fieldId: string;
    label: string;
    type: string;
  }[];
  responses: PageResponse[];
}
