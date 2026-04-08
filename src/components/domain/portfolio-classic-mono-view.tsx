import Link from 'next/link';
import {
  Github,
  Globe,
  Linkedin,
  Mail,
  MapPin,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react';

import { PortfolioPublicFooter } from '@/components/domain/portfolio-public-footer';
import type { SocialLink } from '@/lib/social-links';
import { cn, normalizeOutboundHref } from '@/lib/utils';
import type { PortfolioContent } from '@/types';

function parsePortfolioDate(value?: string | null): number {
  if (!value) return Number.NEGATIVE_INFINITY;
  const raw = value.trim();
  if (!raw) return Number.NEGATIVE_INFINITY;
  if (/present|current|now/i.test(raw)) return Number.POSITIVE_INFINITY;
  const direct = Date.parse(raw);
  if (!Number.isNaN(direct)) return direct;
  const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) return Date.parse(`${yearMatch[0]}-01-01`);
  return Number.NEGATIVE_INFINITY;
}

function sortExperienceMostRecentFirst(experience: PortfolioContent['experience']) {
  return [...experience].sort((a, b) => {
    const aEnd = parsePortfolioDate(a.endDate);
    const bEnd = parsePortfolioDate(b.endDate);
    if (aEnd !== bEnd) return bEnd - aEnd;
    const aStart = parsePortfolioDate(a.startDate);
    const bStart = parsePortfolioDate(b.startDate);
    if (aStart !== bStart) return bStart - aStart;
    return 0;
  });
}

function splitBioParagraphs(bio?: string | null): string[] {
  if (!bio) return [];
  return bio
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
}

function normalizeHref(href: string): string {
  return href.trim().replace(/\/$/, '').toLowerCase();
}

/** Parse hostname for icon matching; avoids substring bugs (e.g. `fox.com` matching `x.com`). */
function hostnameForIconMatch(href: string): string | null {
  try {
    const raw = href.trim();
    if (!raw) return null;
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`;
    return new URL(withScheme).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function isTwitterHostname(host: string): boolean {
  return host === 'x.com' || host === 'twitter.com' || host.endsWith('.twitter.com');
}

function buildProfileLinks(content: PortfolioContent, socialLinks: SocialLink[]): SocialLink[] {
  const links: SocialLink[] = [];
  if (content.email) links.push({ label: 'Email', href: `mailto:${content.email}` });
  if (content.website) links.push({ label: 'Website', href: content.website });
  if (content.github) links.push({ label: 'GitHub', href: content.github });
  if (content.linkedin) links.push({ label: 'LinkedIn', href: content.linkedin });
  links.push(...socialLinks);
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.label.toLowerCase()}::${normalizeHref(normalizeOutboundHref(link.href))}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function iconForProfileLink(link: SocialLink): LucideIcon {
  const label = link.label.toLowerCase();
  const href = link.href.toLowerCase();
  const host = hostnameForIconMatch(link.href);

  if (label.includes('github') || (host && (host === 'github.com' || host.endsWith('.github.com')))) return Github;
  if (label.includes('linkedin') || (host && (host === 'linkedin.com' || host.endsWith('.linkedin.com'))))
    return Linkedin;
  if (label.includes('twitter') || label === 'x' || (host && isTwitterHostname(host))) return Twitter;
  if (label.includes('youtube') || (host && (host === 'youtube.com' || host === 'youtu.be' || host.endsWith('.youtube.com'))))
    return Youtube;
  if (label.includes('email') || href.startsWith('mailto:')) return Mail;
  return Globe;
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-6 border-b border-zinc-200 pb-2 text-lg font-bold tracking-tight text-zinc-900 dark:border-zinc-700 dark:text-zinc-100 sm:text-xl">
      {children}
    </h2>
  );
}

interface PortfolioClassicMonoViewProps {
  content: PortfolioContent;
  slug: string;
  siteBasePath: string;
  showBlogLink?: boolean;
  socialLinks?: SocialLink[];
  /**
   * Editor / narrow embed: avoid viewport `md:`/`sm:` side-by-side layouts that break when the
   * preview panel is only ~400–600px wide while the window is large.
   */
  narrowLayout?: boolean;
}

export function PortfolioClassicMonoView({
  content,
  slug,
  siteBasePath,
  showBlogLink,
  socialLinks = [],
  narrowLayout = false,
}: PortfolioClassicMonoViewProps) {
  const sortedExperience = content.experience ? sortExperienceMostRecentFirst(content.experience) : [];
  const bioParagraphs = splitBioParagraphs(content.bio);
  const profileLinks = buildProfileLinks(content, socialLinks);
  const displayName = content.name?.trim() || slug;
  const initial = displayName.charAt(0).toUpperCase() || '?';
  const navItems = [
    bioParagraphs.length > 0 ? { label: 'About', href: '#about' } : null,
    sortedExperience.length ? { label: 'Experience', href: '#experience' } : null,
    content.education?.length ? { label: 'Education', href: '#education' } : null,
    content.projects?.length ? { label: 'Projects', href: '#projects' } : null,
    content.skills?.length ? { label: 'Skills', href: '#skills' } : null,
    showBlogLink ? { label: 'Blog', href: `${siteBasePath}/blog` } : null,
  ].filter((item): item is { label: string; href: string } => item !== null);

  const skillsEyebrow = content.skills?.length
    ? content.skills.slice(0, 6).join(' · ')
    : null;

  return (
    <div className="min-h-full text-zinc-800 antialiased dark:text-zinc-200">
      <div
        className={cn(
          'mx-auto max-w-2xl px-5 pb-20 sm:px-8 lg:max-w-3xl',
          narrowLayout ? 'pt-4 pb-12' : 'pt-8 lg:pt-12',
        )}
      >
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-700">
          <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{displayName}</span>
          <nav className="flex flex-wrap items-center justify-end gap-4 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">
            {navItems.map((item) =>
              item.href.startsWith('/') ? (
                <Link
                  key={item.label}
                  href={item.href}
                  className="transition-colors hover:text-[var(--portfolio-accent)]"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="transition-colors hover:text-[var(--portfolio-accent)]"
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
        </header>

        <section
          className={cn(
            'mb-14 border-b border-zinc-200 pb-12 dark:border-zinc-700',
            narrowLayout
              ? 'flex flex-col gap-6'
              : 'flex flex-col gap-8 md:flex-row-reverse md:items-start md:justify-between',
          )}
        >
          <div className={cn('shrink-0', !narrowLayout && 'md:pt-1')}>
            {content.profileImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={content.profileImageUrl}
                alt={displayName}
                className={cn(
                  'border border-zinc-300 object-cover dark:border-zinc-600',
                  narrowLayout ? 'h-20 w-20' : 'h-24 w-24 sm:h-28 sm:w-28',
                )}
              />
            ) : (
              <div
                className={cn(
                  'flex items-center justify-center border border-zinc-300 font-bold text-zinc-400 dark:border-zinc-600 dark:text-zinc-500',
                  narrowLayout ? 'h-20 w-20 text-xl' : 'h-24 w-24 text-2xl sm:h-28 sm:w-28',
                )}
              >
                {initial}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 space-y-4">
            {skillsEyebrow ? (
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">{skillsEyebrow}</p>
            ) : null}
            <h1
              className={cn(
                'break-words font-bold leading-tight tracking-tight text-zinc-950 dark:text-zinc-50',
                narrowLayout ? 'text-2xl' : 'text-3xl sm:text-4xl md:text-5xl',
              )}
            >
              {displayName}
            </h1>
            {content.location ? (
              <p className="flex items-center gap-2 text-sm text-zinc-500">
                <MapPin className="h-4 w-4 shrink-0" />
                {content.location}
              </p>
            ) : null}
            {profileLinks.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-2">
                {profileLinks.map((link, idx) => {
                  const Icon = iconForProfileLink(link);
                  return (
                    <a
                      key={`${link.label}-${idx}`}
                      href={normalizeOutboundHref(link.href)}
                      target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                      rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                      className="inline-flex h-9 w-9 items-center justify-center border border-zinc-300 text-zinc-500 transition-colors hover:border-[var(--portfolio-accent)] hover:text-[var(--portfolio-accent)] dark:border-zinc-600"
                      aria-label={link.label}
                    >
                      <Icon className="h-4 w-4" />
                    </a>
                  );
                })}
              </div>
            ) : null}
          </div>
        </section>

        {bioParagraphs.length > 0 && (
          <section id="about" className="mb-14 scroll-mt-24">
            <SectionTitle>About</SectionTitle>
            <div className="space-y-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 sm:text-[15px]">
              {bioParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </section>
        )}

        {sortedExperience.length > 0 && (
          <section id="experience" className="mb-14 scroll-mt-24">
            <SectionTitle>Work experience</SectionTitle>
            <div className="space-y-10">
              {sortedExperience.map((exp, idx) => {
                const dateStr = `${exp.startDate}${exp.endDate ? ` — ${exp.endDate}` : ' — Present'}`;
                return (
                  <article key={`exp-${idx}`}>
                    <div
                      className={cn(
                        'flex flex-col gap-2',
                        !narrowLayout && 'sm:flex-row sm:items-baseline sm:justify-between',
                      )}
                    >
                      <h3
                        className={cn(
                          'font-bold text-zinc-900 dark:text-zinc-100',
                          narrowLayout ? 'text-base' : 'text-base sm:text-lg',
                        )}
                      >
                        {exp.role}
                      </h3>
                      {exp.location ? (
                        <span className="w-fit rounded border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-zinc-600 dark:border-zinc-600 dark:bg-zinc-900/60 dark:text-zinc-400">
                          {exp.location}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-500">{exp.company}</p>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-600">{dateStr}</p>
                    {exp.bullets && exp.bullets.length > 0 ? (
                      <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                        {exp.bullets.map((b, i) => (
                          <li key={i} className="pl-1">
                            {b}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {content.education && content.education.length > 0 && (
          <section id="education" className="mb-14 scroll-mt-24">
            <SectionTitle>Education</SectionTitle>
            <div className="space-y-8">
              {content.education.map((edu, idx) => (
                <article key={`edu-${idx}`}>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{edu.institution}</h3>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-500">
                    {edu.degree}
                    {edu.field ? ` · ${edu.field}` : ''}
                  </p>
                  <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-600">
                    {edu.startDate}
                    {edu.endDate ? ` — ${edu.endDate}` : ''}
                    {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {content.projects && content.projects.length > 0 && (
          <section id="projects" className="mb-14 scroll-mt-24">
            <SectionTitle>Projects</SectionTitle>
            <div className="space-y-10">
              {content.projects.map((project, idx) => (
                <article key={`proj-${idx}`}>
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{project.name}</h3>
                    {project.url ? (
                      <a
                        href={normalizeOutboundHref(project.url)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-[var(--portfolio-accent)] underline underline-offset-4 hover:opacity-90"
                      >
                        Open link
                      </a>
                    ) : null}
                  </div>
                  {project.description ? (
                    <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{project.description}</p>
                  ) : null}
                  {project.bullets && project.bullets.length > 0 ? (
                    <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                      {project.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        )}

        {content.skills && content.skills.length > 0 && (
          <section id="skills" className="mb-14 scroll-mt-24">
            <SectionTitle>Skills</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {content.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded px-2 py-0.5 text-xs font-medium leading-none bg-[var(--portfolio-accent)] text-zinc-950 dark:text-[#09090b]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {content.awards && content.awards.filter(Boolean).length > 0 && (
          <section className="mb-14">
            <SectionTitle>Awards</SectionTitle>
            <ul className="list-inside list-disc space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              {content.awards.filter(Boolean).map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          </section>
        )}

        {content.extracurricular && content.extracurricular.length > 0 && (
          <section className="mb-14">
            <SectionTitle>Extracurricular</SectionTitle>
            <div className="space-y-8">
              {content.extracurricular.map((block, idx) => (
                <article key={`ex-${idx}`}>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{block.title}</h3>
                  {block.bullets.length > 0 ? (
                    <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-zinc-600 dark:text-zinc-400">
                      {block.bullets.map((b, i) => (
                        <li key={i}>{b}</li>
                      ))}
                    </ul>
                  ) : null}
                </article>
              ))}
            </div>
          </section>
        )}

        {content.otherSections && content.otherSections.length > 0 && (
          <section className="mb-14 space-y-12">
            {content.otherSections.map((block, idx) => (
              <div key={`other-${idx}`}>
                <SectionTitle>{block.title || 'Section'}</SectionTitle>
                {block.bullets.length > 0 ? (
                  <ul className="list-inside list-disc space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {block.bullets.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </section>
        )}

        {!narrowLayout ? (
          <div className="mt-16 rounded-none border-t border-zinc-200 bg-zinc-100/80 px-4 py-5 sm:px-5 dark:border-zinc-800 dark:bg-zinc-900/50">
            <PortfolioPublicFooter neu={false} label="Published profile" band />
          </div>
        ) : null}
      </div>
    </div>
  );
}
