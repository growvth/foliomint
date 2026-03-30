'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Save, Eye, Globe, Loader2, Plus, Trash2 } from 'lucide-react';

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
        credentials: 'include',
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
  const updateContent = (updater: (current: PortfolioContent) => PortfolioContent) => {
    setState((prev) =>
      prev && prev.content ? { ...prev, content: updater(prev.content) } : prev,
    );
  };

  const textareaClass =
    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

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
                        <label className="mb-1.5 block text-sm font-medium">Profile image URL</label>
                        <Input
                          value={content.profileImageUrl ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({
                              ...c,
                              profileImageUrl: e.target.value || undefined,
                            }))
                          }
                          placeholder="https://example.com/me.jpg"
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">Email</label>
                          <Input
                            value={content.email ?? ''}
                            onChange={(e) =>
                              updateContent((c) => ({ ...c, email: e.target.value || undefined }))
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">Phone</label>
                          <Input
                            value={content.phone ?? ''}
                            onChange={(e) =>
                              updateContent((c) => ({ ...c, phone: e.target.value || undefined }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Location</label>
                        <Input
                          value={content.location ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({ ...c, location: e.target.value || undefined }))
                          }
                        />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">Website</label>
                          <Input
                            value={content.website ?? ''}
                            onChange={(e) =>
                              updateContent((c) => ({ ...c, website: e.target.value || undefined }))
                            }
                          />
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium">LinkedIn</label>
                          <Input
                            value={content.linkedin ?? ''}
                            onChange={(e) =>
                              updateContent((c) => ({ ...c, linkedin: e.target.value || undefined }))
                            }
                          />
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">GitHub</label>
                        <Input
                          value={content.github ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({ ...c, github: e.target.value || undefined }))
                          }
                        />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-medium">Bio</label>
                        <textarea
                          className={textareaClass}
                          value={content.bio ?? ''}
                          onChange={(e) =>
                            updateContent((c) => ({ ...c, bio: e.target.value || undefined }))
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
                      className={textareaClass}
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Experience</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
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
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {content && content.experience.length > 0 ? (
                    <div className="space-y-4">
                      {content.experience.map((exp, idx) => (
                        <div key={`${exp.company}-${exp.role}-${idx}`} className="rounded-md border bg-muted/40 p-3 text-xs">
                          <div className="mb-2 flex justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                updateContent((c) => ({
                                  ...c,
                                  experience: c.experience.filter((_, i) => i !== idx),
                                }))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input
                              value={exp.company}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  experience: c.experience.map((it, i) =>
                                    i === idx ? { ...it, company: e.target.value } : it,
                                  ),
                                }))
                              }
                              placeholder="Company"
                            />
                            <Input
                              value={exp.role}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  experience: c.experience.map((it, i) =>
                                    i === idx ? { ...it, role: e.target.value } : it,
                                  ),
                                }))
                              }
                              placeholder="Role"
                            />
                          </div>
                          <div className="mt-2 grid gap-2 sm:grid-cols-3">
                            <Input
                              value={exp.startDate}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  experience: c.experience.map((it, i) =>
                                    i === idx ? { ...it, startDate: e.target.value } : it,
                                  ),
                                }))
                              }
                              placeholder="Start date"
                            />
                            <Input
                              value={exp.endDate ?? ''}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  experience: c.experience.map((it, i) =>
                                    i === idx ? { ...it, endDate: e.target.value || undefined } : it,
                                  ),
                                }))
                              }
                              placeholder="End date"
                            />
                            <Input
                              value={exp.location ?? ''}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  experience: c.experience.map((it, i) =>
                                    i === idx ? { ...it, location: e.target.value || undefined } : it,
                                  ),
                                }))
                              }
                              placeholder="Location"
                            />
                          </div>
                          <textarea
                            className={`${textareaClass} mt-2 min-h-[72px]`}
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
                            placeholder="One bullet per line"
                          />
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Education</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
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
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {content && content.education.length > 0 ? (
                    <div className="space-y-3">
                      {content.education.map((edu, idx) => (
                        <div key={`${edu.institution}-${edu.degree}-${idx}`} className="rounded-md border bg-muted/40 p-3 text-xs">
                          <div className="mb-2 flex justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.filter((_, i) => i !== idx),
                                }))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input
                              value={edu.institution}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.map((it, i) =>
                                    i === idx ? { ...it, institution: e.target.value } : it,
                                  ),
                                }))
                              }
                              placeholder="Institution"
                            />
                            <Input
                              value={edu.degree}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.map((it, i) =>
                                    i === idx ? { ...it, degree: e.target.value } : it,
                                  ),
                                }))
                              }
                              placeholder="Degree"
                            />
                          </div>
                          <div className="mt-2 grid gap-2 sm:grid-cols-4">
                            <Input
                              value={edu.field ?? ''}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.map((it, i) =>
                                    i === idx ? { ...it, field: e.target.value || undefined } : it,
                                  ),
                                }))
                              }
                              placeholder="Field"
                            />
                            <Input
                              value={edu.startDate}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.map((it, i) =>
                                    i === idx ? { ...it, startDate: e.target.value } : it,
                                  ),
                                }))
                              }
                              placeholder="Start"
                            />
                            <Input
                              value={edu.endDate ?? ''}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.map((it, i) =>
                                    i === idx ? { ...it, endDate: e.target.value || undefined } : it,
                                  ),
                                }))
                              }
                              placeholder="End"
                            />
                            <Input
                              value={edu.gpa ?? ''}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  education: c.education.map((it, i) =>
                                    i === idx ? { ...it, gpa: e.target.value || undefined } : it,
                                  ),
                                }))
                              }
                              placeholder="GPA"
                            />
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Projects</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateContent((c) => ({
                          ...c,
                          projects: [...c.projects, { name: '', description: '', url: '', technologies: [], bullets: [] }],
                        }))
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {content && content.projects.length > 0 ? (
                    <div className="space-y-4">
                      {content.projects.map((project, idx) => (
                        <div key={`${project.name}-${idx}`} className="rounded-md border bg-muted/40 p-3 text-xs">
                          <div className="mb-2 flex justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                updateContent((c) => ({
                                  ...c,
                                  projects: c.projects.filter((_, i) => i !== idx),
                                }))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-2 sm:grid-cols-2">
                            <Input
                              value={project.name}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  projects: c.projects.map((it, i) =>
                                    i === idx ? { ...it, name: e.target.value } : it,
                                  ),
                                }))
                              }
                              placeholder="Project name"
                            />
                            <Input
                              value={project.url ?? ''}
                              onChange={(e) =>
                                updateContent((c) => ({
                                  ...c,
                                  projects: c.projects.map((it, i) =>
                                    i === idx ? { ...it, url: e.target.value || undefined } : it,
                                  ),
                                }))
                              }
                              placeholder="Project URL"
                            />
                          </div>
                          <textarea
                            className={`${textareaClass} mt-2 min-h-[56px]`}
                            value={project.description ?? ''}
                            onChange={(e) =>
                              updateContent((c) => ({
                                ...c,
                                projects: c.projects.map((it, i) =>
                                  i === idx ? { ...it, description: e.target.value || undefined } : it,
                                ),
                              }))
                            }
                            placeholder="Short description"
                          />
                          <Input
                            className="mt-2"
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
                            placeholder="Technologies (comma-separated)"
                          />
                          <textarea
                            className={`${textareaClass} mt-2 min-h-[72px]`}
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
                            placeholder="One bullet per line"
                          />
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Awards</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateContent((c) => ({
                          ...c,
                          awards: [...(c.awards ?? []), ''],
                        }))
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {content && content.awards && content.awards.length > 0 ? (
                    <div className="space-y-2">
                      {content.awards.map((a, i) => (
                        <div key={i} className="flex gap-2">
                          <Input
                            value={a}
                            onChange={(e) =>
                              updateContent((c) => ({
                                ...c,
                                awards: (c.awards ?? []).map((it, idx) =>
                                  idx === i ? e.target.value : it,
                                ),
                              }))
                            }
                          />
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              updateContent((c) => ({
                                ...c,
                                awards: (c.awards ?? []).filter((_, idx) => idx !== i),
                              }))
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No awards listed.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Extracurricular</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateContent((c) => ({
                          ...c,
                          extracurricular: [...(c.extracurricular ?? []), { title: '', bullets: [] }],
                        }))
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {content && content.extracurricular && content.extracurricular.length > 0 ? (
                    <div className="space-y-3">
                      {content.extracurricular.map((block, idx) => (
                        <div key={`${block.title}-${idx}`} className="rounded-md border bg-muted/40 p-3 text-xs">
                          <div className="mb-2 flex justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                updateContent((c) => ({
                                  ...c,
                                  extracurricular: (c.extracurricular ?? []).filter((_, i) => i !== idx),
                                }))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={block.title}
                            onChange={(e) =>
                              updateContent((c) => ({
                                ...c,
                                extracurricular: (c.extracurricular ?? []).map((it, i) =>
                                  i === idx ? { ...it, title: e.target.value } : it,
                                ),
                              }))
                            }
                            placeholder="Section title"
                          />
                          <textarea
                            className={`${textareaClass} mt-2 min-h-[72px]`}
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
                            placeholder="One bullet per line"
                          />
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Other sections</CardTitle>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateContent((c) => ({
                          ...c,
                          otherSections: [...(c.otherSections ?? []), { title: '', bullets: [] }],
                        }))
                      }
                    >
                      <Plus className="mr-1 h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {content && content.otherSections && content.otherSections.length > 0 ? (
                    <div className="space-y-3">
                      {content.otherSections.map((block, idx) => (
                        <div key={`${block.title}-${idx}`} className="rounded-md border bg-muted/40 p-3 text-xs">
                          <div className="mb-2 flex justify-end">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                updateContent((c) => ({
                                  ...c,
                                  otherSections: (c.otherSections ?? []).filter((_, i) => i !== idx),
                                }))
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <Input
                            value={block.title}
                            onChange={(e) =>
                              updateContent((c) => ({
                                ...c,
                                otherSections: (c.otherSections ?? []).map((it, i) =>
                                  i === idx ? { ...it, title: e.target.value } : it,
                                ),
                              }))
                            }
                            placeholder="Section title"
                          />
                          <textarea
                            className={`${textareaClass} mt-2 min-h-[72px]`}
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
                            placeholder="One bullet per line"
                          />
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
                        {content?.profileImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={content.profileImageUrl}
                            alt={content.name || state.title}
                            className="mb-3 h-16 w-16 rounded-full object-cover"
                          />
                        ) : null}
                        <h2 className="text-2xl font-bold">{content?.name || state.title || 'Untitled portfolio'}</h2>
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

