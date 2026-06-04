'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useProjectStore } from '@/stores/projectStore';
import { useEditorStore } from '@/stores/editorStore';
import { api } from '@/lib/api';
import { EditorLayout } from '@/components/editor/EditorLayout';
import { SaveLinkPrompt } from '@/components/editor/SaveLinkPrompt';

export default function EditPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const [showSaveLink, setShowSaveLink] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const { setProject, setManagementToken, setLoading, setError } = useProjectStore();
  const { loadCanvas } = useEditorStore();

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        // Get token from sessionStorage (set during creation) or URL
        const token = sessionStorage.getItem(`mp_token_${projectId}`);
        if (!token) {
          setError('Management token not found. Please use your management link.');
          return;
        }

        setManagementToken(token);

        const project = await api.getProject(projectId, token);
        setProject(project);

        // Load canvas content (template or saved)
        const content = await api.getProjectContent(projectId, token);
        const canvasData = content.canvasJson;
        if (canvasData && typeof canvasData === 'object' && Object.keys(canvasData).length > 0) {
          // Normalize: templates store flat { width, height, elements },
          // but loadCanvas expects { canvas: {...}, elements: [...] }
          const normalized = 'canvas' in canvasData
            ? canvasData
            : {
                version: 1,
                canvas: {
                  width: (canvasData as any).width ?? 1080,
                  height: (canvasData as any).height ?? 1920,
                  backgroundColor: (canvasData as any).backgroundColor ?? '#ffffff',
                  gridEnabled: false,
                  snapToGrid: false,
                },
                elements: (canvasData as any).elements ?? [],
              };
          loadCanvas(normalized);
        }

        setIsLoaded(true);

        // Show save link prompt on first visit
        const hasSeenPrompt = sessionStorage.getItem(`mp_seen_prompt_${projectId}`);
        if (!hasSeenPrompt) {
          setShowSaveLink(true);
          sessionStorage.setItem(`mp_seen_prompt_${projectId}`, 'true');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [projectId, setProject, setManagementToken, setLoading, setError, loadCanvas]);

  const managementToken = useProjectStore((s) => s.managementToken);
  const error = useProjectStore((s) => s.error);
  const isLoading = useProjectStore((s) => s.isLoading);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900">Unable to load editor</h2>
          <p className="mt-2 text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) return null;

  const managementUrl = `${window.location.origin}/manage/${managementToken}`;

  return (
    <>
      <EditorLayout />
      {showSaveLink && (
        <SaveLinkPrompt
          managementUrl={managementUrl}
          onClose={() => setShowSaveLink(false)}
        />
      )}
    </>
  );
}
