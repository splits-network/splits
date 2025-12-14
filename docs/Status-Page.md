# Public Status Page

## Overview

A public-facing status page has been added to the Splits Network portal to provide real-time visibility into the health of all backend services.

## Access

**URL:** `https://yourdomain.com/status` (or `http://localhost:3100/status` in development)

**Authentication:** None required - publicly accessible

## Features

### Real-Time Health Monitoring
- Displays current status of all 6 backend services
- Auto-refreshes every 30 seconds
- Manual refresh button for on-demand updates
- Response time tracking for each service

### Visual Status Indicators
- **Green (Healthy):** Service is operational
- **Red (Unhealthy):** Service is down or experiencing issues
- **Yellow (Checking):** Health check in progress

### Service Coverage
1. **API Gateway** - Main entry point for all API requests
2. **Identity Service** - User authentication and organization management
3. **ATS Service** - Jobs, candidates, applications, and placements
4. **Network Service** - Recruiter profiles and role assignments
5. **Billing Service** - Subscription management
6. **Notification Service** - Email notifications

### Overall System Status
- Summary banner showing overall health
- Count of healthy services
- Last check timestamp
- Clear indication when services are degraded

## Implementation

### Frontend Component
**Location:** `apps/portal/src/app/(public)/status/page.tsx`

**Features:**
- Client-side component for dynamic updates
- Fetches health data from Next.js API routes
- 5-second timeout for each health check
- Auto-refresh every 30 seconds
- DaisyUI styled interface

### API Routes
Health check proxy routes to avoid CORS issues:

- `/api-health/gateway` → API Gateway
- `/api-health/identity` → Identity Service
- `/api-health/ats` → ATS Service
- `/api-health/network` → Network Service
- `/api-health/billing` → Billing Service
- `/api-health/notification` → Notification Service

### Environment Variables

The portal needs these environment variables configured:

```env
# For API routes to proxy health checks
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
IDENTITY_SERVICE_URL=http://localhost:3001
ATS_SERVICE_URL=http://localhost:3002
NETWORK_SERVICE_URL=http://localhost:3003
BILLING_SERVICE_URL=http://localhost:3004
NOTIFICATION_SERVICE_URL=http://localhost:3005
```

In Docker Compose, these are configured as:
```yaml
portal:
  environment:
    NEXT_PUBLIC_API_GATEWAY_URL: http://api-gateway:3000
    IDENTITY_SERVICE_URL: http://identity-service:3001
    ATS_SERVICE_URL: http://ats-service:3002
    NETWORK_SERVICE_URL: http://network-service:3003
    BILLING_SERVICE_URL: http://billing-service:3004
    NOTIFICATION_SERVICE_URL: http://notification-service:3005
```

## User Experience

### For Users
- No authentication required
- Clean, easy-to-understand interface
- Mobile-responsive design
- Contact information for support

### For Operations
- Quick visibility into system health
- Can share link with customers during issues
- Useful for debugging and incident communication

## Footer Link

The status page is linked in the footer under "Support" section:
```
Support > System Status → /status
```

## Testing

### Local Testing
```bash
# Start all services
docker-compose up -d

# Visit status page
open http://localhost:3100/status
```

### Manual Health Check Testing
```bash
# Check individual API routes
curl http://localhost:3100/api-health/gateway
curl http://localhost:3100/api-health/identity
curl http://localhost:3100/api-health/ats
curl http://localhost:3100/api-health/network
curl http://localhost:3100/api-health/billing
curl http://localhost:3100/api-health/notification
```

### Expected Responses

**Healthy Service:**
```json
{
  "status": "healthy",
  "service": "service-name",
  "timestamp": "2025-12-13T10:30:00.000Z"
}
```

**Unhealthy Service:**
```json
{
  "status": "unhealthy",
  "service": "service-name",
  "timestamp": "2025-12-13T10:30:00.000Z",
  "error": "Error description"
}
```

## Future Enhancements

### Historical Data
- Track uptime percentages over time
- Show incident history
- Display maintenance windows

### Incident Communication
- Subscribe to status updates via email/SMS
- RSS feed for status changes
- Slack/Discord webhooks for alerts

### Advanced Metrics
- Response time graphs
- Database query performance
- RabbitMQ queue depths
- Redis cache hit rates

### Regional Status
- Multi-region deployment status
- Latency by region
- Failover status

### Service Dependencies
- Visual dependency graph
- Show cascading failures
- Root cause analysis hints

## Best Practices

### For Operations Teams

1. **Monitor the Status Page**
   - Set up automated tests hitting the status page
   - Alert if any services show unhealthy
   - Review response times regularly

2. **Communication During Incidents**
   - Share status page link in incident communications
   - Update status page as first step in incident response
   - Use as source of truth for customer inquiries

3. **Maintenance Windows**
   - Consider adding maintenance mode indicator
   - Schedule maintenance during low-traffic periods
   - Pre-announce maintenance on status page

### For Development Teams

1. **Health Check Best Practices**
   - Keep health checks lightweight
   - Return quickly (< 3 seconds)
   - Check actual dependencies (DB, RabbitMQ, etc.)
   - Don't expose sensitive information in error messages

2. **Adding New Services**
   - Add health endpoint to service (`GET /health`)
   - Add proxy route in portal (`/api-health/new-service`)
   - Update status page service list
   - Test before deploying

## Troubleshooting

### Status Page Shows All Services as Unhealthy

**Possible Causes:**
- Portal can't reach backend services
- Environment variables not configured
- Network connectivity issues

**Resolution:**
```bash
# Check portal logs
docker-compose logs portal

# Verify environment variables
docker-compose exec portal env | grep SERVICE_URL

# Test direct service access
docker-compose exec portal curl http://identity-service:3001/health
```

### Intermittent Status Failures

**Possible Causes:**
- Services restarting (normal during deployment)
- Network timeouts
- Health check too slow

**Resolution:**
- Check service logs for errors
- Increase timeout if needed (currently 5 seconds)
- Review health check implementation

### Status Page Not Loading

**Possible Causes:**
- Portal service down
- Build errors in Next.js app
- Route configuration issues

**Resolution:**
```bash
# Check portal is running
docker-compose ps portal

# Check portal logs
docker-compose logs portal

# Rebuild if needed
docker-compose build portal
docker-compose up -d portal
```

## Security Considerations

### Information Disclosure
- Health checks return minimal information
- No sensitive data in error messages
- No internal URLs or credentials exposed

### Rate Limiting
- Status page auto-refreshes every 30 seconds
- Consider adding rate limiting if public traffic is high
- Monitor for abuse patterns

### DDOS Protection
- Consider placing behind CDN (Cloudflare, etc.)
- Add Cloudflare "Under Attack" mode during incidents
- Cache status page responses with short TTL

## Monitoring Integration

### Uptime Monitoring Services
The status page can be monitored by external services:

- **UptimeRobot:** Monitor `/status` endpoint
- **Pingdom:** Check page load time and content
- **StatusCake:** Verify all services show healthy

### Internal Monitoring
Integrate with existing monitoring:

```javascript
// Example: Datadog synthetic test
{
  "url": "https://splits.network/status",
  "assertions": [
    {
      "type": "body",
      "operator": "contains",
      "target": "All Systems Operational"
    }
  ]
}
```

## Accessibility

- Semantic HTML structure
- Color is not the only indicator (icons + text)
- Screen reader friendly status descriptions
- Keyboard navigation support
- WCAG 2.1 AA compliant

## Related Documentation

- [Health Checks Implementation](./Health-Checks.md)
- [Monitoring Guide](./Monitoring.md) (to be created)
- [Incident Response](./Incident-Response.md) (to be created)
