import Link from 'next/link';
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  Code2,
  Dribbble,
  Github,
  Globe,
  GraduationCap,
  Linkedin,
  Mail,
  MapPin,
  Sparkles,
  Trophy,
  Twitter,
  Youtube,
  type LucideIcon,
} from 'lucide-react';

import { PortfolioAmbientBg } from '@/components/domain/portfolio-ambient';
import { PortfolioPublicFooter } from '@/components/domain/portfolio-public-footer';
import {
  PORTFOLIO_CARD_PAD,
  PORTFOLIO_SECTION_GAP,
  portfolioBulletDotClass,
  portfolioBulletLineClass,
  portfolioCardClass,
  portfolioContentContainerClass,
  portfolioDateBadgeClass,
  portfolioEyebrowClass,
  portfolioHeaderRuleClass,
  portfolioInlineLinkClass,
  portfolioNavPillClass,
  portfolioOutboundChipClass,
  portfolioSectionAccentClass,
  portfolioSectionTitleRowClass,
  portfolioShellClass,
  portfolioSkillChipClass,
} from '@/lib/portfolio-public-ui';
import { cn } from '@/lib/utils';
import type { SocialLink } from '@/lib/social-links';
import type { PortfolioContent } from '@/types';

interface PortfolioContentViewProps {
  content: PortfolioContent;
  slug: string;
  theme: string;
  showBlogLink?: boolean;
  socialLinks?: SocialLink[];
}

function normalizeHref(href: string): string {
  return href.trim().replace(/\/$/, '').toLowerCase();
}

function splitBioParagraphs(bio?: string | null): string[] {
  if (!bio) return [];
  return bio
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildProfileLinks(content: PortfolioContent, socialLinks: SocialLink[]): SocialLink[] {
  const links: SocialLink[] = [];

  if (content.email) {
    links.push({ label: 'Email', href: `mailto:${content.email}` });
  }
  if (content.website) {
    links.push({ label: 'Website', href: content.website });
  }
  if (content.github) {
    links.push({ label: 'GitHub', href: content.github });
  }
  if (content.linkedin) {
    links.push({ label: 'LinkedIn', href: content.linkedin });
  }

  links.push(...socialLinks);

  const seen = new Set<string>();
  return links.filter((link) => {
    const key = `${link.label.toLowerCase()}::${normalizeHref(link.href)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function iconForProfileLink(link: SocialLink): LucideIcon {
  const label = link.label.toLowerCase();
  const href = link.href.toLowerCase();

  if (label.includes('github') || href.includes('github.com')) return Github;
  if (label.includes('linkedin') || href.includes('linkedin.com')) return Linkedin;
  if (label === 'x' || label.includes('twitter') || href.includes('twitter.com') || href.includes('x.com')) {
    return Twitter;
  }
  if (label.includes('youtube') || href.includes('youtube.com')) return Youtube;
  if (label.includes('dribbble') || href.includes('dribbble.com')) return Dribbble;
  if (label.includes('behance') || href.includes('behance.net')) return Globe;
  if (label.includes('email') || href.startsWith('mailto:')) return Mail;

  return Globe;
}

function ClassicSectionHeader({
  icon: Icon,
  title,
  kicker,
}: {
  icon: LucideIcon;
  title: string;
  kicker: string;
}) {
  return (
    <div className="mb-7 flex items-end justify-between gap-4 border-b border-border/70 pb-4">
      <div>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
        </div>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{kicker}</p>
      </div>
    </div>
  );
}

function parsePortfolioDate(value?: string | null): number {
  if (!value) return Number.NEGATIVE_INFINITY;

  const raw = value.trim();
  if (!raw) return Number.NEGATIVE_INFINITY;

  if (/present|current|now/i.test(raw)) {
    return Number.POSITIVE_INFINITY;
  }

  const direct = Date.parse(raw);
  if (!Number.isNaN(direct)) {
    return direct;
  }

  const yearMatch = raw.match(/\b(19|20)\d{2}\b/);
  if (yearMatch) {
    return Date.parse(`${yearMatch[0]}-01-01`);
  }

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

function SectionHeading({ children, neu }: { children: React.ReactNode; neu: boolean }) {
  return (
    <h2 className={portfolioSectionTitleRowClass(neu)}>
      <span className={portfolioSectionAccentClass(neu)} aria-hidden />
      {children}
    </h2>
  );
}

function BulletList({ items, neu, dense }: { items: string[]; neu: boolean; dense?: boolean }) {
  return (
    <ul className={dense ? 'space-y-1.5' : 'space-y-2.5'}>
      {items.map((b, i) => (
        <li key={i} className={cn(portfolioBulletLineClass(neu), dense && 'text-[13px] leading-relaxed')}>
          <span className={portfolioBulletDotClass(neu)} aria-hidden />
          <span>{b}</span>
        </li>
      ))}
    </ul>
  );
}

export function PortfolioContentView({
  content,
  slug,
  theme,
  showBlogLink,
  socialLinks = [],
}: PortfolioContentViewProps) {
  const neu = theme === 'neubrutalism';

  const card = portfolioCardClass(neu);
  const pad = PORTFOLIO_CARD_PAD;
  const sortedExperience = content.experience ? sortExperienceMostRecentFirst(content.experience) : [];
  const bioParagraphs = splitBioParagraphs(content.bio);
  const profileLinks = buildProfileLinks(content, socialLinks);
  const classicNavItems = [
    content.projects?.length ? { label: 'Projects', href: '#projects' } : null,
    sortedExperience.length ? { label: 'Experience', href: '#experience' } : null,
    content.education?.length ? { label: 'Education', href: '#education' } : null,
    showBlogLink ? { label: 'Blog', href: `/${slug}/blog` } : null,
  ].filter((item): item is { label: string; href: string } => item !== null);

  if (!neu) {
    return (
      <div className={portfolioShellClass(false)}>
        <PortfolioAmbientBg />

        <div className={cn('relative', portfolioContentContainerClass())}>
          <div className="mx-auto max-w-4xl">
            <header className="border-b border-border/70 pb-4">
              <div className="flex items-center justify-between gap-6">
                <div className="font-mono text-sm font-semibold tracking-tight text-foreground">{content.name || slug}</div>
                <nav className="hidden items-center gap-5 md:flex">
                  {classicNavItems.map((item) =>
                    item.href.startsWith('/') ? (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        key={item.label}
                        href={item.href}
                        className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {item.label}
                      </a>
                    ),
                  )}
                </nav>
              </div>
            </header>

            <section className="grid gap-8 border-b border-border/70 py-10 md:grid-cols-[auto,1fr] md:gap-10">
              <div className="shrink-0">
                {content.profileImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={content.profileImageUrl}
                    alt={content.name}
                    className="h-16 w-16 rounded-xl border border-border/70 object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl border border-border/70 bg-primary/10 text-lg font-semibold text-primary shadow-sm">
                    {content.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-primary">
                  {content.skills?.slice(0, 3).join(' + ') || 'Developer portfolio'}
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                  {content.name || slug}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                  {content.location && (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {content.location}
                    </span>
                  )}
                  {content.website && (
                    <a
                      href={content.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-foreground"
                    >
                      <Globe className="h-3.5 w-3.5" />
                      {content.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                  )}
                </div>
                <div className="mt-6 max-w-2xl space-y-4">
                  {(bioParagraphs.length > 0 ? bioParagraphs : ['A focused portfolio built from generated resume data.']).map(
                    (paragraph, idx) => (
                      <p key={idx} className="font-mono text-[13px] leading-7 text-foreground/82 sm:text-[13.5px]">
                        {paragraph}
                      </p>
                    ),
                  )}
                </div>
                {profileLinks.length > 0 && (
                  <div className="mt-6 flex flex-wrap items-center gap-2.5">
                    {profileLinks.map((link, idx) => {
                      const Icon = iconForProfileLink(link);
                      return (
                        <a
                          key={`${link.label}-${link.href}-${idx}`}
                          href={link.href}
                          target={link.href.startsWith('mailto:') ? undefined : '_blank'}
                          rel={link.href.startsWith('mailto:') ? undefined : 'noreferrer'}
                          aria-label={link.label}
                          title={link.label}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
                        >
                          <Icon className="h-4 w-4" />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>

            <div className="portfolio-surface mt-12 space-y-16">
              {content.projects && content.projects.length > 0 && (
                <section id="projects">
                  <ClassicSectionHeader
                    icon={Code2}
                    title="Featured Projects"
                    kicker="Highlighted work across tooling, systems, and product ideas."
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    {content.projects.map((project, idx) => (
                      <article
                        key={`${project.name}-${idx}`}
                        className="group rounded-[22px] border border-border/70 bg-card/70 p-5 shadow-sm ring-1 ring-black/[0.03] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-lg font-semibold leading-snug text-foreground">{project.name}</h3>
                          {project.url && (
                            <a
                              href={project.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                              View
                              <ArrowUpRight className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        {project.description && (
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                        )}
                        {!project.description && project.bullets && project.bullets.length > 0 && (
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.bullets[0]}</p>
                        )}
                        {project.bullets && project.bullets.length > 1 && (
                          <div className="mt-4 rounded-2xl border border-border/60 bg-background/45 px-4 py-3">
                            <BulletList items={project.bullets.slice(0, 2)} neu={false} dense />
                          </div>
                        )}
                        {project.technologies && project.technologies.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {project.technologies.map((tech) => (
                              <span
                                key={`${project.name}-${tech}`}
                                className="rounded-full border border-border/65 bg-background/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {sortedExperience.length > 0 && (
                <section id="experience">
                  <ClassicSectionHeader
                    icon={BriefcaseBusiness}
                    title="Experience"
                    kicker="Recent roles, scope, and the work behind them."
                  />
                  <div className="space-y-4">
                    {sortedExperience.map((exp, idx) => {
                      const dateStr = `${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ' – Present'}`;
                      return (
                        <article
                          key={`${exp.company}-${exp.role}-${idx}`}
                          className="rounded-[22px] border border-border/70 bg-card/70 p-5 shadow-sm ring-1 ring-black/[0.03] sm:p-6"
                        >
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <h3 className="text-xl font-semibold leading-tight tracking-tight text-foreground">
                                {exp.role}
                              </h3>
                              <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">{exp.company}</p>
                              {exp.location && (
                                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-border/65 bg-background/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {exp.location}
                                </div>
                              )}
                            </div>
                            <p className="shrink-0 rounded-full border border-border/65 bg-background/75 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                              {dateStr}
                            </p>
                          </div>
                          {exp.bullets && exp.bullets.length > 0 && (
                            <div className="mt-5 rounded-2xl border border-border/60 bg-background/45 px-5 py-4">
                              <BulletList items={exp.bullets} neu={false} dense />
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {content.skills && content.skills.length > 0 && (
                <section id="skills">
                  <ClassicSectionHeader
                    icon={Sparkles}
                    title="Skills"
                    kicker="Core tools, languages, and technologies I reach for often."
                  />
                  <div className="flex flex-wrap gap-2.5">
                    {content.skills.map((skill) => (
                      <span
                        key={skill}
                        className="rounded-full border border-border/65 bg-background/75 px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
              )}

              {content.education && content.education.length > 0 && (
                <section id="education">
                  <ClassicSectionHeader
                    icon={GraduationCap}
                    title="Education"
                    kicker="Academic background, degrees, and formal training."
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    {content.education.map((edu, idx) => (
                      <article
                        key={`${edu.institution}-${idx}`}
                        className="rounded-[22px] border border-border/70 bg-card/70 p-5 shadow-sm ring-1 ring-black/[0.03] sm:p-6"
                      >
                        <h3 className="text-lg font-semibold leading-snug text-foreground">{edu.institution}</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {edu.degree}
                          {edu.field ? ` · ${edu.field}` : ''}
                        </p>
                        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                          {edu.startDate}
                          {edu.endDate ? ` – ${edu.endDate}` : ''}
                          {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {content.awards && content.awards.length > 0 && (
                <section>
                  <ClassicSectionHeader
                    icon={Trophy}
                    title="Awards"
                    kicker="Recognition, honors, and achievements worth highlighting."
                  />
                  <div className="rounded-[22px] border border-border/70 bg-card/70 p-5 shadow-sm ring-1 ring-black/[0.03] sm:p-6">
                    <BulletList items={content.awards} neu={false} />
                  </div>
                </section>
              )}

              {content.extracurricular && content.extracurricular.length > 0 && (
                <section>
                  <ClassicSectionHeader
                    icon={BookOpen}
                    title="Extracurricular"
                    kicker="Communities, leadership, volunteering, and interests outside core work."
                  />
                  <div className="space-y-4">
                    {content.extracurricular.map((block, idx) => (
                      <article
                        key={`${block.title}-${idx}`}
                        className="rounded-[22px] border border-border/70 bg-card/70 p-5 shadow-sm ring-1 ring-black/[0.03] sm:p-6"
                      >
                        <h3 className="text-base font-semibold text-foreground">{block.title}</h3>
                        {block.bullets.length > 0 && (
                          <div className="mt-4 rounded-2xl border border-border/60 bg-background/45 px-5 py-4">
                            <BulletList items={block.bullets} neu={false} dense />
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {content.otherSections && content.otherSections.length > 0 && (
                <section className="space-y-12">
                  {content.otherSections.map((block, idx) => (
                    <div key={`${block.title}-${idx}`}>
                      <ClassicSectionHeader
                        icon={Globe}
                        title={block.title}
                        kicker="Additional work, writing, or context from the source resume."
                      />
                      {block.bullets.length > 0 && (
                        <div className="rounded-[22px] border border-border/70 bg-card/70 p-5 shadow-sm ring-1 ring-black/[0.03] sm:p-6">
                          <BulletList items={block.bullets} neu={false} />
                        </div>
                      )}
                    </div>
                  ))}
                </section>
              )}
            </div>

            <PortfolioPublicFooter neu={false} label="Published profile" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={portfolioShellClass(neu)}>
      {!neu && <PortfolioAmbientBg />}

      <div className={cn('relative', portfolioContentContainerClass())}>
        {showBlogLink && (
          <div className="mb-10 flex justify-end sm:mb-12">
            <Link href={`/${slug}/blog`} className={portfolioNavPillClass(neu)}>
              Blog
            </Link>
          </div>
        )}

        <header className={portfolioHeaderRuleClass(neu)}>
          <div className="flex flex-col gap-10 md:flex-row md:items-start md:gap-12 lg:gap-16">
            <div className="shrink-0 md:pt-1">
              {content.profileImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={content.profileImageUrl}
                  alt={content.name}
                  className={cn(
                    'h-28 w-28 object-cover sm:h-32 sm:w-32',
                    neu
                      ? 'rounded-none border-4 border-foreground shadow-[8px_8px_0_0_hsl(var(--foreground))]'
                      : 'rounded-2xl shadow-lg ring-4 ring-background ring-offset-2 ring-offset-background',
                  )}
                />
              ) : (
                <div
                  className={cn(
                    'flex h-28 w-28 items-center justify-center text-3xl font-bold text-primary sm:h-32 sm:w-32 sm:text-4xl',
                    neu
                      ? 'rounded-none border-4 border-foreground bg-primary/25 shadow-[8px_8px_0_0_hsl(var(--foreground))]'
                      : 'rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary shadow-inner',
                  )}
                  aria-hidden
                >
                  {content.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-5">
              <p className={portfolioEyebrowClass(neu)}>Portfolio</p>
              <h1
                className={cn(
                  'font-display text-[clamp(1.85rem,4vw+1rem,3.25rem)] font-semibold leading-[1.08] tracking-tight',
                  neu && 'uppercase tracking-[0.06em]',
                )}
              >
                {content.name || slug}
              </h1>
              {content.bio && (
                <p
                  className={cn(
                    'max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl',
                    neu && 'font-medium text-foreground/90',
                  )}
                >
                  {content.bio}
                </p>
              )}
            </div>
          </div>
        </header>

        <div className={cn('portfolio-surface', PORTFOLIO_SECTION_GAP)}>
          {content.skills && content.skills.length > 0 && (
            <section>
              <SectionHeading neu={neu}>Skills</SectionHeading>
              <div className="flex flex-wrap gap-2.5">
                {content.skills.map((skill) => (
                  <span key={skill} className={portfolioSkillChipClass(neu)}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}

          {sortedExperience.length > 0 && (
            <section>
              <SectionHeading neu={neu}>Experience</SectionHeading>
              <div className="space-y-5">
                {sortedExperience.map((exp, idx) => {
                  const dateStr = `${exp.startDate}${exp.endDate ? ` – ${exp.endDate}` : ' – Present'}`;

                  return (
                    <div
                      key={`${exp.company}-${exp.role}-${idx}`}
                      className={cn(
                        neu
                          ? cn(card, pad)
                          : [
                              'group relative overflow-hidden rounded-[26px] border border-border/70 bg-card/75 p-6 shadow-sm',
                              'ring-1 ring-white/[0.03] backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-300',
                              'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/5 sm:p-7',
                            ],
                      )}
                    >
                      {!neu && (
                        <div
                          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent"
                          aria-hidden
                        />
                      )}
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3
                            className={cn(
                              'text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-[1.65rem]',
                              neu && 'text-lg font-bold uppercase',
                            )}
                          >
                            {exp.role}
                          </h3>
                          <p
                            className={cn(
                              'mt-2 text-[15px] leading-relaxed text-muted-foreground sm:text-base',
                              neu && 'text-sm font-bold',
                            )}
                          >
                            {exp.company}
                          </p>
                          {exp.location && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full border border-border/70 bg-background/65 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground',
                                  neu &&
                                    'rounded-none border-2 border-foreground bg-background px-2.5 py-1 font-bold tracking-[0.14em] text-foreground',
                                )}
                              >
                                {exp.location}
                              </span>
                            </div>
                          )}
                        </div>
                        <p
                          className={cn(
                            'shrink-0 rounded-full border border-border/70 bg-background/70 px-3.5 py-1.5 text-xs font-medium tabular-nums text-muted-foreground',
                            neu && portfolioDateBadgeClass(neu),
                          )}
                        >
                          {dateStr}
                        </p>
                      </div>
                      {exp.bullets && exp.bullets.length > 0 && (
                        <div
                          className={cn(
                            'mt-6',
                            neu
                              ? 'border-t-2 border-foreground/15 pt-5'
                              : 'rounded-2xl border border-border/60 bg-background/45 px-5 py-4',
                          )}
                        >
                          <BulletList items={exp.bullets} neu={neu} dense />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {content.education && content.education.length > 0 && (
            <section>
              <SectionHeading neu={neu}>Education</SectionHeading>
              <div className="grid gap-5 sm:grid-cols-2">
                {content.education.map((edu, idx) => (
                  <div key={`${edu.institution}-${idx}`} className={cn(card, pad)}>
                    <h3 className="text-lg font-semibold leading-snug">{edu.institution}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {edu.degree}
                      {edu.field ? ` · ${edu.field}` : ''}
                    </p>
                    <p className="mt-3 text-xs font-medium tabular-nums text-muted-foreground/90">
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
              <SectionHeading neu={neu}>Projects</SectionHeading>
              <div className={cn('grid gap-5', content.projects.length > 1 && 'sm:grid-cols-2')}>
                {content.projects.map((project, idx) => (
                  <div key={`${project.name}-${idx}`} className={cn('flex flex-col', card, pad)}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold leading-snug">{project.name}</h3>
                      {project.url && (
                        <a
                          href={project.url}
                          className={portfolioInlineLinkClass(neu)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open →
                        </a>
                      )}
                    </div>
                    {project.description && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{project.description}</p>
                    )}
                    {project.technologies && project.technologies.length > 0 && (
                      <p className="mt-4 text-xs font-medium text-muted-foreground/90">
                        {project.technologies.join(' · ')}
                      </p>
                    )}
                    {project.bullets && project.bullets.length > 0 && (
                      <div className="mt-5">
                        <BulletList items={project.bullets} neu={neu} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {content.awards && content.awards.length > 0 && (
            <section>
              <SectionHeading neu={neu}>Awards</SectionHeading>
              <div className={cn(card, pad)}>
                <BulletList items={content.awards} neu={neu} />
              </div>
            </section>
          )}

          {content.extracurricular && content.extracurricular.length > 0 && (
            <section>
              <SectionHeading neu={neu}>Extracurricular</SectionHeading>
              <div className="space-y-5">
                {content.extracurricular.map((block, idx) => (
                  <div key={`${block.title}-${idx}`} className={cn(card, pad)}>
                    <h3 className="text-base font-semibold">{block.title}</h3>
                    {block.bullets.length > 0 && (
                      <div className="mt-4">
                        <BulletList items={block.bullets} neu={neu} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {content.otherSections && content.otherSections.length > 0 && (
            <section className="space-y-14">
              {content.otherSections.map((block, idx) => (
                <div key={`${block.title}-${idx}`}>
                  <SectionHeading neu={neu}>{block.title}</SectionHeading>
                  {block.bullets.length > 0 && (
                    <div className={cn(card, pad)}>
                      <BulletList items={block.bullets} neu={neu} />
                    </div>
                  )}
                </div>
              ))}
            </section>
          )}

          {socialLinks.length > 0 && (
            <section>
              <SectionHeading neu={neu}>Links</SectionHeading>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((link, i) => (
                  <a
                    key={`${link.label}-${link.href}-${i}`}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className={portfolioOutboundChipClass(neu)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          )}
        </div>

        <PortfolioPublicFooter neu={neu} label="Published profile" />
      </div>
    </div>
  );
}
