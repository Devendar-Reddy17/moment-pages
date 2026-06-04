'use client';

import type { CanvasElement, MediaContent } from '@/types/editor';

interface VideoElementProps {
  element: CanvasElement;
}

export function VideoElement({ element }: VideoElementProps) {
  const content = element.content as MediaContent;

  if (!content.src) {
    return (
      <div
        className="absolute bg-amber-50 border border-amber-200 rounded flex items-center justify-center"
        style={{
          left: element.x,
          top: element.y,
          width: element.width,
          height: element.height,
          transform: `rotate(${element.rotation}deg)`,
          opacity: element.opacity,
        }}
      >
        <span className="text-sm text-amber-600">No video</span>
      </div>
    );
  }

  return (
    <div
      className="absolute overflow-hidden rounded"
      style={{
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: `rotate(${element.rotation}deg)`,
        opacity: element.opacity,
      }}
    >
      <video
        src={content.src}
        controls
        playsInline
        preload="metadata"
        className="w-full h-full"
        style={{ objectFit: content.objectFit || 'contain' }}
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
