import { portfolioFooterRuleClass } from '@/lib/portfolio-public-ui';

export function PortfolioPublicFooter({ neu, label }: { neu: boolean; label: string }) {
  return (
    <footer className={portfolioFooterRuleClass(neu)}>
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
