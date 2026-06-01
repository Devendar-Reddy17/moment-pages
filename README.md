# MomentPages

A SaaS web application for creating beautiful personalized invitation websites.

## Architecture

- **Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Spring Boot 3.3 + Java 21 + PostgreSQL
- **Storage**: Cloudflare R2
- **Payments**: Stripe
- **AI**: OpenAI (pluggable)

## Project Structure

```
moment-pages/
├── frontend/                     # Next.js 15 application
│   ├── src/app/                  # App Router pages
│   │   ├── (marketing)/          # Landing page
│   │   ├── (editor)/create/      # Project creation flow
│   │   ├── (editor)/edit/[id]/   # Canvas editor
│   │   ├── (management)/manage/  # Management dashboard
│   │   └── (public)/p/[slug]/    # Public invitation pages (SSR)
│   ├── src/components/           # Shared + domain components
│   ├── src/stores/               # Zustand state management
│   ├── src/hooks/                # Custom hooks (auto-save, media, audio)
│   ├── src/lib/                  # API client, constants
│   └── src/types/                # TypeScript type definitions
├── backend/                      # Spring Boot 3.3 application
│   └── src/main/java/com/momentpages/
│       ├── project/              # Project CRUD + content management
│       ├── media/                # File upload (Cloudflare R2)
│       ├── payment/              # Stripe Checkout + webhooks
│       ├── analytics/            # View tracking + stats
│       ├── response/             # Form response collection
│       ├── template/             # Reusable page templates
│       ├── ai/                   # OpenAI integration (pluggable)
│       ├── archival/             # Scheduled page archival
│       └── config/               # Security, CORS, R2
├── docs/                         # Architecture documentation
├── .github/workflows/            # CI/CD (GitHub Actions)
└── docker-compose.yml            # Local development environment
```

## Key Features

- **No account required** — link-based authentication with cryptographic tokens
- **Drag & drop canvas editor** — text, images, video, audio, shapes, forms
- **Flexible form builder** — collect custom responses from visitors
- **AI-powered** — text generation & theme suggestions via OpenAI
- **One-time payment** — £1.99 to publish, no subscription
- **Auto-archival** — pages archive 30 days after event, reactivatable

## Getting Started

### Prerequisites

- Node.js 20+
- Java 17+ (21 recommended for production)
- Docker & Docker Compose
- PostgreSQL 16+

### Local Development

1. Clone the repository
2. Copy environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start database:
   ```bash
   docker-compose up -d postgres
   ```
4. Start backend:
   ```bash
   cd backend && ./gradlew bootRun
   ```
5. Start frontend:
   ```bash
   cd frontend && npm run dev
   ```

The frontend runs at `http://localhost:3000` and the backend API at `http://localhost:8080/api/v1`.

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/projects` | POST | Create project (returns management token) |
| `/api/v1/projects/{id}` | GET | Get project (requires token) |
| `/api/v1/projects/{id}/content` | PUT | Save canvas JSON |
| `/api/v1/projects/{id}/settings` | PATCH | Update title, date, password |
| `/api/v1/projects/{id}/checkout` | POST | Create Stripe checkout |
| `/api/v1/public/pages/{slug}` | GET | Get published page (SSR) |
| `/api/v1/public/pages/{slug}/responses` | POST | Submit form response |
| `/api/v1/templates` | GET | List available templates |
| `/api/v1/ai/generate-text` | POST | AI invitation text |
| `/api/v1/ai/generate-theme` | POST | AI theme suggestion |

All management endpoints require `X-Management-Token` header.

## Deployment

- **Frontend**: Vercel (auto-deploys from `main`, path filter: `frontend/`)
- **Backend**: Railway (auto-deploys from `main`, path filter: `backend/`)
- **Database**: Railway PostgreSQL or Neon
- **Storage**: Cloudflare R2 with custom CDN domain

## Environment Variables

See `.env.example` for all required configuration.
