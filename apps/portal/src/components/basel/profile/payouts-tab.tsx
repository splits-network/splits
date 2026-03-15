"use client";

import { useStripeConnectStatus } from "@/hooks/use-stripe-connect-status";
import { BaselAlertBox, BaselStatusPill } from "@splits-network/basel-ui";
import { PayoutAccountCard } from "./payout-account-card";
import { PayoutHistoryList } from "./payout-history-list";

export function PayoutsTab() {
    const connectStatus = useStripeConnectStatus();

    if (connectStatus.loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <span className="loading loading-spinner loading-md" />
            </div>
        );
    }

    if (connectStatus.error) {
        return (
            <div>
                <h2 className="text-xl font-black tracking-tight mb-1">Payouts</h2>
                <p className="text-base text-base-content/50 mb-8">
                    Manage your Stripe Connect account for receiving placement fees.
                </p>
                <BaselAlertBox variant="error">
                    {connectStatus.error}
                    <button className="btn btn-ghost btn-sm ml-2" onClick={connectStatus.refresh}>
                        Retry
                    </button>
                </BaselAlertBox>
            </div>
        );
    }

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">Payouts</h2>
            <p className="text-base text-base-content/50 mb-8">
                Manage your Stripe Connect account for receiving placement fees.
            </p>

            {/* ── Not Started ─────────────────────────────────────────────── */}
            {connectStatus.status === "not_started" && (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                    <div className="lg:col-span-3">
                        <div className="bg-base-200 border border-base-300 p-8 text-center">
                            <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-money-bill-transfer text-2xl text-primary" />
                            </div>
                            <h3 className="text-lg font-black tracking-tight mb-2">
                                Start Receiving Payouts
                            </h3>
                            <p className="text-sm text-base-content/50 max-w-md mx-auto mb-6">
                                Connect your bank account to receive placement commissions directly.
                                You&apos;ll be redirected to Stripe to securely set up your account.
                            </p>
                            <button className="btn btn-primary" onClick={connectStatus.createAccountAndRedirect}>
                                <i className="fa-duotone fa-regular fa-rocket" />
                                Set Up Payouts
                            </button>
                        </div>
                    </div>
                    <div className="lg:col-span-2">
                        <div className="bg-base-200 border border-base-300 border-l-4 border-l-info p-6">
                            <h4 className="text-sm font-black uppercase tracking-wider text-base-content/50 mb-3">
                                How It Works
                            </h4>
                            <div className="space-y-3">
                                {[
                                    { icon: "fa-shield-check", text: "Securely set up via Stripe's trusted platform" },
                                    { icon: "fa-building-columns", text: "Connect your bank account for direct deposits" },
                                    { icon: "fa-id-card", text: "Stripe handles identity verification" },
                                ].map((item) => (
                                    <div key={item.text} className="flex items-center gap-3">
                                        <i className={`fa-duotone fa-regular ${item.icon} text-info w-4 text-center`} />
                                        <span className="text-sm text-base-content">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Incomplete ──────────────────────────────────────────────── */}
            {connectStatus.status === "incomplete" && (
                <div className="bg-base-200 border border-base-300 border-l-4 border-l-warning p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-warning/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-circle-half-stroke text-warning" />
                        </div>
                        <div>
                            <div className="font-bold text-base-content">Setup Incomplete</div>
                            <div className="text-sm text-base-content/60">
                                You started setting up your payout account but didn&apos;t finish.
                                Continue on Stripe to complete setup.
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-warning btn-sm" onClick={connectStatus.openStripeOnboarding}>
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                        Continue on Stripe
                    </button>
                </div>
            )}

            {/* ── Pending Verification ────────────────────────────────────── */}
            {connectStatus.status === "pending_verification" && (
                <div className="bg-base-200 border border-base-300 border-l-4 border-l-warning p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-warning/10 flex items-center justify-center">
                            <i className="fa-duotone fa-regular fa-clock text-warning" />
                        </div>
                        <div>
                            <div className="font-bold text-base-content">Verification In Progress</div>
                            <div className="text-sm text-base-content/60">
                                Stripe is reviewing your information. This usually takes 1–2 business days.
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <BaselStatusPill color="warning">Under Review</BaselStatusPill>
                        <button className="btn btn-ghost btn-sm" onClick={connectStatus.refresh}>
                            <i className="fa-duotone fa-regular fa-rotate-right" />
                            Check Status
                        </button>
                    </div>
                </div>
            )}

            {/* ── Action Required ─────────────────────────────────────────── */}
            {connectStatus.status === "action_required" && (
                <div>
                    <BaselAlertBox variant="error" className="mb-6">
                        <span className="font-bold">Action Required</span> — Stripe needs additional information to keep your payouts active.
                        <button className="btn btn-error btn-sm ml-4" onClick={connectStatus.openStripeOnboarding}>
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                            Update on Stripe
                        </button>
                    </BaselAlertBox>

                    {connectStatus.bankAccount && (
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
                            <div className="lg:col-span-3">
                                <PayoutAccountCard
                                    bankAccount={connectStatus.bankAccount}
                                    payoutSchedule={connectStatus.payoutSchedule}
                                    pendingBalance={connectStatus.pendingBalance}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── Ready ───────────────────────────────────────────────────── */}
            {connectStatus.status === "ready" && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
                        {/* Left: Account status (60%) */}
                        <div className="lg:col-span-3">
                            {connectStatus.bankAccount ? (
                                <PayoutAccountCard
                                    bankAccount={connectStatus.bankAccount}
                                    payoutSchedule={connectStatus.payoutSchedule}
                                    pendingBalance={connectStatus.pendingBalance}
                                />
                            ) : (
                                <div className="bg-base-200 border border-base-300 border-l-4 border-l-success p-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-success/10 flex items-center justify-center">
                                            <i className="fa-duotone fa-regular fa-circle-check text-success" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-base-content">Payouts Enabled</div>
                                            <div className="text-sm text-base-content/60">
                                                Your account is fully verified and ready to receive payouts.
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button
                                className="btn btn-ghost btn-sm mt-3"
                                onClick={connectStatus.openStripeOnboarding}
                            >
                                <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                                Manage on Stripe
                            </button>
                        </div>

                        {/* Right: Status pills (40%) */}
                        <div className="lg:col-span-2">
                            <div className="bg-base-200 border border-base-300 p-6">
                                <h4 className="text-sm font-black uppercase tracking-wider text-base-content/50 mb-3">
                                    Account Status
                                </h4>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <BaselStatusPill color="success">Identity Verified</BaselStatusPill>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BaselStatusPill color="success">Bank Connected</BaselStatusPill>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <BaselStatusPill color="success">Payouts Enabled</BaselStatusPill>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payout history */}
                    <div>
                        <h3 className="text-lg font-black tracking-tight mb-1">Payout History</h3>
                        <p className="text-sm text-base-content/50 mb-4">
                            Recent payouts to your bank account.
                        </p>
                        <PayoutHistoryList />
                    </div>
                </>
            )}
        </div>
    );
}
