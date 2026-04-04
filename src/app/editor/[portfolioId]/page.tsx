'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BookOpen, Globe2, Save, Eye, Globe, Loader2, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  EditorField,
  EditorFormPanel,
  EditorSkillsField,
  editorMonoControlClass,
} from '@/components/domain/editor-form-ui';
import { EditorLivePreview } from '@/components/domain/editor-live-preview';
import { Navbar } from '@/components/domain/navbar';
import { normalizePortfolioAccent } from '@/lib/portfolio-accent';
import { cn } from '@/lib/utils';
import type { PortfolioContent } from '@/types';

interface EditorState {
  id: string;
  slug: string;
  title: string;
  theme: string;
  accentColor: string | null;
  isPublished: boolean;
  content: PortfolioContent | null;
}

export default function EditorPage() {
  const params = useParams<{ portfolioId: string }>();
  const router = useRouter();
  const [state, setState] = useState<EditorState | null>(null);
  const [tier, setTier] = useState<'free' | 'pro'>('pro');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const rawId = params.portfolioId;
    const id = typeof rawId === 'string' ? rawId : Array.isArray(rawId) ? rawId[0] : undefined;
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/portfolios/${id}`, { credentials: 'include' });
        if (!res.ok) {
          if (res.status === 401) {
            router.push(`/sign-in?callbackUrl=${encodeURIComponent(`/editor/${id}`)}`);
            return;
          }
          throw new Error('Failed to load portfolio');
        }
        const data = await res.json();
        setState({
          id: data.id,
          slug: data.slug,
          title: data.title,
          theme: data.theme,
          accentColor: data.accentColor ?? null,
          isPublished: data.isPublished,
          content: data.content,
        });
        const me = await fetch('/api/me', { credentials: 'include' }).then((r) => r.json() as Promise<{ tier?: string }>);
        setTier(me.tier === 'pro' ? 'pro' : 'free');
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load portfolio');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [params.portfolioId, router]);

  const handleSave = async (updates?: Partial<EditorState>) => {
    if (!state) return;
    setSaving(true);
    try {
      const next = { ...state, ...updates };
      const res = await fetch(`/api/portfolios/${state.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: next.title,
          theme: next.theme,
          accentColor: next.accentColor,
          isPublished: next.isPublished,
          content: next.content,
        }),
      });
      if (!res.ok) throw new Error('Failed to save portfolio');
      setState(next);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save portfolio');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          Failed to load portfolio.
        </div>
      </div>
    );
  }

  const content = state.content;
  const updateContent = (updater: (current: PortfolioContent) => PortfolioContent) => {
    setState((prev) =>
      prev && prev.content ? { ...prev, content: updater(prev.content) } : prev,
    );
  };

  const previewCardClass = cn(
    'editor-form-card shadow-sm hover:translate-y-0 hover:shadow-md before:hidden dark:hover:shadow-black/20',
  );
  const editorCardTitleClass = 'font-sans text-base font-semibold tracking-tight text-foreground';
  const editorRepeatItemClass = cn('editor-nested-card rounded-lg border-2 border-border p-4 dark:border-white/10');

  const monoInput = (extra?: string) => cn(editorMonoControlClass, 'h-10', extra);
  const monoTextarea = (extra?: string) =>
    cn(editorMonoControlClass, 'min-h-[88px] resize-y', extra);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Editor toolbar */}
        <div className="sticky top-16 z-40 border-b bg-background/80 backdrop-blur-lg">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Editing</span>
              <code className="truncate rounded bg-muted px-2 py-0.5 text-xs">{state.slug}</code>
              <span
                className={
                  tier === 'pro'
                    ? 'rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary'
                    : 'rounded-full border border-border bg-muted/60 px-2 py-0.5 text-[11px] font-medium text-muted-foreground'
                }
              >
                {tier === 'pro' ? 'Pro' : 'Free'}
              </span>
              <div className="ml-1 hidden items-center gap-1 sm:flex">
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/editor/${state.id}/blog`}>
                    <BookOpen className="mr-1 h-4 w-4" />
                    Blog
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/editor/${state.id}/domain`}>
                    <Globe2 className="mr-1 h-4 w-4" />
                    Domain
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
                Theme
                <select
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                  value={state.theme}
                  onChange={(e) => void handleSave({ theme: e.target.value })}
                  disabled={saving}
                >
                  <option value="classic">Classic</option>
                  <option value="neubrutalism" disabled={tier === 'free'}>
                    Neubrutalism (Pro)
                  </option>
                </select>
              </label>
              {state.isPublished && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/${state.slug}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-1 sm:hidden">
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/editor/${state.id}/blog`} aria-label="Blog">
                    <BookOpen className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="icon">
                  <Link href={`/editor/${state.id}/domain`} aria-label="Domain">
                    <Globe2 className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <Button
                variant={state.isPublished ? 'outline' : 'default'}
                size="sm"
                onClick={() => handleSave({ isPublished: !state.isPublished })}
                disabled={saving}
              >
                <Globe className="mr-2 h-4 w-4" />
                {state.isPublished ? 'Unpublish' : 'Publish'}
              </Button>
              <Button size="sm" onClick={() => handleSave()} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Editor content */}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="editor-workspace grid gap-8 lg:grid-cols-2">
            {/* Form side */}
            <div className="space-y-6">
              <EditorFormPanel title="Personal info">
                <EditorField
                  id="editor-accent-color"
                  label="Portfolio accent"
                  hint="Used for highlights and links on your public site. Visitors switch light/dark with the toggle on the published page (independent of FolioMint dashboard theme)."
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="color"
                      aria-label="Pick accent color"
                      className="h-10 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
                      value={normalizePortfolioAccent(state.accentColor)}
                      onChange={(e) => void handleSave({ accentColor: e.target.value })}
                      disabled={saving}
                    />
                    <Input
                      id="editor-accent-color-hex"
                      className={monoInput('max-w-[9.5rem]')}
                      value={state.accentColor ?? ''}
                      placeholder="#34d399"
                      spellCheck={false}
                      onChange={(e) =>
                        setState((prev) => (prev ? { ...prev, accentColor: e.target.value || null } : prev))
                      }
                      onBlur={(e) => {
                        const v = e.target.value.trim() || null;
                        void handleSave({ accentColor: v });
                      }}
                      disabled={saving}
                    />
                  </div>
                </EditorField>
                <EditorField
                  id="editor-portfolio-title"
                  label="Portfolio title"
                  hint="Shown in your dashboard and browser tab; can differ from your display name."
                >
                  <Input
                    id="editor-portfolio-title"
                    value={state.title}
                    onChange={(e) => setState((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                    className={monoInput()}
                  />
                </EditorField>
                {content && (
                  <>
                    <EditorField id="editor-full-name" label="Display name" hint="Your name on the public portfolio.">
                      <Input
                        id="editor-full-name"
                        value={content.name}
                        onChange={(e) =>
                          setState((prev) =>
                            prev && prev.content
                              ? { ...prev, content: { ...prev.content, name: e.target.value } }
                              : prev,
                          )
                        }
                        className={monoInput()}
                      />
                    </EditorField>
                    <EditorField
                      id="editor-profile-image"
                      label="Profile image URL"
                      hint="Square photo works best. Paste a direct image link (https://…)."
                    >
                      <Input
                        id="editor-profile-image"
                        value={content.profileImageUrl ?? ''}
                        onChange={(e) =>
                          updateContent((c) => ({
                            ...c,
                            profileImageUrl: e.target.value || undefined,
                          }))
                        }
                        placeholder="https://example.com/me.jpg"
                        className={monoInput()}
                      />
                    </EditorField>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <EditorField id="editor-email" label="Email">
                        <Input
                          id="editor-email"
                          type="email"
                          value={content.email ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({ ...c, email: e.target.value || undefined }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                      <EditorField id="editor-phone" label="Phone">
                        <Input
                          id="editor-phone"
                          value={content.phone ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({ ...c, phone: e.target.value || undefined }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </div>
                    <EditorField id="editor-location" label="Location">
                      <Input
                        id="editor-location"
                        value={content.location ?? ''}
                        onChange={(e) =>
                          updateContent((c) => ({ ...c, location: e.target.value || undefined }))
                        }
                        className={monoInput()}
                      />
                    </EditorField>
                    <div className="grid gap-5 sm:grid-cols-2">
                      <EditorField id="editor-website" label="Website">
                        <Input
                          id="editor-website"
                          value={content.website ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({ ...c, website: e.target.value || undefined }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                      <EditorField id="editor-linkedin" label="LinkedIn">
                        <Input
                          id="editor-linkedin"
                          value={content.linkedin ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({ ...c, linkedin: e.target.value || undefined }))
                          }
                          className={monoInput()}
                        />
                      </EditorField>
                    </div>
                    <EditorField id="editor-github" label="GitHub">
                      <Input
                        id="editor-github"
                        value={content.github ?? ''}
                        onChange={(e) =>
                          updateContent((c) => ({ ...c, github: e.target.value || undefined }))
                        }
                        className={monoInput()}
                      />
                    </EditorField>
                    <EditorField
                      id="editor-bio"
                      label="About"
                      hint="Short summary for your portfolio. Blank lines create new paragraphs."
                    >
                      <textarea
                        id="editor-bio"
                        className={monoTextarea('min-h-[120px]')}
                        value={content.bio ?? ''}
                        onChange={(e) =>
                          updateContent((c) => ({ ...c, bio: e.target.value || undefined }))
                        }
                        placeholder="A brief professional summary…"
                      />
                    </EditorField>
                  </>
                )}
              </EditorFormPanel>

              <EditorFormPanel title="Skills">
                {content ? (
                  <EditorSkillsField
                    skills={content.skills}
                    onChange={(skills) =>
                      setState((prev) =>
                        prev && prev.content ? { ...prev, content: { ...prev.content, skills } } : prev,
                      )
                    }
                  />
                ) : (
                  <p className="font-mono text-sm text-muted-foreground">
                    Skills will appear here after your resume is parsed.
                  </p>
                )}
              </EditorFormPanel>

              <EditorFormPanel
                title="Experience"
                actions={
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-mono text-xs uppercase"
                    onClick={() =>
                      updateContent((c) => ({
                        ...c,
                        experience: [
                          ...c.experience,
                          { company: '', role: '', startDate: '', bullets: [], endDate: '', location: '' },
                        ],
                      }))
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add role
                  </Button>
                }
              >
                {content && content.experience.length > 0 ? (
                  <div className="space-y-5">
                    {content.experience.map((exp, idx) => (
                      <div key={`editor-exp-${idx}`} className={editorRepeatItemClass}>
                        <div className="mb-4 flex items-center justify-between gap-2 border-b border-border/60 pb-3 dark:border-white/10">
                          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Role {idx + 1}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="shrink-0"
                            onClick={() =>
                              updateContent((c) => ({
                                ...c,
                                experience: c.experience.filter((_, i) => i !== idx),
                              }))
                            }
                            aria-label="Remove this role"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <EditorField id={`editor-exp-${idx}-company`} label="Company / organization">
                            <Input
                              id={`editor-exp-${idx}-company`}
                              value={exp.company}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  experience: c.experience.map((it, i) =>
                                    i === idx ? { ...it, company: e.target.value } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                          <EditorField id={`editor-exp-${idx}-role`} label="Job title">
                            <Input
                              id={`editor-exp-${idx}-role`}
                              value={exp.role}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  experience: c.experience.map((it, i) =>
                                    i === idx ? { ...it, role: e.target.value } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                        </div>
                        <div className="mt-4 grid gap-5 sm:grid-cols-3">
                          <EditorField id={`editor-exp-${idx}-start`} label="Start date" hint="e.g. Jan 2022">
                            <Input
                              id={`editor-exp-${idx}-start`}
                              value={exp.startDate}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  experience: c.experience.map((it, i) =>
                                    i === idx ? { ...it, startDate: e.target.value } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                          <EditorField id={`editor-exp-${idx}-end`} label="End date" hint="Leave blank if current">
                            <Input
                              id={`editor-exp-${idx}-end`}
                              value={exp.endDate ?? ''}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  experience: c.experience.map((it, i) =>
                                    i === idx ? { ...it, endDate: e.target.value || undefined } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                          <EditorField id={`editor-exp-${idx}-loc`} label="Location" hint="City, remote, etc.">
                            <Input
                              id={`editor-exp-${idx}-loc`}
                              value={exp.location ?? ''}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  experience: c.experience.map((it, i) =>
                                    i === idx ? { ...it, location: e.target.value || undefined } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                        </div>
                        <EditorField
                          id={`editor-exp-${idx}-bullets`}
                          label="Highlights"
                          hint="One achievement or responsibility per line."
                        >
                          <textarea
                            id={`editor-exp-${idx}-bullets`}
                            className={monoTextarea('min-h-[100px]')}
                            value={(exp.bullets ?? []).join('\n')}
                            onChange={(e) =>
                              updateContent((c) => ({
                                ...c,
                                experience: c.experience.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        bullets: e.target.value
                                          .split('\n')
                                          .map((v) => v.trim())
                                          .filter(Boolean),
                                      }
                                    : it,
                                ),
                              }))
                            }
                          />
                        </EditorField>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-sm text-muted-foreground">
                    No roles yet. Add one or re-parse your resume.
                  </p>
                )}
              </EditorFormPanel>

              <EditorFormPanel
                title="Education"
                actions={
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-mono text-xs uppercase"
                    onClick={() =>
                      updateContent((c) => ({
                        ...c,
                        education: [
                          ...c.education,
                          { institution: '', degree: '', startDate: '', endDate: '', field: '', gpa: '' },
                        ],
                      }))
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add school
                  </Button>
                }
              >
                {content && content.education.length > 0 ? (
                  <div className="space-y-5">
                    {content.education.map((edu, idx) => (
                      <div key={`editor-edu-${idx}`} className={editorRepeatItemClass}>
                        <div className="mb-4 flex items-center justify-between gap-2 border-b border-border/60 pb-3 dark:border-white/10">
                          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            School {idx + 1}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="shrink-0"
                            onClick={() =>
                              updateContent((c) => ({
                                ...c,
                                education: c.education.filter((_, i) => i !== idx),
                              }))
                            }
                            aria-label="Remove this school"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <EditorField id={`editor-edu-${idx}-inst`} label="School / university">
                            <Input
                              id={`editor-edu-${idx}-inst`}
                              value={edu.institution}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.map((it, i) =>
                                    i === idx ? { ...it, institution: e.target.value } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                          <EditorField id={`editor-edu-${idx}-degree`} label="Degree" hint="e.g. B.S., M.Eng.">
                            <Input
                              id={`editor-edu-${idx}-degree`}
                              value={edu.degree}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.map((it, i) =>
                                    i === idx ? { ...it, degree: e.target.value } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                        </div>
                        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                          <EditorField
                            id={`editor-edu-${idx}-field`}
                            label="Field of study"
                            hint="Major, concentration, or program (optional)."
                          >
                            <Input
                              id={`editor-edu-${idx}-field`}
                              value={edu.field ?? ''}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.map((it, i) =>
                                    i === idx ? { ...it, field: e.target.value || undefined } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                          <EditorField id={`editor-edu-${idx}-start`} label="Start">
                            <Input
                              id={`editor-edu-${idx}-start`}
                              value={edu.startDate}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.map((it, i) =>
                                    i === idx ? { ...it, startDate: e.target.value } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                          <EditorField id={`editor-edu-${idx}-end`} label="End">
                            <Input
                              id={`editor-edu-${idx}-end`}
                              value={edu.endDate ?? ''}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.map((it, i) =>
                                    i === idx ? { ...it, endDate: e.target.value || undefined } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                          <EditorField id={`editor-edu-${idx}-gpa`} label="GPA" hint="Optional">
                            <Input
                              id={`editor-edu-${idx}-gpa`}
                              value={edu.gpa ?? ''}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.map((it, i) =>
                                    i === idx ? { ...it, gpa: e.target.value || undefined } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-sm text-muted-foreground">
                    No schools yet. Add one or re-parse your resume.
                  </p>
                )}
              </EditorFormPanel>

              <EditorFormPanel
                title="Projects"
                actions={
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-mono text-xs uppercase"
                    onClick={() =>
                      updateContent((c) => ({
                        ...c,
                        projects: [...c.projects, { name: '', description: '', url: '', technologies: [], bullets: [] }],
                      }))
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add project
                  </Button>
                }
              >
                {content && content.projects.length > 0 ? (
                  <div className="space-y-5">
                    {content.projects.map((project, idx) => (
                      <div key={`editor-proj-${idx}`} className={editorRepeatItemClass}>
                        <div className="mb-4 flex items-center justify-between gap-2 border-b border-border/60 pb-3 dark:border-white/10">
                          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Project {idx + 1}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="shrink-0"
                            onClick={() =>
                              updateContent((c) => ({
                                ...c,
                                projects: c.projects.filter((_, i) => i !== idx),
                              }))
                            }
                            aria-label="Remove this project"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-5 sm:grid-cols-2">
                          <EditorField id={`editor-proj-${idx}-name`} label="Project name">
                            <Input
                              id={`editor-proj-${idx}-name`}
                              value={project.name}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  projects: c.projects.map((it, i) =>
                                    i === idx ? { ...it, name: e.target.value } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                          <EditorField id={`editor-proj-${idx}-url`} label="Link" hint="Repo, demo, or case study URL.">
                            <Input
                              id={`editor-proj-${idx}-url`}
                              value={project.url ?? ''}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  projects: c.projects.map((it, i) =>
                                    i === idx ? { ...it, url: e.target.value || undefined } : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                        </div>
                        <EditorField id={`editor-proj-${idx}-desc`} label="Summary" hint="One or two sentences.">
                          <textarea
                            id={`editor-proj-${idx}-desc`}
                            className={monoTextarea('min-h-[72px]')}
                            value={project.description ?? ''}
                            onChange={(e) =>
                              updateContent((c) => ({
                                ...c,
                                projects: c.projects.map((it, i) =>
                                  i === idx ? { ...it, description: e.target.value || undefined } : it,
                                ),
                              }))
                            }
                          />
                        </EditorField>
                        <EditorField
                          id={`editor-proj-${idx}-tech`}
                          label="Technologies"
                          hint="Comma-separated (shown as tags on your portfolio)."
                        >
                          <Input
                            id={`editor-proj-${idx}-tech`}
                            value={(project.technologies ?? []).join(', ')}
                            onChange={(e) =>
                              updateContent((c) => ({
                                ...c,
                                projects: c.projects.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        technologies: e.target.value
                                          .split(',')
                                          .map((v) => v.trim())
                                          .filter(Boolean),
                                      }
                                    : it,
                                ),
                              }))
                            }
                            className={monoInput()}
                          />
                        </EditorField>
                        <EditorField
                          id={`editor-proj-${idx}-bullets`}
                          label="Details"
                          hint="Extra bullets; one per line."
                        >
                          <textarea
                            id={`editor-proj-${idx}-bullets`}
                            className={monoTextarea('min-h-[88px]')}
                            value={(project.bullets ?? []).join('\n')}
                            onChange={(e) =>
                              updateContent((c) => ({
                                ...c,
                                projects: c.projects.map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        bullets: e.target.value
                                          .split('\n')
                                          .map((v) => v.trim())
                                          .filter(Boolean),
                                      }
                                    : it,
                                ),
                              }))
                            }
                          />
                        </EditorField>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-sm text-muted-foreground">
                    No projects yet. Add one or re-parse your resume.
                  </p>
                )}
              </EditorFormPanel>

              <EditorFormPanel
                title="Awards"
                actions={
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-mono text-xs uppercase"
                    onClick={() =>
                      updateContent((c) => ({
                        ...c,
                        awards: [...(c.awards ?? []), ''],
                      }))
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add award
                  </Button>
                }
              >
                {content && content.awards && content.awards.length > 0 ? (
                  <div className="space-y-4">
                    {content.awards.map((a, i) => (
                      <div key={`editor-award-${i}`} className="flex flex-col gap-2 sm:flex-row sm:items-end">
                        <div className="min-w-0 flex-1">
                          <EditorField id={`editor-award-${i}`} label={`Award ${i + 1}`}>
                            <Input
                              id={`editor-award-${i}`}
                              value={a}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  awards: (c.awards ?? []).map((it, idx) =>
                                    idx === i ? e.target.value : it,
                                  ),
                                }))
                              }
                              className={monoInput()}
                            />
                          </EditorField>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="shrink-0"
                          onClick={() =>
                            updateContent((c) => ({
                              ...c,
                              awards: (c.awards ?? []).filter((_, idx) => idx !== i),
                            }))
                          }
                          aria-label="Remove award"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-sm text-muted-foreground">No awards yet.</p>
                )}
              </EditorFormPanel>

              <EditorFormPanel
                title="Extracurricular"
                actions={
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-mono text-xs uppercase"
                    onClick={() =>
                      updateContent((c) => ({
                        ...c,
                        extracurricular: [...(c.extracurricular ?? []), { title: '', bullets: [] }],
                      }))
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add block
                  </Button>
                }
              >
                {content && content.extracurricular && content.extracurricular.length > 0 ? (
                  <div className="space-y-5">
                    {content.extracurricular.map((block, idx) => (
                      <div key={`editor-extra-${idx}`} className={editorRepeatItemClass}>
                        <div className="mb-4 flex items-center justify-between gap-2 border-b border-border/60 pb-3 dark:border-white/10">
                          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Block {idx + 1}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="shrink-0"
                            onClick={() =>
                              updateContent((c) => ({
                                ...c,
                                extracurricular: (c.extracurricular ?? []).filter((_, i) => i !== idx),
                              }))
                            }
                            aria-label="Remove block"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <EditorField id={`editor-extra-${idx}-title`} label="Section heading">
                          <Input
                            id={`editor-extra-${idx}-title`}
                            value={block.title}
                            onChange={(e) =>
                              updateContent((c) => ({
                                ...c,
                                extracurricular: (c.extracurricular ?? []).map((it, i) =>
                                  i === idx ? { ...it, title: e.target.value } : it,
                                ),
                              }))
                            }
                            className={monoInput()}
                          />
                        </EditorField>
                        <EditorField
                          id={`editor-extra-${idx}-bullets`}
                          label="Bullets"
                          hint="One per line."
                        >
                          <textarea
                            id={`editor-extra-${idx}-bullets`}
                            className={monoTextarea('min-h-[88px]')}
                            value={block.bullets.join('\n')}
                            onChange={(e) =>
                              updateContent((c) => ({
                                ...c,
                                extracurricular: (c.extracurricular ?? []).map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        bullets: e.target.value
                                          .split('\n')
                                          .map((v) => v.trim())
                                          .filter(Boolean),
                                      }
                                    : it,
                                ),
                              }))
                            }
                          />
                        </EditorField>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-sm text-muted-foreground">No extracurricular blocks yet.</p>
                )}
              </EditorFormPanel>

              <EditorFormPanel
                title="Other sections"
                actions={
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-mono text-xs uppercase"
                    onClick={() =>
                      updateContent((c) => ({
                        ...c,
                        otherSections: [...(c.otherSections ?? []), { title: '', bullets: [] }],
                      }))
                    }
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add section
                  </Button>
                }
              >
                {content && content.otherSections && content.otherSections.length > 0 ? (
                  <div className="space-y-5">
                    {content.otherSections.map((block, idx) => (
                      <div key={`editor-other-${idx}`} className={editorRepeatItemClass}>
                        <div className="mb-4 flex items-center justify-between gap-2 border-b border-border/60 pb-3 dark:border-white/10">
                          <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            Custom {idx + 1}
                          </span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="shrink-0"
                            onClick={() =>
                              updateContent((c) => ({
                                ...c,
                                otherSections: (c.otherSections ?? []).filter((_, i) => i !== idx),
                              }))
                            }
                            aria-label="Remove section"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <EditorField id={`editor-other-${idx}-title`} label="Section title">
                          <Input
                            id={`editor-other-${idx}-title`}
                            value={block.title}
                            onChange={(e) =>
                              updateContent((c) => ({
                                ...c,
                                otherSections: (c.otherSections ?? []).map((it, i) =>
                                  i === idx ? { ...it, title: e.target.value } : it,
                                ),
                              }))
                            }
                            className={monoInput()}
                          />
                        </EditorField>
                        <EditorField
                          id={`editor-other-${idx}-bullets`}
                          label="Content"
                          hint="One bullet per line."
                        >
                          <textarea
                            id={`editor-other-${idx}-bullets`}
                            className={monoTextarea('min-h-[88px]')}
                            value={block.bullets.join('\n')}
                            onChange={(e) =>
                              updateContent((c) => ({
                                ...c,
                                otherSections: (c.otherSections ?? []).map((it, i) =>
                                  i === idx
                                    ? {
                                        ...it,
                                        bullets: e.target.value
                                          .split('\n')
                                          .map((v) => v.trim())
                                          .filter(Boolean),
                                      }
                                    : it,
                                ),
                              }))
                            }
                          />
                        </EditorField>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="font-mono text-sm text-muted-foreground">No extra sections yet.</p>
                )}
              </EditorFormPanel>

              {error && (
                <p className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>

            {/* Preview side */}
            <div className="hidden lg:block">
              <div className="sticky top-32">
                <Card
                  className={cn(
                    previewCardClass,
                    'flex max-h-[min(720px,calc(100vh-8.5rem))] min-h-[280px] flex-col overflow-hidden',
                  )}
                >
                  <CardHeader className="shrink-0 space-y-1 border-b border-border/60 bg-background/80 pb-4 dark:border-white/10">
                    <CardTitle className={editorCardTitleClass}>Live Preview</CardTitle>
                    <p className="font-sans text-xs text-muted-foreground">
                      Uses your selected theme ({state.theme === 'neubrutalism' ? 'Neubrutalism' : 'Classic'}). Canvas
                      light/dark follows your FolioMint theme toggle so it matches what visitors see after they switch
                      modes on the live site.
                    </p>
                  </CardHeader>
                  <CardContent className="min-h-0 flex-1 overflow-y-auto bg-background px-4 py-4 sm:px-5">
                    <EditorLivePreview
                      content={content}
                      portfolioTitle={state.title}
                      slug={state.slug}
                      theme={state.theme}
                      accentColor={state.accentColor}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

