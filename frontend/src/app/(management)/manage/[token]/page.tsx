'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import type { Project, AnalyticsSummary, ResponsesData } from '@/types/project';
import { BarChart3, MessageSquare, Settings, Edit3 } from 'lucide-react';
import Link from 'next/link';

export default function ManagementPage() {
  const params = useParams();
  const token = params.token as string;

  const [project, setProject] = useState<Project | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [responses, setResponses] = useState<ResponsesData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        // Fetch project by management token
        const projectData = await api.getProjectByToken(token);
        setProject(projectData);

        const [analyticsData, responsesData] = await Promise.all([
          api.getAnalytics(projectData.id, token),
          api.getResponses(projectData.id, token),
        ]);

        setAnalytics(analyticsData);
        setResponses(responsesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [token]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Unable to load page</h2>
          <p className="mt-2 text-gray-600">{error || 'Project not found'}</p>
        </div>
      </div>
    );
  }

  const publicUrl = project.publicSlug
    ? `${window.location.origin}/p/${project.publicSlug}`
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {project.title || 'Untitled Page'}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={project.status === 'published' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
              {publicUrl && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {publicUrl}
                </a>
              )}
            </div>
          </div>
          <Link href={`/edit/${project.id}`}>
            <Button>
              <Edit3 className="h-4 w-4 mr-2" /> Edit Page
            </Button>
          </Link>
        </div>

        {/* Archived Banner */}
        {project.status === 'archived' && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-800 font-medium">
              This page has been archived. Visitors can no longer see it.
            </p>
            <Button size="sm" className="mt-2" variant="outline">
              Reactivate (£0.99)
            </Button>
          </div>
        )}

        {/* Tabs */}
        <Tabs defaultValue="analytics">
          <TabsList>
            <TabsTrigger value="analytics">
              <BarChart3 className="h-4 w-4 mr-1" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="responses">
              <MessageSquare className="h-4 w-4 mr-1" /> Responses
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-1" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analytics" className="mt-6">
            {analytics && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total Views" value={analytics.totalViews} />
                <StatCard label="Unique Views" value={analytics.uniqueViews} />
                <StatCard label="Unlocks" value={analytics.unlocks} />
                <StatCard label="Responses" value={analytics.totalResponses} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="responses" className="mt-6">
            {responses && responses.responses.length > 0 ? (
              <div className="bg-white rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Visitor
                        </th>
                        {(responses.formFields ?? []).map((field) => (
                          <th
                            key={field.fieldId}
                            className="px-4 py-3 text-left font-medium text-gray-600"
                          >
                            {field.label}
                          </th>
                        ))}
                        <th className="px-4 py-3 text-left font-medium text-gray-600">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {responses.responses.map((response) => (
                        <tr key={response.id}>
                          <td className="px-4 py-3">
                            {response.visitorName || 'Anonymous'}
                          </td>
                          {(responses.formFields ?? []).map((field) => (
                            <td key={field.fieldId} className="px-4 py-3">
                              {String(response.fields[field.fieldId] ?? '-')}
                            </td>
                          ))}
                          <td className="px-4 py-3 text-gray-500">
                            {new Date(response.submittedAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No responses yet</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <div className="bg-white rounded-lg border p-6 space-y-6 max-w-lg">
              <div>
                <h3 className="font-medium text-gray-900">Page Title</h3>
                <input
                  type="text"
                  defaultValue={project.title || ''}
                  placeholder="My Invitation"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Event Date</h3>
                <input
                  type="date"
                  defaultValue={project.eventDate || ''}
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Password Protection</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Set a password that visitors must enter to view your page.
                </p>
                <input
                  type="password"
                  placeholder="Leave empty for no password"
                  className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <Button>Save Settings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value.toLocaleString()}</p>
    </div>
  );
}
