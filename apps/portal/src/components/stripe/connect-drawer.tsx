"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
    useStripeConnectStatus,
    type ConnectStatus,
} from "@/hooks/use-stripe-connect-status";
import {
    ConnectProvider,
    useConnectInstance,
} from "@/components/stripe/connect-provider";
import { LoadingState } from "@splits-network/shared-ui";

interface ConnectDrawerProps {
    open: boolean;
    onClose: () => void;
}

export function ConnectDrawer({ open, onClose }: ConnectDrawerProps) {
    return (
        <div className="drawer drawer-end">
            <input
                id="connect-drawer"
                type="checkbox"
                className="drawer-toggle"
                checked={open}
                readOnly
            />

            <div className="drawer-side z-50">
                <label
                    className="drawer-overlay"
                    onClick={onClose}
                    aria-label="Close drawer"
                />

                <div className="bg-base-100 min-h-full w-full md:w-2/3 lg:w-1/2 xl:w-2/5 flex flex-col">
                    {/* Header */}
                    <div className="sticky top-0 z-10 bg-base-100 border-b border-base-300 p-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold">
                                <i className="fa-duotone fa-regular fa-building-columns mr-2"></i>
                                Set Up Payouts
                            </h2>
                            <button
                                className="btn btn-sm btn-circle btn-ghost"
                                onClick={onClose}
                                aria-label="Close"
                            >
                                <i className="fa-duotone fa-regular fa-xmark"></i>
                            </button>
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {open && <DrawerContent onClose={onClose} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DrawerContent({ onClose }: { onClose: () => void }) {
    const connectStatus = useStripeConnectStatus();

    if (connectStatus.loading) {
        return <LoadingState message="Loading payout status..." />;
    }

    if (connectStatus.error) {
        return (
            <div className="alert alert-error">
                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                <span>{connectStatus.error}</span>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Progress Stepper */}
            <ProgressStepper status={connectStatus.status} />

            {/* Main Content by Status */}
            <ConnectContentByStatus connectStatus={connectStatus} />

            {/* Security Note */}
            <div className="alert alert-info">
                <i className="fa-duotone fa-regular fa-lock"></i>
                <div>
                    <div className="font-semibold text-sm">
                        Your data is secure
                    </div>
                    <div className="text-sm">
                        Your personal and financial information is collected
                        and stored securely by Stripe. Splits Network never
                        sees or stores your bank details, tax ID, or
                        identity documents.
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProgressStepper({ status }: { status: ConnectStatus }) {
    const steps = [
        {
            label: "Create Account",
            done: status !== "not_started",
        },
        {
            label: "Complete Verification",
            done: status === "ready" || status === "pending_verification",
            active:
                status === "incomplete" || status === "action_required",
        },
        { label: "Ready", done: status === "ready" },
    ];

    return (
        <ul className="steps steps-horizontal w-full">
            {steps.map((step, i) => (
                <li
                    key={i}
                    className={`step ${step.done ? "step-primary" : ""} ${step.active ? "step-primary" : ""}`}
                >
                    {step.label}
                </li>
            ))}
        </ul>
    );
}

function ConnectContentByStatus({
    connectStatus,
}: {
    connectStatus: ReturnType<typeof useStripeConnectStatus>;
}) {
    const { status } = connectStatus;

    if (status === "not_started") {
        return (
            <NotStartedState
                onCreateAccount={connectStatus.createAccount}
            />
        );
    }

    if (status === "pending_verification") {
        return <PendingVerificationState />;
    }

    if (status === "ready") {
        return (
            <ReadyState onOpenDashboard={connectStatus.openDashboard} />
        );
    }

    // incomplete or action_required — show embedded onboarding
    return (
        <ConnectProvider>
            <EmbeddedOnboarding onComplete={connectStatus.refresh} />
        </ConnectProvider>
    );
}

function NotStartedState({
    onCreateAccount,
}: {
    onCreateAccount: () => Promise<void>;
}) {
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        setCreating(true);
        await onCreateAccount();
    };

    if (creating) {
        return <LoadingState message="Setting up your account..." />;
    }

    return (
        <div className="text-center py-8">
            <i className="fa-duotone fa-regular fa-building-columns text-5xl text-primary mb-4"></i>
            <h3 className="text-xl font-bold mb-2">
                Connect Your Bank Account
            </h3>
            <p className="text-base-content/70 max-w-md mx-auto mb-6">
                Set up your payout account to receive commissions from
                successful placements. This takes about 5 minutes.
            </p>
            <button
                className="btn btn-primary btn-lg"
                onClick={handleCreate}
            >
                <i className="fa-duotone fa-regular fa-rocket"></i>
                Get Started
            </button>
        </div>
    );
}

function PendingVerificationState() {
    return (
        <div className="text-center py-8">
            <i className="fa-duotone fa-regular fa-clock text-5xl text-warning mb-4"></i>
            <h3 className="text-xl font-bold mb-2">
                Verification in Progress
            </h3>
            <p className="text-base-content/70 max-w-md mx-auto mb-2">
                Stripe is reviewing your information. This usually takes
                1-2 business days.
            </p>
            <p className="text-base-content/50 text-sm">
                We&apos;ll notify you by email when verification is
                complete.
            </p>
        </div>
    );
}

function ReadyState({
    onOpenDashboard,
}: {
    onOpenDashboard: () => Promise<void>;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                    <i className="fa-duotone fa-regular fa-circle-check text-2xl text-success"></i>
                </div>
                <div>
                    <h3 className="text-xl font-bold">Payouts Ready</h3>
                    <p className="text-base-content/70 text-sm">
                        Your account is fully set up
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 text-sm">
                    <i className="fa-duotone fa-regular fa-circle-check text-success"></i>
                    <span>Identity verified</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <i className="fa-duotone fa-regular fa-circle-check text-success"></i>
                    <span>Bank account connected</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                    <i className="fa-duotone fa-regular fa-circle-check text-success"></i>
                    <span>Payouts enabled</span>
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    className="btn btn-outline btn-sm"
                    onClick={onOpenDashboard}
                >
                    <i className="fa-duotone fa-regular fa-arrow-up-right-from-square"></i>
                    View Stripe Dashboard
                </button>
            </div>

            {/* Account Management Section */}
            <div className="border-t border-base-300 pt-4 mt-4">
                <h4 className="font-semibold mb-2">
                    <i className="fa-duotone fa-regular fa-gear mr-2"></i>
                    Manage Account
                </h4>
                <p className="text-base-content/70 text-sm mb-4">
                    Update your bank details, address, or other account
                    information.
                </p>
                <ConnectProvider>
                    <EmbeddedManagement />
                </ConnectProvider>
            </div>
        </div>
    );
}

function EmbeddedOnboarding({
    onComplete,
}: {
    onComplete: () => Promise<void>;
}) {
    const { connectInstance, loading, error } = useConnectInstance();
    const containerRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<any>(null);

    const handleExit = useCallback(() => {
        onComplete();
    }, [onComplete]);

    useEffect(() => {
        if (!connectInstance || !containerRef.current) return;

        // Clean up any existing element
        if (elementRef.current && containerRef.current.firstChild) {
            containerRef.current.removeChild(
                containerRef.current.firstChild
            );
        }

        const onboardingElement = connectInstance.create(
            "account-onboarding"
        );
        onboardingElement.setOnExit(handleExit);
        onboardingElement.setCollectionOptions({
            fields: "eventually_due",
            futureRequirements: "include",
        });
        onboardingElement.setFullTermsOfServiceUrl(
            "https://splits.network/terms-of-service"
        );
        onboardingElement.setRecipientTermsOfServiceUrl(
            "https://splits.network/terms-of-service"
        );
        onboardingElement.setPrivacyPolicyUrl(
            "https://splits.network/privacy-policy"
        );

        containerRef.current.appendChild(onboardingElement);
        elementRef.current = onboardingElement;

        return () => {
            if (
                elementRef.current &&
                containerRef.current?.contains(elementRef.current)
            ) {
                containerRef.current.removeChild(elementRef.current);
            }
            elementRef.current = null;
        };
    }, [connectInstance, handleExit]);

    if (loading) {
        return <LoadingState message="Loading onboarding form..." />;
    }

    if (error) {
        return (
            <div className="alert alert-error">
                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                <span>
                    We&apos;re having trouble connecting to our payment
                    provider. Please try again in a few minutes.
                </span>
            </div>
        );
    }

    return <div ref={containerRef} />;
}

function EmbeddedManagement() {
    const { connectInstance, loading, error } = useConnectInstance();
    const containerRef = useRef<HTMLDivElement>(null);
    const elementRef = useRef<any>(null);

    useEffect(() => {
        if (!connectInstance || !containerRef.current) return;

        if (elementRef.current && containerRef.current.firstChild) {
            containerRef.current.removeChild(
                containerRef.current.firstChild
            );
        }

        const managementElement =
            connectInstance.create("account-management");

        containerRef.current.appendChild(managementElement);
        elementRef.current = managementElement;

        return () => {
            if (
                elementRef.current &&
                containerRef.current?.contains(elementRef.current)
            ) {
                containerRef.current.removeChild(elementRef.current);
            }
            elementRef.current = null;
        };
    }, [connectInstance]);

    if (loading) {
        return (
            <LoadingState message="Loading account management..." />
        );
    }

    if (error) {
        return (
            <div className="alert alert-warning alert-sm">
                <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                <span className="text-sm">
                    Unable to load account management. Try again later.
                </span>
            </div>
        );
    }

    return <div ref={containerRef} />;
}
