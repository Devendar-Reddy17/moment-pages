import type { CanvasElement } from '@/types/editor';

interface ShapeElementProps {
  element: CanvasElement;
}

export function ShapeElement({ element }: ShapeElementProps) {
  const content = element.content as {
    shapeType: string;
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    borderRadius?: number;
  };

  return (
    <div
      className="w-full h-full"
      style={{
        backgroundColor: content.fill || 'transparent',
        border: `${content.strokeWidth || 1}px solid ${content.stroke || '#000'}`,
        borderRadius: content.shapeType === 'circle' ? '50%' : (content.borderRadius || 0),
      }}
    />
  );
}
