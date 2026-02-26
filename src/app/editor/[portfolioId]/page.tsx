'use client';

import { useParams } from 'next/navigation';
import { Save, Eye, Palette, Globe } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/domain/navbar';

export default function EditorPage() {
  const params = useParams<{ portfolioId: string }>();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <div className="flex-1">
        {/* Editor toolbar */}
        <div className="sticky top-16 z-40 border-b bg-background/80 backdrop-blur-lg">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Editing portfolio</span>
              <code className="rounded bg-muted px-2 py-0.5 text-xs">{params.portfolioId}</code>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </Button>
              <Button variant="ghost" size="sm">
                <Palette className="mr-2 h-4 w-4" />
                Theme
              </Button>
              <Button variant="outline" size="sm">
                <Globe className="mr-2 h-4 w-4" />
                Deploy
              </Button>
              <Button size="sm">
                <Save className="mr-2 h-4 w-4" />
                Save
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
                    <label className="mb-1.5 block text-sm font-medium">Full Name</label>
                    <Input placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Email</label>
                    <Input type="email" placeholder="john@example.com" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Location</label>
                    <Input placeholder="San Francisco, CA" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Bio</label>
                    <textarea
                      className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="A brief professional summary..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Skills editor will load here from parsed resume data.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Experience entries will load here from parsed resume data.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Education</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Education entries will load here from parsed resume data.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Project entries will load here from parsed resume data.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Preview side */}
            <div className="hidden lg:block">
              <div className="sticky top-32">
                <Card className="min-h-[600px]">
                  <CardHeader>
                    <CardTitle className="text-lg">Live Preview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center rounded-lg bg-muted/50 py-32 text-sm text-muted-foreground">
                      Portfolio preview will render here as you edit.
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
