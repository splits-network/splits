'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import type { AiModelConfig, AiConfigTestResult } from '@splits-network/shared-types';
import { ConfigEditModal } from './config-edit-modal';

const OPERATION_LABELS: Record<string, string> = {
    fit_review: 'Fit Review',
    resume_extraction: 'Resume Extraction',
    call_summarization: 'Call Summarization',
    resume_generation: 'Resume Generation',
    resume_parsing: 'Resume Parsing',
    embedding: 'Embedding',
    matching_scoring: 'Match Scoring',
};

export function ModelConfigTable() {
    const { getToken } = useAuth();
    const [configs, setConfigs] = useState<AiModelConfig[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState<AiModelConfig | null>(null);
    const [testing, setTesting] = useState<string | null>(null);
    const [testResult, setTestResult] = useState<AiConfigTestResult | null>(null);

    const loadConfigs = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get<{ data: AiModelConfig[] }>('/ai/admin/ai/configs');
            setConfigs(res.data);
        } catch { /* non-critical */ } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => { loadConfigs(); }, [loadConfigs]);

    const handleTest = async (operation: string) => {
        setTesting(operation);
        setTestResult(null);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.post<{ data: AiConfigTestResult }>(`/ai/admin/ai/configs/${operation}/test`, {});
            setTestResult(res.data);
        } catch {
            setTestResult({ success: false, error: 'Test request failed', provider: 'openai', model: '', input_tokens: 0, output_tokens: 0, duration_ms: 0, estimated_cost: 0, response_preview: '' });
        } finally {
            setTesting(null);
        }
    };

    const handleSave = async () => {
        await loadConfigs();
        setEditing(null);
    };

    if (loading) {
        return (
            <div className="card bg-base-100 shadow-sm">
                <div className="card-body">
                    <div className="flex items-center justify-center py-12">
                        <span className="loading loading-spinner loading-md" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="card bg-base-100 shadow-sm">
                <div className="overflow-x-auto">
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th>Operation</th>
                                <th>Provider</th>
                                <th>Model</th>
                                <th>Temp</th>
                                <th>Max Tokens</th>
                                <th>Active</th>
                                <th className="text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {configs.map((config) => (
                                <tr key={config.id}>
                                    <td className="font-medium">{OPERATION_LABELS[config.operation] ?? config.operation}</td>
                                    <td>
                                        <span className={`badge badge-sm ${config.provider === 'openai' ? 'badge-info' : 'badge-warning'}`}>
                                            {config.provider}
                                        </span>
                                    </td>
                                    <td className="font-mono text-xs">{config.model}</td>
                                    <td>{config.temperature ?? '-'}</td>
                                    <td>{config.max_tokens?.toLocaleString() ?? '-'}</td>
                                    <td>
                                        {config.is_active
                                            ? <span className="badge badge-success badge-sm">Active</span>
                                            : <span className="badge badge-ghost badge-sm">Inactive</span>
                                        }
                                    </td>
                                    <td className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-xs"
                                                onClick={() => handleTest(config.operation)}
                                                disabled={testing === config.operation}
                                            >
                                                {testing === config.operation
                                                    ? <span className="loading loading-spinner loading-xs" />
                                                    : <i className="fa-duotone fa-regular fa-flask-vial" />
                                                }
                                                Test
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn-ghost btn-xs"
                                                onClick={() => setEditing(config)}
                                            >
                                                <i className="fa-duotone fa-regular fa-pen-to-square" />
                                                Edit
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {testResult && (
                <div className={`alert mt-4 ${testResult.success ? 'alert-success' : 'alert-error'}`}>
                    <i className={`fa-duotone fa-regular ${testResult.success ? 'fa-check-circle' : 'fa-circle-xmark'}`} />
                    <div>
                        <p className="font-medium">
                            {testResult.success ? 'Test Passed' : 'Test Failed'}
                            {testResult.success && ` - ${testResult.provider}/${testResult.model}`}
                        </p>
                        <p className="text-sm opacity-80">
                            {testResult.success
                                ? `${testResult.input_tokens + testResult.output_tokens} tokens, ${testResult.duration_ms}ms, ~$${testResult.estimated_cost.toFixed(6)}`
                                : testResult.error
                            }
                        </p>
                        {testResult.response_preview && (
                            <p className="text-xs opacity-60 mt-1 truncate max-w-lg">{testResult.response_preview}</p>
                        )}
                    </div>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTestResult(null)}>
                        <i className="fa-duotone fa-regular fa-xmark" />
                    </button>
                </div>
            )}

            {editing && (
                <ConfigEditModal config={editing} onClose={() => setEditing(null)} onSave={handleSave} />
            )}
        </>
    );
}
