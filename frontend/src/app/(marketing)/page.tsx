import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HomeAISection } from '@/components/HomeAISection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-purple-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
          MomentPages
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/templates" className="text-sm text-gray-600 hover:text-gray-900 transition">
            Templates
          </Link>
          <Link href="/pricing" className="text-sm text-gray-600 hover:text-gray-900 transition">
            Pricing
          </Link>
          <Link href="/create">
            <Button size="sm">Create Free</Button>
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 pt-20 pb-32 text-center">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 max-w-4xl mx-auto">
          Create beautiful
          <span className="bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
            {' '}invitation pages{' '}
          </span>
          in minutes
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
          No signup required. Design stunning invitations for coffee dates, dinners,
          birthdays, proposals, and more. Share a beautiful link with your special someone.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/create">
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-rose-600 hover:to-purple-700">
              Start Creating — Free
            </Button>
          </Link>
          <Link href="/templates">
            <Button variant="outline" size="lg" className="text-lg px-8 py-6">
              Browse Templates
            </Button>
          </Link>
        </div>

        {/* AI Page Generator */}
        <HomeAISection />

        <p className="mt-6 text-sm text-gray-500">
          Only £1.99 to publish. No subscription. No account needed.
        </p>
      </main>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Everything you need to create the perfect invitation
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <FeatureCard
            title="Drag & Drop Editor"
            description="Build your invitation with our intuitive canvas editor. Add text, images, videos, and voice notes."
          />
          <FeatureCard
            title="AI-Powered Content"
            description="Let AI help you write the perfect invitation message and suggest beautiful themes."
          />
          <FeatureCard
            title="Collect Responses"
            description="Add custom form fields — date pickers, text inputs, buttons — and see all responses in your dashboard."
          />
          <FeatureCard
            title="Beautiful Templates"
            description="Start with a professionally designed template and make it yours with full customization."
          />
          <FeatureCard
            title="Share Anywhere"
            description="Get a beautiful link with Open Graph previews. Perfect for messaging apps and social media."
          />
          <FeatureCard
            title="No Account Needed"
            description="Start creating immediately. We give you a private management link — bookmark it and come back anytime."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="bg-gradient-to-r from-rose-500 to-purple-600 rounded-3xl p-12 md:p-20 text-white">
          <h2 className="text-3xl md:text-4xl font-bold">Ready to create something special?</h2>
          <p className="mt-4 text-lg opacity-90 max-w-xl mx-auto">
            Pick a template, customize it, and share your invitation in minutes.
          </p>
          <Link href="/create">
            <Button size="lg" variant="secondary" className="mt-8 text-lg px-8 py-6">
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-gray-200">
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

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <Card className="hover:shadow-md transition">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
