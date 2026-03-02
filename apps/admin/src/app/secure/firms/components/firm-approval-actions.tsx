'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminConfirmModal } from '@/components/shared';
import { AdminApiClient } from '@/lib/api-client';
import { useAdminToast } from '@/hooks/use-admin-toast';

type FirmApprovalActionsProps = {
    firmId: string;
    marketplaceVisible: boolean;
    marketplaceApprovedAt: string | null;
    onSuccess: () => void;
};

type ActionConfig = {
    label: string;
    approved: boolean;
    title: string;
    message: string;
    variant: 'primary' | 'warning' | 'error';
    btnClass: string;
};

function getActions(visible: boolean, approvedAt: string | null): ActionConfig[] {
    const actions: ActionConfig[] = [];

    if (visible && !approvedAt) {
        actions.push({
            label: 'Approve',
            approved: true,
            title: 'Approve Firm for Marketplace',
            message: 'This firm will become visible on the public marketplace. Other recruiters and candidates will be able to see their profile.',
            variant: 'primary',
            btnClass: 'btn-primary',
        });
    }

    if (approvedAt) {
        actions.push({
            label: 'Revoke',
            approved: false,
            title: 'Revoke Marketplace Approval',
            message: 'This firm will be removed from the public marketplace. Their profile will no longer be visible to other users.',
            variant: 'warning',
            btnClass: 'btn-warning',
        });
    }

    return actions;
}

export function FirmApprovalActions({ firmId, marketplaceVisible, marketplaceApprovedAt, onSuccess }: FirmApprovalActionsProps) {
    const { getToken } = useAuth();
    const toast = useAdminToast();
    const [pending, setPending] = useState<ActionConfig | null>(null);
    const [loading, setLoading] = useState(false);

    const actions = getActions(marketplaceVisible, marketplaceApprovedAt);

    async function handleConfirm() {
        if (!pending) return;
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');
            const client = new AdminApiClient(token);
            await client.patch(`/network/admin/firms/${firmId}/marketplace-approval`, {
                approved: pending.approved,
            });
            toast.success(`Firm marketplace approval ${pending.approved ? 'granted' : 'revoked'} successfully`);
            onSuccess();
        } catch {
            toast.error('Failed to update firm marketplace approval');
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
                        key={action.label}
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
