import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';

import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { db } from '@/lib/db';
import { portfolios } from '@/lib/db/schema';
import type { PortfolioContent } from '@/types';

interface PortfolioPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PortfolioPageProps): Promise<Metadata> {
  const portfolio = await db
    .select({
      title: portfolios.title,
    })
    .from(portfolios)
    .where(eq(portfolios.slug, params.slug))
    .get();

  if (!portfolio) {
    return {
      title: 'Portfolio not found',
      description: 'This portfolio could not be found.',
    };
  }

  return {
    title: portfolio.title,
    description: `Professional portfolio for ${portfolio.title}`,
  };
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { slug } = params;

  const portfolio = await db
    .select()
    .from(portfolios)
    .where(eq(portfolios.slug, slug))
    .get();

  if (!portfolio || !portfolio.isPublished) {
    return notFound();
  }

  const content = portfolio.content as unknown as PortfolioContent;

  return (
    <div className="min-h-screen bg-background">
      {/* Theme toggle for viewers */}
      <div className="fixed right-4 top-4 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center">
          {content.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={content.profileImageUrl}
              alt={content.name}
              className="mx-auto mb-6 h-24 w-24 rounded-full object-cover"
            />
          ) : (
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
              {content.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {content.name || slug}
          </h1>
          {content.bio && (
            <p className="mt-3 text-lg text-muted-foreground">{content.bio}</p>
          )}
        </header>

        {/* Sections */}
        <div className="mt-16 space-y-12">
          {content.skills && content.skills.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">Skills</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {content.skills.map((skill) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>
          )}

          {content.experience && content.experience.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">Experience</h2>
              <div className="mt-4 space-y-4">
                {content.experience.map((exp, idx) => (
                  <div key={`${exp.company}-${exp.role}-${idx}`} className="rounded-lg border bg-card p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold">
                          {exp.role} @ {exp.company}
                        </h3>
                        {exp.location && (
                          <p className="text-xs text-muted-foreground">{exp.location}</p>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {exp.startDate}
                        {exp.endDate ? ` – ${exp.endDate}` : ' – Present'}
                      </p>
                    </div>
                    {exp.bullets && exp.bullets.length > 0 && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {exp.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {content.education && content.education.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">Education</h2>
              <div className="mt-4 space-y-4">
                {content.education.map((edu, idx) => (
                  <div key={`${edu.institution}-${idx}`} className="rounded-lg border bg-card p-6">
                    <h3 className="text-base font-semibold">{edu.institution}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {edu.degree}
                      {edu.field ? ` · ${edu.field}` : ''}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {edu.startDate}
                      {edu.endDate ? ` – ${edu.endDate}` : ''}
                      {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {content.projects && content.projects.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">Projects</h2>
              <div className="mt-4 space-y-4">
                {content.projects.map((project, idx) => (
                  <div key={`${project.name}-${idx}`} className="rounded-lg border bg-card p-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="text-base font-semibold">{project.name}</h3>
                      {project.url && (
                        <a
                          href={project.url}
                          className="text-xs text-primary hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          View project
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="mt-2 text-sm text-muted-foreground">{project.description}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Tech: {project.technologies.join(', ')}
                      </p>
                    )}
                    {project.bullets && project.bullets.length > 0 && (
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {project.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {content.awards && content.awards.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">Awards</h2>
              <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {content.awards.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {content.extracurricular && content.extracurricular.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold">Extracurricular</h2>
              <div className="mt-4 space-y-6">
                {content.extracurricular.map((block, idx) => (
                  <div key={`${block.title}-${idx}`}>
                    <h3 className="text-base font-semibold">{block.title}</h3>
                    {block.bullets.length > 0 && (
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                        {block.bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {content.otherSections && content.otherSections.length > 0 && (
            <section className="space-y-8">
              {content.otherSections.map((block, idx) => (
                <div key={`${block.title}-${idx}`}>
                  <h2 className="text-xl font-semibold">{block.title}</h2>
                  {block.bullets.length > 0 && (
                    <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                      {block.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </section>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-24 border-t pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            Built with{' '}
            <a href="/" className="text-primary hover:underline">
              FolioMint
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}

