import type { PortfolioContent } from '@/types';

/** Client editor page state (portfolio row + parsed content). */
export interface EditorPageState {
  id: string;
  slug: string;
  title: string;
  theme: string;
  accentColor: string | null;
  isPublished: boolean;
  content: PortfolioContent | null;
}
