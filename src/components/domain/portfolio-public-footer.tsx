import { cn } from '@/lib/utils';
import { portfolioFooterRuleClass } from '@/lib/portfolio-public-ui';

export function PortfolioPublicFooter({
  neu,
  label,
  /** Parent already provides the tinted band + top border (classic mono); skip extra mt/pt so the strip is not a huge empty block */
  band = false,
}: {
  neu: boolean;
  label: string;
  band?: boolean;
}) {
  return (
    <footer
      className={
        band
          ? cn('flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between')
          : portfolioFooterRuleClass(neu)
      }
    >
      <p className="text-xs text-zinc-600 dark:text-zinc-500">
        Built with{' '}
        <a href="/" className="font-medium text-[var(--portfolio-accent)] hover:underline">
          FolioMint
        </a>
      </p>
      <p className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-600">{label}</p>
    </footer>
  );
}
