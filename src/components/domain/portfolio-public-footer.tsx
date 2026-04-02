import { portfolioFooterRuleClass } from '@/lib/portfolio-public-ui';

export function PortfolioPublicFooter({ neu, label }: { neu: boolean; label: string }) {
  return (
    <footer className={portfolioFooterRuleClass(neu)}>
      <p className="text-xs text-muted-foreground">
        Built with{' '}
        <a href="/" className="font-medium text-primary hover:underline">
          FolioMint
        </a>
      </p>
      <p className="text-[11px] uppercase tracking-wider text-muted-foreground/80">{label}</p>
    </footer>
  );
}
