import { cn } from '@/lib/utils';

/** Inner page wrapper: follows shell theme (light / dark). */
export function portfolioShellClass(_neu: boolean): string {
  return 'relative min-h-full text-zinc-900 dark:text-zinc-100';
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
        'inline-flex items-center justify-center border-4 px-4 py-2 text-sm font-bold no-underline',
        'border-zinc-900 bg-white text-zinc-900 shadow-[4px_4px_0_0_rgb(24_24_27)]',
        'transition-transform hover:translate-x-px hover:translate-y-px',
        'dark:border-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[4px_4px_0_0_rgb(228_228_231)]',
      )
    : cn(
        'inline-flex items-center justify-center rounded-full border border-[var(--portfolio-accent-border)]',
        'bg-[var(--portfolio-accent-softer)] px-5 py-2 text-sm font-semibold text-[var(--portfolio-accent)]',
        'no-underline transition-colors hover:bg-[var(--portfolio-accent-soft)]',
      );
}

/** Eyebrow label (Portfolio, Writing, …). */
export function portfolioEyebrowClass(neu: boolean): string {
  return cn(
    'text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--portfolio-accent)]',
    neu && 'tracking-[0.22em]',
  );
}

/** Divider under hero / page intro (portfolio hero + blog headers). */
export function portfolioHeaderRuleClass(neu: boolean): string {
  return cn(
    'border-b pb-12 sm:pb-16',
    neu ? 'border-zinc-300 dark:border-zinc-600/80' : 'border-zinc-200 dark:border-zinc-700',
  );
}

/** Section titles (Skills, Experience, …). */
export function portfolioSectionTitleRowClass(neu: boolean): string {
  return cn(
    'mb-8 flex items-center gap-3 text-[1.35rem] font-semibold tracking-tight text-zinc-900 sm:text-2xl',
    'dark:text-zinc-100',
    neu && 'uppercase tracking-[0.12em]',
  );
}

export function portfolioSectionAccentClass(neu: boolean): string {
  return neu
    ? cn(
        'block h-4 w-4 shrink-0 rounded-none border-4 border-zinc-900 bg-[var(--portfolio-accent)]',
        'shadow-[4px_4px_0_0_rgb(24_24_27)]',
        'dark:border-zinc-200 dark:shadow-[4px_4px_0_0_rgb(228_228_231)]',
      )
    : 'block h-9 w-1 shrink-0 rounded-full bg-[var(--portfolio-accent)]';
}

/** Primary content cards (experience, education, projects, awards, blog list items). */
export function portfolioCardClass(neu: boolean): string {
  return neu
    ? cn(
        'rounded-none border-4 border-zinc-900 bg-white/95 shadow-[6px_6px_0_0_rgb(24_24_27)]',
        'dark:border-zinc-200 dark:bg-zinc-900/70 dark:shadow-[6px_6px_0_0_rgb(228_228_231)]',
      )
    : cn(
        'rounded-2xl border border-zinc-200 bg-white/90 shadow-sm',
        'transition-[transform,box-shadow,border-color] duration-300',
        'hover:-translate-y-0.5 hover:border-[var(--portfolio-accent-border)] hover:shadow-lg hover:shadow-[var(--portfolio-accent-softer)]',
        'dark:border-zinc-700/90 dark:bg-zinc-900/45',
        'dark:hover:border-[var(--portfolio-accent-border)] dark:hover:shadow-[var(--portfolio-accent-softer)]',
      );
}

export const PORTFOLIO_CARD_PAD = 'p-6 sm:p-7';

/** Non-interactive skill chips. */
export function portfolioSkillChipClass(neu: boolean): string {
  return neu
    ? cn(
        'rounded-none border-2 border-zinc-900 bg-white px-2 py-0.5 text-xs font-bold leading-none text-zinc-900',
        'shadow-[3px_3px_0_0_rgb(24_24_27)]',
        'dark:border-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[3px_3px_0_0_rgb(228_228_231)]',
      )
    : cn(
        'rounded-full border border-[var(--portfolio-accent-border)] bg-[var(--portfolio-accent-softer)] px-2.5 py-0.5',
        'text-xs font-medium leading-none text-zinc-800 transition-colors hover:border-[var(--portfolio-accent)]/55 hover:bg-[var(--portfolio-accent-soft)]',
        'dark:text-zinc-200 dark:hover:border-[var(--portfolio-accent)]/55',
      );
}

/** External text links inside cards (e.g. Open project). */
export function portfolioInlineLinkClass(neu: boolean): string {
  return neu
    ? cn(
        'inline-flex items-center border-2 border-zinc-900 bg-white px-3 py-1.5',
        'text-xs font-bold text-zinc-900 shadow-[3px_3px_0_0_rgb(24_24_27)] no-underline',
        'transition-transform hover:translate-x-px hover:translate-y-px',
        'dark:border-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[3px_3px_0_0_rgb(228_228_231)]',
      )
    : 'text-xs font-semibold text-[var(--portfolio-accent)] underline-offset-4 hover:underline';
}

/** Social / outbound link chips (same family as nav pill, slightly tighter). */
export function portfolioOutboundChipClass(neu: boolean): string {
  return neu
    ? cn(
        'inline-flex items-center justify-center border-4 border-zinc-900 bg-white px-4 py-2',
        'text-sm font-bold text-zinc-900 shadow-[4px_4px_0_0_rgb(24_24_27)] no-underline',
        'transition-transform hover:translate-x-px hover:translate-y-px',
        'dark:border-zinc-200 dark:bg-zinc-950 dark:text-zinc-100 dark:shadow-[4px_4px_0_0_rgb(228_228_231)]',
      )
    : cn(
        'inline-flex items-center justify-center rounded-full border border-[var(--portfolio-accent-border)]',
        'bg-[var(--portfolio-accent-softer)] px-4 py-2 text-sm font-semibold text-[var(--portfolio-accent)]',
        'no-underline transition-colors hover:bg-[var(--portfolio-accent-soft)]',
      );
}

export function portfolioDateTextClass(): string {
  return 'text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-500';
}

export function portfolioDateBadgeClass(neu: boolean): string {
  return cn(
    portfolioDateTextClass(),
    neu &&
      cn(
        'border-2 border-zinc-900 bg-white px-2 py-1 font-bold text-zinc-900',
        'dark:border-zinc-200 dark:bg-zinc-950 dark:text-zinc-100',
      ),
  );
}

/** Bullet list marker line. */
export function portfolioBulletLineClass(neu: boolean): string {
  return cn(
    'flex gap-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400',
    neu && 'text-zinc-800 dark:text-zinc-200',
  );
}

export function portfolioBulletDotClass(neu: boolean): string {
  return neu
    ? cn(
        'mt-2.5 h-2 w-2 shrink-0 rounded-none border-2 border-zinc-900 bg-[var(--portfolio-accent)]',
        'dark:border-zinc-200',
      )
    : 'mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--portfolio-accent)]/80';
}

export function portfolioFooterRuleClass(neu: boolean): string {
  return cn(
    'mt-20 flex flex-col gap-3 border-t border-zinc-200 pt-10 sm:flex-row sm:items-center sm:justify-between',
    'dark:border-zinc-700',
    neu && 'border-zinc-300 dark:border-zinc-600',
  );
}

/** Space between major sections on the page. */
export const PORTFOLIO_SECTION_GAP = 'mt-14 space-y-20 sm:mt-16 lg:mt-20';
