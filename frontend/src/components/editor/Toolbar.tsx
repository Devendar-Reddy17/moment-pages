'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEditorStore } from '@/stores/editorStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Grid3x3,
  Magnet,
  Monitor,
  Smartphone,
  Save,
  Eye,
  Send,
  Loader2,
} from 'lucide-react';

export function Toolbar() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.projectId as string | undefined;
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    zoom,
    setZoom,
    gridEnabled,
    toggleGrid,
    snapEnabled,
    toggleSnap,
    previewMode,
    setPreviewMode,
    isDirty,
    history,
    undo,
    redo,
    getCanvasData,
    markClean,
  } = useEditorStore();

  const getToken = () => {
    if (!projectId) return null;
    return sessionStorage.getItem(`mp_token_${projectId}`);
  };

  const handleSave = async () => {
    if (!projectId || !isDirty) return;
    const token = getToken();
    if (!token) return;

    setIsSaving(true);
    try {
      const canvasData = getCanvasData();
      await api.saveContent(projectId, token, canvasData);
      markClean();
      toast.success('Saved!');
    } catch {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!projectId) return;
    const token = getToken();
    if (!token) return;

    setIsPublishing(true);
    try {
      // Save first
      if (isDirty) {
        const canvasData = getCanvasData();
        await api.saveContent(projectId, token, canvasData);
        markClean();
      }
      // Navigate to mock payment page
      router.push(`/payment/${projectId}`);
    } catch {
      toast.error('Failed to save');
      setIsPublishing(false);
    }
  };

  return (
    <div className="h-12 bg-white border-b border-gray-200 flex items-center px-4 gap-2 shrink-0">
      {/* Logo */}
      <span className="text-sm font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent mr-4">
        MomentPages
      </span>

      <Separator orientation="vertical" className="h-6" />

      {/* Undo / Redo */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={undo}
        disabled={history.past.length === 0}
        title="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={redo}
        disabled={history.future.length === 0}
        title="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Zoom */}
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setZoom(zoom - 0.1)}
        title="Zoom out"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      <span className="text-xs text-gray-600 w-12 text-center">
        {Math.round(zoom * 100)}%
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => setZoom(zoom + 0.1)}
        title="Zoom in"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Grid & Snap */}
      <Button
        variant={gridEnabled ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={toggleGrid}
        title="Toggle grid"
      >
        <Grid3x3 className="h-4 w-4" />
      </Button>
      <Button
        variant={snapEnabled ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={toggleSnap}
        title="Toggle snap"
      >
        <Magnet className="h-4 w-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Preview */}
      <Button
        variant={previewMode === 'desktop' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => setPreviewMode(previewMode === 'desktop' ? null : 'desktop')}
        title="Desktop preview"
      >
        <Monitor className="h-4 w-4" />
      </Button>
      <Button
        variant={previewMode === 'mobile' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-8 w-8"
        onClick={() => setPreviewMode(previewMode === 'mobile' ? null : 'mobile')}
        title="Mobile preview"
      >
        <Smartphone className="h-4 w-4" />
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Save status */}
      {isDirty && (
        <span className="text-xs text-amber-600 mr-2">Unsaved changes</span>
      )}

      {/* Actions */}
      <Button
        variant={previewMode !== null ? 'secondary' : 'ghost'}
        size="sm"
        className="h-8"
        onClick={() => setPreviewMode(previewMode !== null ? null : 'desktop')}
      >
        <Eye className="h-4 w-4 mr-1" />
        {previewMode !== null ? 'Edit' : 'Preview'}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className="h-8"
        onClick={handleSave}
        disabled={!isDirty || isSaving}
      >
        {isSaving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
        Save
      </Button>
      <Button
        size="sm"
        className="h-8 bg-gradient-to-r from-rose-500 to-purple-600"
        onClick={handlePublish}
        disabled={isPublishing}
      >
        {isPublishing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
        Publish
      </Button>
    </div>
  );
}
