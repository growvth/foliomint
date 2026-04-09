import { toast } from 'sonner';

import { showPortfolioPublishedToast } from '@/components/domain/portfolio-published-toast';
import { portfolioSiteBasePath } from '@/lib/public-handle';
import type { EditorPageState } from '@/types/editor-page';

/** After a successful PATCH, show copy that matches what the user actually changed. */
export function toastAfterPortfolioSave(
  updates: Partial<EditorPageState> | undefined,
  next: EditorPageState,
  prevPublished: boolean,
): void {
  if (updates && Object.prototype.hasOwnProperty.call(updates, 'isPublished')) {
    if (next.isPublished && !prevPublished) {
      const path = portfolioSiteBasePath({
        publicHandle: next.publicHandle,
        slug: next.slug,
      });
      showPortfolioPublishedToast(path);
      return;
    }
    if (!next.isPublished && prevPublished) {
      toast('Taken offline', {
        duration: 6500,
        description: 'Your portfolio is no longer visible to the public.',
      });
      return;
    }
  }

  if (!updates || Object.keys(updates).length === 0) {
    toast.success('Saved', { description: 'All changes have been stored.' });
    return;
  }

  const keys = Object.keys(updates) as (keyof EditorPageState)[];
  const onlyTheme = keys.length === 1 && keys[0] === 'theme';
  const onlyLookKeys = keys.every((k) => k === 'theme' || k === 'accentColor');

  if (onlyTheme) {
    const label = next.theme === 'neubrutalism' ? 'Neubrutalism' : 'Classic';
    toast.success('Theme updated', {
      description: `${label} is now set. Visitors will see this style on your published site.`,
    });
    return;
  }

  if (onlyLookKeys && keys.includes('theme')) {
    toast.success('Look updated', {
      description: 'Theme and accent preferences saved.',
    });
    return;
  }

  toast.success('Saved', {
    description: 'Your changes have been stored.',
  });
}
