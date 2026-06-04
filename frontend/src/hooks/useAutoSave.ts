import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';
import { api } from '@/lib/api';
import { AUTO_SAVE_INTERVAL_MS } from '@/lib/constants';

export function useAutoSave() {
  const isDirty = useEditorStore((s) => s.isDirty);
  const getCanvasData = useEditorStore((s) => s.getCanvasData);
  const markClean = useEditorStore((s) => s.markClean);
  const project = useProjectStore((s) => s.project);
  const managementToken = useProjectStore((s) => s.managementToken);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  const save = useCallback(async () => {
    if (!project || !managementToken || isSavingRef.current) return;
    if (!isDirty) return;

    isSavingRef.current = true;
    try {
      const canvasData = getCanvasData();
      await api.updateProjectContent(project.id, managementToken, canvasData);
      markClean();
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [project, managementToken, isDirty, getCanvasData, markClean]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      save();
    }, AUTO_SAVE_INTERVAL_MS);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [save]);

  return { save, isSaving: isSavingRef.current };
}
