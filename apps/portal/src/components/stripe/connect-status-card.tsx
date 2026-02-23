"use client";

import Link from "next/link";
import { useStripeConnectStatus } from "@/hooks/use-stripe-connect-status";
import { LoadingState } from "@splits-network/shared-ui";
import { BaselStatusPill } from "@splits-network/basel-ui";

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
    } = useStripeConnectStatus();

    if (loading) {
        return (
            <div
                className={`bg-base-200 border border-base-300 ${className}`}
            >
                <div className="p-6">
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
                onAction={onAction}
                className={className}
            />
        );
    }

    return (
        <FullCard
            status={status}
            showActions={showActions}
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
    onAction,
    className,
}: {
    status: string;
    showActions: boolean;
    onAction?: () => void;
    className: string;
}) {
    return (
        <div className={`bg-base-200 border border-base-300 ${className}`}>
            <div className="p-6">
                <h2 className="text-lg font-black tracking-tight flex items-center gap-2 mb-4">
                    <i className="fa-duotone fa-regular fa-money-bill-transfer"></i>
                    Payout Settings
                </h2>
                <div className="border-t border-base-300 pt-4">
                    {status === "not_started" && (
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-base-300 flex items-center justify-center">
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
                                <div className="w-10 h-10 bg-warning/10 flex items-center justify-center">
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
                            <div className="w-10 h-10 bg-warning/10 flex items-center justify-center">
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
                                <div className="w-10 h-10 bg-error/10 flex items-center justify-center">
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
                                <div className="w-10 h-10 bg-success/10 flex items-center justify-center">
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

                            <div className="flex flex-wrap items-center gap-2">
                                <BaselStatusPill color="success">
                                    Identity verified
                                </BaselStatusPill>
                                <BaselStatusPill color="success">
                                    Bank connected
                                </BaselStatusPill>
                                <BaselStatusPill color="success">
                                    Payouts enabled
                                </BaselStatusPill>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function CompactCard({
    status,
    showActions,
    onAction,
    className,
}: {
    status: string;
    showActions: boolean;
    onAction?: () => void;
    className: string;
}) {
    if (status === "ready") {
        return (
            <div
                className={`flex items-center gap-2 ${className}`}
            >
                <BaselStatusPill color="success">
                    Payout Ready
                </BaselStatusPill>
            </div>
        );
    }

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <BaselStatusPill color="warning">
                Payouts Not Set Up
            </BaselStatusPill>
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
