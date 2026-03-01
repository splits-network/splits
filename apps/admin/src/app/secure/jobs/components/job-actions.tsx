'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminConfirmModal } from '@/components/shared';
import { AdminApiClient } from '@/lib/api-client';
import { useAdminToast } from '@/hooks/use-admin-toast';

type JobActionsProps = {
    jobId: string;
    currentStatus: string;
    onSuccess: () => void;
};

type ActionConfig = {
    label: string;
    newStatus: string;
    title: string;
    message: string;
    variant: 'primary' | 'warning' | 'error';
    btnClass: string;
};

function getActions(status: string): ActionConfig[] {
    const actions: ActionConfig[] = [];

    if (status === 'draft') {
        actions.push({
            label: 'Activate',
            newStatus: 'active',
            title: 'Activate Job',
            message: 'This job will be made active and visible to recruiters.',
            variant: 'primary',
            btnClass: 'btn-primary',
        });
    }

    if (status === 'active') {
        actions.push({
            label: 'Pause',
            newStatus: 'paused',
            title: 'Pause Job',
            message: 'This job will be paused and hidden from new applicants.',
            variant: 'warning',
            btnClass: 'btn-warning',
        });
        actions.push({
            label: 'Close',
            newStatus: 'closed',
            title: 'Close Job',
            message: 'This job will be closed. No new applications will be accepted.',
            variant: 'error',
            btnClass: 'btn-error btn-outline',
        });
    }

    if (status === 'paused') {
        actions.push({
            label: 'Reopen',
            newStatus: 'active',
            title: 'Reopen Job',
            message: 'This job will be reactivated and visible to recruiters again.',
            variant: 'primary',
            btnClass: 'btn-primary',
        });
    }

    if (status === 'closed') {
        actions.push({
            label: 'Reopen',
            newStatus: 'active',
            title: 'Reopen Job',
            message: 'This job will be reactivated and open for new applications.',
            variant: 'primary',
            btnClass: 'btn-primary',
        });
    }

    return actions;
}

export function JobActions({ jobId, currentStatus, onSuccess }: JobActionsProps) {
    const { getToken } = useAuth();
    const toast = useAdminToast();
    const [pending, setPending] = useState<ActionConfig | null>(null);
    const [loading, setLoading] = useState(false);

    const actions = getActions(currentStatus);

    async function handleConfirm() {
        if (!pending) return;
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = new AdminApiClient(token);
            await client.patch(`/ats/admin/jobs/${jobId}/status`, {
                status: pending.newStatus,
            });
            toast.success(`Job ${pending.label.toLowerCase()}d successfully`);
            onSuccess();
        } catch {
            toast.error('Failed to update job status');
        } finally {
            setLoading(false);
            setPending(null);
        }
    }

    if (actions.length === 0) return null;

    return (
        <>
            <div className="flex items-center gap-1 justify-end">
                {actions.map((action) => (
                    <button
                        key={action.newStatus}
                        type="button"
                        className={`btn btn-xs ${action.btnClass}`}
                        onClick={(e) => { e.stopPropagation(); setPending(action); }}
                    >
                        {action.label}
                    </button>
                ))}
            </div>

            {pending && (
                <AdminConfirmModal
                    isOpen={!!pending}
                    onClose={() => setPending(null)}
                    onConfirm={handleConfirm}
                    title={pending.title}
                    message={pending.message}
                    confirmLabel={pending.label}
                    confirmVariant={pending.variant}
                    loading={loading}
                />
            )}
        </>
    );
}