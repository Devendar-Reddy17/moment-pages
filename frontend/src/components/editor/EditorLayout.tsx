'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Toolbar } from './Toolbar';
import { LeftPanel } from './LeftPanel';
import { RightPanel } from './RightPanel';
import { Canvas } from './Canvas';
import { PageTabs } from './PageTabs';
import { PageRenderer } from '@/components/page-renderer/PageRenderer';
import { AIPromptBox } from '@/components/AIPromptBox';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useEditorStore } from '@/stores/editorStore';
import { useProjectStore } from '@/stores/projectStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { CanvasElement } from '@/types/editor';

export function EditorLayout() {
  useAutoSave();

  const { undo, redo, deleteElement, duplicateElement, selectedElementId, previewMode, getCanvasData, loadCanvas } = useEditorStore();
  const { setProject, setManagementToken } = useProjectStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const ctrlOrMeta = e.ctrlKey || e.metaKey;

      if (ctrlOrMeta && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (ctrlOrMeta && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
        e.preventDefault();
        deleteElement(selectedElementId);
      } else if (ctrlOrMeta && e.key === 'd' && selectedElementId) {
        e.preventDefault();
        duplicateElement(selectedElementId);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, deleteElement, duplicateElement, selectedElementId]);

  const params = useParams();
  const projectId = params?.projectId as string | undefined;

  // Load project content on mount
  useEffect(() => {
    if (!projectId) return;

    const token = sessionStorage.getItem(`mp_token_${projectId}`);
    if (!token) return;

    const loadProject = async () => {
      try {
        const project = await api.getProject(projectId, token);
        setProject(project);
        setManagementToken(token);

        // Load canvas content if available
        const content = await api.getProjectContent(projectId, token);
        if (content.canvasJson) {
          loadCanvas(content.canvasJson);
        }
      } catch (error) {
        console.error('Failed to load project:', error);
      }
    };

    loadProject();
  }, [projectId, setProject, setManagementToken, loadCanvas]);

  const isPreview = previewMode !== null;
  const previewWidth = previewMode === 'mobile' ? 375 : 1080;

  const handleAIGenerate = async (prompt: string) => {
    const token = projectId ? sessionStorage.getItem(`mp_token_${projectId}`) : null;
    if (!token || !projectId) {
      toast.error('No project session');
      return;
    }

    try {
      const { elements, canvas, getCanvasData, addElement, deleteElement, updateElement, updateCanvas, addPage, removePage, goToPage, currentPageIndex, pages } = useEditorStore.getState();

      // Determine if this is an edit or a fresh generate
      const isEdit = elements.length > 0;

      if (isEdit) {
        // Use edit-canvas endpoint with current state
        const canvasData = getCanvasData();
        const result = await api.editCanvas(
          { projectId, prompt, canvasState: JSON.stringify(canvasData) },
          token
        );

        // Apply each operation
        for (const op of result.operations) {
          if (op.type === 'delete') {
            deleteElement(op.elementId);
          } else if (op.type === 'add' && op.element) {
            const element: CanvasElement = {
              id: `el_${crypto.randomUUID().slice(0, 8)}`,
              type: (op.element.type as CanvasElement['type']) || 'text',
              x: (op.element.x as number) ?? canvas.width / 2 - 200,
              y: (op.element.y as number) ?? 200,
              width: (op.element.width as number) ?? 400,
              height: (op.element.height as number) ?? 100,
              rotation: 0,
              zIndex: Date.now() + Math.random(),
              locked: false,
              opacity: 1,
              content: (op.element.content as CanvasElement['content']) || {
                html: '<p>Generated text</p>',
                plainText: 'Generated text',
                fontFamily: 'Inter',
                fontSize: 20,
                color: '#1f2937',
                textAlign: 'center',
              },
            };
            addElement(element);
          } else if (op.type === 'modify' && op.element) {
            // Special case for canvas background
            const content = op.element.content as Record<string, unknown>;
            if (op.elementId === 'canvas' && content?.backgroundColor) {
              updateCanvas({ backgroundColor: content.backgroundColor as string });
            } else {
              // Modify existing element
              const updates: Partial<CanvasElement> = {};
              if (op.element.x !== undefined) updates.x = op.element.x as number;
              if (op.element.y !== undefined) updates.y = op.element.y as number;
              if (op.element.width !== undefined) updates.width = op.element.width as number;
              if (op.element.height !== undefined) updates.height = op.element.height as number;
              if (op.element.content) updates.content = op.element.content as CanvasElement['content'];
              updateElement(op.elementId, updates);
            }
          } else if (op.type === 'add-page') {
            addPage();
            // Rename the new page if pageName is provided
            if (op.pageName) {
              const { renamePage } = useEditorStore.getState();
              renamePage(pages.length, op.pageName);
            }
          } else if (op.type === 'delete-page' && op.targetPage !== undefined) {
            if (op.targetPage >= 0 && op.targetPage < pages.length) {
              removePage(op.targetPage);
            }
          } else if (op.type === 'move-to-page' && op.targetPage !== undefined) {
            // Move element to another page
            const element = elements.find(el => el.id === op.elementId);
            if (element && op.targetPage >= 0 && op.targetPage < pages.length) {
              // Delete from current page
              deleteElement(op.elementId);
              // Navigate to target page
              goToPage(op.targetPage);
              // Add to target page
              addElement(element);
              // Navigate back to original page
              goToPage(currentPageIndex);
            }
          } else if (op.type === 'set-background-image' && op.imagePrompt) {
            // Generate image using DALL-E
            const imageResult = await api.generateImage({ prompt: op.imagePrompt }, token);
            // Set the background image
            updateCanvas({ backgroundImage: imageResult.imageUrl });
          }
        }

        toast.success(`Applied ${result.operations.length} edit${result.operations.length > 1 ? 's' : ''} with AI!`);
      } else {
        // Use generate-page endpoint for fresh canvas
        const result = await api.generatePage(
          { projectId, prompt },
          token
        );

        console.log('AI generate-page full response:', result);
        console.log('Canvas object:', result.canvas);
        console.log('backgroundImagePrompt:', result.canvas?.backgroundImagePrompt);

        // Apply background color
        if (result.canvas?.backgroundColor) {
          updateCanvas({ backgroundColor: result.canvas.backgroundColor });
        }

        // Generate background image if prompt is provided
        if (result.canvas?.backgroundImagePrompt) {
          console.log('Generating background image with prompt:', result.canvas.backgroundImagePrompt);
          try {
            const imageResult = await api.generateImage({ 
              prompt: result.canvas.backgroundImagePrompt,
              projectId 
            });
            console.log('Image generation result:', imageResult);
            console.log('Image URL:', imageResult.imageUrl);
            updateCanvas({ backgroundImage: imageResult.imageUrl });
          } catch (error) {
            console.error('Failed to generate background image:', error);
          }
        }

        // Handle multi-page response
        const { goToPage } = useEditorStore.getState();

        // For each page in the AI response
        for (let i = 0; i < result.pages.length; i++) {
          const pageData = result.pages[i];

          // If this is not the first page, create a new page
          if (i > 0) {
            addPage();
          }

          // Navigate to the page we're populating
          goToPage(i);

          // Add elements to this page
          for (const el of pageData.elements) {
            const element: CanvasElement = {
              id: `el_${crypto.randomUUID().slice(0, 8)}`,
              type: (el.type as CanvasElement['type']) || 'text',
              x: (el.x as number) ?? canvas.width / 2 - 200,
              y: (el.y as number) ?? 200,
              width: (el.width as number) ?? 400,
              height: (el.height as number) ?? 100,
              rotation: 0,
              zIndex: Date.now() + Math.random(),
              locked: false,
              opacity: 1,
              content: (el.content as CanvasElement['content']) || {
                html: '<p>Generated text</p>',
                plainText: 'Generated text',
                fontFamily: 'Inter',
                fontSize: 20,
                color: '#1f2937',
                textAlign: 'center',
              },
            };
            addElement(element);
          }
        }

        // Navigate back to the first page
        goToPage(0);

        const pageCount = result.pages.length;
        toast.success(`Generated ${pageCount} page${pageCount > 1 ? 's' : ''} with AI!`);
      }
    } catch {
      toast.error('AI operation failed. Please try again.');
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100">
      {/* Top Toolbar */}
      <Toolbar />

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Elements, Templates, Media */}
        {!isPreview && <LeftPanel />}

        {/* Canvas Area */}
        <div className={`flex-1 relative overflow-hidden flex flex-col ${isPreview ? 'bg-gray-800' : ''}`}>
          <div className="flex-1 flex items-center justify-center overflow-hidden">
            {isPreview ? (
              <div className="h-full overflow-auto py-8">
                <div
                  className="mx-auto shadow-2xl"
                  style={{
                    width: previewWidth,
                    maxWidth: '100%',
                  }}
                >
                  <PageRenderer canvasJson={getCanvasData()} slug="preview" />
                </div>
              </div>
            ) : (
              <Canvas />
            )}
          </div>
          {!isPreview && (
            <div className="border-t border-gray-200 bg-white px-4 py-3">
              <AIPromptBox
                onGenerate={handleAIGenerate}
                placeholder="Describe what you want to create or change..."
                buttonLabel="Generate"
              />
            </div>
          )}
          {!isPreview && <PageTabs />}
        </div>

        {/* Right Panel - Properties, Layers */}
        {!isPreview && <RightPanel />}
      </div>
    </div>
  );
}
