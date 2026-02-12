# Demo Orchestrator API Reference

> **🔌 Complete API documentation for the Demo Environment Orchestration System**

This document provides comprehensive API reference for the Demo Orchestrator service, including all endpoints, request/response formats, and integration examples.

## 🎯 Base Configuration

```typescript
// API Base URL
const API_BASE = "https://api.splits.network/api/v2/demo-instances";

// Authentication
const headers = {
    Authorization: "Bearer <clerk-jwt-token>",
    "Content-Type": "application/json",
};
```

## 📋 Demo Instance Endpoints

### List Demo Instances

**GET** `/api/v2/demo-instances`

Retrieve paginated list of demo instances with filtering.

**Query Parameters:**

```typescript
interface ListDemoInstancesParams {
    page?: number; // Page number (default: 1)
    limit?: number; // Items per page (default: 25, max: 100)
    status?: "creating" | "ready" | "degraded" | "destroying" | "failed";
    demo_type?: "recruiting-agency" | "enterprise" | "startup";
    created_by?: string; // Filter by creator
    search?: string; // Search in instance ID or namespace
}
```

**Response:**

```typescript
interface ListDemoInstancesResponse {
    data: DemoInstance[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
}

interface DemoInstance {
    id: string; // e.g., "abc123def"
    namespace: string; // e.g., "demo-abc123def"
    demo_type: "recruiting-agency" | "enterprise" | "startup";
    status: "creating" | "ready" | "degraded" | "destroying" | "failed";

    // URLs
    portal_url: string; // https://demo-abc123def.portal.splits.network
    candidate_url: string; // https://demo-abc123def.candidate.splits.network

    // Lifecycle
    created_at: string; // ISO timestamp
    expires_at: string; // ISO timestamp
    created_by: string; // Clerk user ID

    // Supabase integration
    supabase_project_id?: string;
    supabase_url?: string;

    // Metadata
    metadata: {
        demo_credentials?: DemoCredential[];
        resource_usage?: ResourceUsage;
        health_status?: HealthStatus;
    };
}

interface DemoCredential {
    email: string;
    password: string;
    role: "company_admin" | "recruiter" | "candidate";
    description: string;
}
```

**Example Request:**

```bash
curl -X GET "https://api.splits.network/api/v2/demo-instances?status=ready&limit=10" \
  -H "Authorization: Bearer <token>"
```

### Create Demo Instance

**POST** `/api/v2/demo-instances`

Create a new demo environment instance.

**Request Body:**

```typescript
interface CreateDemoInstanceRequest {
    demo_type: "recruiting-agency" | "enterprise" | "startup";
    duration_hours?: number; // Default: 2, Max: 8
    auto_cleanup?: boolean; // Default: true
    demo_data_size?: "minimal" | "standard" | "large"; // Default: 'standard'
    custom_config?: {
        company_name?: string;
        industry?: string;
        user_count?: number;
    };
}
```

**Response:**

```typescript
interface CreateDemoInstanceResponse {
    data: DemoInstance;
}
```

**Example Request:**

```bash
curl -X POST "https://api.splits.network/api/v2/demo-instances" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "demo_type": "recruiting-agency",
    "duration_hours": 3,
    "demo_data_size": "standard"
  }'
```

### Get Demo Instance

**GET** `/api/v2/demo-instances/:id`

Retrieve detailed information about a specific demo instance.

**Path Parameters:**

- `id` (string): Demo instance ID

**Query Parameters:**

```typescript
interface GetDemoInstanceParams {
    include?: string; // Comma-separated: "credentials,health,usage,logs"
}
```

**Response:**

```typescript
interface GetDemoInstanceResponse {
    data: DemoInstance & {
        credentials?: DemoCredential[]; // If include=credentials
        health_status?: HealthStatus; // If include=health
        resource_usage?: ResourceUsage; // If include=usage
        recent_logs?: LogEntry[]; // If include=logs
    };
}

interface HealthStatus {
    overall: "healthy" | "degraded" | "unhealthy";
    kubernetes: ComponentHealth;
    supabase: ComponentHealth;
    portal: ComponentHealth;
    candidate: ComponentHealth;
    last_checked: string;
}

interface ComponentHealth {
    status: "healthy" | "degraded" | "unhealthy";
    details: string;
    metrics?: Record<string, any>;
    error?: string;
}
```

### Extend Demo Instance

**PATCH** `/api/v2/demo-instances/:id/extend`

Extend the expiration time of a demo instance.

**Request Body:**

```typescript
interface ExtendDemoInstanceRequest {
    hours: number; // Number of hours to add (max: 4)
}
```

**Response:**

```typescript
interface ExtendDemoInstanceResponse {
    data: {
        id: string;
        previous_expires_at: string;
        new_expires_at: string;
        hours_added: number;
    };
}
```

### Update Demo Instance

**PATCH** `/api/v2/demo-instances/:id`

Update demo instance configuration or trigger actions.

**Request Body:**

```typescript
interface UpdateDemoInstanceRequest {
    action?: "restart" | "repair" | "refresh_data";
    metadata?: Record<string, any>;
    notes?: string;
}
```

### Delete Demo Instance

**DELETE** `/api/v2/demo-instances/:id`

Immediately terminate and cleanup a demo instance.

**Response:**

```typescript
// 204 No Content (successful deletion)
```

## 🔧 Management Endpoints

### Get Cluster Capacity

**GET** `/api/v2/demo-instances/_capacity`

Retrieve current cluster capacity for demo instances.

**Response:**

```typescript
interface ClusterCapacityResponse {
    data: {
        total_capacity: number; // Max concurrent demos
        current_usage: number; // Active demo instances
        available_slots: number; // Remaining capacity
        resource_utilization: {
            cpu_percent: number;
            memory_percent: number;
        };
        estimated_cost_per_hour: number;
    };
}
```

### Get Usage Statistics

**GET** `/api/v2/demo-instances/_stats`

Retrieve demo usage statistics and analytics.

**Query Parameters:**

```typescript
interface StatsParams {
    period?: "day" | "week" | "month"; // Default: 'week'
    group_by?: "demo_type" | "user" | "day";
}
```

**Response:**

```typescript
interface UsageStatsResponse {
    data: {
        period: string;
        total_demos: number;
        unique_users: number;
        average_duration_minutes: number;
        total_cost: number;
        breakdown: {
            by_demo_type: Record<string, number>;
            by_status: Record<string, number>;
            by_day: Array<{ date: string; count: number }>;
        };
    };
}
```

## 🚨 Error Responses

**Standard Error Format:**

```typescript
interface ErrorResponse {
    error: {
        code: string; // Machine-readable error code
        message: string; // Human-readable error message
        details?: any; // Additional error context
        request_id?: string; // Unique request identifier
    };
}
```

**Common Error Codes:**

| Status | Code                       | Description                          |
| ------ | -------------------------- | ------------------------------------ |
| 400    | `INVALID_DEMO_TYPE`        | Unsupported demo type specified      |
| 400    | `INVALID_DURATION`         | Duration exceeds maximum (8 hours)   |
| 401    | `UNAUTHORIZED`             | Invalid or missing authentication    |
| 403    | `INSUFFICIENT_PERMISSIONS` | User lacks demo creation permissions |
| 409    | `CAPACITY_EXCEEDED`        | Cluster at maximum demo capacity     |
| 429    | `RATE_LIMITED`             | Too many demo creation requests      |
| 500    | `PROVISIONING_FAILED`      | Infrastructure provisioning error    |
| 500    | `SUPABASE_ERROR`           | Supabase project creation failed     |

## 📡 Webhooks

### Demo Lifecycle Events

The demo orchestrator can send webhook events for instance lifecycle changes.

**Webhook Configuration:**

```typescript
interface WebhookConfig {
    url: string; // Your webhook endpoint
    events: DemoEventType[]; // Events to subscribe to
    secret: string; // Webhook verification secret
}

type DemoEventType =
    | "demo.created"
    | "demo.ready"
    | "demo.failed"
    | "demo.extended"
    | "demo.destroyed"
    | "demo.health_degraded";
```

**Webhook Payload:**

```typescript
interface WebhookPayload {
    event_type: DemoEventType;
    timestamp: string;
    demo_instance: DemoInstance;
    previous_state?: Partial<DemoInstance>;
}
```

## 🔌 SDK Examples

### JavaScript/TypeScript SDK

```typescript
import { DemoOrchestratorClient } from "@splits-network/demo-client";

const client = new DemoOrchestratorClient({
    apiKey: process.env.SPLITS_API_KEY,
    baseUrl: "https://api.splits.network",
});

// Create demo
const demo = await client.demos.create({
    demo_type: "recruiting-agency",
    duration_hours: 2,
});

console.log(`Demo created: ${demo.portal_url}`);

// Wait for ready status
await client.demos.waitForStatus(demo.id, "ready", { timeoutMs: 180000 });

// Get credentials
const credentials = await client.demos.getCredentials(demo.id);
console.log("Login credentials:", credentials);

// Cleanup
await client.demos.delete(demo.id);
```

### Python SDK

```python
from splits_demo import DemoOrchestratorClient

client = DemoOrchestratorClient(
    api_key=os.environ['SPLITS_API_KEY'],
    base_url='https://api.splits.network'
)

# Create and wait for demo
demo = client.demos.create(
    demo_type='enterprise',
    duration_hours=3
)

client.demos.wait_for_ready(demo.id, timeout=180)

print(f"Demo ready: {demo.portal_url}")
print(f"Credentials: {demo.credentials}")

# Auto-cleanup after usage
with client.demos.temporary(demo_type='startup') as demo:
    # Use demo for testing
    pass  # Demo automatically cleaned up
```

This API reference provides all necessary information for integrating with the Demo Environment Orchestration System.
