import type { CanvasElement } from '@/types/editor';

interface AudioElementProps {
  element: CanvasElement;
}

export function AudioElement({ element }: AudioElementProps) {
  const content = element.content as { src: string };

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 rounded-lg border border-gray-200 p-2">
      <audio controls className="w-full max-w-full" preload="metadata">
        <source src={content.src} />
        Your browser does not support audio playback.
      </audio>
    </div>
  );
}
