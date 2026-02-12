# Demo Environment Resource Management

> **⚖️ Kubernetes resource management and optimization for demo environments**

This document details resource allocation, limits, monitoring, and optimization strategies for the demo environment system.

## 🎯 Resource Management Goals

### Primary Objectives

- **Predictable Performance**: Consistent response times across all demo instances
- **Cost Control**: Minimize resource waste while maintaining quality
- **Isolation**: Prevent demo instances from impacting each other or production
- **Scalability**: Support 10+ concurrent demos without cluster saturation

### Resource Constraints

- **Maximum 20 concurrent demo instances**
- **2-hour default duration, 8-hour maximum**
- **Production workloads have priority**
- **Demo environments use 25% of cluster capacity maximum**

## 🔧 Kubernetes Resource Configuration

### Namespace-Level Resource Quotas

```yaml
# Per-demo namespace resource quota
apiVersion: v1
kind: ResourceQuota
metadata:
    name: demo-quota
    namespace: demo-{{INSTANCE_ID}}
spec:
    hard:
        # Compute Resources
        requests.cpu: "2" # 2 CPU cores total
        requests.memory: 4Gi # 4GB RAM total
        limits.cpu: "4" # 4 CPU cores burst
        limits.memory: 8Gi # 8GB RAM burst

        # Object Limits
        pods: "20" # Maximum 20 pods
        services: "10" # Maximum 10 services
        secrets: "20" # Maximum 20 secrets
        configmaps: "20" # Maximum 20 configmaps

        # Storage (Demo = ephemeral only)
        persistentvolumeclaims: "0" # No persistent storage
        requests.storage: "0" # No storage requests
```

### Pod-Level Resource Limits

```yaml
# Per-demo namespace limit ranges
apiVersion: v1
kind: LimitRange
metadata:
    name: demo-limits
    namespace: demo-{{INSTANCE_ID}}
spec:
    limits:
        # Container defaults
        - type: Container
          default:
              cpu: 200m # 0.2 CPU default
              memory: 256Mi # 256MB default
          defaultRequest:
              cpu: 100m # 0.1 CPU request
              memory: 128Mi # 128MB request
          max:
              cpu: 500m # 0.5 CPU maximum per container
              memory: 512Mi # 512MB maximum per container
          min:
              cpu: 50m # 0.05 CPU minimum
              memory: 64Mi # 64MB minimum

        # Pod maximums
        - type: Pod
          max:
              cpu: 2 # 2 CPU maximum per pod
              memory: 2Gi # 2GB maximum per pod
```

### Priority Classes

```yaml
# Demo workload priority (lower than production)
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
    name: demo-priority
value: 100
globalDefault: false
description: "Priority class for demo environments - below production workloads"
---
# Production workload priority (higher)
apiVersion: scheduling.k8s.io/v1
kind: PriorityClass
metadata:
    name: production-priority
value: 1000
globalDefault: false
description: "Priority class for production workloads - highest priority"
```

## 📊 Service-Specific Resource Allocation

### API Gateway Resources

```yaml
spec:
    containers:
        - name: api-gateway
          resources:
              requests:
                  cpu: 100m # 0.1 CPU cores
                  memory: 256Mi # 256MB RAM
              limits:
                  cpu: 300m # 0.3 CPU cores max
                  memory: 384Mi # 384MB RAM max
          env:
              - name: NODE_ENV
                value: "demo"
              - name: WEB_CONCURRENCY
                value: "2" # 2 worker processes max
```

### Service Resource Matrix

| Service              | CPU Request | Memory Request | CPU Limit | Memory Limit | Replicas   |
| -------------------- | ----------- | -------------- | --------- | ------------ | ---------- |
| API Gateway          | 100m        | 256Mi          | 300m      | 384Mi        | 1          |
| Identity Service     | 50m         | 128Mi          | 150m      | 256Mi        | 1          |
| ATS Service          | 100m        | 256Mi          | 300m      | 512Mi        | 1          |
| Network Service      | 50m         | 128Mi          | 150m      | 256Mi        | 1          |
| Billing Service      | 50m         | 128Mi          | 150m      | 256Mi        | 1          |
| Notification Service | 50m         | 128Mi          | 150m      | 256Mi        | 1          |
| Document Service     | 75m         | 192Mi          | 200m      | 384Mi        | 1          |
| Portal App           | 100m        | 256Mi          | 300m      | 512Mi        | 1          |
| Candidate App        | 100m        | 256Mi          | 300m      | 512Mi        | 1          |
| **Total**            | **675m**    | **1.6Gi**      | **1.95**  | **3.2Gi**    | **9 pods** |

### Redis & RabbitMQ Resources

```yaml
# Redis for demo (single instance, no persistence)
spec:
  containers:
  - name: redis
    image: redis:7-alpine
    resources:
      requests:
        cpu: 25m
        memory: 64Mi
      limits:
        cpu: 100m
        memory: 128Mi
    args:
    - redis-server
    - --maxmemory 100mb
    - --maxmemory-policy allkeys-lru
    - --save ""

# RabbitMQ for demo (single instance)
spec:
  containers:
  - name: rabbitmq
    image: rabbitmq:3-management-alpine
    resources:
      requests:
        cpu: 50m
        memory: 128Mi
      limits:
        cpu: 150m
        memory: 256Mi
    env:
    - name: RABBITMQ_DEFAULT_USER
      value: demo
    - name: RABBITMQ_DEFAULT_VHOST
      value: "/demo"
```

## 🔍 Resource Monitoring & Observability

### Resource Usage Monitoring

```typescript
class DemoResourceMonitor {
    async getResourceUsage(instanceId: string): Promise<ResourceUsage> {
        const namespace = `demo-${instanceId}`;

        // Get pod metrics from Kubernetes metrics server
        const podMetrics = await this.k8s.getNamespacedPodMetrics(namespace);

        const usage = podMetrics.items.reduce(
            (acc, pod) => {
                const containers = pod.containers || [];
                containers.forEach((container) => {
                    acc.cpu += this.parseCPU(container.usage?.cpu || "0");
                    acc.memory += this.parseMemory(
                        container.usage?.memory || "0",
                    );
                });
                return acc;
            },
            { cpu: 0, memory: 0, pods: podMetrics.items.length },
        );

        // Calculate percentages against quotas
        const quotas = await this.getNamespaceQuotas(namespace);

        return {
            instanceId,
            namespace,
            current: usage,
            quotas,
            utilization: {
                cpu: (usage.cpu / quotas.cpu) * 100,
                memory: (usage.memory / quotas.memory) * 100,
                pods: (usage.pods / quotas.pods) * 100,
            },
            timestamp: new Date().toISOString(),
        };
    }

    private parseCPU(cpuString: string): number {
        // Parse CPU from formats like "100m", "0.5", "2"
        if (cpuString.endsWith("m")) {
            return parseInt(cpuString) / 1000;
        }
        return parseFloat(cpuString);
    }

    private parseMemory(memoryString: string): number {
        // Parse memory from formats like "256Mi", "1Gi"
        const units = { Ki: 1024, Mi: 1024 ** 2, Gi: 1024 ** 3 };
        const match = memoryString.match(/(\d+)([A-Za-z]+)/);
        if (!match) return 0;

        const [, value, unit] = match;
        return parseInt(value) * (units[unit as keyof typeof units] || 1);
    }
}
```

### Cluster Capacity Planning

```typescript
interface ClusterCapacity {
    total: ResourceAllocation;
    reserved: ResourceAllocation; // For production workloads
    available: ResourceAllocation;
    demos: {
        current: number;
        maximum: number;
        averageUsage: ResourceAllocation;
    };
}

class CapacityPlanner {
    async calculateDemoCapacity(): Promise<ClusterCapacity> {
        const nodes = await this.k8s.listNode();

        const total = nodes.body.items.reduce(
            (acc, node) => {
                const allocatable = node.status?.allocatable;
                if (allocatable) {
                    acc.cpu += this.parseCPU(allocatable.cpu);
                    acc.memory += this.parseMemory(allocatable.memory);
                }
                return acc;
            },
            { cpu: 0, memory: 0 },
        );

        // Reserve 75% for production workloads
        const reserved = {
            cpu: total.cpu * 0.75,
            memory: total.memory * 0.75,
        };

        const available = {
            cpu: total.cpu - reserved.cpu,
            memory: total.memory - reserved.memory,
        };

        // Calculate max demos based on available resources
        const demoRequirements = { cpu: 2, memory: 4 * 1024 ** 3 }; // 4GB
        const maxDemosByCPU = Math.floor(available.cpu / demoRequirements.cpu);
        const maxDemosByMemory = Math.floor(
            available.memory / demoRequirements.memory,
        );
        const maxDemos = Math.min(maxDemosByCPU, maxDemosByMemory, 20); // Hard limit

        return {
            total,
            reserved,
            available,
            demos: {
                current: await this.countActiveDemos(),
                maximum: maxDemos,
                averageUsage: await this.getAverageDemoUsage(),
            },
        };
    }
}
```

## ⚡ Performance Optimization

### Container Optimization

```dockerfile
# Optimized Dockerfile for demo services
FROM node:18-alpine AS base

# Install production dependencies only
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

# Build stage
FROM base AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Runtime stage - minimal image
FROM base AS runtime
WORKDIR /app

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy dependencies and built application
COPY --from=deps --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

USER nextjs

# Environment optimizations for demos
ENV NODE_ENV=demo
ENV NODE_OPTIONS="--max-old-space-size=384"  # Limit to 384MB heap
ENV WEB_CONCURRENCY=1                         # Single worker process

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Service Configuration for Demos

```typescript
// Demo-specific optimizations
const demoConfig = {
    // Reduced connection pools
    database: {
        max: 5, // Max 5 connections vs 20 in production
        min: 1, // Min 1 connection
        idle: 30000, // 30 second idle timeout
    },

    // Reduced cache sizes
    redis: {
        maxMemoryPolicy: "allkeys-lru",
        maxMemory: "50mb",
    },

    // Simplified logging
    logging: {
        level: "info",
        destinations: ["stdout"], // No file logging
        sampling: 0.1, // Sample 10% of logs
    },

    // Reduced worker processes
    workers: 1,

    // Disabled features for demos
    features: {
        websockets: false,
        backgroundJobs: false,
        analytics: false,
        monitoring: false,
    },
};
```

## 🛡️ Resource Protection & Limits

### Network Policies for Resource Protection

```yaml
# Prevent demo instances from accessing cluster internals
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
    name: demo-resource-protection
    namespace: demo-{{INSTANCE_ID}}
spec:
    podSelector: {}
    policyTypes:
        - Egress
    egress:
        # Allow DNS
        - to: []
          ports:
              - protocol: UDP
                port: 53
        # Allow external HTTPS (Supabase, Clerk)
        - to: []
          ports:
              - protocol: TCP
                port: 443
        # Block access to Kubernetes API
        - to:
              - namespaceSelector:
                    matchLabels:
                        name: kube-system
          ports: []
        # Block access to other demo namespaces
        - to:
              - namespaceSelector:
                    matchExpressions:
                        - key: app
                          operator: NotIn
                          values: ["splits-demo"]
```

### Pod Security Standards

```yaml
apiVersion: v1
kind: Namespace
metadata:
    name: demo-{{INSTANCE_ID}}
    labels:
        pod-security.kubernetes.io/enforce: restricted
        pod-security.kubernetes.io/audit: restricted
        pod-security.kubernetes.io/warn: restricted
```

### Resource Quotas with Burst Protection

```typescript
class ResourceGuard {
    async enforceResourceLimits(instanceId: string): Promise<void> {
        const usage = await this.monitor.getResourceUsage(instanceId);
        const limits = this.getResourceLimits(instanceId);

        // Check CPU burst
        if (usage.utilization.cpu > 80) {
            await this.throttleCPU(instanceId, "high_cpu_usage");
        }

        // Check memory consumption
        if (usage.utilization.memory > 90) {
            await this.alertHighMemoryUsage(instanceId);
            // Consider evicting non-essential pods
        }

        // Check pod count
        if (usage.current.pods >= limits.pods) {
            await this.preventNewPodCreation(instanceId);
        }
    }

    private async throttleCPU(
        instanceId: string,
        reason: string,
    ): Promise<void> {
        // Reduce CPU limits temporarily
        const namespace = `demo-${instanceId}`;
        await this.k8s.patchNamespacedLimitRange("demo-limits", namespace, {
            spec: {
                limits: [
                    {
                        type: "Container",
                        max: { cpu: "300m" }, // Reduced from 500m
                        default: { cpu: "150m" }, // Reduced from 200m
                    },
                ],
            },
        });

        // Schedule restoration after 5 minutes
        setTimeout(() => this.restoreNormalLimits(instanceId), 5 * 60 * 1000);
    }
}
```

## 📈 Auto-Scaling Configuration

### Horizontal Pod Autoscaler (Disabled for Demos)

```yaml
# HPA disabled for demo environments to maintain cost predictability
# Demo services run single replicas only
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
    name: demo-portal-hpa
    namespace: demo-{{INSTANCE_ID}}
spec:
    scaleTargetRef:
        apiVersion: apps/v1
        kind: Deployment
        name: portal
    minReplicas: 1
    maxReplicas: 1 # Fixed at 1 replica
    metrics:
        - type: Resource
          resource:
              name: cpu
              target:
                  type: Utilization
                  averageUtilization: 80
    behavior:
        scaleUp:
            stabilizationWindowSeconds: 300
        scaleDown:
            stabilizationWindowSeconds: 300
```

## 🔧 Resource Optimization Scripts

### Demo Environment Right-Sizing

```typescript
class DemoOptimizer {
    async optimizeResourceAllocation(): Promise<OptimizationReport> {
        const instances = await this.repository.getActiveInstances();
        const optimizations: OptimizationAction[] = [];

        for (const instance of instances) {
            const usage = await this.monitor.getResourceUsage(instance.id);
            const recommendations = this.analyzeUsage(usage);

            if (recommendations.length > 0) {
                optimizations.push(...recommendations);
            }
        }

        return {
            timestamp: new Date().toISOString(),
            instances_analyzed: instances.length,
            optimizations_identified: optimizations.length,
            potential_savings: this.calculateSavings(optimizations),
            actions: optimizations,
        };
    }

    private analyzeUsage(usage: ResourceUsage): OptimizationAction[] {
        const actions: OptimizationAction[] = [];

        // Check for over-provisioned CPU
        if (usage.utilization.cpu < 20) {
            actions.push({
                type: "reduce_cpu",
                current: usage.current.cpu,
                recommended: usage.current.cpu * 0.7,
                reason: "Low CPU utilization detected",
                estimated_savings: "$0.05/hour",
            });
        }

        // Check for over-provisioned memory
        if (usage.utilization.memory < 30) {
            actions.push({
                type: "reduce_memory",
                current: usage.current.memory,
                recommended: usage.current.memory * 0.8,
                reason: "Low memory utilization detected",
                estimated_savings: "$0.02/hour",
            });
        }

        // Check for idle instances
        const idleTime = Date.now() - new Date(usage.timestamp).getTime();
        if (idleTime > 30 * 60 * 1000) {
            // 30 minutes idle
            actions.push({
                type: "schedule_cleanup",
                reason: "Instance appears idle for 30+ minutes",
                estimated_savings: "$0.16/hour",
            });
        }

        return actions;
    }
}
```

This resource management strategy ensures efficient use of cluster resources while maintaining isolation and predictable performance for demo environments.
