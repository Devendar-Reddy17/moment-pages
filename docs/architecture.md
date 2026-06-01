# MomentPages Architecture

## System Overview

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTS                                │
│  Browser (Desktop/Mobile)                                     │
└──────────┬───────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────┐      ┌─────────────────────────┐
│   Vercel (Frontend)  │      │   Custom Domain CNAME   │
│   Next.js 15 App     │◄─────│   via Vercel Domains    │
│   - Public Pages SSR │      └─────────────────────────┘
│   - Editor (CSR)     │
│   - Management (CSR) │
└──────────┬───────────┘
           │ REST API
           ▼
┌──────────────────────┐
│  Railway (Backend)   │
│  Spring Boot 3.3     │
│  Java 21 (Virtual    │
│  Threads)            │
└───┬──────┬───────┬───┘
    │      │       │
    ▼      ▼       ▼
┌────────┐ ┌─────┐ ┌──────────────┐
│Postgres│ │Stripe│ │Cloudflare R2 │
│  (DB)  │ │     │ │  (CDN Media) │
└────────┘ └─────┘ └──────────────┘
                          │
                    ┌─────┴──────┐
                    │  OpenAI    │
                    │  (AI Gen)  │
                    └────────────┘
```

## Key Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth | URL-based management tokens | Zero-friction, no accounts |
| Editor Canvas | Fabric.js | Mature, JSON serialization built-in |
| State Mgmt | Zustand | Lightweight, excellent undo/redo |
| Public Pages | SSR (HTML from JSON) | Fast, SEO, accessible |
| File Uploads | R2 signed URLs | No backend bottleneck |
| Payments | Stripe Checkout | PCI-compliant, simple |
| AI | OpenAI (pluggable) | Cost-effective, swappable |

## Data Flow

1. **Create**: User → POST /projects → management token issued immediately
2. **Edit**: Editor ↔ auto-save PUT /content every 30s
3. **Upload**: Frontend → signed URL → direct to R2 → confirm
4. **Publish**: Pay via Stripe → webhook → public slug generated
5. **View**: Visitor → GET /public/pages/{slug} → SSR render
6. **Respond**: Visitor fills form → POST /responses → JSON stored
7. **Archive**: Daily cron → archives pages 30d past event
