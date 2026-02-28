'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminConfirmModal } from '@/components/shared';
import { AdminApiClient } from '@/lib/api-client';
import { useAdminToast } from '@/hooks/use-admin-toast';

type RecruiterStatus = 'pending' | 'active' | 'suspended';

type RecruiterActionsProps = {
    recruiterId: string;
    currentStatus: RecruiterStatus;
    onSuccess: () => void;
};

type ActionConfig = {
    label: string;
    newStatus: RecruiterStatus;
    title: string;
    message: string;
    variant: 'primary' | 'warning' | 'error';
    btnClass: string;
};

function getActions(status: RecruiterStatus): ActionConfig[] {
    const actions: ActionConfig[] = [];

    if (status === 'pending' || status === 'suspended') {
        actions.push({
            label: 'Approve',
            newStatus: 'active',
            title: 'Approve Recruiter',
            message: 'This recruiter will be activated and can access the platform.',
            variant: 'primary',
            btnClass: 'btn-primary',
        });
    }

    if (status === 'active') {
        actions.push({
            label: 'Suspend',
            newStatus: 'suspended',
            title: 'Suspend Recruiter',
            message: 'This recruiter will be suspended and lose platform access.',
            variant: 'warning',
            btnClass: 'btn-warning',
        });
    }

    return actions;
}

export function RecruiterActions({ recruiterId, currentStatus, onSuccess }: RecruiterActionsProps) {
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
            await client.patch(`/admin/network/admin/recruiters/${recruiterId}/status`, {
                status: pending.newStatus,
            });
            toast.success(`Recruiter ${pending.label.toLowerCase()}d successfully`);
            onSuccess();
        } catch {
            toast.error('Failed to update recruiter status');
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
                        onClick={() => setPending(action)}
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
