'use client';

import { useState, useEffect } from 'react';
import type { CanvasData, CanvasElement } from '@/types/editor';
import { TextElement } from './TextElement';
import { ImageElement } from './ImageElement';
import { VideoElement } from '../public/VideoElement';
import { AudioElement } from './AudioElement';
import { FormElement } from './FormElement';
import { ShapeElement } from './ShapeElement';
import { api } from '@/lib/api';

interface PageRendererProps {
  canvasJson: CanvasData;
  slug: string;
}

function renderPage(
  elements: CanvasElement[],
  formValues: Record<string, unknown>,
  onFieldChange: (fieldId: string, value: unknown) => void,
  pageKey: string,
) {
  return (
    <>
      {[...elements]
        .sort((a, b) => a.zIndex - b.zIndex)
        .map((element) => (
          <div
            key={`${pageKey}-${element.id}`}
            className="absolute"
            style={{
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              transform: `rotate(${element.rotation}deg)`,
              opacity: element.opacity,
            }}
          >
            {renderElement(element, formValues, onFieldChange)}
          </div>
        ))}
    </>
  );
}

export function PageRenderer({ canvasJson, slug }: PageRendererProps) {
  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scale, setScale] = useState(1);

  const { canvas } = canvasJson;
  const pages = canvasJson.pages && canvasJson.pages.length > 0
    ? canvasJson.pages
    : [{ id: 'page-1', name: 'Page 1', elements: canvasJson.elements }];

  const allFormElements = pages.flatMap((p) => p.elements.filter((el) => el.type === 'form-element'));
  const hasForm = allFormElements.length > 0;

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Try to find visitor name from form fields
      let visitorName: string | undefined;
      for (const el of allFormElements) {
        const fc = el.content as { fieldId: string; label: string };
        const val = formValues[fc.fieldId];
        if (val && typeof val === 'string' &&
            (fc.label.toLowerCase().includes('name') || fc.fieldId.toLowerCase().includes('name'))) {
          visitorName = val;
          break;
        }
      }
      await api.submitResponse(slug, formValues, visitorName);
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate scale based on window size
  const calculateScale = () => {
    if (typeof window === 'undefined') return 1;
    const padding = 32; // py-4 = 16px * 2
    const availableWidth = window.innerWidth - padding;
    return Math.min(1, availableWidth / canvas.width);
  };

  // Update scale on mount and window resize
  useEffect(() => {
    setScale(calculateScale());

    const handleResize = () => {
      setScale(calculateScale());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvas.width]);

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-4 gap-4">
      {pages.map((page) => (
        <div
          key={page.id}
          className="relative overflow-hidden mx-auto shadow-lg"
          style={{
            width: canvas.width * scale,
            height: canvas.height * scale,
            backgroundColor: canvas.backgroundColor,
            backgroundImage: canvas.backgroundImage
              ? `url(${canvas.backgroundImage})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
          }}
        >
          {renderPage(page.elements, formValues, handleFieldChange, page.id)}
        </div>
      ))}

      {/* Submit button for form responses */}
      {hasForm && !submitted && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-3 bg-rose-500 text-white rounded-full font-medium shadow-lg hover:bg-rose-600 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Sending...' : 'Submit Response'}
          </button>
        </div>
      )}

      {submitted && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-green-50 border border-green-200 rounded-full px-6 py-3">
          <p className="text-green-700 font-medium text-sm">
            ✓ Response submitted! Thank you.
          </p>
        </div>
      )}
    </div>
  );
}

function renderElement(
  element: CanvasElement,
  formValues: Record<string, unknown>,
  onFieldChange: (fieldId: string, value: unknown) => void
) {
  switch (element.type) {
    case 'text':
      return <TextElement element={element} />;
    case 'image':
      return <ImageElement element={element} />;
    case 'video':
      return <VideoElement element={element} />;
    case 'audio':
      return <AudioElement element={element} />;
    case 'shape':
      return <ShapeElement element={element} />;
    case 'form-element':
      return (
        <FormElement
          element={element}
          value={formValues[(element.content as { fieldId: string }).fieldId]}
          onChange={onFieldChange}
        />
      );
    default:
      return null;
  }
}
