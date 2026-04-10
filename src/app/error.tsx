'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16">
      <div className="mx-auto max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Something went wrong</p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">We couldn&apos;t load this page</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          A temporary error occurred. You can try again or go back to the home page.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button type="button" onClick={() => reset()}>
            Try again
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
