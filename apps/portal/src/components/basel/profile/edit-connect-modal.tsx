"use client";

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import {
    type StripeConnectStatusState,
    type UpdateDetailsPayload,
} from "@/hooks/use-stripe-connect-status";
import { ModalPortal } from "@splits-network/shared-ui";
import { BaselAlertBox, BaselWizardModal } from "@splits-network/basel-ui";
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

interface EditConnectModalProps {
    isOpen: boolean;
    onClose: () => void;
    /** Pre-loaded connect status from parent — no hooks, no routing */
    connectStatus: StripeConnectStatusState;
}

/* ─── Component ─────────────────────────────────────────────────────────── */

export function EditConnectModal({ isOpen, onClose, connectStatus }: EditConnectModalProps) {
    return (
        <ModalPortal>
            {isOpen && (
                <EditWizard
                    isOpen={isOpen}
                    onClose={onClose}
                    connectStatus={connectStatus}
                />
            )}
        </ModalPortal>
    );
}

/* ─── Edit Wizard ───────────────────────────────────────────────────────── */

function EditWizard({
    isOpen,
    onClose,
    connectStatus,
}: {
    isOpen: boolean;
    onClose: () => void;
    connectStatus: StripeConnectStatusState;
}) {
    const { user } = useUser();
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const ind = connectStatus.individual;

    // Pre-populate from Stripe individual data, fall back to Clerk user
    const [personal, setPersonal] = useState<PersonalInfo>({
        firstName: ind?.first_name || user?.firstName || "",
        lastName: ind?.last_name || user?.lastName || "",
        email: ind?.email || user?.primaryEmailAddress?.emailAddress || "",
        phone: ind?.phone || user?.primaryPhoneNumber?.phoneNumber || "",
        dobMonth: ind?.dob?.month ? String(ind.dob.month) : "",
        dobDay: ind?.dob?.day ? String(ind.dob.day) : "",
        dobYear: ind?.dob?.year ? String(ind.dob.year) : "",
        ssnLast4: "",
    });

    const [address, setAddress] = useState<AddressInfo>({
        line1: ind?.address?.line1 || "",
        city: ind?.address?.city || "",
        state: ind?.address?.state || "",
        postalCode: ind?.address?.postal_code || "",
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
    const ssnAlreadyProvided = !!ind?.ssn_last_4_provided;

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
                if (!personal.ssnLast4.trim() && !ssnAlreadyProvided)
                    newErrors.ssnLast4 = "SSN last 4 is required";
                else if (personal.ssnLast4.trim() && !/^\d{4}$/.test(personal.ssnLast4))
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
        [personal, address, bank, effectiveHolderName, tosAccepted, ssnAlreadyProvided]
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
                ssn_last_4: personal.ssnLast4 || "",
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
            await connectStatus.acceptTos();

            // Done — close the modal
            onClose();
        } catch (err: any) {
            setSubmitError(err?.message || "Something went wrong. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <BaselWizardModal
            isOpen={isOpen}
            onClose={onClose}
            title="Edit Payout Details"
            icon="fa-building-columns"
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            onNext={handleNext}
            onBack={handleBack}
            onSubmit={handleSubmit}
            submitting={submitting}
            nextDisabled={false}
            submitLabel="Save Changes"
            submittingLabel="Saving..."
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
                    ssnAlreadyProvided={ssnAlreadyProvided}
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
                    existingBank={connectStatus.bankAccount}
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
