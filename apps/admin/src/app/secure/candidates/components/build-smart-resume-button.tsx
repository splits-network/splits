'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminApiClient } from '@/lib/api-client';
import { useAdminToast } from '@/hooks/use-admin-toast';

type BuildSmartResumeButtonProps = {
    candidateId: string;
    onSuccess: () => void;
};

export function BuildSmartResumeButton({ candidateId, onSuccess }: BuildSmartResumeButtonProps) {
    const { getToken } = useAuth();
    const toast = useAdminToast();
    const [loading, setLoading] = useState(false);

    async function handleBuild(e: React.MouseEvent) {
        e.stopPropagation();
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = new AdminApiClient(token);
            await client.post('/ai/admin/smart-resume/auto-parse', {
                candidate_id: candidateId,
            });
            toast.success('Smart Resume built successfully');
            onSuccess();
        } catch (err: any) {
            const message = err?.response?.data?.error?.message
                || err?.message
                || 'Failed to build Smart Resume';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <button
            type="button"
            className="btn btn-primary btn-xs"
            onClick={handleBuild}
            disabled={loading}
        >
            {loading ? (
                <>
                    <span className="loading loading-spinner loading-xs" />
                    Building...
                </>
            ) : (
                <>
                    <i className="fa-duotone fa-regular fa-wand-magic-sparkles" />
                    Build Smart Resume
                </>
            )}
        </button>
    );
}
