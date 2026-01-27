"use client";

import { useUserProfile } from "@/contexts";
import RecruiterSubscriptionSection from "./recruiter-subscription-section";
import PaymentMethodSection from "./payment-method-section";
import BillingHistorySection from "./billing-history-section";

export default function BillingContent() {
    const { profile, isLoading, isRecruiter, isCompanyUser } = useUserProfile();

    if (isLoading) {
        return (
            <div className="container mx-auto py-6 px-4">
                <div className="flex items-center justify-center min-h-[400px]">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            </div>
        );
    }

    // Company users don't have subscriptions in this system
    if (isCompanyUser && !isRecruiter) {
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

                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <div className="text-center py-8">
                            <i className="fa-duotone fa-regular fa-building text-5xl text-base-content/30 mb-4 block"></i>
                            <h2 className="text-xl font-semibold mb-2">
                                Company Billing
                            </h2>
                            <p className="text-base-content/70 max-w-md mx-auto">
                                Company billing is managed at the organization
                                level. Contact your organization administrator
                                for billing inquiries.
                            </p>
                        </div>
                    </div>
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
                    <div className="card bg-base-100 shadow">
                        <div className="card-body">
                            <h2 className="card-title">
                                <i className="fa-duotone fa-regular fa-money-bill-transfer"></i>
                                Payout Settings
                            </h2>
                            <div className="divider my-2"></div>

                            <div className="alert alert-info">
                                <i className="fa-duotone fa-regular fa-info-circle"></i>
                                <div>
                                    <div className="font-semibold">
                                        Stripe Connect Required
                                    </div>
                                    <div className="text-sm">
                                        Connect your bank account to receive
                                        payouts for successful placements.
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-4">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Bank Account
                                    </legend>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="Not configured"
                                        disabled
                                    />
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">
                                        Payout Schedule
                                    </legend>
                                    <select className="select w-full" disabled>
                                        <option>Monthly</option>
                                        <option>Weekly</option>
                                    </select>
                                </fieldset>

                                <button className="btn btn-primary" disabled>
                                    <i className="fa-duotone fa-regular fa-link"></i>
                                    Configure Payout Settings
                                </button>
                            </div>
                        </div>
                    </div>
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
