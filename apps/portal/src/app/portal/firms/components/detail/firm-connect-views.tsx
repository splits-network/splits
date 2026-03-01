"use client";

import { useState } from "react";
import type { FirmConnectStatusState, FirmConnectStatus } from "@/hooks/use-firm-connect-status";
import {
    BaselAlertBox,
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
} from "@splits-network/basel-ui";

const WIZARD_STEPS = [
    { label: "Company & Representative" },
    { label: "Address" },
    { label: "Bank Account" },
    { label: "Review & Submit" },
];

export { WIZARD_STEPS };

export function NotStartedView({
    isOpen,
    onClose,
    onCreateAccount,
}: {
    isOpen: boolean;
    onClose: () => void;
    onCreateAccount: () => Promise<void>;
}) {
    const [creating, setCreating] = useState(false);

    const handleCreate = async () => {
        setCreating(true);
        await onCreateAccount();
    };

    return (
        <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <BaselModalHeader
                title="Set Up Firm Payouts"
                subtitle="Step 1 of 4 — Company & Representative"
                icon="fa-building-columns"
                onClose={onClose}
            >
                <div className="flex gap-2 mt-5">
                    {WIZARD_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 ${i === 0 ? "bg-primary" : "bg-neutral-content/20"}`}
                        />
                    ))}
                </div>
            </BaselModalHeader>

            <BaselModalBody padding="p-8">
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-primary/10 flex items-center justify-center mx-auto mb-5">
                        <i className="fa-duotone fa-regular fa-building-columns text-3xl text-primary" />
                    </div>
                    <h4 className="text-xl font-black mb-2">
                        Connect Your Firm&apos;s Bank Account
                    </h4>
                    <p className="text-base-content/60 max-w-md mx-auto leading-relaxed">
                        Set up your firm&apos;s payout account to receive admin take
                        payouts from member placements. This takes about 5 minutes.
                    </p>

                    <div className="bg-base-200 p-5 mt-8 text-left">
                        <div className="flex items-start gap-3">
                            <i className="fa-duotone fa-regular fa-lock text-base-content/40 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm">Your data is secure</p>
                                <p className="text-xs text-base-content/50 mt-1">
                                    Company and financial information is transmitted
                                    securely to our payment processor. We encrypt all
                                    sensitive data in transit.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </BaselModalBody>

            <BaselModalFooter align="between">
                <button onClick={onClose} className="btn btn-ghost">
                    Cancel
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleCreate}
                    disabled={creating}
                >
                    {creating ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />
                            Setting up...
                        </>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-rocket" />
                            Get Started
                        </>
                    )}
                </button>
            </BaselModalFooter>
        </BaselModal>
    );
}

export function StatusView({
    isOpen,
    onClose,
    status,
}: {
    isOpen: boolean;
    onClose: () => void;
    status: FirmConnectStatus;
}) {
    const isPending = status === "pending_verification";
    const stepIndex = isPending ? 2 : 3;

    return (
        <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <BaselModalHeader
                title="Firm Payouts"
                subtitle={isPending ? "Verification in Progress" : "Payouts Ready"}
                icon="fa-building-columns"
                iconColor={isPending ? "warning" : "success"}
                onClose={onClose}
            >
                <div className="flex gap-2 mt-5">
                    {WIZARD_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 ${
                                i <= stepIndex
                                    ? isPending ? "bg-warning" : "bg-success"
                                    : "bg-neutral-content/20"
                            }`}
                        />
                    ))}
                </div>
            </BaselModalHeader>

            <BaselModalBody padding="p-8">
                {isPending ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-warning/10 flex items-center justify-center mx-auto mb-5">
                            <i className="fa-duotone fa-regular fa-clock text-3xl text-warning" />
                        </div>
                        <h4 className="text-xl font-black mb-2">
                            Verification in Progress
                        </h4>
                        <p className="text-base-content/60 max-w-md mx-auto leading-relaxed mb-2">
                            Your firm&apos;s information is being reviewed. This usually takes
                            1-2 business days.
                        </p>
                        <p className="text-base-content/50 text-sm">
                            We&apos;ll notify you by email when verification is complete.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-success/10 flex items-center justify-center mx-auto mb-5">
                                <i className="fa-duotone fa-regular fa-circle-check text-3xl text-success" />
                            </div>
                            <h4 className="text-xl font-black mb-2">
                                Payouts Ready
                            </h4>
                            <p className="text-base-content/60">
                                Your firm&apos;s account is fully set up and verified.
                            </p>
                        </div>

                        <div className="bg-base-200 p-5 space-y-3">
                            <div className="flex items-center gap-3">
                                <i className="fa-duotone fa-regular fa-circle-check text-success" />
                                <span className="text-sm">Identity verified</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fa-duotone fa-regular fa-circle-check text-success" />
                                <span className="text-sm">Bank account connected</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <i className="fa-duotone fa-regular fa-circle-check text-success" />
                                <span className="text-sm">Payouts enabled</span>
                            </div>
                        </div>
                    </div>
                )}
            </BaselModalBody>

            <BaselModalFooter align="end">
                <button onClick={onClose} className="btn btn-ghost">
                    Close
                </button>
            </BaselModalFooter>
        </BaselModal>
    );
}

export function IdentityVerificationView({
    isOpen,
    onClose,
    connectStatus,
}: {
    isOpen: boolean;
    onClose: () => void;
    connectStatus: FirmConnectStatusState;
}) {
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [verifyComplete, setVerifyComplete] = useState(false);

    const handleVerify = async () => {
        setVerifying(true);
        setVerifyError(null);

        try {
            const { client_secret } = await connectStatus.createVerificationSession();

            const { loadStripe } = await import("@stripe/stripe-js");
            const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
            if (!publishableKey) throw new Error("Stripe publishable key not configured");

            const stripe = await loadStripe(publishableKey);
            if (!stripe) throw new Error("Failed to load Stripe");

            const { error } = await stripe.verifyIdentity(client_secret);

            if (error) {
                setVerifyError(error.message || "Verification failed. Please try again.");
            } else {
                setVerifyComplete(true);
                await connectStatus.refresh();
            }
        } catch (err: any) {
            setVerifyError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    return (
        <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <BaselModalHeader
                title="Firm Payouts"
                subtitle={verifyComplete ? "Verification Submitted" : "Identity Verification"}
                icon="fa-building-columns"
                iconColor={verifyComplete ? "success" : "info"}
                onClose={onClose}
            >
                <div className="flex gap-2 mt-5">
                    {WIZARD_STEPS.map((_, i) => (
                        <div key={i} className="h-1 flex-1 bg-primary" />
                    ))}
                    <div className={`h-1 flex-1 ${verifyComplete ? "bg-success" : "bg-info"}`} />
                </div>
            </BaselModalHeader>

            <BaselModalBody padding="p-8">
                {verifyComplete ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-success/10 flex items-center justify-center mx-auto mb-5">
                            <i className="fa-duotone fa-regular fa-circle-check text-3xl text-success" />
                        </div>
                        <h4 className="text-xl font-black mb-2">Verification Submitted</h4>
                        <p className="text-base-content/60 max-w-md mx-auto leading-relaxed">
                            Your identity documents have been submitted for review.
                            This usually takes a few minutes. We&apos;ll notify you
                            when everything is verified.
                        </p>
                    </div>
                ) : (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-info/10 flex items-center justify-center mx-auto mb-5">
                            <i className="fa-duotone fa-regular fa-id-card text-3xl text-info" />
                        </div>
                        <h4 className="text-xl font-black mb-2">Verify Your Identity</h4>
                        <p className="text-base-content/60 max-w-md mx-auto leading-relaxed">
                            Your firm&apos;s account details have been saved. To complete
                            setup, we need to verify the representative&apos;s identity
                            with a photo ID and a selfie.
                        </p>

                        {verifyError && (
                            <div className="mt-4 text-left">
                                <BaselAlertBox variant="error">{verifyError}</BaselAlertBox>
                            </div>
                        )}

                        <div className="bg-base-200 p-5 mt-8 text-left space-y-3">
                            <div className="flex items-start gap-3">
                                <i className="fa-duotone fa-regular fa-camera text-base-content/40 mt-0.5" />
                                <div>
                                    <p className="font-bold text-sm">What you&apos;ll need</p>
                                    <ul className="text-xs text-base-content/50 mt-1 space-y-1">
                                        <li>A valid government-issued photo ID (driver&apos;s license, passport, etc.)</li>
                                        <li>Access to your device&apos;s camera for a selfie</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </BaselModalBody>

            <BaselModalFooter align={verifyComplete ? "end" : "between"}>
                {verifyComplete ? (
                    <button onClick={onClose} className="btn btn-ghost">
                        Close
                    </button>
                ) : (
                    <>
                        <button onClick={onClose} className="btn btn-ghost">
                            I&apos;ll do this later
                        </button>
                        <button
                            className="btn btn-primary"
                            onClick={handleVerify}
                            disabled={verifying}
                        >
                            {verifying ? (
                                <>
                                    <span className="loading loading-spinner loading-sm" />
                                    Opening camera...
                                </>
                            ) : (
                                <>
                                    <i className="fa-duotone fa-regular fa-id-card" />
                                    Verify Identity
                                </>
                            )}
                        </button>
                    </>
                )}
            </BaselModalFooter>
        </BaselModal>
    );
}
