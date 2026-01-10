# Candidate Website - applicant.network

Public-facing candidate portal for job seekers on the Splits Network platform.

## Overview

The candidate website provides:
- **Public job board**: Browse all open/active roles from employers
- **Candidate dashboard**: Manage profile, applications, and documents
- **Application tracking**: View application status and communication
- **Profile management**: Build professional profile with skills and experience
- **Document management**: Upload resumes, cover letters, portfolios

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Auth**: Clerk
- **Styling**: TailwindCSS + DaisyUI
- **API**: Calls `api-gateway` for all backend operations
- **TypeScript**: Fully typed

## Getting Started

### Prerequisites

- Node.js (LTS)
- pnpm
- Running `api-gateway` service

### Installation

From repository root:

```bash
pnpm install
```

### Development

```bash
pnpm --filter @splits-network/candidate dev
```

The app runs on `http://localhost:3101`

### Build

```bash
pnpm --filter @splits-network/candidate build
```

### Production

```bash
pnpm --filter @splits-network/candidate start
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

- Clerk keys from [Clerk Dashboard](https://portal/dashboard.clerk.com)
- API Gateway URL (defaults to `http://localhost:4000`)

## Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for full deployment instructions including:
- Docker build and run
- Kubernetes manifests
- CI/CD pipeline setup
- DNS and TLS configuration
- API Gateway URL (default: `http://localhost:4000`)

## Project Structure

```
apps/candidate/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── public/           # Public routes (no auth)
│   │   │   ├── jobs/           # Job browsing and search
│   │   │   ├── sign-in/        # Authentication pages
│   │   │   └── sign-up/
│   │   ├── portal/    # Protected candidate routes
│   │   │   ├── dashboard/      # Candidate dashboard
│   │   │   ├── profile/        # Profile management
│   │   │   ├── applications/   # Application tracking
│   │   │   └── documents/      # Document management
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx            # Homepage
│   ├── components/             # Reusable UI components
│   │   ├── navigation/
│   │   ├── jobs/
│   │   └── profile/
│   ├── lib/                    # Utilities and API clients
│   │   ├── api-client.ts       # API Gateway client
│   │   └── utils.ts
│   └── middleware.ts           # Clerk auth middleware
├── public/                     # Static assets
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

## Key Features

### Public Features
- Browse all active job listings
- Search and filter jobs by title, location, salary, etc.
- View detailed job descriptions
- Company information pages

### Authenticated Features
- Personal candidate dashboard
- Complete profile with work history, education, skills
- Track all applications and their status
- Upload and manage documents (resume, cover letters, etc.)
- Apply to jobs with one click
- Receive notifications about application updates

## API Integration

All backend calls go through the `api-gateway`:

- `GET /jobs` - List all active jobs
- `GET /jobs/:id` - Get job details
- `GET /candidates/me` - Get current candidate profile
- `PUT /candidates/me` - Update profile
- `GET /candidates/me/applications` - Get candidate's applications
- `POST /applications` - Submit job application
- `GET /candidates/me/documents` - List documents
- `POST /candidates/me/documents` - Upload document

## Deployment

Domain: `https://applicant.network`

Build command:
```bash
pnpm build
```

Production server:
```bash
pnpm start
```

## Contributing

Follow the patterns defined in:
- `docs/splits-network-architecture.md`
- `docs/guidance/form-controls.md`
- `.github/copilot-instructions.md`
