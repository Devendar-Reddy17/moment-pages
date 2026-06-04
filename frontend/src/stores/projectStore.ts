import { create } from 'zustand';
import type { Project } from '@/types/project';

interface ProjectState {
  project: Project | null;
  managementToken: string | null;
  isLoading: boolean;
  error: string | null;
}

interface ProjectActions {
  setProject: (project: Project) => void;
  setManagementToken: (token: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type ProjectStore = ProjectState & ProjectActions;

export const useProjectStore = create<ProjectStore>((set) => ({
  project: null,
  managementToken: null,
  isLoading: false,
  error: null,

  setProject: (project) => set({ project, error: null }),
  setManagementToken: (token) => set({ managementToken: token }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  reset: () => set({ project: null, managementToken: null, isLoading: false, error: null }),
}));
