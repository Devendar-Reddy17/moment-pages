'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIPromptBoxProps {
  onGenerate: (prompt: string) => Promise<void>;
  placeholder?: string;
  buttonLabel?: string;
  className?: string;
}

export function AIPromptBox({
  onGenerate,
  placeholder = 'Describe what you want to create...',
  buttonLabel = 'Generate',
  className = '',
}: AIPromptBoxProps) {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async () => {
    if (!prompt.trim() || isGenerating) return;
    setIsGenerating(true);
    try {
      await onGenerate(prompt.trim());
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative flex-1">
        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={placeholder}
          disabled={isGenerating}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 shadow-sm"
        />
      </div>
      <Button
        onClick={handleSubmit}
        disabled={!prompt.trim() || isGenerating}
        className="bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700 text-white px-5 shrink-0"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4 mr-2" />
            {buttonLabel}
          </>
        )}
      </Button>
    </div>
  );
}
