# Local Development Setup Guide

This guide will walk you through setting up the Splits Network platform for local development.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone the Repository](#clone-the-repository)
3. [Install Dependencies](#install-dependencies)
4. [Set Up Environment Variables](#set-up-environment-variables)
5. [Start Infrastructure Services](#start-infrastructure-services)
6. [Run Database Migrations](#run-database-migrations)
7. [Start the Application](#start-the-application)
8. [Verify the Setup](#verify-the-setup)
9. [Development Workflow](#development-workflow)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed:

### Required Software

- **Node.js** (v20.x or later) - [Download](https://nodejs.org/)
- **pnpm** (v8.x or later) - Install with: `npm install -g pnpm`
- **Docker Desktop** - [Download](https://www.docker.com/products/docker-desktop/)
- **Git** - [Download](https://git-scm.com/)

### Required Accounts

You'll need accounts for these third-party services:

1. **Clerk** - https://clerk.com (for authentication)
2. **Supabase** - https://supabase.com (for database and storage)
3. **Stripe** - https://stripe.com (for billing, use test mode)
4. **Resend** - https://resend.com (for transactional emails)

### Verify Installation

```bash
# Check Node.js version (should be 20.x or higher)
node --version

# Check pnpm version (should be 8.x or higher)
pnpm --version

# Check Docker is running
docker --version
docker ps
```

---

## Clone the Repository

```bash
# Clone the repo
git clone https://github.com/your-org/splits.network.git
cd splits.network

# (Optional) Create a new branch for your work
git checkout -b feature/your-feature-name
```

---

## Install Dependencies

Install all dependencies for the monorepo:

```bash
# Install all workspace dependencies
pnpm install

# This will install dependencies for:
# - Root workspace
# - apps/portal
# - All services (api-gateway, identity-service, etc.)
# - All shared packages
```

Expected output:
```
Packages: +XXX
Progress: resolved XXX, reused XXX, downloaded 0, added XXX, done
```

---

## Set Up Environment Variables

### Get API Keys

Before creating `.env` files, collect your API keys:

#### 1. Clerk (Authentication)
1. Go to https://dashboard.clerk.com
2. Create a new application (or use existing)
3. Navigate to **API Keys**
4. Copy:
   - Publishable Key (`pk_test_...`)
   - Secret Key (`sk_test_...`)
5. Navigate to **Webhooks** > Add Endpoint
   - URL: `http://localhost:3001/webhooks/clerk` (for identity service)
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Copy the Signing Secret (`whsec_...`)

#### 2. Supabase (Database & Storage)
1. Go to https://supabase.com/dashboard
2. Create a new project (or use existing)
3. Navigate to **Settings** > **API**
4. Copy:
   - Project URL (`https://xxxxx.supabase.co`)
   - `service_role` key (NOT the `anon` key)
5. Navigate to **Settings** > **Database**
6. Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
7. Replace `[YOUR-PASSWORD]` with your actual database password

#### 3. Stripe (Billing)
1. Go to https://dashboard.stripe.com/test/apikeys
2. Ensure you're in **Test Mode** (toggle in top right)
3. Copy:
   - Secret key (`sk_test_...`)
   - Publishable key (`pk_test_...`)
4. For webhooks (we'll set this up later):
   - Install Stripe CLI: https://stripe.com/docs/stripe-cli
   - Run: `stripe login`

#### 4. Resend (Email)
1. Go to https://resend.com/api-keys
2. Create a new API key
3. Copy the API key (`re_...`)
4. Navigate to **Domains** and verify your sending domain
5. Note your verified sender email (e.g., `noreply@yourdomain.com`)

### Create Environment Files

Now create `.env` files for each service:

#### Portal: `apps/portal/.env.local`

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# API Gateway URLs
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_API_GATEWAY_URL=http://api-gateway:3000

NODE_ENV=development
```

#### API Gateway: `services/api-gateway/.env`

```bash
PORT=3000
NODE_ENV=development

CLERK_SECRET_KEY=sk_test_xxxxx
REDIS_URL=redis://localhost:6379

# Service URLs (Docker internal)
IDENTITY_SERVICE_URL=http://identity-service:3001
ATS_SERVICE_URL=http://ats-service:3002
NETWORK_SERVICE_URL=http://network-service:3003
BILLING_SERVICE_URL=http://billing-service:3004
NOTIFICATION_SERVICE_URL=http://notification-service:3005

LOG_LEVEL=info
```

#### Identity Service: `services/identity-service/.env`

```bash
PORT=3001
NODE_ENV=development

DATABASE_URL=postgresql://postgres:[PASSWORD]@db.einhgkqmxbkgdohwfayv.supabase.co:5432/postgres

CLERK_WEBHOOK_SECRET=whsec_xxxxx

LOG_LEVEL=info
```

#### ATS Service: `services/ats-service/.env`

```bash
PORT=3002
NODE_ENV=development

DATABASE_URL=postgresql://postgres:[PASSWORD]@db.einhgkqmxbkgdohwfayv.supabase.co:5432/postgres
RABBITMQ_URL=amqp://guest:guest@localhost:5672

SUPABASE_URL=https://einhgkqmxbkgdohwfayv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxxxx
STORAGE_BUCKET_NAME=documents

LOG_LEVEL=info
```

#### Network Service: `services/network-service/.env`

```bash
PORT=3003
NODE_ENV=development

DATABASE_URL=postgresql://postgres:[PASSWORD]@db.einhgkqmxbkgdohwfayv.supabase.co:5432/postgres

ATS_SERVICE_URL=http://ats-service:3002

LOG_LEVEL=info
```

#### Billing Service: `services/billing-service/.env`

```bash
PORT=3004
NODE_ENV=development

DATABASE_URL=postgresql://postgres:[PASSWORD]@db.einhgkqmxbkgdohwfayv.supabase.co:5432/postgres

STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

LOG_LEVEL=info
```

#### Notification Service: `services/notification-service/.env`

```bash
PORT=3005
NODE_ENV=development

DATABASE_URL=postgresql://postgres:[PASSWORD]@db.einhgkqmxbkgdohwfayv.supabase.co:5432/postgres
RABBITMQ_URL=amqp://guest:guest@localhost:5672

RESEND_API_KEY=re_xxxxx
FROM_EMAIL=noreply@yourdomain.com
FROM_NAME=Splits Network

LOG_LEVEL=info
```

---

## Start Infrastructure Services

Start Redis and RabbitMQ using Docker Compose:

```bash
# Start Redis and RabbitMQ in the background
docker-compose up -d redis rabbitmq

# Verify they're running
docker ps

# You should see:
# - redis (port 6379)
# - rabbitmq (ports 5672, 15672)
```

**RabbitMQ Management UI:**
- URL: http://localhost:15672
- Username: `guest`
- Password: `guest`

---

## Run Database Migrations

Apply all database migrations to set up schemas and tables:

```bash
# Option 1: Use Supabase CLI (if installed)
supabase db push

# Option 2: Use psql directly
psql $DATABASE_URL -f infra/migrations/001_initial_schema.sql
psql $DATABASE_URL -f infra/migrations/002_add_document_fields.sql
psql $DATABASE_URL -f infra/migrations/003_add_indexes.sql

# Option 3: Use the Supabase dashboard
# Go to SQL Editor and paste migration contents
```

**Verify migrations:**

```bash
# Connect to database
psql $DATABASE_URL

# List schemas
\dn

# You should see:
# - identity
# - ats
# - network
# - billing
# - notifications

# List tables in ats schema
\dt ats.*

# Exit psql
\q
```

---

## Start the Application

You have two options for running the application:

### Option A: Run Full Stack (Recommended for most work)

This starts both the portal (frontend) and all backend services:

```bash
# From repo root
pnpm dev:full-stack

# OR use VS Code task: "Dev: Full Stack"
```

This runs:
- Portal on http://localhost:4000
- API Gateway on http://localhost:3000
- Identity Service on http://localhost:3001
- ATS Service on http://localhost:3002
- Network Service on http://localhost:3003
- Billing Service on http://localhost:3004
- Notification Service on http://localhost:3005

### Option B: Run Services Separately

Useful when working on a specific service:

```bash
# In separate terminal windows/tabs:

# Terminal 1: API Gateway
cd services/api-gateway
pnpm dev

# Terminal 2: Portal
cd apps/portal
pnpm dev

# Terminal 3: Identity Service (if needed)
cd services/identity-service
pnpm dev

# etc. for other services
```

---

## Verify the Setup

### 1. Check Service Health

Each service should have a health endpoint:

```bash
# API Gateway
curl http://localhost:3000/health

# Identity Service
curl http://localhost:3001/health

# ATS Service
curl http://localhost:3002/health

# etc.
```

Expected response: `{"status":"ok"}`

### 2. Open the Portal

Navigate to http://localhost:4000 in your browser.

You should see the Clerk sign-in page.

### 3. Create a Test User

1. Click "Sign up"
2. Create a test account
3. Verify email (if required by Clerk settings)
4. You should be redirected to the dashboard

### 4. Verify Backend Communication

Check that the portal can communicate with the API Gateway:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to different pages in the portal
4. You should see requests to `http://localhost:3000/api/*`
5. All should return 200 or 401 (if not authenticated)

### 5. Check Database

Verify that data is being created:

```bash
psql $DATABASE_URL

# Check users table
SELECT * FROM identity.users;

# Should see your test user
```

---

## Development Workflow

### Making Code Changes

The application uses hot reloading:

- **Frontend (Portal)**: Changes to `.tsx` files automatically reload
- **Backend (Services)**: Changes to `.ts` files restart the service (using `nodemon` or similar)

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests for a specific service
pnpm --filter @splits-network/ats-service test

# Run tests in watch mode
pnpm test:watch
```

### Database Changes

When making schema changes:

1. Create a new migration file in `infra/migrations/`
2. Name it with incrementing number: `004_your_change.sql`
3. Apply it:
   ```bash
   psql $DATABASE_URL -f infra/migrations/004_your_change.sql
   ```

### Adding a New NPM Package

```bash
# Add to a specific workspace
pnpm --filter @splits-network/ats-service add lodash

# Add to root workspace
pnpm add -w some-tool

# Add as dev dependency
pnpm --filter @splits-network/ats-service add -D @types/lodash
```

### Viewing Logs

All services log to stdout. When using `pnpm dev:full-stack`, logs are interleaved.

To view logs for a specific service:

```bash
# If running with Docker Compose
docker-compose logs -f identity-service

# If running directly
# Just look at the terminal where you started it
```

---

## Troubleshooting

### Port Already in Use

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**

```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use a different port
PORT=3010 pnpm dev
```

### Cannot Connect to Database

```
Error: connect ECONNREFUSED
```

**Check:**
1. `DATABASE_URL` is correct in `.env`
2. Supabase project is running
3. Your IP is allowed (Supabase > Settings > Database > Connection pooling)
4. Password is correct (no special characters causing issues)

### Redis Connection Failed

```
Error: Redis connection to localhost:6379 failed
```

**Solution:**

```bash
# Check if Redis is running
docker ps | grep redis

# If not, start it
docker-compose up -d redis

# Verify
redis-cli ping
# Should return: PONG
```

### RabbitMQ Connection Failed

```
Error: Failed to connect to amqp://localhost:5672
```

**Solution:**

```bash
# Check if RabbitMQ is running
docker ps | grep rabbitmq

# If not, start it
docker-compose up -d rabbitmq

# Check management UI
open http://localhost:15672
# Login: guest / guest
```

### Clerk Webhooks Not Working

**For local development:**

Clerk can't reach `localhost` directly. Options:

1. **Use ngrok** (recommended):
   ```bash
   # Install ngrok
   brew install ngrok  # or download from ngrok.com
   
   # Start tunnel to identity service
   ngrok http 3001
   
   # Copy the https URL (e.g., https://abc123.ngrok.io)
   # Update Clerk webhook endpoint to: https://abc123.ngrok.io/webhooks/clerk
   ```

2. **Disable webhooks** (not recommended):
   - User creation will require manual database inserts
   - Best for quick testing only

### Stripe Webhooks Not Working

**For local development**, use Stripe CLI:

```bash
# Login to Stripe
stripe login

# Forward webhooks to billing service
stripe listen --forward-to localhost:3004/webhooks/stripe

# Copy the webhook signing secret from output
# Update STRIPE_WEBHOOK_SECRET in services/billing-service/.env

# Keep this terminal open while developing
```

### Build Errors After Pulling Changes

```bash
# Clean install
pnpm clean
pnpm install

# Rebuild all packages
pnpm -r build
```

### TypeScript Errors

```bash
# Verify types are built
cd packages/shared-types
pnpm build

# Return to root and rebuild
cd ../..
pnpm -r build
```

### Hot Reload Not Working

```bash
# Restart the service
# If using dev:full-stack, stop and restart

# Check for syntax errors in the file you changed

# Check nodemon config in package.json
```

---

## Useful Commands

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm -r build

# Run full stack
pnpm dev:full-stack

# Run just backend services
pnpm dev:services

# Run just portal
pnpm --filter @splits-network/portal dev

# Run specific service
pnpm --filter @splits-network/api-gateway dev

# Check for errors
pnpm lint

# Format code
pnpm format

# Run all tests
pnpm test

# Clean node_modules
pnpm clean

# Reset database (CAUTION: deletes all data)
psql $DATABASE_URL -c "DROP SCHEMA identity CASCADE; DROP SCHEMA ats CASCADE; DROP SCHEMA network CASCADE; DROP SCHEMA billing CASCADE; DROP SCHEMA notifications CASCADE;"
psql $DATABASE_URL -f infra/migrations/001_initial_schema.sql
```

---

## Next Steps

Now that you have the platform running locally:

1. **Explore the codebase**
   - Read `docs/splits-network-architecture.md` for architecture overview
   - Check `docs/splits-network-phase1-prd.md` for feature requirements

2. **Create test data**
   - Use the portal to create companies, jobs, candidates
   - Or run seed scripts: `pnpm seed` (if available)

3. **Start developing**
   - Pick a task from the backlog
   - Create a feature branch
   - Make your changes
   - Test locally
   - Submit a pull request

4. **Join the team channels**
   - Slack: `#splits-dev`
   - Daily standup: 10am PT

---

## Resources

- **Architecture Docs**: `docs/splits-network-architecture.md`
- **Environment Variables**: `docs/ENVIRONMENT-VARIABLES.md`
- **API Documentation**: `docs/API.md` (if available)
- **Contributing Guide**: `CONTRIBUTING.md` (if available)

---

**Need Help?**

- Slack: `#splits-dev`
- Email: dev@splits.network
- GitHub Issues: https://github.com/your-org/splits.network/issues

---

**Last Updated:** December 14, 2025  
**Maintained By:** Platform Team
