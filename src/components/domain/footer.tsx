import Link from 'next/link';

import { Logo } from '@/components/ui/logo';

const footerLinks = {
  Product: [
    { href: '/pricing', label: 'Pricing' },
    { href: '/generate', label: 'Get Started' },
  ],
  Resources: [
    { href: '#', label: 'Documentation' },
    { href: '#', label: 'Changelog' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/terms', label: 'Terms of Service' },
  ],
} as const;

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Turn your resume into a stunning portfolio website in minutes.
            </p>
          </div>
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-sm font-semibold">{section}</h3>
              <ul className="mt-4 space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FolioMint. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
