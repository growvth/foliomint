'use client';

import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/** Shared control look: high-contrast border, monospace (editor “worksheet” style). */
export const editorMonoControlClass = cn(
  'w-full rounded-lg border-2 border-border bg-background px-3 py-2.5 font-mono text-sm leading-relaxed',
  'text-foreground placeholder:text-muted-foreground/70',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
  'dark:border-white/[0.14] dark:bg-[hsl(200_14%_10%)] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)]',
);

export function EditorFormPanel({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        'rounded-xl border-2 border-border bg-card/40 p-5 shadow-sm sm:p-6',
        'dark:border-white/[0.12] dark:bg-[hsl(200_14%_11%)] dark:shadow-none',
      )}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-4 dark:border-white/10">
        <h2 className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-foreground">{title}</h2>
        {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function EditorField({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block font-mono text-xs font-bold uppercase tracking-wide text-foreground">
        {label}
      </label>
      {hint ? <p className="font-mono text-[11px] leading-snug text-muted-foreground">{hint}</p> : null}
      {children}
    </div>
  );
}

export function EditorSkillsField({
  skills,
  onChange,
}: {
  skills: string[];
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const t = draft.trim();
    if (!t) return;
    if (skills.includes(t)) {
      setDraft('');
      return;
    }
    onChange([...skills, t]);
    setDraft('');
  };

  const remove = (index: number) => onChange(skills.filter((_, idx) => idx !== index));

  return (
    <div className="space-y-3">
      <p className="font-mono text-[11px] text-muted-foreground">
        Add skills one at a time. Each appears as a removable tag—no guessing after you fill the form.
      </p>
      <div className="flex min-h-[2.5rem] flex-wrap gap-2 rounded-lg border-2 border-dashed border-border/80 bg-muted/20 p-2 dark:border-white/10 dark:bg-black/20">
        {skills.length === 0 ? (
          <span className="self-center font-mono text-xs text-muted-foreground">No skills yet.</span>
        ) : (
          skills.map((s, i) => (
            <span
              key={`skill-chip-${i}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 font-mono text-xs font-medium dark:border-white/12"
            >
              {s}
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Remove ${s}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          id="editor-skill-draft"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Type a skill, press Enter"
          className={cn(editorMonoControlClass, 'h-10 sm:max-w-md')}
        />
        <Button type="button" variant="outline" size="sm" className="h-10 font-mono text-xs uppercase" onClick={add}>
          Add skill
        </Button>
      </div>
    </div>
  );
}
