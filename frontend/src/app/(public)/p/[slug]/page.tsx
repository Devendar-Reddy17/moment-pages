import { notFound } from 'next/navigation';
import { PageRenderer } from '@/components/page-renderer/PageRenderer';

interface PublicPageProps {
  params: Promise<{ slug: string }>;
}

async function getPageData(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
  const res = await fetch(`${apiUrl}/public/pages/${slug}`, {
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;
  if (res.status === 410) return { archived: true };
  if (!res.ok) return null;

  return res.json();
}

export async function generateMetadata({ params }: PublicPageProps) {
  const { slug } = await params;
  const data = await getPageData(slug);

  if (!data || data.archived) {
    return { title: 'Page Not Found | MomentPages' };
  }

  const title = data.title || 'You are invited!';
  const description = data.description || 'Open to view your personalized invitation.';
  const ogImageUrl = data.ogImageUrl
    || `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/og?slug=${slug}`;

  return {
    title: `${title} | MomentPages`,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: ogImageUrl ? [{ url: ogImageUrl, width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

export default async function PublicPage({ params }: PublicPageProps) {
  const { slug } = await params;
  const data = await getPageData(slug);

  if (!data) {
    notFound();
  }

  if (data.archived) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8">
          <h1 className="text-2xl font-bold text-gray-900">Page Archived</h1>
          <p className="mt-2 text-gray-600">
            This invitation page has been archived and is no longer available.
          </p>
        </div>
      </div>
    );
  }

  if (data.requiresPassword) {
    return <PasswordGate slug={slug} />;
  }

  return <PageRenderer canvasJson={data.canvasJson} slug={slug} />;
}

function PasswordGate({ slug }: { slug: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50">
      <div className="max-w-sm w-full p-8 bg-white rounded-2xl shadow-lg text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-gray-900">This page is protected</h1>
        <p className="mt-2 text-sm text-gray-600">
          Enter the password to view this invitation.
        </p>
        <form className="mt-6" action={`/api/unlock/${slug}`} method="POST">
          <input
            type="password"
            name="password"
            placeholder="Enter password"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-center"
            required
          />
          <button
            type="submit"
            className="w-full mt-3 px-4 py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 transition"
          >
            Unlock
          </button>
        </form>
      </div>
    </div>
  );
}
