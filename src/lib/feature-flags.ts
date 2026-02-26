/**
 * When true, all users are treated as having an active subscription (no rate limits,
 * no portfolio expiry, all paid features unlocked). Set to false or remove for production.
 */
export function isPaymentGatingBypassed(): boolean {
  return process.env.BYPASS_PAYMENT_GATING === 'true';
}
