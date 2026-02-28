'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useAdminToast } from '@/hooks/use-admin-toast';

type FeatureFlags = {
    ai_matching: boolean;
    fraud_detection: boolean;
    automation: boolean;
    escrow: boolean;
};

type GeneralSettings = {
    platform_name: string;
    support_email: string;
    maintenance_mode: boolean;
};

type SettingsState = {
    general: GeneralSettings;
    features: FeatureFlags;
};

const DEFAULT_SETTINGS: SettingsState = {
    general: {
        platform_name: 'Splits Network',
        support_email: 'support@splits.network',
        maintenance_mode: false,
    },
    features: {
        ai_matching: true,
        fraud_detection: true,
        automation: false,
        escrow: true,
    },
};

type SettingsFormProps = {
    initialSettings?: Partial<SettingsState>;
};

export function SettingsForm({ initialSettings }: SettingsFormProps) {
    const { getToken } = useAuth();
    const toast = useAdminToast();
    const [settings, setSettings] = useState<SettingsState>({
        ...DEFAULT_SETTINGS,
        ...initialSettings,
        general: { ...DEFAULT_SETTINGS.general, ...initialSettings?.general },
        features: { ...DEFAULT_SETTINGS.features, ...initialSettings?.features },
    });
    const [saving, setSaving] = useState(false);

    function updateGeneral<K extends keyof GeneralSettings>(key: K, value: GeneralSettings[K]) {
        setSettings((prev) => ({ ...prev, general: { ...prev.general, [key]: value } }));
    }

    function updateFeature<K extends keyof FeatureFlags>(key: K, value: boolean) {
        setSettings((prev) => ({ ...prev, features: { ...prev.features, [key]: value } }));
    }

    async function handleSave() {
        setSaving(true);
        try {
            const token = await getToken();
            const gatewayUrl = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL ?? 'http://admin-gateway:3020';
            await fetch(`${gatewayUrl}/admin/settings`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(settings),
            });
            toast.success('Settings saved successfully');
        } catch {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-6">
            {/* General */}
            <div className="card bg-base-100 border border-base-200">
                <div className="card-body">
                    <h2 className="card-title text-base">General</h2>
                    <fieldset className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Platform Name</span>
                            </label>
                            <input
                                type="text"
                                className="input input-sm input-bordered w-full max-w-sm"
                                value={settings.general.platform_name}
                                onChange={(e) => updateGeneral('platform_name', e.target.value)}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">Support Email</span>
                            </label>
                            <input
                                type="email"
                                className="input input-sm input-bordered w-full max-w-sm"
                                value={settings.general.support_email}
                                onChange={(e) => updateGeneral('support_email', e.target.value)}
                            />
                        </div>
                        <div className="form-control">
                            <label className="label cursor-pointer justify-start gap-3">
                                <input
                                    type="checkbox"
                                    className="toggle toggle-sm toggle-warning"
                                    checked={settings.general.maintenance_mode}
                                    onChange={(e) => updateGeneral('maintenance_mode', e.target.checked)}
                                />
                                <div>
                                    <span className="label-text font-medium">Maintenance Mode</span>
                                    <p className="text-xs text-base-content/50">
                                        Show maintenance page to non-admin users
                                    </p>
                                </div>
                            </label>
                        </div>
                    </fieldset>
                </div>
            </div>

            {/* Features */}
            <div className="card bg-base-100 border border-base-200">
                <div className="card-body">
                    <h2 className="card-title text-base">Feature Flags</h2>
                    <fieldset className="space-y-3">
                        {(Object.keys(settings.features) as (keyof FeatureFlags)[]).map((flag) => (
                            <div key={flag} className="form-control">
                                <label className="label cursor-pointer justify-start gap-3">
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-sm toggle-primary"
                                        checked={settings.features[flag]}
                                        onChange={(e) => updateFeature(flag, e.target.checked)}
                                    />
                                    <span className="label-text capitalize">
                                        {flag.replace(/_/g, ' ')}
                                    </span>
                                </label>
                            </div>
                        ))}
                    </fieldset>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleSave}
                    disabled={saving}
                >
                    {saving && <span className="loading loading-spinner loading-xs" />}
                    Save Settings
                </button>
            </div>
        </div>
    );
}
