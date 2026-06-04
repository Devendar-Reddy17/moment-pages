'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { api } from '@/lib/api';
import { EVENT_TYPES } from '@/lib/constants';
import { buildCanvasFromTemplate, buildCanvasFromLayout, getTemplateDefinition } from '@/lib/templateBuilder';
import type { EventType } from '@/types/project';
import type { LayoutDefinition } from '@/lib/templateBuilder';
import type { Template } from '@/types/api';

export default function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateId = searchParams.get('template');

  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [templateLayout, setTemplateLayout] = useState<LayoutDefinition | null>(null);

  // Fetch template layout from API on mount
  useEffect(() => {
    if (!templateId) return;

    const fetchTemplate = async () => {
      try {
        const templates = await api.listTemplates();
        const found = templates.find((t: Template) => t.slug === templateId || t.id === templateId);
        if (found && found.layoutDefinition) {
          let parsed: LayoutDefinition | null = null;
          const ld = found.layoutDefinition as unknown;
          if (typeof ld === 'string' && ld.length > 2) {
            try { parsed = JSON.parse(ld); } catch { /* ignore */ }
          } else if (typeof ld === 'object' && ld !== null && Object.keys(ld as Record<string, unknown>).length > 0) {
            parsed = ld as LayoutDefinition;
          }
          if (parsed) setTemplateLayout(parsed);
        }
      } catch {
        // Fallback to hardcoded definitions if API fails
        const fallback = getTemplateDefinition(templateId);
        if (fallback) setTemplateLayout(fallback);
      }
    };

    fetchTemplate();
  }, [templateId]);

  const handleCreate = async () => {
    if (!selectedEventType) return;

    setIsCreating(true);
    setError(null);

    try {
      // Generate canvas from template + event type
      let canvasJson: string | undefined;
      if (templateId) {
        let canvasData;
        if (templateLayout) {
          canvasData = buildCanvasFromLayout(templateLayout, selectedEventType);
        } else {
          canvasData = buildCanvasFromTemplate(templateId, selectedEventType);
        }
        if (canvasData) {
          canvasJson = JSON.stringify(canvasData);
        }
      }

      const result = await api.createProject({
        eventType: selectedEventType,
        templateId: templateId || undefined,
        canvasJson,
      });
      // Store management token in sessionStorage for immediate use
      sessionStorage.setItem(`mp_token_${result.projectId}`, result.managementToken);
      router.push(`/edit/${result.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 text-center">
            What are you creating?
          </h1>
          <p className="mt-2 text-gray-600 text-center">
            Choose your event type to get started with matching templates.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-10">
            {EVENT_TYPES.map((event) => (
              <Card
                key={event.value}
                className={`p-6 cursor-pointer transition hover:shadow-md ${
                  selectedEventType === event.value
                    ? 'ring-2 ring-rose-500 bg-rose-50'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedEventType(event.value as EventType)}
              >
                <h3 className="font-medium text-gray-900">{event.label}</h3>
              </Card>
            ))}
          </div>

          {error && (
            <p className="mt-6 text-center text-sm text-red-600">{error}</p>
          )}

          <div className="mt-10 text-center">
            <Button
              size="lg"
              onClick={handleCreate}
              disabled={!selectedEventType || isCreating}
              className="px-12"
            >
              {isCreating ? 'Creating...' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
