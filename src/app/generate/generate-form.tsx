'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Upload, FileText, Sparkles, AlertCircle, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navbar } from '@/components/domain/navbar';
import { Footer } from '@/components/domain/footer';
import { cn } from '@/lib/utils';

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export function GenerateForm() {
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [consent, setConsent] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback((f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return 'Please upload a PDF, DOCX, or TXT file.';
    }
    if (f.size > MAX_FILE_SIZE) {
      return 'File size must be under 4MB.';
    }
    return null;
  }, []);

  const handleFileSelect = useCallback(
    (f: File) => {
      const err = validateFile(f);
      if (err) {
        setError(err);
        return;
      }
      setError(null);
      setFile(f);
    },
    [validateFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect],
  );

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('consent', String(consent));

      const res = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        const message = data.error || 'Upload failed';
        if (res.status === 401 || message.toLowerCase().includes('authentication')) {
          throw new Error('session_expired');
        }
        throw new Error(message);
      }

      const data = await res.json();
      window.location.href = `/editor/${data.portfolioId}`;
    } catch (err) {
      if (err instanceof Error && err.message === 'session_expired') {
        setError('session_expired');
      } else {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const isAuthError = error === 'session_expired';

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1 py-24 sm:py-32">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Create your portfolio
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Upload your resume and we&apos;ll extract your information. Use AI for smarter
              mapping, or basic extraction — your choice.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Upload Resume</CardTitle>
              <CardDescription>Supported formats: PDF, DOCX, TXT (max 4MB)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div
                className={cn(
                  'relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-12 transition-colors',
                  dragOver
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:border-primary/50',
                  file && 'border-primary/30 bg-primary/5',
                )}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept=".pdf,.docx,.txt"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileSelect(f);
                  }}
                />
                {file ? (
                  <>
                    <FileText className="mb-3 h-10 w-10 text-primary" />
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {(file.size / 1024).toFixed(1)} KB — Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
                    <p className="text-sm font-medium">Drop your resume here or click to browse</p>
                    <p className="mt-1 text-xs text-muted-foreground">PDF, DOCX, or TXT</p>
                  </>
                )}
              </div>

              <label className="flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-accent/50">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                />
                <div>
                  <p className="text-sm font-medium">Send resume to Groq AI for better mapping</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your resume text will be sent to Groq&apos;s API for semantic extraction. No
                    content is stored by Groq. Uncheck to use basic text extraction instead.
                  </p>
                </div>
              </label>

              {error && (
                <div
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-3 text-sm',
                    isAuthError
                      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                      : 'bg-destructive/10 text-destructive',
                  )}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {isAuthError ? (
                    <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      Your session may have expired. Please{' '}
                      <Link href="/sign-in?callbackUrl=/generate" className="font-medium underline">
                        sign in again
                      </Link>{' '}
                      to continue.
                    </span>
                  ) : (
                    error
                  )}
                </div>
              )}

              <Button
                onClick={handleSubmit}
                disabled={!file || isUploading}
                size="lg"
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    {consent ? 'Parse with AI & Generate Portfolio' : 'Generate Portfolio'}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
