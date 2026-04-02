import { describe, expect, it } from 'vitest';

import { mapLemonSubscriptionStatus, verifyLemonSqueezyWebhookSignature } from '@/lib/lemonsqueezy';

describe('mapLemonSubscriptionStatus', () => {
  it('maps active-like statuses', () => {
    expect(mapLemonSubscriptionStatus('active')).toBe('active');
    expect(mapLemonSubscriptionStatus('on_trial')).toBe('active');
    expect(mapLemonSubscriptionStatus('cancelled')).toBe('active');
  });

  it('maps expired', () => {
    expect(mapLemonSubscriptionStatus('expired')).toBe('cancelled');
  });
});

describe('verifyLemonSqueezyWebhookSignature', () => {
  it('rejects bad signature', () => {
    expect(verifyLemonSqueezyWebhookSignature('{}', 'secret', 'deadbeef')).toBe(false);
  });
});
