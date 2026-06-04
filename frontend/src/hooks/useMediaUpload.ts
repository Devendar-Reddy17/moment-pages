import { useState, useCallback } from 'react';
import { api } from '@/lib/api';
import { useProjectStore } from '@/stores/projectStore';
import { UPLOAD_LIMITS } from '@/lib/constants';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export function useMediaUpload() {
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null,
  });

  const project = useProjectStore((s) => s.project);
  const managementToken = useProjectStore((s) => s.managementToken);

  const validateFile = useCallback((file: File): string | null => {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const isAudio = file.type.startsWith('audio/');

    if (isImage) {
      if (!UPLOAD_LIMITS.image.types.includes(file.type as never)) {
        return 'Unsupported image format. Use JPEG, PNG, WebP, or GIF.';
      }
      if (file.size > UPLOAD_LIMITS.image.maxSize) {
        return 'Image must be under 10 MB.';
      }
    } else if (isVideo) {
      if (!UPLOAD_LIMITS.video.types.includes(file.type as never)) {
        return 'Unsupported video format. Use MP4 or WebM.';
      }
      if (file.size > UPLOAD_LIMITS.video.maxSize) {
        return 'Video must be under 100 MB.';
      }
    } else if (isAudio) {
      if (!UPLOAD_LIMITS.audio.types.includes(file.type as never)) {
        return 'Unsupported audio format. Use MP3, WAV, OGG, or WebM.';
      }
      if (file.size > UPLOAD_LIMITS.audio.maxSize) {
        return 'Audio must be under 20 MB.';
      }
    } else {
      return 'Unsupported file type.';
    }

    return null;
  }, []);

  const upload = useCallback(
    async (file: File): Promise<string | null> => {
      if (!project || !managementToken) {
        setState((s) => ({ ...s, error: 'No active project' }));
        return null;
      }

      const validationError = validateFile(file);
      if (validationError) {
        setState((s) => ({ ...s, error: validationError }));
        return null;
      }

      setState({ isUploading: true, progress: 0, error: null });

      try {
        // Upload directly through backend proxy (avoids R2 CORS issues)
        const { publicUrl } = await api.uploadDirect(project.id, managementToken, file);

        setState({ isUploading: false, progress: 100, error: null });
        return publicUrl;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Upload failed';
        setState({ isUploading: false, progress: 0, error: message });
        return null;
      }
    },
    [project, managementToken, validateFile]
  );

  const clearError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  return { ...state, upload, clearError };
}
