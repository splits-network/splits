'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createAuthenticatedClient } from '@/lib/api-client';
import type { AiModelConfig, AiProvider } from '@splits-network/shared-types';

const PROVIDERS: AiProvider[] = ['openai', 'anthropic'];

const MODEL_OPTIONS: Record<AiProvider, string[]> = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'text-embedding-3-small'],
    anthropic: ['claude-sonnet-4-5-20250514', 'claude-3-5-haiku-20241022'],
};

interface ConfigEditModalProps {
    config: AiModelConfig;
    onClose: () => void;
    onSave: () => void;
}

export function ConfigEditModal({ config, onClose, onSave }: ConfigEditModalProps) {
    const { getToken } = useAuth();
    const [provider, setProvider] = useState<AiProvider>(config.provider);
    const [model, setModel] = useState(config.model);
    const [temperature, setTemperature] = useState(config.temperature?.toString() ?? '');
    const [maxTokens, setMaxTokens] = useState(config.max_tokens?.toString() ?? '');
    const [isActive, setIsActive] = useState(config.is_active);
    const [notes, setNotes] = useState(config.notes ?? '');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            await client.patch(`/ai/admin/ai/configs/${config.operation}`, {
                provider,
                model,
                temperature: temperature ? parseFloat(temperature) : null,
                max_tokens: maxTokens ? parseInt(maxTokens) : null,
                is_active: isActive,
                notes: notes || null,
            });

            onSave();
        } catch (err: any) {
            setError(err?.message ?? 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const models = MODEL_OPTIONS[provider] ?? [];

    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">
                    Edit Configuration: {config.operation.replace(/_/g, ' ')}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Provider</legend>
                        <select
                            className="select select-bordered w-full"
                            value={provider}
                            onChange={(e) => {
                                const newProvider = e.target.value as AiProvider;
                                setProvider(newProvider);
                                const opts = MODEL_OPTIONS[newProvider] ?? [];
                                if (opts.length && !opts.includes(model)) setModel(opts[0]);
                            }}
                        >
                            {PROVIDERS.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Model</legend>
                        <select
                            className="select select-bordered w-full"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                        >
                            {models.map((m) => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                        <p className="text-xs text-base-content/50 mt-1">Or type a custom model ID</p>
                        <input
                            type="text"
                            className="input input-bordered input-sm w-full mt-1"
                            placeholder="Custom model ID"
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                        />
                    </fieldset>

                    <div className="grid grid-cols-2 gap-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Temperature</legend>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                min="0" max="2" step="0.1"
                                value={temperature}
                                onChange={(e) => setTemperature(e.target.value)}
                                placeholder="e.g. 0.3"
                            />
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Max Tokens</legend>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                min="1"
                                value={maxTokens}
                                onChange={(e) => setMaxTokens(e.target.value)}
                                placeholder="e.g. 4000"
                            />
                        </fieldset>
                    </div>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Notes</legend>
                        <textarea
                            className="textarea textarea-bordered w-full"
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional notes about this configuration"
                        />
                    </fieldset>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            className="toggle toggle-primary"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                        />
                        <span className="text-sm">Active</span>
                    </label>

                    {error && (
                        <div className="alert alert-error text-sm">{error}</div>
                    )}

                    <div className="modal-action">
                        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? <span className="loading loading-spinner loading-sm" /> : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="button" onClick={onClose}>close</button>
            </form>
        </dialog>
    );
}
