'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getSyncStatusBadge } from '@/lib/utils/badge-styles';
import { ApiClient } from '@/lib/api-client';

interface ATSIntegration {
    id: string;
    company_id: string;
    platform: string;
    api_base_url: string | null;
    webhook_url: string | null;
    sync_enabled: boolean;
    sync_roles: boolean;
    sync_candidates: boolean;
    sync_applications: boolean;
    last_sync_at: string | null;
    created_at: string;
    updated_at: string;
    config: any;
}

interface SyncLog {
    id: string;
    integration_id: string;
    entity_type: string;
    entity_id: string | null;
    action: string;
    direction: 'inbound' | 'outbound';
    status: 'success' | 'failed' | 'pending' | 'conflict';
    external_id: string | null;
    error_message: string | null;
    metadata: any;
    synced_at: string;
    retry_count: number;
}

export default function IntegrationDetailPage() {
    const router = useRouter();
    const params = useParams();
    const integrationId = params.id as string;

    const [integration, setIntegration] = useState<ATSIntegration | null>(null);
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'logs'>('overview');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        sync_enabled: true,
        sync_roles: true,
        sync_candidates: true,
        sync_applications: true,
        webhook_url: '',
    });

    useEffect(() => {
        loadIntegration();
        loadLogs();
    }, [integrationId]);

    useEffect(() => {
        if (integration) {
            setFormData({
                sync_enabled: integration.sync_enabled,
                sync_roles: integration.sync_roles,
                sync_candidates: integration.sync_candidates,
                sync_applications: integration.sync_applications,
                webhook_url: integration.webhook_url || '',
            });
        }
    }, [integration]);

    const loadIntegration = async () => {
        try {
            setLoading(true);
            setError(null);

            const apiClient = new ApiClient();
            const data = await apiClient.get(`/api/integrations/${integrationId}`);
            setIntegration(data);
        } catch (err: any) {
            console.error('Failed to load integration:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async () => {
        try {
            const apiClient = new ApiClient();
            const data = await apiClient.get(`/api/integrations/${integrationId}/logs?limit=100`);
            setLogs(data.logs || []);
        } catch (err: any) {
            console.error('Failed to load logs:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            setError(null);

            const apiClient = new ApiClient();
            const updated = await apiClient.patch(`/api/integrations/${integrationId}`, formData);
            setIntegration(updated);
            alert('Settings saved successfully');
        } catch (err: any) {
            console.error('Failed to save settings:', err);
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    const triggerSync = async (direction: 'inbound' | 'outbound') => {
        try {
            const apiClient = new ApiClient();
            await apiClient.post(`/api/integrations/${integrationId}/sync`, { direction });

            alert(`${direction === 'inbound' ? 'Import' : 'Export'} sync triggered`);
            await loadLogs();
        } catch (err: any) {
            console.error('Failed to trigger sync:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const testConnection = async () => {
        try {
            const apiClient = new ApiClient();
            const result = await apiClient.post(`/api/integrations/${integrationId}/test`);

            if (result.success) {
                alert('Connection test successful!');
            } else {
                alert(`Connection test failed: ${result.error}`);
            }
        } catch (err: any) {
            console.error('Connection test failed:', err);
            alert(`Error: ${err.message}`);
        }
    };

    const deleteIntegration = async () => {
        if (!confirm('Are you sure you want to delete this integration? This cannot be undone.')) {
            return;
        }

        try {
            const apiClient = new ApiClient();
            await apiClient.delete(`/api/integrations/${integrationId}`);

            router.push('/integrations');
        } catch (err: any) {
            console.error('Failed to delete integration:', err);
            alert(`Error: ${err.message}`);
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    if (!integration) {
        return (
            <div className="container mx-auto p-6">
                <div className="alert alert-error">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>Integration not found</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <Link href="/integrations" className="btn btn-ghost btn-circle">
                    <i className="fa-solid fa-arrow-left"></i>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold capitalize">{integration.platform} Integration</h1>
                    <p className="text-base-content/70 mt-1">
                        Manage synchronization settings and view sync history
                    </p>
                </div>
                <div className="badge badge-lg {integration.sync_enabled ? 'badge-success' : 'badge-neutral'}">
                    {integration.sync_enabled ? 'Active' : 'Paused'}
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="alert alert-error mb-6">
                    <i className="fa-solid fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {/* Tabs */}
            <div className="tabs tabs-bordered mb-6">
                <button
                    className={`tab ${activeTab === 'overview' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    Overview
                </button>
                <button
                    className={`tab ${activeTab === 'settings' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('settings')}
                >
                    Settings
                </button>
                <button
                    className={`tab ${activeTab === 'logs' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    Sync Logs
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Quick Actions */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Quick Actions</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <button className="btn btn-primary" onClick={() => triggerSync('inbound')}>
                                    <i className="fa-solid fa-download"></i>
                                    Import from {integration.platform}
                                </button>
                                <button className="btn btn-secondary" onClick={() => triggerSync('outbound')}>
                                    <i className="fa-solid fa-upload"></i>
                                    Export to {integration.platform}
                                </button>
                                <button className="btn btn-ghost" onClick={testConnection}>
                                    <i className="fa-solid fa-circle-check"></i>
                                    Test Connection
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Integration Info */}
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title">Integration Details</h2>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-base-content/70">Platform:</span>
                                    <span className="font-medium capitalize">{integration.platform}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base-content/70">Status:</span>
                                    <span className={integration.sync_enabled ? 'text-success' : 'text-base-content/50'}>
                                        {integration.sync_enabled ? 'Active' : 'Paused'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base-content/70">Last Sync:</span>
                                    <span>
                                        {integration.last_sync_at
                                            ? new Date(integration.last_sync_at).toLocaleString()
                                            : 'Never'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-base-content/70">Created:</span>
                                    <span>{new Date(integration.created_at).toLocaleString()}</span>
                                </div>
                                {integration.webhook_url && (
                                    <div className="flex justify-between">
                                        <span className="text-base-content/70">Webhook URL:</span>
                                        <span className="font-mono text-sm truncate max-w-xs">{integration.webhook_url}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div className="card bg-base-100 shadow">
                    <form onSubmit={handleSubmit} className="card-body">
                        <h2 className="card-title mb-4">Sync Settings</h2>

                        {/* Sync Enabled */}
                        <div className="fieldset">
                            <label className="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={formData.sync_enabled}
                                    onChange={(e) => setFormData({ ...formData, sync_enabled: e.target.checked })}
                                />
                                <div>
                                    <span className="label-text font-medium">Enable Synchronization</span>
                                    <p className="text-sm text-base-content/60">Turn on/off all sync operations</p>
                                </div>
                            </label>
                        </div>

                        <div className="divider"></div>

                        {/* Sync Options */}
                        <h3 className="font-semibold mb-2">What to Sync</h3>

                        <div className="fieldset">
                            <label className="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={formData.sync_roles}
                                    onChange={(e) => setFormData({ ...formData, sync_roles: e.target.checked })}
                                    disabled={!formData.sync_enabled}
                                />
                                <div>
                                    <span className="label-text font-medium">Job Roles</span>
                                    <p className="text-sm text-base-content/60">Import open positions from {integration.platform}</p>
                                </div>
                            </label>
                        </div>

                        <div className="fieldset">
                            <label className="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={formData.sync_candidates}
                                    onChange={(e) => setFormData({ ...formData, sync_candidates: e.target.checked })}
                                    disabled={!formData.sync_enabled}
                                />
                                <div>
                                    <span className="label-text font-medium">Candidates</span>
                                    <p className="text-sm text-base-content/60">Export submitted candidates to {integration.platform}</p>
                                </div>
                            </label>
                        </div>

                        <div className="fieldset">
                            <label className="label cursor-pointer justify-start gap-4">
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={formData.sync_applications}
                                    onChange={(e) => setFormData({ ...formData, sync_applications: e.target.checked })}
                                    disabled={!formData.sync_enabled}
                                />
                                <div>
                                    <span className="label-text font-medium">Applications</span>
                                    <p className="text-sm text-base-content/60">Sync application status and updates</p>
                                </div>
                            </label>
                        </div>

                        <div className="divider"></div>

                        {/* Webhook URL */}
                        <div className="fieldset">
                            <label className="label">Webhook URL (Optional)</label>
                            <input
                                type="url"
                                className="input"
                                value={formData.webhook_url}
                                onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
                                placeholder={`https://api.splits.network/webhooks/${integration.platform}/${integrationId}`}
                            />
                            <label className="label">
                                <span className="label-text-alt">Configure this URL in your {integration.platform} account to receive real-time updates</span>
                            </label>
                        </div>

                        {/* Actions */}
                        <div className="card-actions justify-between mt-6">
                            <button
                                type="button"
                                className="btn btn-error btn-outline"
                                onClick={deleteIntegration}
                            >
                                Delete Integration
                            </button>
                            <button type="submit" className="btn btn-primary" disabled={saving}>
                                {saving ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-save"></i>
                                        Save Settings
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title mb-4">Sync History</h2>

                        {logs.length === 0 ? (
                            <div className="text-center py-8 text-base-content/60">
                                <i className="fa-solid fa-inbox text-4xl mb-4"></i>
                                <p>No sync logs yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Time</th>
                                            <th>Entity</th>
                                            <th>Action</th>
                                            <th>Direction</th>
                                            <th>Status</th>
                                            <th>Details</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {logs.map((log) => (
                                            <tr key={log.id}>
                                                <td className="text-sm">
                                                    {new Date(log.synced_at).toLocaleString()}
                                                </td>
                                                <td>
                                                    <div className="badge badge-sm">{log.entity_type}</div>
                                                </td>
                                                <td className="text-sm">{log.action}</td>
                                                <td>
                                                    <i className={`fa-solid ${log.direction === 'inbound' ? 'fa-download' : 'fa-upload'}`}></i>
                                                    {' '}{log.direction}
                                                </td>
                                                <td>
                                                    <div className={`badge badge-sm ${getSyncStatusBadge(log.status)}`}>
                                                        {log.status}
                                                    </div>
                                                </td>
                                                <td className="text-sm">
                                                    {log.error_message && (
                                                        <span className="text-error" title={log.error_message}>
                                                            <i className="fa-solid fa-circle-exclamation"></i>
                                                        </span>
                                                    )}
                                                    {log.retry_count > 0 && (
                                                        <span className="text-warning ml-2">
                                                            Retry {log.retry_count}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
