'use client';

import { useUserProfile } from '@/contexts';

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

    return (
        <div className="container mx-auto py-6 px-4">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">
                    <i className="fa-duotone fa-regular fa-credit-card mr-3"></i>
                    Billing & Subscriptions
                </h1>
                <p className="text-base-content/70 mt-2">
                    Manage your subscriptions, payment methods, and billing history
                </p>
            </div>

            <div className="space-y-6">
                {/* Current Plan Section */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title">
                            <i className="fa-duotone fa-regular fa-box"></i>
                            Current Plan
                            <div className="badge badge-primary">Active</div>
                        </h2>
                        <div className="divider my-2"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">
                                    {isRecruiter ? 'Recruiter Professional' : 'Company Starter'}
                                </h3>
                                <p className="text-base-content/70 mb-4">
                                    {isRecruiter
                                        ? 'Full access to job opportunities and candidate management'
                                        : 'Post jobs and manage applications'}
                                </p>
                                <div className="text-2xl font-bold">
                                    $99<span className="text-base font-normal text-base-content/70">/month</span>
                                </div>
                            </div>

                            <div className="flex flex-col justify-between">
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        <span className="text-sm">Unlimited job applications</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        <span className="text-sm">Candidate tracking system</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <i className="fa-duotone fa-regular fa-check text-success"></i>
                                        <span className="text-sm">Email notifications</span>
                                    </div>
                                </div>
                                <button className="btn btn-outline" disabled>
                                    <i className="fa-duotone fa-regular fa-lock"></i>
                                    Manage Plan (Coming Soon)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Method Section */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title">
                            <i className="fa-duotone fa-regular fa-wallet"></i>
                            Payment Method
                        </h2>
                        <div className="divider my-2"></div>

                        <div className="alert alert-info">
                            <i className="fa-duotone fa-regular fa-info-circle"></i>
                            <div>
                                <div className="font-semibold">Stripe Integration Coming Soon</div>
                                <div className="text-sm">
                                    Payment processing and subscription management will be available soon.
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-base-200 rounded-lg opacity-60">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">
                                    <i className="fa-brands fa-cc-visa"></i>
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold">•••• •••• •••• 4242</div>
                                    <div className="text-sm text-base-content/70">Expires 12/2025</div>
                                </div>
                                <button className="btn btn-sm btn-ghost" disabled>
                                    <i className="fa-duotone fa-regular fa-pen"></i>
                                    Edit
                                </button>
                            </div>
                        </div>

                        <button className="btn btn-primary mt-4" disabled>
                            <i className="fa-duotone fa-regular fa-plus"></i>
                            Add Payment Method
                        </button>
                    </div>
                </div>

                {/* Billing History Section */}
                <div className="card bg-base-100 shadow">
                    <div className="card-body">
                        <h2 className="card-title">
                            <i className="fa-duotone fa-regular fa-receipt"></i>
                            Billing History
                        </h2>
                        <div className="divider my-2"></div>

                        <div className="overflow-x-auto">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Invoice</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="opacity-60">
                                        <td>Dec 1, 2025</td>
                                        <td>Monthly Subscription</td>
                                        <td>$99.00</td>
                                        <td>
                                            <div className="badge badge-success">Paid</div>
                                        </td>
                                        <td>
                                            <button className="btn btn-xs btn-ghost" disabled>
                                                <i className="fa-duotone fa-regular fa-download"></i>
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="opacity-60">
                                        <td>Nov 1, 2025</td>
                                        <td>Monthly Subscription</td>
                                        <td>$99.00</td>
                                        <td>
                                            <div className="badge badge-success">Paid</div>
                                        </td>
                                        <td>
                                            <button className="btn btn-xs btn-ghost" disabled>
                                                <i className="fa-duotone fa-regular fa-download"></i>
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                    <tr className="opacity-60">
                                        <td>Oct 1, 2025</td>
                                        <td>Monthly Subscription</td>
                                        <td>$99.00</td>
                                        <td>
                                            <div className="badge badge-success">Paid</div>
                                        </td>
                                        <td>
                                            <button className="btn btn-xs btn-ghost" disabled>
                                                <i className="fa-duotone fa-regular fa-download"></i>
                                                Download
                                            </button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

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
                                    <div className="font-semibold">Stripe Connect Required</div>
                                    <div className="text-sm">
                                        Connect your bank account to receive payouts for successful placements.
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 space-y-4">
                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Bank Account</legend>
                                    <input
                                        type="text"
                                        className="input w-full"
                                        placeholder="Not configured"
                                        disabled
                                    />
                                </fieldset>

                                <fieldset className="fieldset">
                                    <legend className="fieldset-legend">Payout Schedule</legend>
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
                                Permanently cancel your subscription and delete associated data.
                            </p>

                            <button className="btn btn-error btn-outline" disabled>
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
