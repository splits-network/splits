'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminPageHeader, AdminLoadingState } from '@/components/shared';
import { SettingsForm } from './components/settings-form';

export default function SettingsPage() {
    const { getToken } = useAuth();
    const [settings, setSettings] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const token = await getToken();
                const gatewayUrl = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL ?? 'http://admin-gateway:3030';
                const res = await fetch(`${gatewayUrl}/api/v2/identity/admin/settings`, {
                    headers: { Authorization: `Bearer ${token ?? ''}` },
                });
                if (res.ok) {
                    const json = await res.json();
                    setSettings(json.data ?? json);
                }
            } catch {
                // Use defaults if endpoint not available
            } finally {
                setLoading(false);
            }
        }
        load();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            <AdminPageHeader
                title="Platform Settings"
                subtitle="Configure platform-wide settings"
            />

            {loading ? (
                <AdminLoadingState />
            ) : (
                <SettingsForm initialSettings={settings ?? undefined} />
            )}
        </div>
    );
}
