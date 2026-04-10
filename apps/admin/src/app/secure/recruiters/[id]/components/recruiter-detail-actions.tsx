'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminConfirmModal } from '@/components/shared';
import { AdminApiClient } from '@/lib/api-client';
import { useAdminToast } from '@/hooks/use-admin-toast';

type Status = 'pending' | 'active' | 'suspended' | 'inactive';

type Props = {
    recruiterId: string;
    currentStatus: Status;
    onSuccess: () => void;
};

type ActionConfig = {
    label: string;
    newStatus: Status;
    title: string;
    message: string;
    variant: 'primary' | 'warning' | 'error';
    btnClass: string;
};

function getActions(status: Status): ActionConfig[] {
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

    if (status !== 'inactive') {
        actions.push({
            label: 'Deactivate',
            newStatus: 'inactive',
            title: 'Deactivate Recruiter',
            message: 'This recruiter will be deactivated. This is a soft-delete.',
            variant: 'error',
            btnClass: 'btn-error btn-outline',
        });
    }

    return actions;
}

export function RecruiterActions({ recruiterId, currentStatus, onSuccess }: Props) {
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
            await client.patch(`/network/admin/recruiters/${recruiterId}/status`, {
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
            <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-sm btn-ghost">
                    <i className="fa-duotone fa-regular fa-ellipsis-vertical" />
                </div>
                <ul tabIndex={0} className="dropdown-content z-10 menu p-2 shadow-lg bg-base-100 rounded-box w-48 border border-base-200">
                    {actions.map((action) => (
                        <li key={action.newStatus}>
                            <button type="button" onClick={() => setPending(action)}>
                                {action.label}
                            </button>
                        </li>
                    ))}
                </ul>
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
