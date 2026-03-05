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
    BaselWizardModal,
    BaselModal,
    BaselModalHeader,
    BaselModalBody,
    BaselModalFooter,
} from "@splits-network/basel-ui";
import {
    type PersonalInfo,
    type AddressInfo,
    type BankInfo,
    WIZARD_STEPS,
} from "./connect-wizard-types";
import {
    PersonalInfoStep,
    AddressStep,
    BankAccountStep,
    ReviewStep,
} from "./connect-wizard-steps";

/* ─── Types ──────────────────────────────────────────────────────────────── */

interface ConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

/* ─── Main Component ─────────────────────────────────────────────────────── */

export function ConnectModal({ isOpen, onClose }: ConnectModalProps) {
    return (
        <ModalPortal>
            {isOpen && (
                <ModalInner isOpen={isOpen} onClose={onClose} />
            )}
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

/* ─── 4-Step Wizard (setup flow) ─────────────────────────────────────────── */

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

    // Form state — pre-populate from Clerk user
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

    const effectiveHolderName =
        bank.accountHolderName ||
        `${personal.firstName} ${personal.lastName}`.trim();

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
                if (!personal.ssnLast4.trim())
                    newErrors.ssnLast4 = "SSN last 4 is required";
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

            // 3. Accept TOS
            const tosResult = await connectStatus.acceptTos();

            if (tosResult.needs_identity_verification) {
                setShowVerification(true);
            }
        } catch (err: any) {
            setSubmitError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

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
