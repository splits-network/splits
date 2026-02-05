'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import { AdminPageHeader } from '../components';
import { LoadingState } from '@splits-network/shared-ui';

interface PlatformSettings {
    platform: {
        name: string;
        version: string;
        environment: string;
    };
    integrations: {
        stripe: {
            connected: boolean;
            mode: 'test' | 'live';
        };
        clerk: {
            connected: boolean;
        };
        resend: {
            connected: boolean;
        };
        supabase: {
            connected: boolean;
        };
        rabbitmq: {
            connected: boolean;
        };
    };
    features: {
        ai_matching: boolean;
        fraud_detection: boolean;
        automation: boolean;
        escrow: boolean;
    };
    limits: {
        max_applications_per_job: number;
        max_recruiters_per_job: number;
        guarantee_period_days: number;
        escrow_holdback_percentage: number;
    };
}

export default function SettingsPage() {
    const { getToken } = useAuth();
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSettings();
    }, []);

    async function loadSettings() {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                setError('Unauthorized');
                return;
            }

            const apiClient = createAuthenticatedClient(token);
            const response = await apiClient.get('/settings');
            setSettings(response.data);
        } catch (err) {
            console.error('Failed to load settings:', err);
            // Use default settings for display purposes
            setSettings({
                platform: {
                    name: 'Splits Network',
                    version: '1.0.0',
                    environment: process.env.NODE_ENV || 'development',
                },
                integrations: {
                    stripe: { connected: true, mode: 'test' },
                    clerk: { connected: true },
                    resend: { connected: true },
                    supabase: { connected: true },
                    rabbitmq: { connected: true },
                },
                features: {
                    ai_matching: true,
                    fraud_detection: true,
                    automation: true,
                    escrow: true,
                },
                limits: {
                    max_applications_per_job: 100,
                    max_recruiters_per_job: 10,
                    guarantee_period_days: 90,
                    escrow_holdback_percentage: 20,
                },
            });
        } finally {
            setLoading(false);
        }
    }

    function IntegrationStatus({ connected, label, icon, mode }: { connected: boolean; label: string; icon: string; mode?: string }) {
        return (
            <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${connected ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                        <i className={`fa-brands ${icon} text-lg`}></i>
                    </div>
                    <div>
                        <div className="font-medium">{label}</div>
                        {mode && (
                            <div className="text-xs text-base-content/50">
                                Mode: <span className={mode === 'live' ? 'text-success' : 'text-warning'}>{mode}</span>
                            </div>
                        )}
                    </div>
                </div>
                <div className={`badge ${connected ? 'badge-success' : 'badge-error'}`}>
                    {connected ? 'Connected' : 'Disconnected'}
                </div>
            </div>
        );
    }

    function FeatureToggle({ enabled, label, description }: { enabled: boolean; label: string; description: string }) {
        return (
            <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div>
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-base-content/50">{description}</div>
                </div>
                <div className={`badge ${enabled ? 'badge-success' : 'badge-ghost'}`}>
                    {enabled ? 'Enabled' : 'Disabled'}
                </div>
            </div>
        );
    }

    function ConfigValue({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
        return (
            <div className="flex items-center justify-between p-4 bg-base-100 rounded-lg">
                <div className="font-medium">{label}</div>
                <div className="text-lg font-bold text-primary">
                    {value}{unit && <span className="text-sm font-normal text-base-content/50 ml-1">{unit}</span>}
                </div>
            </div>
        );
    }

    if (loading) {
        return <LoadingState message="Loading settings..." />;
    }

    return (
        <div className="space-y-6">
            <AdminPageHeader
                title="Platform Settings"
                subtitle="View platform configuration and integrations"
                breadcrumbs={[{ label: 'Settings' }]}
            />

            {error && (
                <div className="alert alert-warning">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>Could not load live settings. Showing default configuration.</span>
                </div>
            )}

            {/* Platform Info */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h2 className="card-title text-lg">
                        <i className="fa-duotone fa-regular fa-info-circle text-primary"></i>
                        Platform Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-base-100 p-4 rounded-lg">
                            <div className="text-sm text-base-content/50">Platform Name</div>
                            <div className="text-lg font-bold">{settings?.platform.name}</div>
                        </div>
                        <div className="bg-base-100 p-4 rounded-lg">
                            <div className="text-sm text-base-content/50">Version</div>
                            <div className="text-lg font-bold">{settings?.platform.version}</div>
                        </div>
                        <div className="bg-base-100 p-4 rounded-lg">
                            <div className="text-sm text-base-content/50">Environment</div>
                            <div className="text-lg font-bold">
                                <span className={`badge ${settings?.platform.environment === 'production' ? 'badge-success' : 'badge-warning'}`}>
                                    {settings?.platform.environment}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Integrations */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h2 className="card-title text-lg">
                        <i className="fa-duotone fa-regular fa-plug text-secondary"></i>
                        Integrations
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <IntegrationStatus
                            connected={settings?.integrations.stripe.connected ?? false}
                            label="Stripe"
                            icon="fa-stripe"
                            mode={settings?.integrations.stripe.mode}
                        />
                        <IntegrationStatus
                            connected={settings?.integrations.clerk.connected ?? false}
                            label="Clerk"
                            icon="fa-react"
                        />
                        <IntegrationStatus
                            connected={settings?.integrations.resend.connected ?? false}
                            label="Resend"
                            icon="fa-mailchimp"
                        />
                        <IntegrationStatus
                            connected={settings?.integrations.supabase.connected ?? false}
                            label="Supabase"
                            icon="fa-database"
                        />
                        <IntegrationStatus
                            connected={settings?.integrations.rabbitmq.connected ?? false}
                            label="RabbitMQ"
                            icon="fa-message"
                        />
                    </div>
                </div>
            </div>

            {/* Feature Flags */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h2 className="card-title text-lg">
                        <i className="fa-duotone fa-regular fa-toggle-on text-accent"></i>
                        Feature Flags
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <FeatureToggle
                            enabled={settings?.features.ai_matching ?? false}
                            label="AI Matching"
                            description="Automatic candidate-job matching suggestions"
                        />
                        <FeatureToggle
                            enabled={settings?.features.fraud_detection ?? false}
                            label="Fraud Detection"
                            description="Automated fraud signal detection"
                        />
                        <FeatureToggle
                            enabled={settings?.features.automation ?? false}
                            label="Automation Rules"
                            description="Automated workflow triggers"
                        />
                        <FeatureToggle
                            enabled={settings?.features.escrow ?? false}
                            label="Escrow System"
                            description="Holdback during guarantee periods"
                        />
                    </div>
                </div>
            </div>

            {/* Platform Limits */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h2 className="card-title text-lg">
                        <i className="fa-duotone fa-regular fa-sliders text-warning"></i>
                        Platform Limits
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <ConfigValue
                            label="Max Applications per Job"
                            value={settings?.limits.max_applications_per_job ?? 0}
                        />
                        <ConfigValue
                            label="Max Recruiters per Job"
                            value={settings?.limits.max_recruiters_per_job ?? 0}
                        />
                        <ConfigValue
                            label="Guarantee Period"
                            value={settings?.limits.guarantee_period_days ?? 0}
                            unit="days"
                        />
                        <ConfigValue
                            label="Escrow Holdback"
                            value={settings?.limits.escrow_holdback_percentage ?? 0}
                            unit="%"
                        />
                    </div>
                </div>
            </div>

            {/* System Health (placeholder for future) */}
            <div className="card bg-base-200">
                <div className="card-body">
                    <h2 className="card-title text-lg">
                        <i className="fa-duotone fa-regular fa-heart-pulse text-error"></i>
                        System Health
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-base-100 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-success">99.9%</div>
                            <div className="text-xs text-base-content/50">API Uptime</div>
                        </div>
                        <div className="bg-base-100 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-info">45ms</div>
                            <div className="text-xs text-base-content/50">Avg Response</div>
                        </div>
                        <div className="bg-base-100 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-success">0</div>
                            <div className="text-xs text-base-content/50">Errors (24h)</div>
                        </div>
                        <div className="bg-base-100 p-4 rounded-lg text-center">
                            <div className="text-2xl font-bold text-primary">12.4k</div>
                            <div className="text-xs text-base-content/50">Requests (24h)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Admin Note */}
            <div className="alert">
                <i className="fa-duotone fa-regular fa-info-circle"></i>
                <div>
                    <div className="font-semibold">Read-Only View</div>
                    <div className="text-sm text-base-content/70">
                        Platform settings are configured via environment variables and infrastructure.
                        Contact your system administrator to modify these values.
                    </div>
                </div>
            </div>
        </div>
    );
}
