import type { CanvasElement } from '@/types/editor';

interface TextElementProps {
  element: CanvasElement;
}

export function TextElement({ element }: TextElementProps) {
  const content = element.content as { html: string };

  return (
    <div
      className="w-full h-full flex items-center"
      dangerouslySetInnerHTML={{ __html: content.html || '' }}
    />
  );
}
