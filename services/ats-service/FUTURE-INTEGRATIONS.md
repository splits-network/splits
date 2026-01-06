# ATS Integration System (Phase 4C)

Bidirectional synchronization with Applicant Tracking Systems (ATS).

## Overview

The ATS Integration system enables Splits Network to:
- **Import** jobs/roles from external ATS platforms (Greenhouse, Lever, Workable, etc.)
- **Export** candidate submissions and applications to ATS platforms
- **Sync** application status updates bidirectionally
- **Map** internal IDs to external ATS IDs for seamless integration

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Portal UI     │─────▶│  API Gateway     │─────▶│  ATS Service    │
│  /integrations  │      │                  │      │   (REST API)    │
└─────────────────┘      └──────────────────┘      └────────┬────────┘
                                                             │
                         ┌───────────────────────────────────┤
                         │                                   │
                         ▼                                   ▼
                ┌─────────────────┐              ┌──────────────────┐
                │  Sync Queue     │◀─────────────│   Sync Worker    │
                │  (PostgreSQL)   │              │  (Background)    │
                └─────────────────┘              └──────────────────┘
                         │
                         ▼
                ┌─────────────────────────────────────────┐
                │  External ATS APIs                      │
                │  - Greenhouse                           │
                │  - Lever                                │
                │  - Workable                             │
                │  - Ashby                                │
                └─────────────────────────────────────────┘
```

## Database Schema

### Tables

#### `integrations`
Stores ATS platform connections with encrypted credentials.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `company_id` | UUID | Reference to company |
| `platform` | TEXT | ATS platform name |
| `api_key_encrypted` | TEXT | AES-256-CBC encrypted API key |
| `api_base_url` | TEXT | Custom API endpoint (optional) |
| `webhook_url` | TEXT | Webhook endpoint for receiving updates |
| `sync_enabled` | BOOLEAN | Master sync toggle |
| `sync_roles` | BOOLEAN | Enable job sync |
| `sync_candidates` | BOOLEAN | Enable candidate sync |
| `sync_applications` | BOOLEAN | Enable application sync |
| `config` | JSONB | Platform-specific configuration |
| `last_synced_at` | TIMESTAMPTZ | Last successful sync |

#### `sync_logs`
Audit trail of all sync operations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `integration_id` | UUID | Reference to integration |
| `entity_type` | TEXT | Type: role, candidate, application |
| `entity_id` | UUID | Internal entity ID |
| `external_id` | TEXT | External ATS entity ID |
| `action` | TEXT | created, updated, deleted, skipped |
| `direction` | TEXT | inbound or outbound |
| `status` | TEXT | success, failed, pending, conflict |
| `error_message` | TEXT | Error details if failed |
| `synced_at` | TIMESTAMPTZ | Timestamp |
| `retry_count` | INTEGER | Number of retry attempts |

#### `external_entity_map`
Bidirectional ID mapping between internal and external systems.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `integration_id` | UUID | Reference to integration |
| `entity_type` | TEXT | Type of entity |
| `internal_id` | UUID | Our system ID |
| `external_id` | TEXT | ATS system ID |
| `last_synced_at` | TIMESTAMPTZ | Last sync timestamp |
| `sync_version` | INTEGER | Optimistic locking version |

#### `sync_queue`
Async processing queue for sync operations.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `integration_id` | UUID | Reference to integration |
| `entity_type` | TEXT | Entity to sync |
| `direction` | TEXT | inbound or outbound |
| `action` | TEXT | Sync action |
| `status` | TEXT | pending, processing, completed, failed |
| `priority` | INTEGER | 1 (highest) to 10 (lowest) |
| `scheduled_at` | TIMESTAMPTZ | When to process |
| `retry_count` | INTEGER | Retry attempts |
| `max_retries` | INTEGER | Maximum retry attempts (default 3) |
| `error_message` | TEXT | Failure reason |
| `payload` | JSONB | Additional data |

## Components

### 1. Integration Service (`integration-service.ts`)

Core orchestration service handling:
- **Encryption**: AES-256-CBC for API key storage
- **CRUD**: Create, read, update, delete integrations
- **Mapping**: Bidirectional ID translation
- **Stats**: Aggregated sync metrics
- **Queue Management**: Adding and processing sync jobs

### 2. Platform Clients

#### Greenhouse Client (`greenhouse-client.ts`)
- **Board API**: Public job listings
- **Harvest API**: Candidate submissions
- **Webhook Verification**: HMAC signature validation
- **Sync Service**: Bidirectional sync logic

#### Additional Clients (TODO)
- `lever-client.ts` - Lever integration
- `workable-client.ts` - Workable integration
- `ashby-client.ts` - Ashby integration

### 3. Sync Worker (`sync-worker.ts`)

Background worker process that:
- **Polls** sync queue every 5 seconds
- **Processes** up to 10 items concurrently
- **Retries** failed syncs with exponential backoff (1, 2, 4, 8, 16 min)
- **Schedules** periodic syncs every 5 minutes
- **Monitors** queue depth and processing status

### 4. REST API (`integration-routes.ts`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/companies/:id/integrations` | List all integrations |
| `POST` | `/companies/:id/integrations` | Create integration |
| `GET` | `/integrations/:id` | Get integration details |
| `PATCH` | `/integrations/:id` | Update settings |
| `DELETE` | `/integrations/:id` | Delete integration |
| `POST` | `/integrations/:id/sync` | Trigger manual sync |
| `GET` | `/integrations/:id/logs` | View sync history |
| `POST` | `/integrations/:id/test` | Test connection |
| `POST` | `/integrations/:id/webhook` | Receive ATS webhook |

### 5. Frontend UI

#### Integration List (`/integrations`)
- Card view of all active integrations
- Real-time sync status
- Quick actions (pause, resume, trigger sync)
- Stats overview (total syncs, success rate, etc.)

#### Integration Detail (`/integrations/[id]`)
- Tabs: Overview, Settings, Logs
- Sync configuration toggles
- Manual sync triggers
- Audit log viewer

#### New Integration (`/integrations/new`)
- Platform selector
- Credential wizard
- Sync option configuration
- Connection testing

## Supported Platforms

### 1. Greenhouse ✅ (Fully Implemented)
- **API**: Harvest API + Job Board API
- **Auth**: API Key per integration
- **Features**: 
  - Import jobs from Greenhouse
  - Submit candidates to Greenhouse
  - Update application stages
  - Webhook support

### 2. Lever (Types Ready)
- **API**: Lever Opportunities API
- **Auth**: OAuth 2.0 or API Key
- **Environment**: Sandbox / Production
- **Status**: Types defined, client TODO

### 3. Workable (Types Ready)
- **API**: Workable API v1
- **Auth**: Access Token
- **Subdomain**: Required for API base URL
- **Status**: Types defined, client TODO

### 4. Ashby (Types Ready)
- **API**: Ashby API
- **Auth**: API Key
- **Status**: Types defined, client TODO

### 5. Generic/Custom (Types Ready)
- **API**: Any REST API
- **Auth**: Configurable (API Key, Bearer Token)
- **Base URL**: User-provided
- **Status**: Framework ready, needs implementation

## Configuration

### Environment Variables

```bash
# Database
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-role-key

# Encryption (generate with: openssl rand -base64 32)
ENCRYPTION_SECRET=your-32-byte-base64-secret

# Worker Configuration
SYNC_POLL_INTERVAL=5000      # Poll queue every 5 seconds
SYNC_BATCH_SIZE=10           # Process 10 items per batch
SYNC_MAX_CONCURRENT=5        # Max 5 concurrent syncs
```

### Security

1. **API Key Encryption**: All ATS API keys are encrypted with AES-256-CBC before storage
2. **Webhook Signatures**: All incoming webhooks are verified using HMAC-SHA256
3. **RLS Policies**: Row-level security ensures companies only access their own integrations
4. **Service Role**: Worker uses Supabase service role to bypass RLS for system operations

## Usage

### Running Locally

```bash
# Start ATS service
cd services/ats-service
pnpm dev

# Start sync worker (separate terminal)
pnpm dev:worker
```

### Using Docker Compose

```bash
# Start all services including sync worker
docker-compose up -d

# View worker logs
docker-compose logs -f ats-sync-worker

# Restart worker
docker-compose restart ats-sync-worker
```

### Deploying to Kubernetes

```bash
# Apply ATS service deployment
kubectl apply -f infra/k8s/ats-service/deployment.yaml
kubectl apply -f infra/k8s/ats-service/service.yaml

# Apply sync worker deployment
kubectl apply -f infra/k8s/ats-service/sync-worker.yaml

# Create secrets
kubectl create secret generic ats-secrets \
  --from-literal=encryption-secret=$(openssl rand -base64 32) \
  -n splits-network

# Check worker status
kubectl get pods -n splits-network -l app=ats-sync-worker
kubectl logs -n splits-network -l app=ats-sync-worker -f
```

## Sync Workflow

### Inbound Sync (Import from ATS)

1. **Manual Trigger** or **Periodic Scheduler** queues sync job
2. **Worker** picks up job from queue
3. **Integration Service** fetches data from ATS API
4. **Entity Mapping** checks if entities already exist
5. **Database Update** creates or updates internal records
6. **Log Creation** records sync result (success/failure)
7. **Queue Update** marks job as completed or schedules retry

### Outbound Sync (Export to ATS)

1. **Application Event** (candidate submitted) triggers export
2. **Event Handler** queues outbound sync job
3. **Worker** picks up job from queue
4. **Integration Service** prepares candidate data
5. **ATS Client** submits to external API
6. **Entity Mapping** stores external ID returned
7. **Log Creation** records result
8. **Status Update** marks candidate as "submitted to ATS"

### Retry Logic

- **Attempt 1**: Immediate processing
- **Attempt 2**: Retry after 1 minute
- **Attempt 3**: Retry after 2 minutes
- **Attempt 4**: Retry after 4 minutes
- **Max Retries**: 3 (configurable)
- **After Max**: Mark as failed, alert via notification service

## Monitoring

### Health Check

```bash
# Check worker health
curl http://localhost:3002/health

# Response
{
  "healthy": true,
  "running": true,
  "processingCount": 2,
  "queueDepth": 15
}
```

### Metrics to Monitor

1. **Queue Depth**: Number of pending sync jobs
2. **Processing Rate**: Jobs completed per minute
3. **Success Rate**: % of successful syncs
4. **Retry Rate**: % of jobs requiring retries
5. **Average Processing Time**: Time per sync operation
6. **Failed Syncs**: Count and reasons for failures

### Debugging

```sql
-- View recent sync logs
SELECT * FROM sync_logs 
WHERE integration_id = 'xxx' 
ORDER BY synced_at DESC 
LIMIT 50;

-- Check queue status
SELECT status, COUNT(*) 
FROM sync_queue 
GROUP BY status;

-- Find stuck jobs
SELECT * FROM sync_queue 
WHERE status = 'processing' 
AND started_at < NOW() - INTERVAL '10 minutes';

-- View entity mappings
SELECT * FROM external_entity_map 
WHERE integration_id = 'xxx';
```

## API Examples

### Create Integration

```bash
curl -X POST http://localhost:3000/api/companies/{companyId}/integrations \
  -H "Content-Type: application/json" \
  -d '{
    "platform": "greenhouse",
    "api_key": "your-greenhouse-api-key",
    "config": {
      "harvest_api_key": "your-harvest-key"
    }
  }'
```

### Trigger Manual Sync

```bash
curl -X POST http://localhost:3000/api/integrations/{id}/sync \
  -H "Content-Type: application/json" \
  -d '{
    "direction": "inbound"
  }'
```

### View Sync Logs

```bash
curl http://localhost:3000/api/integrations/{id}/logs?limit=100&status=failed
```

## Troubleshooting

### Worker Not Processing Queue

1. Check worker is running: `docker-compose ps ats-sync-worker`
2. View logs: `docker-compose logs ats-sync-worker`
3. Check database connection
4. Verify SUPABASE_SERVICE_KEY is set correctly

### Sync Failing with 401 Unauthorized

1. Verify API key is correct in integration settings
2. Check if API key has required permissions
3. Test connection via `/integrations/{id}/test` endpoint
4. Review ATS platform's API documentation for required scopes

### Duplicate Entities Created

1. Check `external_entity_map` for existing mapping
2. Verify unique constraints on external_id
3. Review sync logs for conflicts
4. Run reconciliation sync to fix mappings

### High Queue Depth

1. Increase `SYNC_MAX_CONCURRENT` to process more items
2. Scale up worker replicas in Kubernetes
3. Optimize slow API calls
4. Check for rate limiting from ATS platform

## Future Enhancements

- [ ] Webhook handlers for real-time updates
- [ ] Conflict resolution UI for manual intervention
- [ ] Bulk import/export tools
- [ ] Advanced filtering and transformation rules
- [ ] Custom field mapping
- [ ] Multi-stage pipeline sync
- [ ] Interview scheduling integration
- [ ] Offer letter synchronization
- [ ] Analytics dashboard for sync metrics

## References

- [Greenhouse API Documentation](https://developers.greenhouse.io/)
- [Lever API Documentation](https://hire.lever.co/developer/documentation)
- [Workable API Documentation](https://workable.readme.io/reference)
- [Ashby API Documentation](https://developers.ashbyhq.com/)
