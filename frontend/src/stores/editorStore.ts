import { create } from 'zustand';
import type { CanvasElement, CanvasSettings, EditorState, CanvasData, Page } from '@/types/editor';
import { CANVAS_DEFAULTS } from '@/lib/constants';

interface EditorActions {
  // Element operations
  addElement: (element: CanvasElement) => void;
  updateElement: (id: string, updates: Partial<CanvasElement>) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  selectElement: (id: string | null) => void;

  // Layer operations
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  moveUp: (id: string) => void;
  moveDown: (id: string) => void;

  // Canvas operations
  updateCanvas: (updates: Partial<CanvasSettings>) => void;
  setZoom: (zoom: number) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  setPreviewMode: (mode: 'desktop' | 'mobile' | null) => void;

  // Page operations
  goToPage: (index: number) => void;
  addPage: () => void;
  removePage: (index: number) => void;
  renamePage: (index: number, name: string) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  // Persistence
  loadCanvas: (data: CanvasData) => void;
  getCanvasData: () => CanvasData;
  markClean: () => void;
}

type EditorStore = EditorState & EditorActions;

const MAX_HISTORY = 50;

function createPage(id: string, name: string, elements: CanvasElement[] = []): Page {
  return { id, name, elements };
}

export const useEditorStore = create<EditorStore>((set, get) => ({
  // Initial state
  canvas: {
    width: CANVAS_DEFAULTS.width,
    height: CANVAS_DEFAULTS.height,
    backgroundColor: CANVAS_DEFAULTS.backgroundColor,
  },
  elements: [],
  pages: [createPage('page-1', 'Page 1')],
  currentPageIndex: 0,
  selectedElementId: null,
  history: { past: [], future: [] },
  previewMode: null,
  gridEnabled: true,
  snapEnabled: true,
  isDirty: false,
  zoom: 1,

  // Element operations
  addElement: (element) => {
    const state = get();
    state.pushHistory();
    set({
      elements: [...state.elements, element],
      selectedElementId: element.id,
      isDirty: true,
    });
  },

  updateElement: (id, updates) => {
    set((state) => ({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, ...updates } : el
      ),
      isDirty: true,
    }));
  },

  deleteElement: (id) => {
    const state = get();
    state.pushHistory();
    set({
      elements: state.elements.filter((el) => el.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
      isDirty: true,
    });
  },

  duplicateElement: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    if (!element) return;

    state.pushHistory();
    const newElement: CanvasElement = {
      ...element,
      id: `el_${crypto.randomUUID().slice(0, 8)}`,
      x: element.x + 20,
      y: element.y + 20,
      zIndex: Math.max(...state.elements.map((el) => el.zIndex)) + 1,
    };
    set({
      elements: [...state.elements, newElement],
      selectedElementId: newElement.id,
      isDirty: true,
    });
  },

  selectElement: (id) => set({ selectedElementId: id }),

  // Layer operations
  bringToFront: (id) => {
    const state = get();
    const maxZ = Math.max(...state.elements.map((el) => el.zIndex));
    set({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: maxZ + 1 } : el
      ),
      isDirty: true,
    });
  },

  sendToBack: (id) => {
    const state = get();
    const minZ = Math.min(...state.elements.map((el) => el.zIndex));
    set({
      elements: state.elements.map((el) =>
        el.id === id ? { ...el, zIndex: minZ - 1 } : el
      ),
      isDirty: true,
    });
  },

  moveUp: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    if (!element) return;
    const sorted = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((el) => el.id === id);
    if (idx < sorted.length - 1) {
      const swapWith = sorted[idx + 1];
      set({
        elements: state.elements.map((el) => {
          if (el.id === id) return { ...el, zIndex: swapWith.zIndex };
          if (el.id === swapWith.id) return { ...el, zIndex: element.zIndex };
          return el;
        }),
        isDirty: true,
      });
    }
  },

  moveDown: (id) => {
    const state = get();
    const element = state.elements.find((el) => el.id === id);
    if (!element) return;
    const sorted = [...state.elements].sort((a, b) => a.zIndex - b.zIndex);
    const idx = sorted.findIndex((el) => el.id === id);
    if (idx > 0) {
      const swapWith = sorted[idx - 1];
      set({
        elements: state.elements.map((el) => {
          if (el.id === id) return { ...el, zIndex: swapWith.zIndex };
          if (el.id === swapWith.id) return { ...el, zIndex: element.zIndex };
          return el;
        }),
        isDirty: true,
      });
    }
  },

  // Canvas operations
  updateCanvas: (updates) =>
    set((state) => ({
      canvas: { ...state.canvas, ...updates },
      isDirty: true,
    })),

  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(3, zoom)) }),

  toggleGrid: () => set((state) => ({ gridEnabled: !state.gridEnabled })),

  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),

  setPreviewMode: (mode) => set({ previewMode: mode }),

  // Page operations
  goToPage: (index) => {
    const state = get();
    if (index < 0 || index >= state.pages.length || index === state.currentPageIndex) return;
    // Save current page
    const updatedPages = state.pages.map((p, i) =>
      i === state.currentPageIndex ? { ...p, elements: JSON.parse(JSON.stringify(state.elements)) } : p
    );
    set({
      pages: updatedPages,
      elements: JSON.parse(JSON.stringify(updatedPages[index].elements)),
      currentPageIndex: index,
      selectedElementId: null,
    });
  },

  addPage: () => {
    const state = get();
    if (state.pages.length >= 3) return;
    // Save current page
    const updatedPages = state.pages.map((p, i) =>
      i === state.currentPageIndex ? { ...p, elements: JSON.parse(JSON.stringify(state.elements)) } : p
    );
    const newIndex = updatedPages.length;
    const newPage = createPage(`page-${newIndex + 1}`, `Page ${newIndex + 1}`);
    set({
      pages: [...updatedPages, newPage],
      elements: [],
      currentPageIndex: newIndex,
      selectedElementId: null,
      isDirty: true,
    });
  },

  removePage: (index) => {
    const state = get();
    if (state.pages.length <= 1 || index < 0 || index >= state.pages.length) return;
    const newPages = state.pages.filter((_, i) => i !== index);
    const newIndex = Math.min(state.currentPageIndex, newPages.length - 1);
    // Renumber remaining pages
    const renumbered = newPages.map((p, i) => ({ ...p, id: `page-${i + 1}`, name: p.name || `Page ${i + 1}` }));
    set({
      pages: renumbered,
      elements: JSON.parse(JSON.stringify(renumbered[newIndex].elements)),
      currentPageIndex: newIndex,
      selectedElementId: null,
      isDirty: true,
    });
  },

  renamePage: (index, name) => {
    set((state) => ({
      pages: state.pages.map((p, i) => (i === index ? { ...p, name } : p)),
      isDirty: true,
    }));
  },

  // History
  pushHistory: () => {
    const state = get();
    const currentPages = state.pages.map((p, i) =>
      i === state.currentPageIndex ? { ...p, elements: JSON.parse(JSON.stringify(state.elements)) } : { ...p }
    );
    const snapshot: CanvasData = {
      version: 1,
      canvas: state.canvas,
      elements: JSON.parse(JSON.stringify(state.elements)),
      pages: currentPages,
      currentPageIndex: state.currentPageIndex,
    };
    set({
      history: {
        past: [...state.history.past.slice(-MAX_HISTORY), snapshot],
        future: [],
      },
    });
  },

  undo: () => {
    const state = get();
    if (state.history.past.length === 0) return;

    const previous = state.history.past[state.history.past.length - 1];
    const currentPages = state.pages.map((p, i) =>
      i === state.currentPageIndex ? { ...p, elements: JSON.parse(JSON.stringify(state.elements)) } : { ...p }
    );
    const currentSnapshot: CanvasData = {
      version: 1,
      canvas: state.canvas,
      elements: JSON.parse(JSON.stringify(state.elements)),
      pages: currentPages,
      currentPageIndex: state.currentPageIndex,
    };

    set({
      canvas: previous.canvas,
      elements: previous.elements ?? [],
      pages: previous.pages ? JSON.parse(JSON.stringify(previous.pages)) : currentPages,
      currentPageIndex: previous.currentPageIndex ?? state.currentPageIndex,
      history: {
        past: state.history.past.slice(0, -1),
        future: [currentSnapshot, ...state.history.future],
      },
      isDirty: true,
    });
  },

  redo: () => {
    const state = get();
    if (state.history.future.length === 0) return;

    const next = state.history.future[0];
    const currentPages = state.pages.map((p, i) =>
      i === state.currentPageIndex ? { ...p, elements: JSON.parse(JSON.stringify(state.elements)) } : { ...p }
    );
    const currentSnapshot: CanvasData = {
      version: 1,
      canvas: state.canvas,
      elements: JSON.parse(JSON.stringify(state.elements)),
      pages: currentPages,
      currentPageIndex: state.currentPageIndex,
    };

    set({
      canvas: next.canvas,
      elements: next.elements ?? [],
      pages: next.pages ? JSON.parse(JSON.stringify(next.pages)) : currentPages,
      currentPageIndex: next.currentPageIndex ?? state.currentPageIndex,
      history: {
        past: [...state.history.past, currentSnapshot],
        future: state.history.future.slice(1),
      },
      isDirty: true,
    });
  },

  // Persistence
  loadCanvas: (data) => {
    if (data.pages && data.pages.length > 0) {
      const idx = data.currentPageIndex ?? 0;
      const safeIdx = Math.min(idx, data.pages.length - 1);
      set({
        canvas: data.canvas,
        elements: JSON.parse(JSON.stringify(data.pages[safeIdx].elements)),
        pages: JSON.parse(JSON.stringify(data.pages)),
        currentPageIndex: safeIdx,
        selectedElementId: null,
        history: { past: [], future: [] },
        isDirty: false,
      });
    } else {
      // Backward compat: single page
      set({
        canvas: data.canvas,
        elements: data.elements,
        pages: [createPage('page-1', 'Page 1', JSON.parse(JSON.stringify(data.elements)))],
        currentPageIndex: 0,
        selectedElementId: null,
        history: { past: [], future: [] },
        isDirty: false,
      });
    }
  },

  getCanvasData: () => {
    const state = get();
    // Save current page before returning
    const pages = state.pages.map((p, i) =>
      i === state.currentPageIndex ? { ...p, elements: JSON.parse(JSON.stringify(state.elements)) } : { ...p }
    );
    return {
      version: 1,
      canvas: state.canvas,
      elements: JSON.parse(JSON.stringify(state.elements)),
      pages,
      currentPageIndex: state.currentPageIndex,
    };
  },

  markClean: () => set({ isDirty: false }),
}));
