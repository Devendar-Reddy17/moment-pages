'use client';

import { buildCanvasFromTemplate } from '@/lib/templateBuilder';
import type { CanvasElement } from '@/types/editor';

interface TemplatePreviewProps {
  templateId: string;
  previewEventType?: string;
}

function renderPreviewElement(element: CanvasElement, scale: number) {
  const { x, y, width, height, opacity, content, type } = element;
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    left: x * scale,
    top: y * scale,
    width: width * scale,
    height: height * scale,
    opacity,
    overflow: 'hidden',
  };

  if (type === 'text') {
    const tc = content as { html: string; color?: string; fontSize?: number; textAlign?: string };
    return (
      <div
        key={element.id}
        style={baseStyle}
        dangerouslySetInnerHTML={{ __html: tc.html }}
      />
    );
  }

  if (type === 'shape') {
    const sc = content as { shapeType: string; fill?: string };
    const isCircle = sc.shapeType === 'circle';
    return (
      <div
        key={element.id}
        style={{
          ...baseStyle,
          backgroundColor: sc.fill || '#e2e8f0',
          borderRadius: isCircle ? '50%' : 0,
        }}
      />
    );
  }

  if (type === 'form-element') {
    return (
      <div
        key={element.id}
        style={{
          ...baseStyle,
          border: '1px solid #d1d5db',
          borderRadius: 4,
          backgroundColor: '#f9fafb',
        }}
      />
    );
  }

  return null;
}

export function TemplatePreview({ templateId, previewEventType = 'custom' }: TemplatePreviewProps) {
  const canvasData = buildCanvasFromTemplate(templateId, previewEventType);

  if (!canvasData) {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-sm">Preview unavailable</span>
      </div>
    );
  }

  const { canvas, elements } = canvasData;
  const containerWidth = 300;
  const scale = containerWidth / canvas.width;
  const maxHeight = 400; // cap preview height
  const containerHeight = Math.min(canvas.height * scale, maxHeight);

  return (
    <div
      className="w-full overflow-hidden relative"
      style={{ height: containerHeight }}
    >
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 origin-top"
        style={{
          width: canvas.width,
          height: canvas.height,
          transform: `scale(${scale})`,
          backgroundColor: canvas.backgroundColor,
        }}
      >
        {[...elements]
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((el) => renderPreviewElement(el, 1))}
      </div>
    </div>
  );
}
