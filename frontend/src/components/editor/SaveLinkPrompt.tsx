'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Copy, Check, Mail } from 'lucide-react';

interface SaveLinkPromptProps {
  managementUrl: string;
  onClose: () => void;
}

export function SaveLinkPrompt({ managementUrl, onClose }: SaveLinkPromptProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(managementUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const emailToSelf = () => {
    const subject = encodeURIComponent('Your MomentPages Editor Link');
    const body = encodeURIComponent(
      `Here's your private management link for MomentPages:\n\n${managementUrl}\n\nBookmark this link! It's the only way to get back to your page editor.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">🔗</span>
          </div>
          <h2 className="mt-4 text-xl font-bold text-gray-900">Save your private link!</h2>
          <p className="mt-2 text-sm text-gray-600">
            This is your <strong>only way</strong> to get back to edit your page.
            No account needed — just this link.
          </p>
        </div>

        <div className="mt-6 bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">Your management link:</p>
          <p className="text-sm text-gray-800 break-all font-mono">{managementUrl}</p>
        </div>

        <div className="mt-4 flex flex-col gap-2">
          <Button onClick={copyToClipboard} className="w-full" variant="default">
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" /> Copy Link
              </>
            )}
          </Button>
          <Button onClick={emailToSelf} className="w-full" variant="outline">
            <Mail className="w-4 h-4 mr-2" /> Email to Myself
          </Button>
        </div>

        <Button
          onClick={onClose}
          variant="ghost"
          className="w-full mt-4 text-sm text-gray-500"
        >
          I&apos;ve saved it — continue editing
        </Button>
      </div>
    </div>
  );
}
