import type { CanvasElement } from '@/types/editor';

interface ImageElementProps {
  element: CanvasElement;
}

export function ImageElement({ element }: ImageElementProps) {
  const content = element.content as { src: string; alt?: string; objectFit?: string };

  return (
    <img
      src={content.src}
      alt={content.alt || ''}
      className="w-full h-full"
      style={{ objectFit: (content.objectFit as React.CSSProperties['objectFit']) || 'cover' }}
      draggable={false}
    />
  );
}
