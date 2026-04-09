'use client';

import type { ComponentProps } from 'react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner } from 'sonner';

type ToasterProps = ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <Sonner
      theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      position="bottom-center"
      richColors
      closeButton
      duration={4200}
      toastOptions={{
        classNames: {
          // Do not set border/bg on the toast <li>: Sonner already styles [data-styled=true]
          // toasts. Extra wrapper styles stack behind toast.custom() content and show square corners.
          toast: 'group text-[13px]',
          title: 'font-medium',
          description: 'text-muted-foreground',
          closeButton: 'text-muted-foreground hover:text-foreground',
        },
      }}
      {...props}
    />
  );
}
