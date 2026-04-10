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
    description: 'Drop your PDF or DOCX and let AI extract and structure your content (daily parse limits on Free).',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Parsing',
    description:
      'Optional Groq-powered mapping of experience, skills, and projects—or use basic extraction without AI.',
  },
  {
    icon: Palette,
    title: 'Beautiful Themes',
    description:
      'Classic theme on Free; Neubrutalism and more on Pro—both with light and dark mode on your live site.',
  },
  {
    icon: Globe,
    title: 'Custom Domains',
    description: 'Use our hosted URL on every plan; connect your own domain on Pro with DNS verification.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'View counts on Free; referrers, devices, and geography on Pro.',
  },
  {
    icon: Layers,
    title: 'Platform Integrations',
    description:
      'Link GitHub, LeetCode, Dribbble, Medium, and more from your dashboard (limits may apply by plan).',
  },
] as const;

/** Homepage teaser only—tier limits stay on /pricing. */
const productHighlights = [
  'AI-assisted parsing from PDF, DOCX, or plain text',
  'Guided editor with live preview',
  'Professional themes with light & dark on your live site',
  'Integrations hub for profiles, repos, and social links',
  'Analytics for your published portfolio',
  'Hosted site with a public URL you control',
  'Markdown blog on your portfolio',
  'Custom domain with DNS verification',
] as const;

export function HomeMarketing() {
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
                Turn your resume into a <span className="text-primary">stunning portfolio</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground sm:text-xl">
                Upload your resume, optionally use AI to structure your content, customize in the editor, and publish a
                professional site.
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
                  Straightforward plans that scale with you
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Everything you need to go from resume to a live portfolio—parsing, editing, hosting, and growth
                  tools. Compare plans anytime for limits and add-ons.
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
                <div className="mb-7">
                  <p className="font-display text-xl font-semibold leading-snug tracking-tight text-foreground">
                    What FolioMint offers
                  </p>
                </div>
                <ul className="space-y-4 font-sans">
                  {productHighlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-3.5 text-[0.9375rem] font-medium leading-relaxed tracking-[-0.01em] text-foreground/90 sm:text-base sm:leading-[1.55]"
                    >
                      <Check
                        className="mt-[0.2em] h-[1.1em] w-[1.1em] shrink-0 text-primary"
                        strokeWidth={2.25}
                        aria-hidden
                      />
                      <span className="min-w-0 text-pretty">{item}</span>
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
                Sign in, upload, and ship a first version in minutes. Scale up when you need more.
              </p>
              <div className="mt-10">
                <Button asChild size="xl">
                  <Link href="/generate">
                    Create Your Portfolio
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <p className="mx-auto mt-6 max-w-md font-sans text-[0.9375rem] leading-relaxed tracking-[-0.01em] text-muted-foreground text-pretty sm:text-base sm:leading-[1.55]">
                You&apos;ll sign in before upload. Details and plans:{' '}
                <Link
                  href="/pricing"
                  className="font-semibold text-primary underline decoration-primary/40 underline-offset-[5px] transition-colors hover:text-primary/90 hover:decoration-primary hover:no-underline"
                >
                  Pricing
                </Link>
                .
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
