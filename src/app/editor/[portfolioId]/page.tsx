'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Save, Eye, Palette, Globe, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/domain/navbar';
import type { PortfolioContent } from '@/types';

interface EditorState {
  id: string;
  slug: string;
  title: string;
  theme: string;
  isPublished: boolean;
  content: PortfolioContent | null;
}

export default function EditorPage() {
  const params = useParams<{ portfolioId: string }>();
  const router = useRouter();
  const [state, setState] = useState<EditorState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const id = params.portfolioId;
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/portfolios/${id}`);
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
          isPublished: data.isPublished,
          content: data.content,
        });
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: next.title,
          theme: next.theme,
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

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Editor toolbar */}
        <div className="sticky top-16 z-40 border-b bg-background/80 backdrop-blur-lg">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Editing portfolio</span>
              <code className="rounded bg-muted px-2 py-0.5 text-xs">{state.slug}</code>
            </div>
            <div className="flex items-center gap-2">
              {state.isPublished && (
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/${state.slug}`} target="_blank">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Link>
                </Button>
              )}
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
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Form side */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Personal Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Portfolio title</label>
                    <Input
                      value={state.title}
                      onChange={(e) =>
                        setState((prev) => (prev ? { ...prev, title: e.target.value } : prev))
                      }
                    />
                  </div>
                  {content && (
                    <>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Full Name</label>
                        <Input
                          value={content.name}
                          onChange={(e) =>
                            setState((prev) =>
                              prev && prev.content
                                ? {
                                    ...prev,
                                    content: { ...prev.content, name: e.target.value },
                                  }
                                : prev,
                            )
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Bio</label>
                        <textarea
                          className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          value={content.bio ?? ''}
                          onChange={(e) =>
                            setState((prev) =>
                              prev && prev.content
                                ? {
                                    ...prev,
                                    content: { ...prev.content, bio: e.target.value },
                                  }
                                : prev,
                            )
                          }
                          placeholder="A brief professional summary..."
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  {content ? (
                    <textarea
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={content.skills.join(', ')}
                      onChange={(e) => {
                        const skills = e.target.value
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean);
                        setState((prev) =>
                          prev && prev.content
                            ? { ...prev, content: { ...prev.content, skills } }
                            : prev,
                        );
                      }}
                      placeholder="comma, separated, skills"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Skills editor will load here from parsed resume data.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  {content && content.experience.length > 0 ? (
                    <div className="space-y-4">
                      {content.experience.map((exp, idx) => (
                        <div key={`${exp.company}-${exp.role}-${idx}`} className="rounded-md border bg-muted/40 p-3 text-xs">
                          <div className="flex flex-wrap items-baseline justify-between gap-1">
                            <div className="font-semibold">
                              {exp.role} @ {exp.company}
                            </div>
                            <div className="text-[11px] text-muted-foreground">
                              {exp.startDate}
                              {exp.endDate ? ` – ${exp.endDate}` : ' – Present'}
                            </div>
                          </div>
                          {exp.location && (
                            <div className="mt-0.5 text-[11px] text-muted-foreground">
                              {exp.location}
                            </div>
                          )}
                          {exp.bullets && exp.bullets.length > 0 && (
                            <ul className="mt-2 list-disc space-y-0.5 pl-4">
                              {exp.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No experience entries were detected in your resume.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Education</CardTitle>
                </CardHeader>
                <CardContent>
                  {content && content.education.length > 0 ? (
                    <div className="space-y-3">
                      {content.education.map((edu, idx) => (
                        <div key={`${edu.institution}-${edu.degree}-${idx}`} className="rounded-md border bg-muted/40 p-3 text-xs">
                          <div className="font-semibold">{edu.institution}</div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {edu.degree}
                            {edu.field ? ` · ${edu.field}` : ''}
                          </div>
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            {edu.startDate}
                            {edu.endDate ? ` – ${edu.endDate}` : ''}
                            {edu.gpa ? ` · GPA ${edu.gpa}` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No education entries were detected in your resume.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  {content && content.projects.length > 0 ? (
                    <div className="space-y-4">
                      {content.projects.map((project, idx) => (
                        <div key={`${project.name}-${idx}`} className="rounded-md border bg-muted/40 p-3 text-xs">
                          <div className="flex flex-wrap items-baseline justify-between gap-1">
                            <div className="font-semibold">{project.name}</div>
                            {project.url && (
                              <a
                                href={project.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[11px] text-primary underline"
                              >
                                View
                              </a>
                            )}
                          </div>
                          {project.description && (
                            <div className="mt-1 text-[11px] text-muted-foreground">
                              {project.description}
                            </div>
                          )}
                          {project.technologies && project.technologies.length > 0 && (
                            <div className="mt-1 text-[11px] text-muted-foreground">
                              Tech: {project.technologies.join(', ')}
                            </div>
                          )}
                          {project.bullets && project.bullets.length > 0 && (
                            <ul className="mt-2 list-disc space-y-0.5 pl-4">
                              {project.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No project entries were detected in your resume.
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Awards</CardTitle>
                </CardHeader>
                <CardContent>
                  {content && content.awards && content.awards.length > 0 ? (
                    <ul className="list-disc space-y-0.5 pl-4 text-xs">
                      {content.awards.map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No awards listed.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Extracurricular</CardTitle>
                </CardHeader>
                <CardContent>
                  {content && content.extracurricular && content.extracurricular.length > 0 ? (
                    <div className="space-y-3">
                      {content.extracurricular.map((block, idx) => (
                        <div key={`${block.title}-${idx}`} className="rounded-md border bg-muted/40 p-3 text-xs">
                          <div className="font-semibold">{block.title}</div>
                          {block.bullets.length > 0 && (
                            <ul className="mt-2 list-disc space-y-0.5 pl-4">
                              {block.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No extracurricular entries.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Other sections</CardTitle>
                </CardHeader>
                <CardContent>
                  {content && content.otherSections && content.otherSections.length > 0 ? (
                    <div className="space-y-3">
                      {content.otherSections.map((block, idx) => (
                        <div key={`${block.title}-${idx}`} className="rounded-md border bg-muted/40 p-3 text-xs">
                          <div className="font-semibold">{block.title}</div>
                          {block.bullets.length > 0 && (
                            <ul className="mt-2 list-disc space-y-0.5 pl-4">
                              {block.bullets.map((b, i) => (
                                <li key={i}>{b}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No additional sections.</p>
                  )}
                </CardContent>
              </Card>

              {error && (
                <p className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>

            {/* Preview side */}
            <div className="hidden lg:block">
              <div className="sticky top-32">
                <Card className="min-h-[600px]">
                  <CardHeader>
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold">
                          {content?.name || state.title || 'Untitled portfolio'}
                        </h2>
                        {content?.bio && (
                          <p className="mt-2 text-sm text-muted-foreground">{content.bio}</p>
                        )}
                      </div>
                      {content && content.skills.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold">Skills</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {content.skills.join(' • ')}
                          </p>
                        </div>
                      )}
                    </div>
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

