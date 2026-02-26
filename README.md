# FolioMint

Turn your resume into a stunning portfolio website in minutes.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Turso (libSQL) production / SQLite local dev
- **ORM**: Drizzle ORM
- **Styling**: Tailwind CSS + CSS variables for theming
- **Auth**: NextAuth v5 (GitHub, Google)
- **Forms**: React Hook Form + Zod
- **State**: Zustand
- **AI Parsing**: Groq API (LLaMA 3.1)
- **Payments**: Stripe Checkout + webhooks
- **Emails**: Resend

## Getting Started

```bash
# 1. Copy environment variables
cp .env.example .env.local

# 2. Fill in your keys in .env.local:
#    - GROQ_API_KEY (free from console.groq.com)
#    - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)
#    - AUTH_GITHUB_ID + AUTH_GITHUB_SECRET
#    - DATABASE_URL=file:./data/dev.db

# 3. Install dependencies
npm install

# 4. Push database schema
npm run db:push

# 5. Start development server
npm run dev
```

## Project Structure

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
│   └── [slug]/           # Public portfolio viewer
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

## License

See [LICENSE](./LICENSE) for details.
