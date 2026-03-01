'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminPageHeader, AdminLoadingState } from '@/components/shared';
import { createAuthenticatedClient } from '@/lib/api-client';
import { SettingsForm } from './components/settings-form';

export default function SettingsPage() {
    const { getToken } = useAuth();
    const [settings, setSettings] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const res = await client.get<{ data: Record<string, any> }>('/identity/admin/settings');
                setSettings(res.data ?? res);
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
