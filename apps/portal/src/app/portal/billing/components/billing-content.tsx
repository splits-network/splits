"use client";

import { useState } from "react";
import { useUserProfile } from "@/contexts";
import RecruiterSubscriptionSection from "./recruiter-subscription-section";
import PaymentMethodSection from "./payment-method-section";
import BillingHistorySection from "./billing-history-section";
import { ConnectStatusCard } from "@/components/stripe/connect-status-card";
import { ConnectDrawer } from "@/components/stripe/connect-drawer";

export default function BillingContent() {
    const { profile, isLoading, isRecruiter, isCompanyUser } = useUserProfile();
    const [connectDrawerOpen, setConnectDrawerOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">
                    <i className="fa-duotone fa-regular fa-credit-card mr-3"></i>
                    Billing & Subscriptions
                </h1>
                <p className="text-base-content/70 mt-2">
                    Manage your subscriptions, payment methods, and billing
                    history
                </p>
            </div>

            <div className="space-y-6">
                {/* Current Plan Section - Recruiter Subscription */}
                <RecruiterSubscriptionSection />

                {/* Payment Method Section */}
                <PaymentMethodSection />

                {/* Billing History Section */}
                <BillingHistorySection />

                {/* Payout Settings - Recruiters only */}
                {isRecruiter && (
                    <>
                        <ConnectStatusCard
                            variant="full"
                            onAction={() => setConnectDrawerOpen(true)}
                        />
                        <ConnectDrawer
                            open={connectDrawerOpen}
                            onClose={() => setConnectDrawerOpen(false)}
                        />
                    </>
                )}

                {/* Danger Zone - Only for Admins */}
                {(isCompanyUser || profile?.is_platform_admin) && (
                    <div className="card bg-base-100 shadow border-2 border-error">
                        <div className="card-body">
                            <h2 className="card-title text-error">
                                <i className="fa-duotone fa-regular fa-triangle-exclamation"></i>
                                Danger Zone
                            </h2>
                            <div className="divider my-2"></div>

                            <p className="text-base-content/70 mb-4">
                                Permanently cancel your subscription and delete
                                associated data.
                            </p>

                            <button
                                className="btn btn-error btn-outline"
                                disabled
                            >
                                <i className="fa-duotone fa-regular fa-ban"></i>
                                Cancel Subscription
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
