"use client";

import Link from "next/link";
import { useStripeConnectStatus } from "@/hooks/use-stripe-connect-status";
import { LoadingState } from "@splits-network/shared-ui";

interface ConnectStatusCardProps {
    variant?: "full" | "compact";
    showActions?: boolean;
    className?: string;
    onAction?: () => void;
}

export function ConnectStatusCard({
    variant = "full",
    showActions = true,
    className = "",
    onAction,
}: ConnectStatusCardProps) {
    const {
        loading,
        status,
        onboarded,
        openDashboard,
    } = useStripeConnectStatus();

    if (loading) {
        return (
            <div
                className={`card bg-base-100 shadow ${className}`}
            >
                <div className="card-body">
                    <LoadingState message="Loading payout status..." />
                </div>
            </div>
        );
    }

    if (variant === "compact") {
        return (
            <CompactCard
                status={status}
                showActions={showActions}
                onOpenDashboard={openDashboard}
                onAction={onAction}
                className={className}
            />
        );
    }

    return (
        <FullCard
            status={status}
            showActions={showActions}
            onOpenDashboard={openDashboard}
            onAction={onAction}
            className={className}
        />
    );
}

function ActionButton({
    onAction,
    className,
    children,
}: {
    onAction?: () => void;
    className: string;
    children: React.ReactNode;
}) {
    if (onAction) {
        return (
            <button className={className} onClick={onAction}>
                {children}
            </button>
        );
    }
    return (
        <Link href="/portal/billing/connect" className={className}>
            {children}
        </Link>
    );
}

function FullCard({
    status,
    showActions,
    onOpenDashboard,
    onAction,
    className,
}: {
    status: string;
    showActions: boolean;
    onOpenDashboard: () => Promise<void>;
    onAction?: () => void;
    className: string;
}) {
    return (
        <div className={`card bg-base-100 shadow ${className}`}>
            <div className="card-body">
                <h2 className="card-title">
                    <i className="fa-duotone fa-regular fa-money-bill-transfer"></i>
                    Payout Settings
                </h2>
                <div className="divider my-2"></div>

                {status === "not_started" && (
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-base-200 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-circle text-base-content/30"></i>
                            </div>
                            <div>
                                <div className="font-semibold">
                                    Payouts Not Set Up
                                </div>
                                <div className="text-sm text-base-content/70">
                                    Connect your bank account to
                                    receive placement commissions.
                                </div>
                            </div>
                        </div>
                        {showActions && (
                            <ActionButton
                                onAction={onAction}
                                className="btn btn-primary btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-rocket"></i>
                                Set Up Payouts
                            </ActionButton>
                        )}
                    </div>
                )}

                {status === "incomplete" && (
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-circle-half-stroke text-warning"></i>
                            </div>
                            <div>
                                <div className="font-semibold">
                                    Setup Incomplete
                                </div>
                                <div className="text-sm text-base-content/70">
                                    You started connecting your
                                    account but didn&apos;t finish.
                                </div>
                            </div>
                        </div>
                        {showActions && (
                            <ActionButton
                                onAction={onAction}
                                className="btn btn-warning btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-right"></i>
                                Continue Setup
                            </ActionButton>
                        )}
                    </div>
                )}

                {status === "pending_verification" && (
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-clock text-warning"></i>
                        </div>
                        <div>
                            <div className="font-semibold">
                                Verification Pending
                            </div>
                            <div className="text-sm text-base-content/70">
                                Stripe is reviewing your information.
                                This usually takes 1-2 business days.
                            </div>
                        </div>
                    </div>
                )}

                {status === "action_required" && (
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-circle-exclamation text-error"></i>
                            </div>
                            <div>
                                <div className="font-semibold">
                                    Action Required
                                </div>
                                <div className="text-sm text-base-content/70">
                                    Stripe needs additional
                                    information to keep your payouts
                                    active.
                                </div>
                            </div>
                        </div>
                        {showActions && (
                            <ActionButton
                                onAction={onAction}
                                className="btn btn-error btn-sm"
                            >
                                <i className="fa-duotone fa-regular fa-pen-to-square"></i>
                                Update Information
                            </ActionButton>
                        )}
                    </div>
                )}

                {status === "ready" && (
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-circle-check text-success"></i>
                            </div>
                            <div>
                                <div className="font-semibold">
                                    Payouts Ready
                                </div>
                                <div className="text-sm text-base-content/70">
                                    Your bank account is connected
                                    and payouts are enabled.
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-4">
                            <span className="badge badge-success badge-sm gap-1">
                                <i className="fa-duotone fa-regular fa-circle-check text-xs"></i>
                                Identity verified
                            </span>
                            <span className="badge badge-success badge-sm gap-1">
                                <i className="fa-duotone fa-regular fa-circle-check text-xs"></i>
                                Bank connected
                            </span>
                            <span className="badge badge-success badge-sm gap-1">
                                <i className="fa-duotone fa-regular fa-circle-check text-xs"></i>
                                Payouts enabled
                            </span>
                        </div>

                        {showActions && (
                            <div className="flex gap-2">
                                <ActionButton
                                    onAction={onAction}
                                    className="btn btn-outline btn-sm"
                                >
                                    <i className="fa-duotone fa-regular fa-gear"></i>
                                    Manage Account
                                </ActionButton>
                                <button
                                    className="btn btn-ghost btn-sm"
                                    onClick={onOpenDashboard}
                                >
                                    <i className="fa-duotone fa-regular fa-arrow-up-right-from-square"></i>
                                    Stripe Dashboard
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function CompactCard({
    status,
    showActions,
    onOpenDashboard,
    onAction,
    className,
}: {
    status: string;
    showActions: boolean;
    onOpenDashboard: () => Promise<void>;
    onAction?: () => void;
    className: string;
}) {
    if (status === "ready") {
        return (
            <div
                className={`flex items-center gap-2 ${className}`}
            >
                <span className="badge badge-success gap-1">
                    <i className="fa-duotone fa-regular fa-circle-check text-xs"></i>
                    Payout Ready
                </span>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <span className="badge badge-warning gap-1">
                <i className="fa-duotone fa-regular fa-circle-exclamation text-xs"></i>
                Payouts Not Set Up
            </span>
            {showActions && onAction ? (
                <button
                    className="text-xs text-primary hover:underline"
                    onClick={onAction}
                >
                    Set up
                </button>
            ) : showActions ? (
                <Link
                    href="/portal/billing/connect"
                    className="text-xs text-primary hover:underline"
                >
                    Set up
                </Link>
            ) : null}
        </div>
    );
}
