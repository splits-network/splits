# Demo Environment Admin UI

> **🎛️ Admin interface design and workflows for demo environment management**

This document outlines the user interface design, workflows, and user experience for the demo environment administration system.

## 🎯 UI Design Goals

### Core Principles

- **Simplicity First**: One-click demo creation with smart defaults
- **Visual Status**: Clear visual indicators for demo states and health
- **Self-Service**: Enable non-technical users to manage demos
- **Real-Time Updates**: Live status updates and notifications
- **Cost Transparency**: Clear cost implications and usage tracking

### Target Users

- **Sales Team**: Create demos for prospects
- **Training Coordinators**: Set up training environments
- **Admins**: Monitor usage, costs, and system health
- **Developers**: Create testing environments

## 🎨 Interface Design

### Main Dashboard Layout

```typescript
interface AdminDashboard {
    header: {
        title: "Demo Environments";
        actions: ["Create New Demo", "View Usage Stats", "System Health"];
    };

    quick_stats: {
        active_demos: number;
        capacity_used: string; // "7/20 (35%)"
        monthly_cost: string; // "$45.60"
        demos_this_month: number;
    };

    demo_instances: {
        filters: DemoFilters;
        sort_options: DemoSortOptions;
        instances: DemoInstanceCard[];
        pagination: PaginationControls;
    };
}
```

### Demo Instance Card Design

```tsx
function DemoInstanceCard({ instance }: { instance: DemoInstance }) {
    return (
        <div className="card border border-base-300 bg-base-100 shadow-sm">
            {/* Header with status indicator */}
            <div className="card-body p-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <StatusIndicator status={instance.status} />
                        <div>
                            <h3 className="font-semibold">
                                Demo {instance.id}
                            </h3>
                            <p className="text-sm text-base-content/70">
                                {instance.demo_type} • Created by{" "}
                                {instance.created_by_name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <DemoTypeIcon type={instance.demo_type} />
                        <ActionMenu instance={instance} />
                    </div>
                </div>

                {/* URLs */}
                <div className="mt-3 space-y-2">
                    <URLButton
                        label="Portal App"
                        url={instance.portal_url}
                        icon="🏢"
                    />
                    <URLButton
                        label="Candidate App"
                        url={instance.candidate_url}
                        icon="👤"
                    />
                </div>

                {/* Metadata */}
                <div className="mt-3 flex items-center justify-between text-sm text-base-content/60">
                    <span>
                        Expires {formatRelativeTime(instance.expires_at)}
                    </span>
                    <span>Cost: ${calculateCost(instance)}</span>
                </div>

                {/* Quick actions */}
                <div className="mt-3 flex gap-2">
                    <button className="btn btn-xs btn-outline">Extend</button>
                    <button className="btn btn-xs btn-outline">
                        View Logs
                    </button>
                    <button className="btn btn-xs btn-error">Delete</button>
                </div>
            </div>
        </div>
    );
}
```

### Status Indicator Component

```tsx
function StatusIndicator({ status }: { status: DemoStatus }) {
    const statusConfig = {
        creating: {
            color: "badge-warning",
            icon: "⚡",
            text: "Creating",
            pulse: true,
        },
        ready: {
            color: "badge-success",
            icon: "✅",
            text: "Ready",
            pulse: false,
        },
        degraded: {
            color: "badge-warning",
            icon: "⚠️",
            text: "Issues",
            pulse: true,
        },
        destroying: {
            color: "badge-info",
            icon: "🗑️",
            text: "Cleaning up",
            pulse: true,
        },
        failed: {
            color: "badge-error",
            icon: "❌",
            text: "Failed",
            pulse: false,
        },
    }[status];

    return (
        <div
            className={`badge ${statusConfig.color} ${statusConfig.pulse ? "animate-pulse" : ""}`}
        >
            <span className="mr-1">{statusConfig.icon}</span>
            {statusConfig.text}
        </div>
    );
}
```

## 🚀 Demo Creation Workflow

### Step 1: Demo Type Selection

```tsx
function DemoTypeSelector({
    onSelect,
}: {
    onSelect: (type: DemoType) => void;
}) {
    const demoTypes = [
        {
            id: "recruiting-agency",
            title: "Recruiting Agency",
            icon: "🎯",
            description: "Multi-client recruiting with 50+ jobs",
            features: [
                "Multiple clients",
                "200+ candidates",
                "Complex workflows",
            ],
            estimatedCost: "$0.32",
            duration: "2 hours",
        },
        {
            id: "enterprise",
            title: "Enterprise Company",
            icon: "🏢",
            description: "Large company with department-based hiring",
            features: [
                "Department structure",
                "Approval workflows",
                "Advanced reporting",
            ],
            estimatedCost: "$0.48",
            duration: "3 hours",
        },
        {
            id: "startup",
            title: "Growing Startup",
            icon: "🚀",
            description: "Fast-moving startup with critical hires",
            features: ["Simple structure", "Fast processes", "Founder access"],
            estimatedCost: "$0.32",
            duration: "2 hours",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {demoTypes.map((type) => (
                <button
                    key={type.id}
                    className="card bg-base-100 border border-base-300 hover:border-coral transition-colors text-left"
                    onClick={() => onSelect(type.id as DemoType)}
                >
                    <div className="card-body p-6">
                        <div className="text-4xl mb-2">{type.icon}</div>
                        <h3 className="card-title">{type.title}</h3>
                        <p className="text-sm text-base-content/70 mb-4">
                            {type.description}
                        </p>

                        <ul className="text-sm space-y-1 mb-4">
                            {type.features.map((feature) => (
                                <li
                                    key={feature}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-success">✓</span>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        <div className="flex justify-between text-sm text-base-content/60">
                            <span>{type.duration}</span>
                            <span>{type.estimatedCost}</span>
                        </div>
                    </div>
                </button>
            ))}
        </div>
    );
}
```

### Step 2: Configuration Options

```tsx
function DemoConfiguration({ type, onSubmit }: ConfigurationProps) {
    const [config, setConfig] = useState({
        duration_hours: 2,
        demo_data_size: "standard",
        auto_cleanup: true,
        custom_config: {},
    });

    return (
        <div className="space-y-6">
            {/* Duration Selection */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">
                        Demo Duration
                    </span>
                </label>
                <div className="flex gap-2">
                    {[1, 2, 4, 8].map((hours) => (
                        <button
                            key={hours}
                            className={`btn btn-sm ${
                                config.duration_hours === hours
                                    ? "btn-primary"
                                    : "btn-outline"
                            }`}
                            onClick={() =>
                                setConfig({ ...config, duration_hours: hours })
                            }
                        >
                            {hours}h
                        </button>
                    ))}
                </div>
                <label className="label">
                    <span className="label-text-alt">
                        Estimated cost: $
                        {(0.16 * config.duration_hours).toFixed(2)}
                    </span>
                </label>
            </div>

            {/* Data Size */}
            <div className="form-control">
                <label className="label">
                    <span className="label-text font-medium">
                        Demo Data Size
                    </span>
                </label>
                <select
                    className="select select-bordered"
                    value={config.demo_data_size}
                    onChange={(e) =>
                        setConfig({ ...config, demo_data_size: e.target.value })
                    }
                >
                    <option value="minimal">Minimal (Fast setup)</option>
                    <option value="standard">Standard (Realistic data)</option>
                    <option value="large">Large (Full-scale demo)</option>
                </select>
            </div>

            {/* Auto Cleanup */}
            <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                    <input
                        type="checkbox"
                        className="checkbox"
                        checked={config.auto_cleanup}
                        onChange={(e) =>
                            setConfig({
                                ...config,
                                auto_cleanup: e.target.checked,
                            })
                        }
                    />
                    <div>
                        <span className="label-text font-medium">
                            Auto-cleanup
                        </span>
                        <p className="text-sm text-base-content/70">
                            Automatically destroy demo when it expires
                        </p>
                    </div>
                </label>
            </div>

            <div className="flex justify-end gap-3">
                <button className="btn btn-ghost">Cancel</button>
                <button
                    className="btn btn-primary"
                    onClick={() => onSubmit(config)}
                >
                    Create Demo
                </button>
            </div>
        </div>
    );
}
```

### Step 3: Creation Progress

```tsx
function DemoCreationProgress({ demoId }: { demoId: string }) {
    const [progress, setProgress] = useState<CreationProgress>({
        stage: "initializing",
        progress: 0,
        message: "Setting up demo environment...",
    });

    const stages = [
        { id: "initializing", label: "Initializing", duration: 10 },
        { id: "kubernetes", label: "Creating namespace", duration: 20 },
        { id: "supabase", label: "Setting up database", duration: 60 },
        { id: "seeding", label: "Loading demo data", duration: 45 },
        { id: "services", label: "Starting services", duration: 30 },
        { id: "ready", label: "Demo ready!", duration: 0 },
    ];

    return (
        <div className="max-w-md mx-auto">
            {/* Progress Bar */}
            <div className="flex justify-between text-sm text-base-content/70 mb-2">
                <span>Creating demo environment</span>
                <span>{progress.progress}%</span>
            </div>
            <progress
                className="progress progress-primary w-full mb-6"
                value={progress.progress}
                max={100}
            />

            {/* Current Stage */}
            <div className="text-center mb-8">
                <div className="text-2xl mb-2">⚡</div>
                <p className="font-medium">{progress.message}</p>
                <p className="text-sm text-base-content/60 mt-1">
                    This usually takes 2-3 minutes
                </p>
            </div>

            {/* Stage List */}
            <div className="space-y-3">
                {stages.map((stage, index) => {
                    const isActive = stage.id === progress.stage;
                    const isComplete =
                        stages.findIndex((s) => s.id === progress.stage) >
                        index;

                    return (
                        <div key={stage.id} className="flex items-center gap-3">
                            <div
                                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                    isComplete
                                        ? "bg-success text-success-content"
                                        : isActive
                                          ? "bg-primary text-primary-content animate-pulse"
                                          : "bg-base-300"
                                }`}
                            >
                                {isComplete ? "✓" : isActive ? "⚡" : index + 1}
                            </div>
                            <span
                                className={`${
                                    isComplete || isActive
                                        ? "text-base-content"
                                        : "text-base-content/50"
                                }`}
                            >
                                {stage.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
```

## 📊 Usage Analytics Dashboard

### Monthly Usage Overview

```tsx
function UsageDashboard() {
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Demos This Month"
                    value="47"
                    change="+12%"
                    icon="🎪"
                />
                <StatCard
                    title="Total Cost"
                    value="$38.24"
                    change="+$5.20"
                    icon="💰"
                />
                <StatCard
                    title="Avg Duration"
                    value="2.3h"
                    change="-0.2h"
                    icon="⏱️"
                />
                <StatCard
                    title="Success Rate"
                    value="94%"
                    change="+2%"
                    icon="✅"
                />
            </div>

            {/* Usage Trends Chart */}
            <div className="card bg-base-100 border border-base-300">
                <div className="card-body">
                    <h3 className="card-title">Demo Usage Trends</h3>
                    <UsageChart data={usageData} />
                </div>
            </div>

            {/* Demo Type Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DemoTypeBreakdown />
                <UserActivityTable />
            </div>
        </div>
    );
}
```

## ⚙️ System Health Monitoring

### Health Dashboard

```tsx
function SystemHealthDashboard() {
    return (
        <div className="space-y-6">
            {/* Cluster Status */}
            <div className="card bg-base-100 border border-base-300">
                <div className="card-body">
                    <h3 className="card-title">Cluster Status</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <HealthMetric
                            label="CPU Usage"
                            value="45%"
                            status="healthy"
                            threshold={80}
                        />
                        <HealthMetric
                            label="Memory Usage"
                            value="62%"
                            status="healthy"
                            threshold={85}
                        />
                        <HealthMetric
                            label="Active Demos"
                            value="7/20"
                            status="healthy"
                            threshold={18}
                        />
                    </div>
                </div>
            </div>

            {/* Service Status */}
            <div className="card bg-base-100 border border-base-300">
                <div className="card-body">
                    <h3 className="card-title">Service Health</h3>
                    <ServiceHealthGrid />
                </div>
            </div>
        </div>
    );
}
```

## 🔧 Advanced Features

### Bulk Operations

```tsx
function BulkOperationsPanel({ selectedInstances }: BulkOperationsProps) {
    return (
        <div className="card bg-base-100 border border-base-300">
            <div className="card-body p-4">
                <div className="flex items-center justify-between">
                    <span className="font-medium">
                        {selectedInstances.length} demos selected
                    </span>
                    <div className="flex gap-2">
                        <button className="btn btn-xs btn-outline">
                            Extend All
                        </button>
                        <button className="btn btn-xs btn-warning">
                            Stop All
                        </button>
                        <button className="btn btn-xs btn-error">
                            Delete All
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
```

### Demo Templates

```tsx
function DemoTemplateManager() {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Demo Templates</h3>
                <button className="btn btn-primary btn-sm">
                    Create Template
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                    <TemplateCard key={template.id} template={template} />
                ))}
            </div>
        </div>
    );
}
```

This admin interface provides a comprehensive yet intuitive way to manage demo environments with real-time updates, clear visual feedback, and efficient workflows for all user types.
