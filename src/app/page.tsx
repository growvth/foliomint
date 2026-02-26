import Link from 'next/link';
import {
  ArrowRight,
  Upload,
  Sparkles,
  Globe,
  Palette,
  BarChart3,
  Layers,
  Check,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/domain/navbar';
import { Footer } from '@/components/domain/footer';

const features = [
  {
    icon: Upload,
    title: 'Upload Your Resume',
    description: 'Drop your PDF or DOCX and let our AI extract and structure your content.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Parsing',
    description:
      'Groq AI semantically maps your experience, skills, and projects with 95%+ accuracy.',
  },
  {
    icon: Palette,
    title: 'Beautiful Themes',
    description: 'Choose from professionally designed themes with full light and dark mode support.',
  },
  {
    icon: Globe,
    title: 'Custom Domains',
    description: 'Deploy to your own domain or use our hosted subdomain — your choice.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Track views, referrers, devices, and geography to understand your audience.',
  },
  {
    icon: Layers,
    title: 'Platform Integrations',
    description:
      'Connect GitHub, LeetCode, Dribbble, Medium, and more to enrich your portfolio.',
  },
] as const;

const pricingHighlights = [
  'Resume upload + AI parsing',
  'Editable form editor',
  'Light & dark mode',
  '10 platform integrations',
  'Basic analytics',
  'Hosted portfolio',
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(160_30%_80%_/_0.3),transparent)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(160_30%_20%_/_0.4),transparent)]" />
          <div className="mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pb-32 sm:pt-28 lg:px-8 lg:pt-32">
            <div className="mx-auto max-w-3xl text-center">
              <Badge variant="secondary" className="mb-6">
                Now with Groq AI-powered parsing
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Turn your resume into a{' '}
                <span className="text-primary">stunning portfolio</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
                Upload your resume, let AI structure your content, customize the design, and deploy a
                professional portfolio — all in under 5 minutes.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="xl">
                  <Link href="/generate">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="xl">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Sign in to get started — free, no credit card. Then upload your resume and we&apos;ll
                build your portfolio.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-t bg-muted/30 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Everything you need to stand out
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                From upload to deployment, we handle the heavy lifting so you can focus on your
                career.
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card
                  key={feature.title}
                  className="border-0 bg-background shadow-md transition-shadow hover:shadow-lg"
                >
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Three steps to your portfolio
              </h2>
            </div>
            <div className="mx-auto mt-16 grid max-w-4xl gap-12 md:grid-cols-3">
              {[
                {
                  step: '01',
                  title: 'Upload',
                  description: 'Drop your resume (PDF, DOCX, or plain text) and consent to AI parsing.',
                },
                {
                  step: '02',
                  title: 'Edit & Customize',
                  description:
                    'Review AI-extracted content, fine-tune in the form editor, pick a theme.',
                },
                {
                  step: '03',
                  title: 'Deploy',
                  description:
                    'Publish your portfolio instantly. Connect a custom domain on the paid plan.',
                },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {item.step}
                  </div>
                  <h3 className="mt-6 text-xl font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Teaser */}
        <section className="border-t bg-muted/30 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-2 lg:items-center">
              <div>
                <Badge variant="secondary" className="mb-4">
                  Pricing
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  Start free, upgrade when you&apos;re ready
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Our free tier gives you everything to create and publish your portfolio. Unlock
                  unlimited parses, custom domains, and advanced analytics for just $4/month.
                </p>
                <div className="mt-8">
                  <Button asChild size="lg">
                    <Link href="/pricing">
                      Compare Plans
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <Card className="p-8">
                <div className="mb-6">
                  <span className="text-sm font-medium text-muted-foreground">Free tier includes</span>
                </div>
                <ul className="space-y-3">
                  {pricingHighlights.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm">
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Ready to mint your portfolio?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join thousands of professionals who&apos;ve turned their resumes into portfolios.
              </p>
              <div className="mt-10">
                <Button asChild size="xl">
                  <Link href="/generate">
                    Create Your Portfolio
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
