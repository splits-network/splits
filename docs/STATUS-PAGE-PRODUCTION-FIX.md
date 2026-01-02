# Production Environment Configuration for Status Pages

## Issue
Status pages on candidate and corporate apps show "fetch failed" for all services except the API Gateway in production.

## Root Cause
The health check API routes (`/api-health/*`) require server-side environment variables to connect to backend services. These variables were not documented or configured in production.

## Solution

### Required Environment Variables

Both **candidate** and **corporate** apps need these environment variables configured in production:

```bash
# API Gateway (public)
NEXT_PUBLIC_API_GATEWAY_URL=https://api.splits.network

# Service URLs (server-side only - not exposed to browser)
ATS_SERVICE_URL=https://ats.splits.network
IDENTITY_SERVICE_URL=https://identity.splits.network
NETWORK_SERVICE_URL=https://network.splits.network
BILLING_SERVICE_URL=https://billing.splits.network
NOTIFICATION_SERVICE_URL=https://notification.splits.network
AUTOMATION_SERVICE_URL=https://automation.splits.network
DOCUMENT_SERVICE_URL=https://document.splits.network
```

### Vercel Deployment Configuration

If using Vercel, add these environment variables:

1. Go to your project settings → Environment Variables
2. Add each variable for **Production**, **Preview**, and **Development** environments
3. Replace the URLs with your actual service URLs (internal Kubernetes service names if deployed in the same cluster)

### Docker/Kubernetes Deployment

If using Docker/Kubernetes:

1. Update your deployment YAMLs to include these environment variables
2. For internal cluster communication, use service names:
   ```yaml
   env:
     - name: ATS_SERVICE_URL
       value: http://ats-service:3002
     - name: IDENTITY_SERVICE_URL
       value: http://identity-service:3001
     # ... etc
   ```

### Local Development

Environment variables are now configured in `.env.local` files with localhost defaults.

To start local development:

```bash
# Make sure all services are running
cd g:\code\splits.network
docker-compose up -d

# Start candidate app
cd apps/candidate
pnpm dev

# Start corporate app (in another terminal)
cd apps/corporate
pnpm dev
```

## Testing

After configuring environment variables in production:

1. Visit the status page: `https://applicant.network/status`
2. All services should show "healthy" or their actual status
3. Gateway should still work (it uses `NEXT_PUBLIC_API_GATEWAY_URL`)

## Why Gateway Works But Others Don't

- **Gateway**: Uses `NEXT_PUBLIC_API_GATEWAY_URL` which is a public environment variable (accessible in browser and server)
- **Other Services**: Use server-side only variables like `ATS_SERVICE_URL` which must be explicitly configured

The gateway URL needs to be public because it's called from client-side code. Backend service URLs don't need to be public since they're only accessed by Next.js API routes (server-side).

## Files Updated

- `apps/candidate/.env.example` - Added service URL documentation
- `apps/candidate/.env.local` - Added local development defaults
- `apps/corporate/.env.example` - Added service URL documentation  
- `apps/corporate/.env.local` - Created with local development defaults

## Next Steps

1. Configure these environment variables in your production deployment platform
2. Redeploy the candidate and corporate apps
3. Verify status pages show correct health status
