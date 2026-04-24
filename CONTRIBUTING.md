# Contributing to InboxNavigator

Quick onboarding for new contributors.

## Stack
- **Next.js 15** App Router with Turbopack
- **TypeScript** + **React 19**
- **Prisma** + Postgres for the database
- **Clerk** for authentication
- **Stripe** for payments
- **Tailwind not used** — plain CSS with design tokens in `src/app/(marketing)/marketing.css`
- Hosted on **Vercel**, deploys on push to `main`

## Local setup
```bash
git clone https://github.com/x8rtcy9uvbionmponibyuvtcrxez/inbox-nav.git
cd inbox-nav
npm install
npx vercel link              # connect to Vercel project
npx vercel env pull .env.local
npx prisma generate
npm run dev
```
Open http://localhost:3000

## Project structure
```
src/app/
  (marketing)/        ← public marketing pages (homepage, /dfy, /proposal/*)
    page.tsx          ← homepage
    layout.tsx        ← marketing layout (fonts, Crisp chat)
    marketing.css     ← design tokens + global utilities
    home.css          ← homepage-specific styles
    dfy/              ← /dfy landing page
    proposal/[slug]/  ← custom prospect proposals
    components/       ← shared marketing components
    opengraph-image.tsx ← dynamic OG image
  (app)/              ← authenticated app (dashboard, admin, checkout)
  api/                ← API routes
prisma/               ← database schema
public/images/        ← static images
prompts/              ← Claude prompts for repeatable tasks
```

## Domain routing
- **inboxnavigator.com** → marketing pages (no auth)
- **app.inboxnavigator.com** → authenticated app
- Routing is host-based in `src/middleware.ts` (look for `MARKETING_HOSTS`)
- Both run from the same Next.js app, same Vercel project

## Design system

All tokens live in `src/app/(marketing)/marketing.css` at the top. Use them, don't hardcode values:

- Colors: `--navy`, `--accent`, `--pink`, `--orange`, `--bg-warm`, `--text-1/2/3`, `--success`
- Gradients: `--gradient`, `--gradient-text`
- Fonts: `--font-serif` (Instrument Serif headings), `--font-sans` (Plus Jakarta Sans body), `--font-mono` (JetBrains Mono tags)
- Radii: `--radius` (24px cards), `--radius-md` (16px), `--radius-sm` (12px), `--radius-pill` (100px)
- Spacing: use `.section` (96/64/48px responsive padding), `.container` (1120px max)

Reusable utilities/classes:
- `.btn`, `.btn-gradient`, `.btn-ghost`
- `.section-header` + `.section-tag` for section intros
- `.gradient-text`, `.tag.gradient`
- `.reveal` for scroll-in animations (paired with `ScrollReveal` component)

## Common tasks

**Edit homepage copy/layout:** `src/app/(marketing)/page.tsx`
**Edit DFY page:** `src/app/(marketing)/dfy/page.tsx`
**Add a new proposal page:** see `prompts/proposal-builder.md`
**Update FAQs:** `src/app/(marketing)/components/FaqSection.tsx`

## Workflow

1. `git checkout -b your-feature-name`
2. Make changes
3. Test locally with `npm run dev`
4. `git commit -m "your message"`
5. `git push origin your-feature-name`
6. Open a PR on GitHub. Vercel auto-creates a preview deployment.
7. Merge to `main` triggers production deploy.

## Don'ts
- Don't commit `.env` or `.env.local` (already gitignored, but double-check)
- Don't hardcode colors, use the CSS tokens
- Don't use `transition: all` (animate specific properties)
- Don't use em dashes in copy (use commas/periods/parens)
- Don't add periods to section headings

## Help
- Vercel deploy logs: vercel.com → inbox-nav project → Deployments
- Database: connect via the URL in `.env`, or use `npx prisma studio`
- Stripe dashboard: dashboard.stripe.com
