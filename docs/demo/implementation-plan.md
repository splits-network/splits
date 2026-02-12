# Demo Environment Implementation Plan

> **📅 Step-by-step implementation guide for the Demo Environment Orchestration System**

This document provides a detailed implementation roadmap for building the demo environment system, broken down into manageable phases with clear deliverables.

## 🎯 Implementation Overview

### Project Goals

- **Primary**: Enable on-demand demo environment creation for sales and training
- **Secondary**: Provide isolated testing environments for development
- **Timeline**: 4 weeks total development time
- **Team**: 2-3 developers (1 backend lead, 1 frontend, 1 DevOps)

### Success Criteria

- ✅ Demo environment ready in <3 minutes
- ✅ Complete isolation from production
- ✅ Auto-cleanup after expiration
- ✅ Cost under $0.50 per demo session
- ✅ Support 10+ concurrent demos

## 📋 Phase 1: Foundation (Week 1)

### 🎯 Goal: Basic demo orchestrator with manual provisioning

#### Backend Development

**1. Demo Orchestrator Service Setup**

```bash
# Create new service
mkdir services/demo-orchestrator
cd services/demo-orchestrator

# Initialize package.json
npm init -y
npm install fastify @fastify/env @fastify/cors
npm install -D typescript @types/node tsx
```

**Service Structure:**

```
services/demo-orchestrator/
├── src/
│   ├── index.ts              # Main server entry
│   ├── v2/
│   │   ├── routes.ts         # V2 route registration
│   │   ├── demo-instances/   # Demo instance domain
│   │   │   ├── types.ts      # Interface definitions
│   │   │   ├── repository.ts # Database operations
│   │   │   ├── service.ts    # Business logic
│   │   │   └── routes.ts     # HTTP endpoints
│   │   └── shared/
│   │       ├── events.ts     # Event publisher
│   │       └── k8s-client.ts # Kubernetes client
│   ├── templates/            # K8s deployment templates
│   └── migrations/           # Database schema
├── Dockerfile
├── package.json
└── tsconfig.json
```

**2. Database Schema Implementation**

```sql
-- Migration: Create demo_orchestrator schema
CREATE SCHEMA IF NOT EXISTS demo_orchestrator;

-- Demo instances table
CREATE TABLE demo_orchestrator.demo_instances (
    id VARCHAR(32) PRIMARY KEY,
    namespace VARCHAR(64) UNIQUE NOT NULL,
    demo_type VARCHAR(32) NOT NULL CHECK (demo_type IN ('recruiting-agency', 'enterprise', 'startup')),
    status VARCHAR(16) NOT NULL CHECK (status IN ('creating', 'ready', 'degraded', 'destroying', 'failed')),

    -- URLs
    portal_url TEXT NOT NULL,
    candidate_url TEXT NOT NULL,

    -- Supabase integration
    supabase_project_id VARCHAR(64),
    supabase_url TEXT,
    supabase_anon_key TEXT,

    -- Lifecycle
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    created_by VARCHAR(64) NOT NULL,

    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX idx_demo_instances_status ON demo_orchestrator.demo_instances(status);
CREATE INDEX idx_demo_instances_expires ON demo_orchestrator.demo_instances(expires_at) WHERE status IN ('creating', 'ready', 'degraded');
CREATE INDEX idx_demo_instances_created_by ON demo_orchestrator.demo_instances(created_by);
```

**3. Core API Implementation**

```typescript
// src/v2/demo-instances/routes.ts
import { FastifyInstance } from "fastify";
import { DemoInstanceServiceV2 } from "./service";

export async function demoInstanceRoutes(app: FastifyInstance) {
    const service = new DemoInstanceServiceV2(/* dependencies */);

    // List demo instances
    app.get(
        "/demo-instances",
        {
            preHandler: app.authenticate,
            schema: {
                querystring: {
                    type: "object",
                    properties: {
                        status: {
                            type: "string",
                            enum: [
                                "creating",
                                "ready",
                                "degraded",
                                "destroying",
                                "failed",
                            ],
                        },
                        page: { type: "number", minimum: 1, default: 1 },
                        limit: {
                            type: "number",
                            minimum: 1,
                            maximum: 100,
                            default: 25,
                        },
                    },
                },
            },
        },
        async (request, reply) => {
            const { status, page, limit } = request.query as any;
            const instances = await service.list(request.user.clerkUserId, {
                status,
                page,
                limit,
            });
            return reply.send({ data: instances });
        },
    );

    // Create demo instance
    app.post(
        "/demo-instances",
        {
            preHandler: app.authenticate,
            schema: {
                body: {
                    type: "object",
                    required: ["demo_type"],
                    properties: {
                        demo_type: {
                            type: "string",
                            enum: [
                                "recruiting-agency",
                                "enterprise",
                                "startup",
                            ],
                        },
                        duration_hours: {
                            type: "number",
                            minimum: 1,
                            maximum: 8,
                            default: 2,
                        },
                        auto_cleanup: { type: "boolean", default: true },
                    },
                },
            },
        },
        async (request, reply) => {
            const instance = await service.create(
                request.user.clerkUserId,
                request.body as any,
            );
            return reply.code(201).send({ data: instance });
        },
    );

    // Get demo instance status
    app.get(
        "/demo-instances/:id",
        {
            preHandler: app.authenticate,
        },
        async (request, reply) => {
            const { id } = request.params as any;
            const instance = await service.get(id, request.user.clerkUserId);
            return reply.send({ data: instance });
        },
    );

    // Extend demo instance
    app.patch(
        "/demo-instances/:id/extend",
        {
            preHandler: app.authenticate,
            schema: {
                body: {
                    type: "object",
                    required: ["hours"],
                    properties: {
                        hours: { type: "number", minimum: 1, maximum: 4 },
                    },
                },
            },
        },
        async (request, reply) => {
            const { id } = request.params as any;
            const { hours } = request.body as any;
            const instance = await service.extend(
                id,
                request.user.clerkUserId,
                hours,
            );
            return reply.send({ data: instance });
        },
    );

    // Delete demo instance
    app.delete(
        "/demo-instances/:id",
        {
            preHandler: app.authenticate,
        },
        async (request, reply) => {
            const { id } = request.params as any;
            await service.delete(id, request.user.clerkUserId);
            return reply.code(204).send();
        },
    );
}
```

#### DevOps Setup

**4. Kubernetes Templates**

```yaml
# templates/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
    name: "{{INSTANCE_ID}}"
    labels:
        app: splits-demo
        instance: "{{INSTANCE_ID}}"
        demo-type: "{{DEMO_TYPE}}"
        managed-by: demo-orchestrator
    annotations:
        splits.network/created-by: "{{CREATED_BY}}"
        splits.network/expires-at: "{{EXPIRES_AT}}"
---
apiVersion: v1
kind: ResourceQuota
metadata:
    name: demo-quota
    namespace: "{{INSTANCE_ID}}"
spec:
    hard:
        requests.cpu: "2"
        requests.memory: 4Gi
        limits.cpu: "4"
        limits.memory: 8Gi
        pods: "20"
        services: "10"
        persistentvolumeclaims: "0"
```

**5. Manual Supabase Integration**

```typescript
// Phase 1: Manual Supabase project management
class ManualSupabaseManager {
    private sharedProjectUrl = process.env.DEMO_SUPABASE_URL!;
    private sharedAnonKey = process.env.DEMO_SUPABASE_ANON_KEY!;

    async provisionDemoDatabase(instanceId: string, demoType: string) {
        // Phase 1: Use shared demo Supabase project with instance-specific schemas
        const schemaName = `demo_${instanceId.replace("-", "_")}`;

        // Create schema for this demo instance
        const { error } = await supabaseAdmin.rpc("create_demo_schema", {
            schema_name: schemaName,
            demo_type: demoType,
        });

        if (error) throw error;

        return {
            supabaseUrl: this.sharedProjectUrl,
            anonKey: this.sharedAnonKey,
            schema: schemaName,
        };
    }
}
```

#### Deliverables - Week 1

- ✅ Demo orchestrator service with V2 API
- ✅ Database schema and migrations
- ✅ Basic Kubernetes integration
- ✅ Manual demo instance creation
- ✅ Simple admin UI for demo management
- ✅ Shared Supabase demo database

## 📋 Phase 2: Automation (Week 2)

### 🎯 Goal: Automated provisioning with Supabase Management API

#### Supabase Integration

**6. Supabase Management API Integration**

```typescript
class SupabaseOrchestrator {
    private managementApi: SupabaseManagementClient;

    async createDemoProject(
        instanceId: string,
        demoType: string,
    ): Promise<DemoDatabase> {
        // Create new Supabase project
        const project = await this.managementApi.createProject({
            name: `splits-demo-${instanceId}`,
            organization_id: process.env.DEMO_SUPABASE_ORG_ID!,
            region: "us-east-1",
            plan: "free",
            kps_enabled: false,
        });

        // Wait for project initialization
        await this.waitForProjectReady(project.id, 120000); // 2 minute timeout

        // Run schema migrations
        await this.deploySchema(project, instanceId);

        // Seed with demo data
        await this.seedDemoData(project, demoType);

        return {
            projectId: project.id,
            url: project.url,
            anonKey: project.anon_key,
            serviceRoleKey: project.service_role_key,
        };
    }

    private async deploySchema(
        project: SupabaseProject,
        instanceId: string,
    ): Promise<void> {
        const client = new Client({
            connectionString: project.database_url,
        });

        await client.connect();

        try {
            // Read and execute migration files
            const migrationFiles = glob.sync("migrations/*.sql").sort();

            for (const file of migrationFiles) {
                const sql = fs.readFileSync(file, "utf8");
                const processedSql = this.processMigrationTemplate(
                    sql,
                    instanceId,
                );

                await client.query(processedSql);
                console.log(`✅ Applied migration: ${file}`);
            }
        } finally {
            await client.end();
        }
    }
}
```

**7. Demo Data Seeding System**

```typescript
// Abstract base class for demo scenarios
abstract class DemoSeed {
    protected supabase: SupabaseClient;

    constructor(supabaseUrl: string, serviceRoleKey: string) {
        this.supabase = createClient(supabaseUrl, serviceRoleKey);
    }

    abstract seed(): Promise<void>;

    protected async createDemoUser(userData: DemoUser): Promise<string> {
        const { data, error } = await this.supabase
            .from("users")
            .insert({
                ...userData,
                clerk_user_id: `demo_${userData.email.split("@")[0]}_${Date.now()}`,
            })
            .select("id")
            .single();

        if (error) throw error;
        return data.id;
    }
}

// Recruiting agency demo scenario
class RecruitingAgencySeed extends DemoSeed {
    async seed(): Promise<void> {
        // 1. Create companies
        const companies = await this.createCompanies();

        // 2. Create users and roles
        const users = await this.createUsers();

        // 3. Create jobs
        const jobs = await this.createJobs(companies);

        // 4. Create candidates
        const candidates = await this.createCandidates(users);

        // 5. Create applications
        await this.createApplications(candidates, jobs);

        // 6. Create recruiters and assignments
        await this.createRecruiters(users, jobs);

        console.log("✅ Recruiting agency demo data seeded");
    }

    private async createCompanies(): Promise<Company[]> {
        const companiesData = [
            {
                id: "demo-acme-corp",
                name: "Acme Corporation",
                industry: "Technology",
                size: "500-1000 employees",
                description: "Leading enterprise software company",
            },
            {
                id: "demo-techstart",
                name: "TechStart Inc",
                industry: "Software",
                size: "50-100 employees",
                description: "Innovative fintech startup",
            },
        ];

        const { data, error } = await this.supabase
            .from("companies")
            .insert(companiesData)
            .select();

        if (error) throw error;
        return data;
    }
}
```

#### Infrastructure Automation

**8. Kubernetes Deployment Automation**

```typescript
class KubernetesOrchestrator {
    private k8sApi: k8s.KubernetesApi;

    async deployDemoEnvironment(config: DemoConfig): Promise<DemoDeployment> {
        const { instanceId, demoType, supabase } = config;

        // 1. Create namespace with resource quotas
        await this.createNamespace(instanceId, demoType, config.createdBy);

        // 2. Deploy all services in parallel
        const deployments = await Promise.all([
            this.deployAPIGateway(instanceId, supabase),
            this.deployIdentityService(instanceId, supabase),
            this.deployATSService(instanceId, supabase),
            this.deployNetworkService(instanceId, supabase),
            this.deployPortalApp(instanceId, supabase),
            this.deployCandidateApp(instanceId, supabase),
        ]);

        // 3. Configure ingress
        await this.configureIngress(instanceId);

        // 4. Wait for all pods to be ready
        await this.waitForDeploymentReady(instanceId, 300000); // 5 minute timeout

        return {
            instanceId,
            namespace: `demo-${instanceId}`,
            deployments,
            status: "ready",
        };
    }

    private async deployAPIGateway(
        instanceId: string,
        supabase: SupabaseConfig,
    ): Promise<void> {
        const deployment = this.generateAPIGatewayManifest(
            instanceId,
            supabase,
        );
        await this.k8sApi.createNamespacedDeployment(
            `demo-${instanceId}`,
            deployment,
        );

        const service = this.generateServiceManifest("api-gateway", 3000);
        await this.k8sApi.createNamespacedService(
            `demo-${instanceId}`,
            service,
        );
    }
}
```

#### Deliverables - Week 2

- ✅ Supabase Management API integration
- ✅ Automated project lifecycle management
- ✅ Demo data seeding system
- ✅ Kubernetes deployment automation
- ✅ DNS subdomain creation

## 📋 Phase 3: Production Ready (Week 3)

### 🎯 Goal: Resource management, monitoring, and reliability

#### Monitoring & Health Checks

**9. Demo Instance Health Monitoring**

```typescript
class DemoHealthMonitor {
    async checkInstanceHealth(instanceId: string): Promise<DemoHealthStatus> {
        const [k8sHealth, supabaseHealth, urlHealth] = await Promise.all([
            this.checkKubernetesHealth(instanceId),
            this.checkSupabaseHealth(instanceId),
            this.checkURLHealth(instanceId),
        ]);

        return {
            instanceId,
            overall: this.calculateOverallStatus([
                k8sHealth,
                supabaseHealth,
                urlHealth,
            ]),
            kubernetes: k8sHealth,
            supabase: supabaseHealth,
            portal: urlHealth.portal,
            candidate: urlHealth.candidate,
            lastChecked: new Date().toISOString(),
        };
    }

    private async checkKubernetesHealth(
        instanceId: string,
    ): Promise<ComponentHealth> {
        try {
            const namespace = `demo-${instanceId}`;
            const pods = await this.k8s.listNamespacedPod(namespace);

            const runningPods = pods.body.items.filter(
                (pod) =>
                    pod.status?.phase === "Running" &&
                    pod.status?.conditions?.some(
                        (c) => c.type === "Ready" && c.status === "True",
                    ),
            );

            const totalPods = pods.body.items.length;
            const healthyPods = runningPods.length;

            return {
                status: healthyPods === totalPods ? "healthy" : "degraded",
                details: `${healthyPods}/${totalPods} pods ready`,
                metrics: { totalPods, healthyPods },
            };
        } catch (error) {
            return {
                status: "unhealthy",
                details: error.message,
                error: error,
            };
        }
    }
}
```

**10. Auto-Cleanup Job Implementation**

```yaml
# k8s/demo-cleanup-cronjob.yaml
apiVersion: batch/v1
kind: CronJob
metadata:
    name: demo-cleanup
    namespace: demo-orchestrator
spec:
    schedule: "*/15 * * * *" # Every 15 minutes
    jobTemplate:
        spec:
            template:
                spec:
                    containers:
                        - name: cleanup
                          image: splits/demo-orchestrator:latest
                          command: ["node", "dist/jobs/cleanup.js"]
                          env:
                              - name: NODE_ENV
                                value: "production"
                              - name: SUPABASE_URL
                                valueFrom:
                                    secretKeyRef:
                                        name: demo-orchestrator-secrets
                                        key: supabase-url
                    restartPolicy: OnFailure
```

```typescript
// jobs/cleanup.ts
class DemoCleanupJob {
    async run(): Promise<void> {
        console.log("🧹 Starting demo cleanup job");

        const expiredInstances = await this.repository.findExpiredInstances();
        console.log(`Found ${expiredInstances.length} expired demo instances`);

        const results = await Promise.allSettled(
            expiredInstances.map((instance) => this.cleanupInstance(instance)),
        );

        const successful = results.filter(
            (r) => r.status === "fulfilled",
        ).length;
        const failed = results.filter((r) => r.status === "rejected").length;

        console.log(
            `✅ Cleanup completed: ${successful} successful, ${failed} failed`,
        );

        if (failed > 0) {
            // Alert on cleanup failures
            await this.alertManager.sendAlert({
                level: "warning",
                message: `Demo cleanup failed for ${failed} instances`,
                details: results.filter((r) => r.status === "rejected"),
            });
        }
    }

    private async cleanupInstance(instance: DemoInstance): Promise<void> {
        const startTime = Date.now();

        try {
            // 1. Delete Kubernetes resources
            await this.k8sOrchestrator.deleteNamespace(instance.namespace);

            // 2. Delete Supabase project
            if (instance.supabase_project_id) {
                await this.supabaseOrchestrator.deleteProject(
                    instance.supabase_project_id,
                );
            }

            // 3. Remove DNS records
            await this.dnsManager.deleteDemoSubdomains(instance.id);

            // 4. Update database status
            await this.repository.markAsDestroyed(instance.id);

            const duration = Date.now() - startTime;
            console.log(`✅ Cleaned up ${instance.id} in ${duration}ms`);
        } catch (error) {
            console.error(`❌ Failed to cleanup ${instance.id}:`, error);
            await this.repository.markAsFailed(instance.id, error.message);
            throw error;
        }
    }
}
```

#### Deliverables - Week 3

- ✅ Resource quotas and limits
- ✅ Network isolation policies
- ✅ Health monitoring system
- ✅ Auto-cleanup Jobs
- ✅ Error handling and recovery
- ✅ Basic alerting

## 📋 Phase 4: Advanced Features (Week 4)

### 🎯 Goal: User experience and operational features

#### Admin UI Enhancement

**11. React Admin Dashboard**

```tsx
// apps/portal/src/app/portal/admin/demo-instances/page.tsx
export default function DemoInstancesPage() {
    const [instances, setInstances] = useState<DemoInstance[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Demo Environments</h1>
                <DemoInstanceCreator onCreated={refreshInstances} />
            </div>

            <DemoInstanceStats instances={instances} />
            <DemoInstanceTable
                instances={instances}
                onExtend={handleExtend}
                onDelete={handleDelete}
            />
        </div>
    );
}

function DemoInstanceCreator({ onCreated }: { onCreated: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [form, setForm] = useState({
        demo_type: "recruiting-agency",
        duration_hours: 2,
    });

    const createDemo = async () => {
        setCreating(true);
        try {
            const response = await apiClient.post("/demo-instances", form);
            await pollForReady(response.data.id);
            onCreated();
            setIsOpen(false);

            // Open demo in new tab
            window.open(response.data.portal_url, "_blank");
        } catch (error) {
            toast.error("Failed to create demo instance");
        } finally {
            setCreating(false);
        }
    };

    return (
        <>
            <button className="btn btn-primary" onClick={() => setIsOpen(true)}>
                <i className="fa-solid fa-plus mr-2" />
                Create Demo
            </button>

            {isOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <h3 className="font-bold text-lg mb-4">
                            🎪 Create Demo Environment
                        </h3>

                        <div className="space-y-4">
                            <div className="form-control">
                                <label className="label">Demo Type</label>
                                <select
                                    className="select select-bordered"
                                    value={form.demo_type}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            demo_type: e.target.value,
                                        })
                                    }
                                >
                                    <option value="recruiting-agency">
                                        Recruiting Agency
                                    </option>
                                    <option value="enterprise">
                                        Enterprise
                                    </option>
                                    <option value="startup">Startup</option>
                                </select>
                            </div>

                            <div className="form-control">
                                <label className="label">
                                    Duration (hours)
                                </label>
                                <input
                                    type="number"
                                    className="input input-bordered"
                                    min={1}
                                    max={8}
                                    value={form.duration_hours}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            duration_hours: parseInt(
                                                e.target.value,
                                            ),
                                        })
                                    }
                                />
                            </div>
                        </div>

                        <div className="modal-action">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setIsOpen(false)}
                                disabled={creating}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={createDemo}
                                disabled={creating}
                            >
                                {creating ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Demo"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
```

**12. Usage Analytics**

```typescript
class DemoAnalytics {
    async trackDemoCreation(
        instanceId: string,
        userId: string,
        demoType: string,
    ): Promise<void> {
        await this.analytics.track("demo_instance_created", {
            instance_id: instanceId,
            user_id: userId,
            demo_type: demoType,
            timestamp: new Date().toISOString(),
        });
    }

    async getDemoUsageStats(
        timeframe: "week" | "month" | "quarter",
    ): Promise<DemoUsageStats> {
        const endDate = new Date();
        const startDate = new Date();

        switch (timeframe) {
            case "week":
                startDate.setDate(endDate.getDate() - 7);
                break;
            case "month":
                startDate.setMonth(endDate.getMonth() - 1);
                break;
            case "quarter":
                startDate.setMonth(endDate.getMonth() - 3);
                break;
        }

        const [totalDemos, uniqueUsers, avgDuration] = await Promise.all([
            this.countDemoInstances(startDate, endDate),
            this.countUniqueUsers(startDate, endDate),
            this.calculateAverageDuration(startDate, endDate),
        ]);

        return {
            timeframe,
            period: { start: startDate, end: endDate },
            total_demos: totalDemos,
            unique_users: uniqueUsers,
            average_duration_minutes: avgDuration,
            cost_total: totalDemos * 0.32, // Estimate
            popular_demo_types: await this.getPopularDemoTypes(
                startDate,
                endDate,
            ),
        };
    }
}
```

#### Deliverables - Week 4

- ✅ Enhanced admin dashboard
- ✅ Self-service demo creation
- ✅ Usage analytics
- ✅ Demo templates
- ✅ Performance monitoring
- ✅ Documentation

## 🚀 Post-Launch Enhancements

### Future Roadmap (Months 2-3)

**Advanced Features:**

- **CRM Integration**: Salesforce/HubSpot demo tracking
- **White-label demos**: Customer-branded environments
- **Advanced scenarios**: Industry-specific templates
- **Multi-region support**: Global demo deployment
- **Persistent demos**: Optional data persistence for extended evaluations

**Operational Improvements:**

- **Advanced monitoring**: Grafana dashboards
- **Cost optimization**: Spot instances and resource right-sizing
- **Compliance features**: SOC2/GDPR considerations
- **Backup/restore**: Demo state snapshots

## 📝 Implementation Checklist

### Pre-Development Setup

- [ ] Kubernetes cluster access and permissions
- [ ] Supabase Organization for demo projects
- [ ] Cloudflare API access for DNS management
- [ ] Container registry setup
- [ ] Monitoring stack (Prometheus/Grafana)

### Development Environment

- [ ] Local Kubernetes cluster (minikube/kind)
- [ ] Demo Supabase project for testing
- [ ] Environment variables and secrets
- [ ] CI/CD pipeline setup

### Testing Strategy

- [ ] Unit tests for orchestrator service
- [ ] Integration tests for Kubernetes deployment
- [ ] End-to-end demo creation tests
- [ ] Load testing for concurrent demos
- [ ] Security testing for isolation

### Production Readiness

- [ ] Resource monitoring and alerting
- [ ] Backup and disaster recovery procedures
- [ ] Security audit and penetration testing
- [ ] Documentation for operations team
- [ ] Training for sales and support teams

This implementation plan provides a clear roadmap for building the demo environment system with incremental delivery and validation at each phase.
