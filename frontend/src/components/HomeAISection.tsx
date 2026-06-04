'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export function HomeAISection() {
  const router = useRouter();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    setError(null);

    try {
      // Generate a temporary projectId for potential PII images
      const tempProjectId = crypto.randomUUID();

      // 1. Generate page content from AI
      const pageResult = await api.generatePage({ prompt: prompt.trim() });

      console.log('AI generate-page full response:', pageResult);
      console.log('Canvas object:', pageResult.canvas);
      console.log('backgroundImagePrompt:', pageResult.canvas?.backgroundImagePrompt);

      // 2. Generate background image if prompt is provided
      let backgroundImageUrl: string | undefined;
      if (pageResult.canvas?.backgroundImagePrompt) {
        console.log('Generating background image with prompt:', pageResult.canvas.backgroundImagePrompt);
        try {
          // Pass tempProjectId - backend will use it if PII is detected
          const imageResult = await api.generateImage({ 
            prompt: pageResult.canvas.backgroundImagePrompt,
            projectId: tempProjectId 
          });
          console.log('Image generation result:', imageResult);
          console.log('Image URL:', imageResult.imageUrl);
          backgroundImageUrl = imageResult.imageUrl;
        } catch (error) {
          console.error('Failed to generate background image:', error);
        }
      }

      // 3. Create a new project with multi-page support
      const pages = pageResult.pages.map((page, i) => ({
        id: `page-${i + 1}`,
        name: page.name || `Page ${i + 1}`,
        elements: page.elements.map((el) => ({
          id: `el_${crypto.randomUUID().slice(0, 8)}`,
          type: el.type || 'text',
          x: el.x ?? 140,
          y: el.y ?? 200,
          width: el.width ?? 400,
          height: el.height ?? 100,
          rotation: 0,
          zIndex: Date.now() + Math.random(),
          locked: false,
          opacity: 1,
          content: el.content || {
            html: '<p>Generated text</p>',
            plainText: 'Generated text',
            fontFamily: 'Inter',
            fontSize: 20,
            color: '#1f2937',
            textAlign: 'center',
          },
        })),
      }));

      const canvasData = {
        version: 1,
        canvas: {
          width: pageResult.canvas.width || 1080,
          height: pageResult.canvas.height || 1920,
          backgroundColor: pageResult.canvas.backgroundColor || '#ffffff',
          backgroundImage: backgroundImageUrl,
        },
        elements: pages[0]?.elements || [],
        pages,
        currentPageIndex: 0,
      };

      const result = await api.createProject({
        eventType: 'custom',
        canvasJson: JSON.stringify(canvasData),
        projectId: tempProjectId,
      });

      // 4. Store management token and redirect to editor
      sessionStorage.setItem(`mp_token_${result.projectId}`, result.managementToken);
      router.push(`/edit/${result.projectId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="mt-12 max-w-2xl mx-auto">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">AI Page Generator</span>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
            placeholder="e.g. A beautiful coffee date invitation with yes/no buttons and a date picker..."
            disabled={isGenerating}
            className="flex-1 px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50"
          />
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-6 shrink-0"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate
              </>
            )}
          </Button>
        </div>
        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
        <p className="mt-3 text-xs text-gray-400">
          Describe your page in natural language and AI will generate it for you. You can edit everything in the canvas afterwards.
        </p>
      </div>
    </div>
  );
}
