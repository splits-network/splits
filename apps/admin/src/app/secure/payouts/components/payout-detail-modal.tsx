'use client';

import { useEffect, useRef } from 'react';
import type { PayoutTransaction, PayoutStatus } from './payout-table';

const STATUS_BADGE: Record<PayoutStatus, string> = {
    pending: 'badge-warning',
    processing: 'badge-info',
    paid: 'badge-success',
    failed: 'badge-error',
    reversed: 'badge-error',
    on_hold: 'badge-ghost',
};

type PayoutDetailModalProps = {
    payout: PayoutTransaction | null;
    onClose: () => void;
};

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex justify-between items-start py-2 border-b border-base-200 last:border-0">
            <span className="text-sm text-base-content/60 font-medium">{label}</span>
            <span className="text-sm text-right max-w-[60%]">{value}</span>
        </div>
    );
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount / 100);
}

export function PayoutDetailModal({ payout, onClose }: PayoutDetailModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (payout) {
            dialog.showModal();
        } else {
            dialog.close();
        }
    }, [payout]);

    if (!payout) return null;

    const status = payout.status as PayoutStatus;

    return (
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box max-w-lg">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-black text-lg">Payout Details</h3>
                    <span className={`badge badge-sm capitalize ${STATUS_BADGE[status] ?? 'badge-ghost'}`}>
                        {payout.status.replace(/_/g, ' ')}
                    </span>
                </div>

                <div className="space-y-1">
                    <DetailRow label="ID" value={<span className="font-mono text-xs">{payout.id}</span>} />
                    <DetailRow label="Recruiter" value={payout.recruiter_name ?? '—'} />
                    <DetailRow
                        label="Email"
                        value={<span className="text-base-content/70">{payout.recruiter_email ?? '—'}</span>}
                    />
                    <DetailRow label="Amount" value={<span className="font-semibold">{formatCurrency(payout.amount)}</span>} />
                    <DetailRow label="Type" value={payout.type?.replace(/_/g, ' ') ?? '—'} />
                    <DetailRow label="Placement ID" value={<span className="font-mono text-xs">{payout.placement_id}</span>} />
                    {payout.stripe_transfer_id && (
                        <DetailRow
                            label="Stripe Transfer"
                            value={<span className="font-mono text-xs">{payout.stripe_transfer_id}</span>}
                        />
                    )}
                    {payout.failure_reason && (
                        <DetailRow
                            label="Failure Reason"
                            value={<span className="text-error">{payout.failure_reason}</span>}
                        />
                    )}
                </div>

                <div className="mt-4 pt-4 border-t border-base-200">
                    <p className="text-xs text-base-content/50 font-semibold uppercase tracking-wide mb-2">Timeline</p>
                    <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                            <span className="text-base-content/60">Created</span>
                            <span>{new Date(payout.created_at).toLocaleString()}</span>
                        </div>
                        {payout.completed_at && (
                            <div className="flex justify-between text-sm">
                                <span className="text-base-content/60">Completed</span>
                                <span>{new Date(payout.completed_at).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-base-content/60">Updated</span>
                            <span>{new Date(payout.updated_at).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <div className="modal-action">
                    <button type="button" className="btn btn-sm btn-ghost" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit">close</button>
            </form>
        </dialog>
    );
}
