import { cn } from '@/lib/utils';

/** Outer page shell (background + text). */
export function portfolioShellClass(neu: boolean): string {
  return neu
    ? 'relative min-h-screen bg-[#fff8e8] text-foreground dark:bg-zinc-950 dark:text-zinc-50'
    : 'relative min-h-screen bg-background';
}

/**
 * Main column: same width + horizontal padding on portfolio + blog index.
 * Blog post uses the same outer padding; inner prose width is constrained separately.
 */
export function portfolioContentContainerClass(): string {
  return 'mx-auto max-w-5xl px-5 pb-24 pt-10 sm:px-8 lg:px-12 lg:pb-28 lg:pt-14';
}

/** Narrow column for long-form reading (blog post body). */
export function portfolioReadingColumnClass(): string {
  return 'mx-auto w-full max-w-3xl';
}

/** Top nav / primary actions: Blog, Back to portfolio, All posts — same everywhere. */
export function portfolioNavPillClass(neu: boolean): string {
  return neu
    ? cn(
        'inline-flex items-center justify-center border-4 border-foreground bg-background px-4 py-2',
        'text-sm font-bold text-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))]',
        'no-underline transition-transform hover:translate-x-px hover:translate-y-px',
      )
    : cn(
        'inline-flex items-center justify-center rounded-full border border-primary/25 bg-primary/10 px-5 py-2',
        'text-sm font-semibold text-primary no-underline transition-colors hover:bg-primary/15',
      );
}

/** Eyebrow label (Portfolio, Writing, …). */
export function portfolioEyebrowClass(neu: boolean): string {
  return cn(
    'text-[11px] font-semibold uppercase tracking-[0.28em] text-primary',
    neu && 'tracking-[0.22em]',
  );
}

/** Divider under hero / page intro (portfolio hero + blog headers). */
export function portfolioHeaderRuleClass(neu: boolean): string {
  return cn('border-b pb-12 sm:pb-16', neu ? 'border-foreground/20' : 'border-border/70');
}

/** Section titles (Skills, Experience, …). */
export function portfolioSectionTitleRowClass(neu: boolean): string {
  return cn(
    'mb-8 flex items-center gap-3 text-[1.35rem] font-semibold tracking-tight text-foreground sm:text-2xl',
    neu && 'uppercase tracking-[0.12em]',
  );
}

export function portfolioSectionAccentClass(neu: boolean): string {
  return cn(
    'block h-9 w-1 shrink-0 rounded-full bg-primary',
    neu && 'h-4 w-4 rounded-none border-4 border-foreground bg-primary shadow-[4px_4px_0_0_hsl(var(--foreground))]',
  );
}

/** Primary content cards (experience, education, projects, awards, blog list items). */
export function portfolioCardClass(neu: boolean): string {
  return neu
    ? 'rounded-none border-4 border-foreground bg-card shadow-[6px_6px_0_0_hsl(var(--foreground))]'
    : cn(
        'rounded-2xl border border-border/80 bg-card/80 shadow-sm',
        'ring-1 ring-black/[0.03] dark:ring-white/[0.06]',
        'transition-[transform,box-shadow,border-color] duration-300',
        'hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5',
      );
}

export const PORTFOLIO_CARD_PAD = 'p-6 sm:p-7';

/** Non-interactive skill chips. */
export function portfolioSkillChipClass(neu: boolean): string {
  return neu
    ? 'rounded-none border-2 border-foreground bg-background px-3 py-1.5 text-sm font-bold shadow-[3px_3px_0_0_hsl(var(--foreground))]'
    : cn(
        'rounded-full border border-primary/20 bg-primary/[0.06] px-3.5 py-1.5 text-sm font-medium',
        'text-foreground/90 transition-colors hover:border-primary/35 hover:bg-primary/[0.1]',
      );
}

/** External text links inside cards (e.g. Open project). */
export function portfolioInlineLinkClass(neu: boolean): string {
  return neu
    ? cn(
        'inline-flex items-center border-2 border-foreground bg-background px-3 py-1.5',
        'text-xs font-bold text-foreground shadow-[3px_3px_0_0_hsl(var(--foreground))] no-underline',
        'transition-transform hover:translate-x-px hover:translate-y-px',
      )
    : 'text-xs font-semibold text-primary underline-offset-4 hover:underline';
}

/** Social / outbound link chips (same family as nav pill, slightly tighter). */
export function portfolioOutboundChipClass(neu: boolean): string {
  return neu
    ? cn(
        'inline-flex items-center justify-center border-4 border-foreground bg-background px-4 py-2',
        'text-sm font-bold text-foreground shadow-[4px_4px_0_0_hsl(var(--foreground))] no-underline',
        'transition-transform hover:translate-x-px hover:translate-y-px',
      )
    : cn(
        'inline-flex items-center justify-center rounded-full border border-primary/25 bg-primary/10 px-4 py-2',
        'text-sm font-semibold text-primary no-underline transition-colors hover:bg-primary/15',
      );
}

export function portfolioDateTextClass(): string {
  return 'text-xs font-medium tabular-nums text-muted-foreground';
}

export function portfolioDateBadgeClass(neu: boolean): string {
  return cn(portfolioDateTextClass(), neu && 'border-2 border-foreground bg-background px-2 py-1 font-bold text-foreground');
}

/** Bullet list marker line. */
export function portfolioBulletLineClass(neu: boolean): string {
  return cn(
    'flex gap-3 text-sm leading-relaxed text-muted-foreground',
    neu && 'text-foreground',
  );
}

export function portfolioBulletDotClass(neu: boolean): string {
  return cn(
    'mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/75',
    neu && 'mt-2.5 h-2 w-2 rounded-none border-2 border-foreground bg-primary',
  );
}

export function portfolioFooterRuleClass(neu: boolean): string {
  return cn(
    'mt-20 flex flex-col gap-3 border-t pt-10 sm:flex-row sm:items-center sm:justify-between',
    neu ? 'border-foreground/25' : 'border-border/70',
  );
}

/** Space between major sections on the page. */
export const PORTFOLIO_SECTION_GAP = 'mt-14 space-y-20 sm:mt-16 lg:mt-20';
