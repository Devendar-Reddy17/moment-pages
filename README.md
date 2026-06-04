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

### 1. Cloudflare R2 (Storage)

1. Create a Cloudflare R2 bucket named `momentpages-media`
2. Get your R2 credentials (Account ID, Access Key ID, Secret Access Key)
3. Enable public access or set up a custom domain for the bucket
4. Note the public URL (e.g., `https://momentpages-media.3122283e30023a97d4c3d583c4be2f10.r2.cloudflarestorage.com`)

### 2. Railway (Backend + Database)

#### Deploy PostgreSQL Database
1. Go to Railway and create a new project
2. Add a PostgreSQL database service
3. Note the connection URL (will be used in backend env vars)

#### Deploy Backend
1. Create a new Railway service from GitHub
2. Select the `moment-pages` repository
3. Set root directory to `backend`
4. Configure environment variables:
   ```
   SPRING_DATASOURCE_URL=jdbc:postgresql://<railway-db-host>/<db-name>
   SPRING_DATASOURCE_USERNAME=<db-user>
   SPRING_DATASOURCE_PASSWORD=<db-password>
   R2_ACCOUNT_ID=<your-r2-account-id>
   R2_ACCESS_KEY_ID=<your-r2-access-key>
   R2_SECRET_ACCESS_KEY=<your-r2-secret-key>
   R2_BUCKET_NAME=momentpages-media
   R2_PUBLIC_URL=<your-r2-public-url>
   R2_UPLOAD_EXPIRY_MINUTES=15
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   OPENAI_API_KEY=sk-...
   APP_DOMAIN=momentpages.com
   BACKEND_URL=<your-railway-backend-url>
   FRONTEND_URL=<your-vercel-frontend-url>
   ```
5. Deploy — Railway will build and run the Spring Boot application
6. Note the backend URL (e.g., `https://momentpages-backend.up.railway.app`)

### 3. Vercel (Frontend)

1. Create a new Vercel project from GitHub
2. Select the `moment-pages` repository
3. Configure build settings:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=<your-railway-backend-url>/api/v1
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
5. Deploy — Vercel will build and host the Next.js app
6. Note the frontend URL (e.g., `https://momentpages.vercel.app`)

### 4. Stripe Configuration

1. Go to Stripe Dashboard → Webhooks
2. Add a webhook endpoint: `<your-railway-backend-url>/api/v1/stripe/webhooks`
3. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
4. Copy the webhook signing secret and add to Railway env vars as `STRIPE_WEBHOOK_SECRET`

### 5. Update Backend CORS

In Railway backend env vars, update:
```
CORS_ALLOWED_ORIGINS=<your-vercel-frontend-url>,https://momentpages.com,https://*.momentpages.com
```

### 6. GitHub Actions (Optional CI/CD)

The existing workflows only build and test. To enable auto-deployment:

**For Railway Backend:**
- Railway auto-deploys from GitHub when you push to `main`
- No additional GitHub Actions needed

**For Vercel Frontend:**
- Vercel auto-deploys from GitHub when you push to `main`
- No additional GitHub Actions needed

### 7. Domain Configuration (Optional)

1. Add custom domain in Vercel (e.g., `momentpages.com`)
2. Configure DNS records:
   - CNAME `www` → cname.vercel-dns.com
   - A `@` → 76.76.21.21
3. Update Railway and Stripe configs to use the custom domain

## Environment Variables

See `.env.example` for all required configuration.
