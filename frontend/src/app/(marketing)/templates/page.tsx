'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplatePreview } from "@/components/marketing/TemplatePreview";
import { api } from '@/lib/api';
import Link from "next/link";
import type { Template } from '@/types/api';

const BUILTIN_TEMPLATES: { id: string; name: string; eventType: string; description: string }[] = [
  { id: "birthday-elegant", name: "Elegant Birthday", eventType: "birthday", description: "A refined, minimal design perfect for milestone birthdays." },
  { id: "wedding-classic", name: "Classic Wedding", eventType: "wedding", description: "Timeless and romantic. Floral accents with elegant typography." },
  { id: "party-modern", name: "Modern Party", eventType: "party", description: "Bold colors and playful shapes. Great for casual celebrations." },
  { id: "baby-shower", name: "Baby Shower", eventType: "baby_shower", description: "Soft pastels and gentle curves. Celebrate the new arrival." },
  { id: "graduation", name: "Graduation", eventType: "graduation", description: "Celebrate the achievement with a sleek, modern design." },
  { id: "corporate", name: "Corporate Event", eventType: "corporate", description: "Professional and clean. Perfect for conferences and galas." },
  { id: "story-album", name: "Story Album", eventType: "anniversary", description: "A 2-page layout: Cover and Story/Details page with photo placeholders." },
  { id: "event-album", name: "Event Album", eventType: "birthday", description: "A 3-page layout: Cover, Gallery, and RSVP. Perfect for big events." },
];

function getDescription(slug: string): string {
  return BUILTIN_TEMPLATES.find(t => t.id === slug)?.description ?? 'A beautiful template for your event.';
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const data = await api.listTemplates();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load templates');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
          MomentPages
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/create">
            <Button size="sm">Create Free</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">Choose a template</h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          Start with a beautifully designed template and customize it to match your event.
        </p>
      </section>

      {/* Templates Grid */}
      <section className="container mx-auto px-4 py-12">
        {loading && (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500 mx-auto" />
            <p className="mt-4 text-gray-500">Loading templates...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-20">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </div>
        )}

        {!loading && !error && templates.length === 0 && (
          <p className="text-center text-gray-500 py-20">No templates available.</p>
        )}

        {!loading && !error && templates.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {templates.map((template) => (
              <Card key={template.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                <div className="border-b border-gray-100">
                  <TemplatePreview templateId={template.slug || template.id} previewEventType={template.eventType} />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{getDescription(template.slug)}</p>
                  {template.category !== 'default' && (
                    <span className="inline-block mt-2 px-2 py-0.5 text-xs bg-rose-100 text-rose-700 rounded-full">
                      Community
                    </span>
                  )}
                  <Link href={`/create?template=${template.slug || template.id}`}>
                    <Button className="w-full mt-3" variant="outline" size="sm">
                      Use Template
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200 mt-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">© 2026 MomentPages. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-700">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-700">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
