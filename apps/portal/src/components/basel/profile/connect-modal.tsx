"use client";

import { useState, useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    useStripeConnectStatus,
    type ConnectStatus,
    type UpdateDetailsPayload,
} from "@/hooks/use-stripe-connect-status";
import { LoadingState, ModalPortal } from "@splits-network/shared-ui";
import {
    BaselAlertBox,
    BaselFormField,
    BaselReviewSection,
    BaselWizardModal,
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
} from "@splits-network/basel-ui";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface ConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/* ─── US States ──────────────────────────────────────────────────────────── */

const US_STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC",
] as const;

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

/* ─── Wizard Steps ───────────────────────────────────────────────────────── */

const WIZARD_STEPS = [
    { label: "Personal Information" },
    { label: "Address" },
    { label: "Bank Account" },
    { label: "Review & Submit" },
];

/* ─── Form State ─────────────────────────────────────────────────────────── */

interface PersonalInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dobMonth: string;
    dobDay: string;
    dobYear: string;
    ssnLast4: string;
}

interface AddressInfo {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
}

interface BankInfo {
    accountHolderName: string;
    routingNumber: string;
    accountNumber: string;
    confirmAccountNumber: string;
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export function ConnectModal({ isOpen, onClose }: ConnectModalProps) {
    return (
        <ModalPortal>
            {isOpen && <ModalInner isOpen={isOpen} onClose={onClose} />}
        </ModalPortal>
    );
}

/* ─── Inner (loads status, routes to wizard or status view) ──────────────── */

function ModalInner({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const connectStatus = useStripeConnectStatus();
    const { status, accountType } = connectStatus;

    if (connectStatus.loading) {
        return (
            <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
                <BaselModalHeader
                    title="Set Up Payouts"
                    subtitle="Loading..."
                    icon="fa-building-columns"
                    onClose={onClose}
                />
                <BaselModalBody padding="p-8">
                    <LoadingState message="Loading payout status..." />
                </BaselModalBody>
            </BaselModal>
        );
    }

    if (connectStatus.error) {
        return (
            <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
                <BaselModalHeader
                    title="Set Up Payouts"
                    subtitle="Error"
                    icon="fa-building-columns"
                    onClose={onClose}
                />
                <BaselModalBody padding="p-8">
                    <BaselAlertBox variant="error">
                        {connectStatus.error}
                    </BaselAlertBox>
                </BaselModalBody>
                <BaselModalFooter align="end">
                    <button onClick={onClose} className="btn btn-ghost">
                        Close
                    </button>
                </BaselModalFooter>
            </BaselModal>
        );
    }

    // Express account — always redirect to Stripe's hosted onboarding
    if (accountType === "express") {
        if (status === "ready") {
            return (
                <StatusView
                    isOpen={isOpen}
                    onClose={onClose}
                    status={status}
                />
            );
        }
        return (
            <ExpressFallbackView
                isOpen={isOpen}
                onClose={onClose}
            />
        );
    }

    // Not started — show intro screen
    if (status === "not_started") {
        return (
            <NotStartedView
                isOpen={isOpen}
                onClose={onClose}
                onCreateAccount={connectStatus.createAccount}
            />
        );
    }

    // Pending verification — show waiting state
    if (status === "pending_verification") {
        return (
            <StatusView
                isOpen={isOpen}
                onClose={onClose}
                status={status}
            />
        );
    }

    // Ready — show success state
    if (status === "ready") {
        return (
            <StatusView
                isOpen={isOpen}
                onClose={onClose}
                status={status}
            />
        );
    }

    // Custom account that only needs identity verification (details already submitted)
    if (
        accountType === "custom" &&
        connectStatus.needsIdentityVerification &&
        connectStatus.detailsSubmitted
    ) {
        return (
            <IdentityVerificationView
                isOpen={isOpen}
                onClose={onClose}
                connectStatus={connectStatus}
            />
        );
    }

    // Custom account incomplete/action_required — show wizard
    return (
        <ConnectWizard
            isOpen={isOpen}
            onClose={onClose}
            connectStatus={connectStatus}
        />
    );
}

/* ─── Not Started View ───────────────────────────────────────────────────── */

function NotStartedView({
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
                title="Set Up Payouts"
                subtitle="Step 1 of 4 — Personal Information"
                icon="fa-building-columns"
                onClose={onClose}
            >
                <div className="flex gap-2 mt-5">
                    {WIZARD_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 ${
                                i === 0 ? "bg-primary" : "bg-neutral-content/20"
                            }`}
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
                        Connect Your Bank Account
                    </h4>
                    <p className="text-base-content/60 max-w-md mx-auto leading-relaxed">
                        Set up your payout account to receive commissions from
                        successful placements. This takes about 5 minutes.
                    </p>

                    <div className="bg-base-200 p-5 mt-8 text-left">
                        <div className="flex items-start gap-3">
                            <i className="fa-duotone fa-regular fa-lock text-base-content/40 mt-0.5" />
                            <div>
                                <p className="font-bold text-sm">Your data is secure</p>
                                <p className="text-xs text-base-content/50 mt-1">
                                    Personal and financial information is transmitted
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

/* ─── Status View (pending_verification + ready) ─────────────────────────── */

function StatusView({
    isOpen,
    onClose,
    status,
}: {
    isOpen: boolean;
    onClose: () => void;
    status: ConnectStatus;
}) {
    const isPending = status === "pending_verification";
    const stepIndex = isPending ? 2 : 3;

    return (
        <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <BaselModalHeader
                title="Set Up Payouts"
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
                            Your information is being reviewed. This usually takes
                            1-2 business days.
                        </p>
                        <p className="text-base-content/50 text-sm">
                            We&apos;ll notify you by email when verification is
                            complete.
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
                                Your account is fully set up and verified.
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

/* ─── Express Fallback View ──────────────────────────────────────────────── */

function ExpressFallbackView({
    isOpen,
    onClose,
}: {
    isOpen: boolean;
    onClose: () => void;
}) {
    const { getToken } = useAuth();
    const [redirecting, setRedirecting] = useState(false);
    const [redirectError, setRedirectError] = useState<string | null>(null);

    const handleRedirect = async () => {
        setRedirecting(true);
        setRedirectError(null);
        try {
            const returnUrl = `${window.location.origin}/portal/profile`;
            const refreshUrl = `${window.location.origin}/portal/profile`;

            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const api = createAuthenticatedClient(token);
            const response: any = await api.post("/stripe/connect/onboarding-link", {
                return_url: returnUrl,
                refresh_url: refreshUrl,
            });

            if (response?.data?.url) {
                window.open(response.data.url, "_blank");
            }
        } catch (err: any) {
            setRedirectError(err?.message || "Failed to create onboarding link");
        } finally {
            setRedirecting(false);
        }
    };

    return (
        <BaselModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
            <BaselModalHeader
                title="Complete Account Setup"
                subtitle="Express Account"
                icon="fa-building-columns"
                iconColor="warning"
                onClose={onClose}
            />

            <BaselModalBody padding="p-8">
                <div className="text-center py-6">
                    <div className="w-16 h-16 bg-warning/10 flex items-center justify-center mx-auto mb-5">
                        <i className="fa-duotone fa-regular fa-arrow-up-right-from-square text-3xl text-warning" />
                    </div>
                    <h4 className="text-xl font-black mb-2">
                        Complete Your Setup
                    </h4>
                    <p className="text-base-content/60 max-w-md mx-auto leading-relaxed">
                        Your account was created with our previous system. Please
                        complete the setup on Stripe&apos;s secure page.
                    </p>

                    {redirectError && (
                        <div className="mt-4">
                            <BaselAlertBox variant="error">{redirectError}</BaselAlertBox>
                        </div>
                    )}
                </div>
            </BaselModalBody>

            <BaselModalFooter align="between">
                <button onClick={onClose} className="btn btn-ghost">
                    Cancel
                </button>
                <button
                    className="btn btn-primary"
                    onClick={handleRedirect}
                    disabled={redirecting}
                >
                    {redirecting ? (
                        <>
                            <span className="loading loading-spinner loading-sm" />
                            Redirecting...
                        </>
                    ) : (
                        <>
                            <i className="fa-duotone fa-regular fa-arrow-up-right-from-square" />
                            Continue on Stripe
                        </>
                    )}
                </button>
            </BaselModalFooter>
        </BaselModal>
    );
}

/* ─── 4-Step Wizard ──────────────────────────────────────────────────────── */

function ConnectWizard({
    isOpen,
    onClose,
    connectStatus,
}: {
    isOpen: boolean;
    onClose: () => void;
    connectStatus: ReturnType<typeof useStripeConnectStatus>;
}) {
    const { user } = useUser();
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showVerification, setShowVerification] = useState(false);

    // Form state
    const [personal, setPersonal] = useState<PersonalInfo>({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        phone: user?.primaryPhoneNumber?.phoneNumber || "",
        dobMonth: "",
        dobDay: "",
        dobYear: "",
        ssnLast4: "",
    });

    const [address, setAddress] = useState<AddressInfo>({
        line1: "",
        city: "",
        state: "",
        postalCode: "",
    });

    const [bank, setBank] = useState<BankInfo>({
        accountHolderName: "",
        routingNumber: "",
        accountNumber: "",
        confirmAccountNumber: "",
    });

    const [tosAccepted, setTosAccepted] = useState(false);

    // Pre-fill bank holder name when personal info changes
    const effectiveHolderName =
        bank.accountHolderName ||
        `${personal.firstName} ${personal.lastName}`.trim();

    // Validation
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep = useCallback(
        (step: number): boolean => {
            const newErrors: Record<string, string> = {};

            if (step === 0) {
                if (!personal.firstName.trim()) newErrors.firstName = "First name is required";
                if (!personal.lastName.trim()) newErrors.lastName = "Last name is required";
                if (!personal.email.trim()) newErrors.email = "Email is required";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personal.email))
                    newErrors.email = "Invalid email address";
                if (!personal.phone.trim()) newErrors.phone = "Phone number is required";
                if (!personal.dobMonth) newErrors.dobMonth = "Month is required";
                if (!personal.dobDay) newErrors.dobDay = "Day is required";
                if (!personal.dobYear) newErrors.dobYear = "Year is required";
                if (!personal.ssnLast4.trim()) newErrors.ssnLast4 = "SSN last 4 is required";
                else if (!/^\d{4}$/.test(personal.ssnLast4))
                    newErrors.ssnLast4 = "Must be exactly 4 digits";
            }

            if (step === 1) {
                if (!address.line1.trim()) newErrors.line1 = "Street address is required";
                if (!address.city.trim()) newErrors.city = "City is required";
                if (!address.state) newErrors.state = "State is required";
                if (!address.postalCode.trim()) newErrors.postalCode = "ZIP code is required";
                else if (!/^\d{5}$/.test(address.postalCode))
                    newErrors.postalCode = "Must be a 5-digit ZIP code";
            }

            if (step === 2) {
                if (!effectiveHolderName.trim())
                    newErrors.accountHolderName = "Account holder name is required";
                if (!bank.routingNumber.trim()) newErrors.routingNumber = "Routing number is required";
                else if (!/^\d{9}$/.test(bank.routingNumber))
                    newErrors.routingNumber = "Must be exactly 9 digits";
                if (!bank.accountNumber.trim())
                    newErrors.accountNumber = "Account number is required";
                if (!bank.confirmAccountNumber.trim())
                    newErrors.confirmAccountNumber = "Please confirm account number";
                else if (bank.accountNumber !== bank.confirmAccountNumber)
                    newErrors.confirmAccountNumber = "Account numbers do not match";
            }

            if (step === 3) {
                if (!tosAccepted) newErrors.tos = "You must accept the terms to continue";
            }

            setErrors(newErrors);
            return Object.keys(newErrors).length === 0;
        },
        [personal, address, bank, effectiveHolderName, tosAccepted]
    );

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setErrors({});
            setCurrentStep((s) => s + 1);
        }
    };

    const handleBack = () => {
        setErrors({});
        setCurrentStep((s) => s - 1);
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;

        setSubmitting(true);
        setSubmitError(null);

        try {
            // Guard: prevent submit if account is Express (should be caught by routing)
            if (connectStatus.accountType === "express") {
                setSubmitError(
                    "This account uses Stripe's hosted onboarding. Please close this dialog and use the Stripe redirect instead."
                );
                setSubmitting(false);
                return;
            }

            // 1. Update personal details + address
            const detailsPayload: UpdateDetailsPayload = {
                first_name: personal.firstName,
                last_name: personal.lastName,
                email: personal.email,
                phone: personal.phone,
                dob: {
                    month: parseInt(personal.dobMonth),
                    day: parseInt(personal.dobDay),
                    year: parseInt(personal.dobYear),
                },
                ssn_last_4: personal.ssnLast4,
                address: {
                    line1: address.line1,
                    city: address.city,
                    state: address.state,
                    postal_code: address.postalCode,
                },
            };
            await connectStatus.updateDetails(detailsPayload);

            // 2. Add bank account (tokenized via Stripe.js)
            const { loadStripe } = await import("@stripe/stripe-js");
            const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
            if (!publishableKey) throw new Error("Stripe publishable key not configured");
            const stripeInstance = await loadStripe(publishableKey);
            if (!stripeInstance) throw new Error("Failed to load Stripe");

            const { token: bankToken, error: tokenError } = await stripeInstance.createToken(
                "bank_account" as any,
                {
                    country: "US",
                    currency: "usd",
                    routing_number: bank.routingNumber,
                    account_number: bank.accountNumber,
                    account_holder_name: effectiveHolderName,
                    account_holder_type: "individual",
                } as any,
            );

            if (tokenError || !bankToken) {
                throw new Error(tokenError?.message || "Failed to tokenize bank details");
            }

            await connectStatus.addBankAccount({ token: bankToken.id });

            // 3. Accept TOS — use response directly to avoid stale closure
            const tosResult = await connectStatus.acceptTos();

            // Check if identity verification is needed (from fresh API response)
            if (tosResult.needs_identity_verification) {
                setShowVerification(true);
            }
        } catch (err: any) {
            setSubmitError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // After wizard submit, show identity verification if needed
    if (showVerification) {
        return (
            <IdentityVerificationView
                isOpen={isOpen}
                onClose={onClose}
                connectStatus={connectStatus}
            />
        );
    }

    return (
        <BaselWizardModal
            isOpen={isOpen}
            onClose={onClose}
            title="Set Up Payouts"
            icon="fa-building-columns"
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            submitting={submitting}
            nextDisabled={false}
            submitLabel="Submit & Verify"
            submittingLabel="Submitting..."
            maxWidth="max-w-2xl"
        >
            {submitError && (
                <div className="mb-6">
                    <BaselAlertBox variant="error">{submitError}</BaselAlertBox>
                </div>
            )}

            {currentStep === 0 && (
                <PersonalInfoStep
                    data={personal}
                    onChange={setPersonal}
                    errors={errors}
                />
            )}

            {currentStep === 1 && (
                <AddressStep
                    data={address}
                    onChange={setAddress}
                    errors={errors}
                />
            )}

            {currentStep === 2 && (
                <BankAccountStep
                    data={bank}
                    onChange={setBank}
                    holderName={effectiveHolderName}
                    errors={errors}
                />
            )}

            {currentStep === 3 && (
                <ReviewStep
                    personal={personal}
                    address={address}
                    bank={bank}
                    holderName={effectiveHolderName}
                    tosAccepted={tosAccepted}
                    onTosChange={setTosAccepted}
                    onEditStep={setCurrentStep}
                    errors={errors}
                />
            )}
        </BaselWizardModal>
    );
}

/* ─── Identity Verification View ─────────────────────────────────────────── */

function IdentityVerificationView({
    isOpen,
    onClose,
    connectStatus,
}: {
    isOpen: boolean;
    onClose: () => void;
    connectStatus: ReturnType<typeof useStripeConnectStatus>;
}) {
    const [verifying, setVerifying] = useState(false);
    const [verifyError, setVerifyError] = useState<string | null>(null);
    const [verifyComplete, setVerifyComplete] = useState(false);

    const handleVerify = async () => {
        setVerifying(true);
        setVerifyError(null);

        try {
            // 1. Create verification session on backend
            const { client_secret } = await connectStatus.createVerificationSession();

            // 2. Load Stripe.js and open Identity modal
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
                // Refresh status — webhook will eventually update the account
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
                title="Set Up Payouts"
                subtitle={verifyComplete ? "Verification Submitted" : "Identity Verification"}
                icon="fa-building-columns"
                iconColor={verifyComplete ? "success" : "info"}
                onClose={onClose}
            >
                <div className="flex gap-2 mt-5">
                    {WIZARD_STEPS.map((_, i) => (
                        <div
                            key={i}
                            className="h-1 flex-1 bg-primary"
                        />
                    ))}
                    <div
                        className={`h-1 flex-1 ${
                            verifyComplete ? "bg-success" : "bg-info"
                        }`}
                    />
                </div>
            </BaselModalHeader>

            <BaselModalBody padding="p-8">
                {verifyComplete ? (
                    <div className="text-center py-6">
                        <div className="w-16 h-16 bg-success/10 flex items-center justify-center mx-auto mb-5">
                            <i className="fa-duotone fa-regular fa-circle-check text-3xl text-success" />
                        </div>
                        <h4 className="text-xl font-black mb-2">
                            Verification Submitted
                        </h4>
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
                        <h4 className="text-xl font-black mb-2">
                            Verify Your Identity
                        </h4>
                        <p className="text-base-content/60 max-w-md mx-auto leading-relaxed">
                            Your account details have been saved. To complete setup,
                            we need to verify your identity with a photo ID and a
                            selfie.
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

/* ─── Step 1: Personal Information ───────────────────────────────────────── */

function PersonalInfoStep({
    data,
    onChange,
    errors,
}: {
    data: PersonalInfo;
    onChange: (d: PersonalInfo) => void;
    errors: Record<string, string>;
}) {
    const update = (field: keyof PersonalInfo, value: string) =>
        onChange({ ...data, [field]: value });

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 83 }, (_, i) => currentYear - 18 - i);

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaselFormField label="First Name" required error={errors.firstName}>
                    <input
                        type="text"
                        className={`input w-full ${errors.firstName ? "input-error" : ""}`}
                        value={data.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        placeholder="John"
                    />
                </BaselFormField>

                <BaselFormField label="Last Name" required error={errors.lastName}>
                    <input
                        type="text"
                        className={`input w-full ${errors.lastName ? "input-error" : ""}`}
                        value={data.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        placeholder="Smith"
                    />
                </BaselFormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaselFormField label="Email" required error={errors.email}>
                    <input
                        type="email"
                        className={`input w-full ${errors.email ? "input-error" : ""}`}
                        value={data.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="john@example.com"
                    />
                </BaselFormField>

                <BaselFormField label="Phone" required error={errors.phone}>
                    <input
                        type="tel"
                        className={`input w-full ${errors.phone ? "input-error" : ""}`}
                        value={data.phone}
                        onChange={(e) => update("phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                    />
                </BaselFormField>
            </div>

            <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2">
                    Date of Birth <span className="text-error">*</span>
                </p>
                <div className="grid grid-cols-3 gap-3">
                    <select
                        className={`select w-full ${errors.dobMonth ? "select-error" : ""}`}
                        value={data.dobMonth}
                        onChange={(e) => update("dobMonth", e.target.value)}
                    >
                        <option value="">Month</option>
                        {MONTHS.map((m, i) => (
                            <option key={m} value={String(i + 1)}>
                                {m}
                            </option>
                        ))}
                    </select>
                    <select
                        className={`select w-full ${errors.dobDay ? "select-error" : ""}`}
                        value={data.dobDay}
                        onChange={(e) => update("dobDay", e.target.value)}
                    >
                        <option value="">Day</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={String(d)}>
                                {d}
                            </option>
                        ))}
                    </select>
                    <select
                        className={`select w-full ${errors.dobYear ? "select-error" : ""}`}
                        value={data.dobYear}
                        onChange={(e) => update("dobYear", e.target.value)}
                    >
                        <option value="">Year</option>
                        {yearOptions.map((y) => (
                            <option key={y} value={String(y)}>
                                {y}
                            </option>
                        ))}
                    </select>
                </div>
                {(errors.dobMonth || errors.dobDay || errors.dobYear) && (
                    <p className="text-error text-xs mt-1">
                        <i className="fa-duotone fa-regular fa-circle-exclamation mr-1" />
                        Please select a complete date of birth
                    </p>
                )}
            </div>

            <BaselFormField
                label="SSN Last 4 Digits"
                required
                error={errors.ssnLast4}
                hint="Only the last 4 digits of your Social Security Number"
            >
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    className={`input w-full max-w-32 ${errors.ssnLast4 ? "input-error" : ""}`}
                    value={data.ssnLast4}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                        update("ssnLast4", val);
                    }}
                    placeholder="1234"
                />
            </BaselFormField>
        </div>
    );
}

/* ─── Step 2: Address ────────────────────────────────────────────────────── */

function AddressStep({
    data,
    onChange,
    errors,
}: {
    data: AddressInfo;
    onChange: (d: AddressInfo) => void;
    errors: Record<string, string>;
}) {
    const update = (field: keyof AddressInfo, value: string) =>
        onChange({ ...data, [field]: value });

    return (
        <div className="space-y-5">
            <BaselFormField label="Street Address" required error={errors.line1}>
                <input
                    type="text"
                    className={`input w-full ${errors.line1 ? "input-error" : ""}`}
                    value={data.line1}
                    onChange={(e) => update("line1", e.target.value)}
                    placeholder="123 Main Street"
                />
            </BaselFormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaselFormField label="City" required error={errors.city}>
                    <input
                        type="text"
                        className={`input w-full ${errors.city ? "input-error" : ""}`}
                        value={data.city}
                        onChange={(e) => update("city", e.target.value)}
                        placeholder="San Francisco"
                    />
                </BaselFormField>

                <BaselFormField label="State" required error={errors.state}>
                    <select
                        className={`select w-full ${errors.state ? "select-error" : ""}`}
                        value={data.state}
                        onChange={(e) => update("state", e.target.value)}
                    >
                        <option value="">Select state</option>
                        {US_STATES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </BaselFormField>
            </div>

            <BaselFormField label="ZIP Code" required error={errors.postalCode}>
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={5}
                    className={`input w-full max-w-32 ${errors.postalCode ? "input-error" : ""}`}
                    value={data.postalCode}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                        update("postalCode", val);
                    }}
                    placeholder="94102"
                />
            </BaselFormField>
        </div>
    );
}

/* ─── Step 3: Bank Account ───────────────────────────────────────────────── */

function BankAccountStep({
    data,
    onChange,
    holderName,
    errors,
}: {
    data: BankInfo;
    onChange: (d: BankInfo) => void;
    holderName: string;
    errors: Record<string, string>;
}) {
    const update = (field: keyof BankInfo, value: string) =>
        onChange({ ...data, [field]: value });

    return (
        <div className="space-y-5">
            <BaselFormField
                label="Account Holder Name"
                required
                error={errors.accountHolderName}
            >
                <input
                    type="text"
                    className={`input w-full ${errors.accountHolderName ? "input-error" : ""}`}
                    value={data.accountHolderName || holderName}
                    onChange={(e) => update("accountHolderName", e.target.value)}
                    placeholder="John Smith"
                />
            </BaselFormField>

            <BaselFormField
                label="Routing Number"
                required
                error={errors.routingNumber}
                hint="9-digit number found on your check or bank statement"
            >
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={9}
                    className={`input w-full max-w-48 ${errors.routingNumber ? "input-error" : ""}`}
                    value={data.routingNumber}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 9);
                        update("routingNumber", val);
                    }}
                    placeholder="110000000"
                />
            </BaselFormField>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaselFormField
                    label="Account Number"
                    required
                    error={errors.accountNumber}
                >
                    <input
                        type="password"
                        inputMode="numeric"
                        className={`input w-full ${errors.accountNumber ? "input-error" : ""}`}
                        value={data.accountNumber}
                        onChange={(e) => update("accountNumber", e.target.value)}
                        placeholder="Enter account number"
                    />
                </BaselFormField>

                <BaselFormField
                    label="Confirm Account Number"
                    required
                    error={errors.confirmAccountNumber}
                >
                    <input
                        type="password"
                        inputMode="numeric"
                        className={`input w-full ${errors.confirmAccountNumber ? "input-error" : ""}`}
                        value={data.confirmAccountNumber}
                        onChange={(e) =>
                            update("confirmAccountNumber", e.target.value)
                        }
                        placeholder="Re-enter account number"
                    />
                </BaselFormField>
            </div>

            <div className="bg-base-200 p-4 flex items-start gap-3">
                <i className="fa-duotone fa-regular fa-shield-check text-base-content/40 mt-0.5" />
                <div>
                    <p className="font-bold text-sm">Bank-level security</p>
                    <p className="text-xs text-base-content/50 mt-1">
                        Your bank details are encrypted and transmitted securely.
                        Account numbers are never stored on our servers.
                    </p>
                </div>
            </div>
        </div>
    );
}

/* ─── Step 4: Review & Submit ────────────────────────────────────────────── */

function ReviewStep({
    personal,
    address,
    bank,
    holderName,
    tosAccepted,
    onTosChange,
    onEditStep,
    errors,
}: {
    personal: PersonalInfo;
    address: AddressInfo;
    bank: BankInfo;
    holderName: string;
    tosAccepted: boolean;
    onTosChange: (v: boolean) => void;
    onEditStep: (step: number) => void;
    errors: Record<string, string>;
}) {
    const dobDisplay =
        personal.dobMonth && personal.dobDay && personal.dobYear
            ? `${MONTHS[parseInt(personal.dobMonth) - 1]} ${personal.dobDay}, ${personal.dobYear}`
            : "Not set";

    return (
        <div className="space-y-5">
            <BaselReviewSection
                title="Personal Information"
                onEdit={() => onEditStep(0)}
                items={[
                    { label: "Name", value: `${personal.firstName} ${personal.lastName}` },
                    { label: "Email", value: personal.email },
                    { label: "Phone", value: personal.phone },
                    { label: "Date of Birth", value: dobDisplay },
                    { label: "SSN", value: `***-**-${personal.ssnLast4}` },
                ]}
            />

            <BaselReviewSection
                title="Address"
                onEdit={() => onEditStep(1)}
                items={[
                    { label: "Street", value: address.line1 },
                    { label: "City", value: address.city },
                    { label: "State", value: address.state },
                    { label: "ZIP Code", value: address.postalCode },
                ]}
            />

            <BaselReviewSection
                title="Bank Account"
                onEdit={() => onEditStep(2)}
                items={[
                    { label: "Account Holder", value: holderName },
                    { label: "Routing Number", value: bank.routingNumber },
                    {
                        label: "Account Number",
                        value: `****${bank.accountNumber.slice(-4)}`,
                    },
                ]}
            />

            <div className="border-t border-base-300 pt-5">
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        className={`checkbox checkbox-primary mt-0.5 ${errors.tos ? "checkbox-error" : ""}`}
                        checked={tosAccepted}
                        onChange={(e) => onTosChange(e.target.checked)}
                    />
                    <span className="text-sm text-base-content/70 leading-relaxed">
                        I agree to the{" "}
                        <a
                            href="https://stripe.com/connect-account/legal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Stripe Connected Account Agreement
                        </a>{" "}
                        and the{" "}
                        <a
                            href="/terms-of-service"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                        >
                            Splits Network Terms of Service
                        </a>
                        .
                    </span>
                </label>
                {errors.tos && (
                    <p className="text-error text-xs mt-2 ml-8">
                        <i className="fa-duotone fa-regular fa-circle-exclamation mr-1" />
                        {errors.tos}
                    </p>
                )}
            </div>
        </div>
    );
}
