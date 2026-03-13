'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { AdminConfirmModal } from '@/components/shared';
import type { EscrowHold } from './escrow-table';

type ReleaseModalProps = {
    hold: EscrowHold | null;
    onClose: () => void;
    onReleased: () => void;
};

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
}

export function ReleaseModal({ hold, onClose, onReleased }: ReleaseModalProps) {
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);

    async function handleRelease() {
        if (!hold) return;
        setLoading(true);
        try {
            const token = await getToken();
            const gatewayUrl = process.env.NEXT_PUBLIC_ADMIN_GATEWAY_URL ?? 'http://admin-gateway:3030';
            const res = await fetch(`${gatewayUrl}/api/v3/billing/admin/escrow/${hold.id}/release`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) throw new Error('Release failed');
            onReleased();
        } catch {
            // Error handled silently; in production you'd show a toast
        } finally {
            setLoading(false);
        }
    }

    const amount = hold ? formatCurrency(hold.hold_amount) : '';
    const message = hold
        ? `Release escrow hold of ${amount}? This action cannot be undone. The funds will be transferred to the recipient.`
        : '';

    return (
        <AdminConfirmModal
            isOpen={hold !== null}
            onClose={onClose}
            onConfirm={handleRelease}
            title="Release Escrow Hold"
            message={message}
            confirmLabel="Release Funds"
            confirmVariant="warning"
            loading={loading}
        />
    );
}
