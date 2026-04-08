# Contributing

Thanks for your interest in FolioMint. Whether you are fixing a typo, reporting a bug, or opening a pull request, you are welcome here.

This guide covers how to run the app locally and how the repo is organized. If something is unclear, opening an issue with your question is completely fine. For production and deferred setup items, see [TODO.md](./TODO.md).

## Before you start

- Use a recent LTS version of Node.js if you can.
- Copy `.env.example` to `.env.local` and fill in what you need. You do not have to configure every integration on day one. Local defaults in `.env.example` are there so you can get the app running without a full production stack.

## Stack (for orientation)

- **Framework**: Next.js 14 (App Router)
- **Database**: Turso (libSQL) in production, SQLite locally
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS and CSS variables for theming
- **Auth**: NextAuth v5 (GitHub, Google)
- **Forms**: React Hook Form and Zod
- **State**: Zustand
- **AI parsing**: Groq API (LLaMA 3.1)
- **Payments**: Lemon Squeezy Checkout and webhooks
- **Emails**: Resend (optional, for portfolio publish notifications)
- **Blog**: Markdown posts per portfolio
- **Themes**: Classic and Neubrutalism on public portfolios
- **Integrations**: Profile links (GitHub, LinkedIn, and more) on the published site
- **Custom domains**: DNS TXT verification in the app; host routing is wired at deploy time

## Getting started

```bash
cp .env.example .env.local
# Edit .env.local: at minimum GROQ_API_KEY, NEXTAUTH_SECRET, and database URL
# Optional OAuth: AUTH_GITHUB_ID, AUTH_GITHUB_SECRET (or NEXTAUTH_DEV_BYPASS=true for local-only)
# BYPASS_PAYMENT_GATING=true in .env.example helps local dev without Lemon Squeezy

npm install
npm run db:push
npm run dev
```

If `db:push` or `dev` fails, check the error message first, then that your Node version and `.env.local` match what the scripts expect.

## Project structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── (auth)/           # Auth-gated routes
│   ├── api/              # Route handlers (webhooks, parse)
│   ├── dashboard/        # User dashboard
│   ├── editor/           # Portfolio editor
│   ├── generate/         # Upload + parse flow
│   ├── pricing/          # Pricing page
│   ├── sign-in/          # Authentication
│   ├── u/                # Public portfolios by handle (/u/{handle})
│   └── [slug]/           # Legacy / public portfolio viewer
├── components/
│   ├── domain/           # Business-specific components
│   └── ui/               # Generic UI primitives
├── lib/
│   ├── db/               # Drizzle schema + client
│   ├── auth.ts           # NextAuth configuration
│   ├── groq.ts           # Groq AI integration
│   ├── rate-limit.ts     # Upload rate limiting
│   ├── resume-parser.ts  # PDF/DOCX text extraction
│   ├── errors.ts         # Typed error classes
│   └── utils.ts          # Shared utilities
├── stores/               # Zustand stores
└── types/                # Shared TypeScript types + Zod schemas
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run format` | Format with Prettier |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm test` | Run tests |

## Pull requests

Small, focused changes are easier to review and merge. If your change is large, a short note in the PR about motivation and testing helps a lot. Running `npm run lint` (and tests if you touched logic) before you push saves everyone a round trip.

Thank you for helping improve FolioMint.
