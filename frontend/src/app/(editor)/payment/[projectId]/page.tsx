'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, CheckCircle, CreditCard, Globe, Lock } from 'lucide-react';

export default function PaymentPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<{ name?: string; title?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = typeof window !== 'undefined'
    ? sessionStorage.getItem(`mp_token_${projectId}`)
    : null;

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setError('Management token not found. Please use your management link.');
        setIsLoading(false);
        return;
      }
      try {
        const data = await api.getProject(projectId, token);
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [projectId, token]);

  const handlePay = async () => {
    if (!token) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Publish the project
      await api.publishProject(projectId, token);

      // Step 2: Optionally save as template
      if (saveAsTemplate) {
        await api.saveAsTemplate(projectId, token);
      }

      setIsComplete(true);
      toast.success('Published successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-rose-500" />
      </div>
    );
  }

  if (error && !isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.push(`/edit/${projectId}`)} variant="outline">
              Back to Editor
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Published!</h2>
            <p className="text-gray-600 mb-2">
              Your page is now live and ready to share.
            </p>
            {saveAsTemplate && (
              <p className="text-sm text-rose-600 mb-4">
                Your layout has been saved as a community template.
              </p>
            )}
            <div className="flex flex-col gap-3 mt-6">
              <Button
                onClick={() => router.push(`/manage/${token}`)}
                className="w-full bg-gradient-to-r from-rose-500 to-purple-600"
              >
                Go to Dashboard
              </Button>
              <Button
                onClick={() => router.push(`/edit/${projectId}`)}
                variant="outline"
                className="w-full"
              >
                Back to Editor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Publish</h1>
          <p className="text-gray-600 mt-1">
            One-time fee to publish your page
          </p>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Globe className="h-5 w-5 text-rose-500" />
              Publish &ldquo;{project?.title || 'Your Page'}&rdquo;
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Pricing */}
            <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Lifetime Publishing</p>
                <p className="text-sm text-gray-500">One-time payment</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">$9.99</p>
                <p className="text-xs text-gray-400 line-through">$19.99</p>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Public page with custom URL
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Unlimited RSVPs and responses
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Analytics dashboard
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Edit anytime
              </li>
            </ul>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Mock payment form */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Card Details (Mock)
              </label>
              <div className="grid grid-cols-1 gap-2">
                <input
                  type="text"
                  placeholder="Card number: 4242 4242 4242 4242"
                  defaultValue="4242 4242 4242 4242"
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  readOnly
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="MM/YY"
                    defaultValue="12/30"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    readOnly
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    defaultValue="123"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                    readOnly
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                This is a mock payment. No real card is charged.
              </p>
            </div>

            {/* Save as template checkbox */}
            <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
              <input
                type="checkbox"
                id="save-template"
                checked={saveAsTemplate}
                onChange={(e) => setSaveAsTemplate(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
              />
              <label htmlFor="save-template" className="text-sm text-gray-700 cursor-pointer leading-tight">
                <span className="font-medium">Save this layout as a community template</span>
                <span className="block text-gray-500 text-xs mt-0.5">
                  Other users will be able to use your design. Personal information will be removed.
                </span>
              </label>
            </div>

            {/* Pay button */}
            {error && (
              <p className="text-sm text-red-600 text-center">{error}</p>
            )}
            <Button
              onClick={handlePay}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-rose-500 to-purple-600 h-11"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>Pay $9.99 & Publish</>
              )}
            </Button>

            <Button
              onClick={() => router.push(`/edit/${projectId}`)}
              variant="ghost"
              className="w-full"
            >
              Cancel
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
