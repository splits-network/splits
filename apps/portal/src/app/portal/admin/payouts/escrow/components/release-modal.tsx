'use client';

import { useState } from 'react';
import { MarkdownEditor } from '@splits-network/shared-ui';

interface EscrowHold {
    id: string;
    payout_id?: string;
    placement_id: string;
    hold_amount: number;
    holdback_percentage?: number;
    hold_reason: 'guarantee_period' | 'dispute' | 'verification' | 'other';
    release_date: string;
    status: 'active' | 'released' | 'cancelled';
    released_at?: string;
    cancelled_at?: string;
    created_at: string;
    updated_at: string;
}

interface ReleaseModalProps {
    hold: EscrowHold | null;
    onClose: () => void;
    onConfirm: (notes: string) => Promise<void>;
}

export function ReleaseModal({ hold, onClose, onConfirm }: ReleaseModalProps) {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    if (!hold) return null;

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setLoading(true);
        try {
            await onConfirm(notes);
            setNotes('');
            onClose();
        } catch (error) {
            // Error handled by parent
        } finally {
            setLoading(false);
        }
    }

    function handleCancel() {
        setNotes('');
        onClose();
    }

    return (
        <>
            <dialog className="modal modal-open" open>
                <div className="modal-box max-w-2xl">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold">Release Escrow Hold</h3>
                        <button
                            onClick={handleCancel}
                            disabled={loading}
                            className="btn btn-sm btn-circle btn-ghost"
                        >
                            <i className="fa-duotone fa-regular fa-xmark"></i>
                        </button>
                    </div>

                    {/* Hold Details */}
                    <div className="space-y-4 mb-6">
                        <div className="alert alert-warning">
                            <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                            <span>
                                This will release the escrow hold and transfer funds to the recruiter immediately.
                                This action cannot be undone.
                            </span>
                        </div>

                        <div className="card bg-base-200">
                            <div className="card-body">
                                <h4 className="font-semibold mb-3">Hold Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-base-content/60">Hold ID</p>
                                        <p className="font-mono">{hold.id.substring(0, 8)}...</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-base-content/60">Amount</p>
                                        <p className="text-xl font-bold text-success">
                                            ${hold.hold_amount.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-base-content/60">Holdback Percentage</p>
                                        <p className="font-semibold">{hold.holdback_percentage}%</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-base-content/60">Scheduled Release</p>
                                        <p>{new Date(hold.release_date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-base-content/60">Placement ID</p>
                                        <p className="font-mono">{hold.placement_id?.substring(0, 8)}...</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-base-content/60">Status</p>
                                        <span className="badge badge-warning">{hold.status}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                        <MarkdownEditor
                            className="fieldset"
                            label="Release Notes (Optional)"
                            value={notes}
                            onChange={setNotes}
                            placeholder="Enter reason for early release (e.g., 'Candidate completed guarantee period early')"
                            helperText="Optional notes will be recorded in the audit log"
                            height={160}
                            preview="edit"
                            disabled={loading}
                        />

                        {/* Actions */}
                        <div className="modal-action">
                            <button
                                type="button"
                                onClick={handleCancel}
                                disabled={loading}
                                className="btn"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-success"
                            >
                                {loading ? (
                                    <>
                                        <span className="loading loading-spinner loading-sm"></span>
                                        Releasing...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-lock-open"></i>
                                        Release ${hold.hold_amount.toLocaleString()}
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop" onClick={handleCancel}>
                    <button type="button">close</button>
                </form>
            </dialog>
        </>
    );
}
