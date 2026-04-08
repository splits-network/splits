'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminApiClient } from '@/lib/api-client';
import { useAdminToast } from '@/hooks/use-admin-toast';

type GenerateTailoredResumeButtonProps = {
    applicationId: string;
    onSuccess: () => void;
};

export function GenerateTailoredResumeButton({ applicationId, onSuccess }: GenerateTailoredResumeButtonProps) {
    const { getToken } = useAuth();
    const toast = useAdminToast();
    const [loading, setLoading] = useState(false);

    async function handleGenerate(e: React.MouseEvent) {
        e.stopPropagation();
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = new AdminApiClient(token);
            await client.post('/ai/admin/ai/generate-and-review', {
                application_id: applicationId,
            });
            toast.success('Tailored resume generated and AI review updated');
            onSuccess();
        } catch (err: any) {
            const message = err?.response?.data?.error?.message
                || err?.message
                || 'Failed to generate tailored resume';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            className="btn btn-accent btn-xs"
            onClick={handleGenerate}
            disabled={loading}
        >
            {loading ? (
                <>
                    <span className="loading loading-spinner loading-xs" />
                    Generating...
                </>
            ) : (
                <>
                    <i className="fa-duotone fa-regular fa-file-user" />
                    Generate Tailored Resume
                </>
            )}
        </button>
    );
}
