"use client";

import {
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
} from "@splits-network/basel-ui";

type TransactionStatus =
    | "pending"
    | "processing"
    | "paid"
    | "failed"
    | "reversed"
    | "on_hold";

type PayoutRole =
    | "candidate_recruiter"
    | "company_recruiter"
    | "job_owner"
    | "candidate_sourcer"
    | "company_sourcer";

interface PayoutTransaction {
    id: string;
    placement_split_id: string;
    placement_id: string;
    recruiter_id: string;
    amount: number;
    status: TransactionStatus;
    stripe_transfer_id?: string;
    stripe_payout_id?: string;
    stripe_connect_account_id?: string;
    created_at: string;
    updated_at: string;
    processing_started_at?: string;
    completed_at?: string;
    failed_at?: string;
    failure_reason?: string;
    retry_count: number;
    recruiter_name?: string;
    recruiter_email?: string;
    candidate_name?: string;
    company_name?: string;
    job_title?: string;
    salary?: number;
    fee_amount?: number;
    placement_state?: string;
    split_role?: PayoutRole;
    split_percentage?: number;
}

const ROLE_LABELS: Record<PayoutRole, string> = {
    candidate_recruiter: "Candidate Recruiter",
    company_recruiter: "Company Recruiter",
    job_owner: "Job Owner",
    candidate_sourcer: "Candidate Sourcer",
    company_sourcer: "Company Sourcer",
};

function StatusBadge({ status }: { status: TransactionStatus }) {
    const colors: Record<string, string> = {
        pending: "badge-warning",
        processing: "badge-info",
        paid: "badge-success",
        failed: "badge-error",
        reversed: "badge-primary",
        on_hold: "badge-primary",
    };
    const icons: Record<string, string> = {
        pending: "fa-clock",
        processing: "fa-spinner fa-spin",
        paid: "fa-check",
        failed: "fa-xmark",
        reversed: "fa-rotate-left",
        on_hold: "fa-pause",
    };
    return (
        <span className={`badge ${colors[status] || "badge-primary"} gap-1`}>
            <i className={`fa-duotone fa-regular ${icons[status]}`}></i>
            {status}
        </span>
    );
}

function DetailRow({
    label,
    value,
    mono,
}: {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
}) {
    return (
        <div className="flex justify-between items-start py-2 border-b border-base-200 last:border-b-0">
            <span className="text-sm text-base-content/60 shrink-0">
                {label}
            </span>
            <span className={`text-sm text-right ${mono ? "font-mono" : ""}`}>
                {value || <span className="text-base-content/30">—</span>}
            </span>
        </div>
    );
}

interface PayoutDetailModalProps {
    transaction: PayoutTransaction | null;
    onClose: () => void;
    onProcess?: (id: string) => void;
    processing?: boolean;
}

export function PayoutDetailModal({
    transaction,
    onClose,
    onProcess,
    processing,
}: PayoutDetailModalProps) {
    if (!transaction) return null;

    const iconColor =
        transaction.status === "paid"
            ? "success"
            : transaction.status === "failed"
              ? "error"
              : transaction.status === "processing"
                ? "info"
                : "warning";

    return (
        <BaselModal
            isOpen={!!transaction}
            onClose={onClose}
            maxWidth="max-w-xl"
        >
            <BaselModalHeader
                title="Payout Transaction"
                subtitle={`${transaction.recruiter_name || "Unknown Recruiter"} · $${(transaction.amount || 0).toLocaleString()}`}
                icon="fa-money-bill-transfer"
                iconColor={iconColor}
                onClose={onClose}
            />
            <BaselModalBody>
                <div className="space-y-5">
                    {/* Status */}
                    <div className="flex items-center gap-3">
                        <StatusBadge status={transaction.status} />
                        {transaction.retry_count > 0 && (
                            <span className="badge badge-ghost badge-sm gap-1">
                                <i className="fa-duotone fa-regular fa-rotate"></i>
                                {transaction.retry_count}{" "}
                                {transaction.retry_count === 1
                                    ? "retry"
                                    : "retries"}
                            </span>
                        )}
                    </div>

                    {/* Failure reason */}
                    {transaction.failure_reason && (
                        <div className="bg-error/10 border-l-4 border-error px-4 py-3">
                            <p className="text-sm font-semibold text-error mb-1">
                                Failure Reason
                            </p>
                            <p className="text-sm text-error/80">
                                {transaction.failure_reason}
                            </p>
                        </div>
                    )}

                    {/* Recruiter Section */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-2">
                            Recruiter
                        </h4>
                        <div className="bg-base-200/50 rounded-lg px-4 py-1">
                            <DetailRow
                                label="Name"
                                value={transaction.recruiter_name}
                            />
                            <DetailRow
                                label="Email"
                                value={transaction.recruiter_email}
                            />
                            <DetailRow
                                label="Role"
                                value={
                                    transaction.split_role
                                        ? ROLE_LABELS[transaction.split_role]
                                        : null
                                }
                            />
                            <DetailRow
                                label="Split"
                                value={
                                    transaction.split_percentage
                                        ? `${transaction.split_percentage}%`
                                        : null
                                }
                            />
                            <DetailRow
                                label="Payout Amount"
                                value={`$${(transaction.amount || 0).toLocaleString()}`}
                            />
                        </div>
                    </div>

                    {/* Placement Section */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-2">
                            Placement
                        </h4>
                        <div className="bg-base-200/50 rounded-lg px-4 py-1">
                            <DetailRow
                                label="Candidate"
                                value={transaction.candidate_name}
                            />
                            <DetailRow
                                label="Company"
                                value={transaction.company_name}
                            />
                            <DetailRow
                                label="Job Title"
                                value={transaction.job_title}
                            />
                            <DetailRow
                                label="Salary"
                                value={
                                    transaction.salary
                                        ? `$${Number(transaction.salary).toLocaleString()}`
                                        : null
                                }
                            />
                            <DetailRow
                                label="Fee"
                                value={
                                    transaction.fee_amount
                                        ? `$${Number(transaction.fee_amount).toLocaleString()}`
                                        : null
                                }
                            />
                            <DetailRow
                                label="Status"
                                value={transaction.placement_state}
                            />
                        </div>
                    </div>

                    {/* Stripe Section */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-2">
                            Stripe
                        </h4>
                        <div className="bg-base-200/50 rounded-lg px-4 py-1">
                            <DetailRow
                                label="Transfer ID"
                                value={transaction.stripe_transfer_id}
                                mono
                            />
                            <DetailRow
                                label="Payout ID"
                                value={transaction.stripe_payout_id}
                                mono
                            />
                            <DetailRow
                                label="Connect Account"
                                value={transaction.stripe_connect_account_id}
                                mono
                            />
                        </div>
                    </div>

                    {/* Timestamps Section */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-2">
                            Timeline
                        </h4>
                        <div className="bg-base-200/50 rounded-lg px-4 py-1">
                            <DetailRow
                                label="Created"
                                value={new Date(
                                    transaction.created_at,
                                ).toLocaleString()}
                            />
                            {transaction.processing_started_at && (
                                <DetailRow
                                    label="Processing Started"
                                    value={new Date(
                                        transaction.processing_started_at,
                                    ).toLocaleString()}
                                />
                            )}
                            {transaction.completed_at && (
                                <DetailRow
                                    label="Completed"
                                    value={new Date(
                                        transaction.completed_at,
                                    ).toLocaleString()}
                                />
                            )}
                            {transaction.failed_at && (
                                <DetailRow
                                    label="Failed"
                                    value={new Date(
                                        transaction.failed_at,
                                    ).toLocaleString()}
                                />
                            )}
                            <DetailRow
                                label="Last Updated"
                                value={new Date(
                                    transaction.updated_at,
                                ).toLocaleString()}
                            />
                        </div>
                    </div>

                    {/* IDs Section */}
                    <div>
                        <h4 className="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-2">
                            References
                        </h4>
                        <div className="bg-base-200/50 rounded-lg px-4 py-1">
                            <DetailRow
                                label="Transaction ID"
                                value={transaction.id}
                                mono
                            />
                            <DetailRow
                                label="Placement ID"
                                value={transaction.placement_id}
                                mono
                            />
                            <DetailRow
                                label="Split ID"
                                value={transaction.placement_split_id}
                                mono
                            />
                            <DetailRow
                                label="Recruiter ID"
                                value={transaction.recruiter_id}
                                mono
                            />
                        </div>
                    </div>
                </div>
            </BaselModalBody>
            <BaselModalFooter align="between">
                <button className="btn btn-ghost btn-sm" onClick={onClose}>
                    Close
                </button>
                {transaction.status === "pending" && onProcess && (
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() => onProcess(transaction.id)}
                        disabled={processing}
                    >
                        {processing ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <>
                                <i className="fa-duotone fa-regular fa-play"></i>
                                Process Payout
                            </>
                        )}
                    </button>
                )}
            </BaselModalFooter>
        </BaselModal>
    );
}
