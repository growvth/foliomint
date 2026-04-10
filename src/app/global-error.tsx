'use client';

import { useEffect } from 'react';

import './globals.css';

export default function GlobalError({
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
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-background px-4 font-sans text-foreground antialiased">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-xl font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-muted-foreground">Please try again.</p>
          <button
            type="button"
            className="mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            onClick={() => reset()}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
