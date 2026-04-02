# Deferred configuration (do before production)

## Database

- [ ] After pulling schema changes, run `npm run db:push` locally (and against production Turso) so new columns and indexes apply.

## Payments — Lemon Squeezy

- [ ] Create API key: Lemon Squeezy → Settings → API → copy into `LEMONSQUEEZY_API_KEY`
- [ ] Note **Store ID** and subscription **Variant ID** → `LEMONSQUEEZY_STORE_ID`, `LEMONSQUEEZY_VARIANT_ID`
- [ ] Add webhook URL: `https://<your-domain>/api/webhooks/lemonsqueezy`
- [ ] Set webhook signing secret → `LEMONSQUEEZY_WEBHOOK_SECRET` (must match dashboard)
- [ ] Subscribe webhook to subscription events you need (e.g. `subscription_created`, `subscription_updated`, `subscription_expired`, `subscription_cancelled`, `subscription_payment_failed`)
- [ ] Test checkout in Lemon Squeezy test mode, then flip live when ready
- [ ] Remove or set `BYPASS_PAYMENT_GATING=false` so real subscriptions gate Pro features

## Auth — OAuth apps

- [ ] GitHub OAuth app: production **Authorization callback URL** = `https://<your-domain>/api/auth/callback/github`
- [ ] Google Cloud OAuth: production **Authorized redirect URIs** for Google provider
- [ ] Set `NEXTAUTH_URL` to public site URL in production

## Database

- [ ] Turso (or other hosted libSQL): `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`
- [ ] Run migrations / `db:push` against production DB

## Email (optional)

- [ ] Resend: `RESEND_API_KEY`, optional `RESEND_FROM` (verified sender). Publishing a portfolio triggers a “live” email when configured.

## Security / ops

- [ ] Strong `NEXTAUTH_SECRET` (not the dev placeholder)
- [ ] Turn off `NEXTAUTH_DEV_BYPASS` (never enable in production)
- [ ] Review env vars in hosting provider; no secrets in client bundles

## Product follow-ups

- [ ] **Host routing** for `customDomain` at your edge (middleware / hosting) — verification and storage exist in-app; wire DNS → app hostname in deployment.
- [ ] OAuth for integrations (optional; link-based integrations ship today).

## Next build tasks (to fully match the Pro plan)

- [ ] **Analytics breakdown UI**: dashboard analytics for referrer/device/country (not just total view counts). Consider time windows (7d/30d) and per-portfolio drilldowns.
- [ ] **Geo logging robustness**: ensure country is populated outside Vercel (or document it). Add safe fallbacks and clearer “unknown” handling.
- [ ] **Bot filtering / dedupe**: improve view logging (ignore common bots more robustly, optional per-session/IP dedupe window to avoid inflating counts).
- [ ] **Upgrade clears expiry**: when user becomes Pro, remove `expiresAt` from existing portfolios (and keep “no expiry” guarantee). Decide if this happens via webhook handler or a scheduled job.
- [ ] **Custom domains: live routing**: serve portfolios by `Host` header when `customDomainVerified=true`. Likely via `middleware.ts` + internal rewrite to `/<slug>` and a resolver that maps host → portfolio slug.
- [ ] **Integrations limits + polish**: enforce “10 integrations” cap (or change copy), add UI for managing them per portfolio vs account-wide (currently user-wide), and optional richer previews.
- [ ] **Support / priority support**: implement a minimal support channel (mailto link, in-app contact form, or help widget) and “priority” tagging for Pro if we keep that promise.
