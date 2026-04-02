import { describe, expect, it } from 'vitest';

import { normalizePublicDomain, slugifyBlog } from '@/lib/slug';

describe('slugifyBlog', () => {
  it('slugifies titles', () => {
    expect(slugifyBlog('Hello World')).toBe('hello-world');
    expect(slugifyBlog('  A B  ')).toBe('a-b');
  });
});

describe('normalizePublicDomain', () => {
  it('strips protocol and trailing slash', () => {
    expect(normalizePublicDomain('https://Example.com/path/')).toBe('example.com/path');
  });
});
