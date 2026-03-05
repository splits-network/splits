"use client";

import { useState, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import type { FirmConnectStatusState, UpdateFirmDetailsPayload } from "@/hooks/use-firm-connect-status";
import { BaselAlertBox, BaselWizardModal } from "@splits-network/basel-ui";
import { IdentityVerificationView, WIZARD_STEPS } from "./firm-connect-views";
import {
    CompanyRepStep,
    AddressStep,
    BankAccountStep,
    ReviewStep,
    type CompanyInfo,
    type RepresentativeInfo,
    type AddressInfo,
    type BankInfo,
} from "./firm-connect-steps";

export function FirmConnectWizard({
    isOpen,
    onClose,
    connectStatus,
    firmName,
}: {
    isOpen: boolean;
    onClose: () => void;
    connectStatus: FirmConnectStatusState;
    firmName?: string;
}) {
    const { user } = useUser();
    const [currentStep, setCurrentStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [showVerification, setShowVerification] = useState(false);

    const [company, setCompany] = useState<CompanyInfo>({
        companyName: firmName || "",
        companyPhone: "",
        companyTaxId: "",
    });

    const [representative, setRepresentative] = useState<RepresentativeInfo>({
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
        bank.accountHolderName || company.companyName || `${representative.firstName} ${representative.lastName}`.trim();

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateStep = useCallback(
        (step: number): boolean => {
            const newErrors: Record<string, string> = {};

            if (step === 0) {
                if (!representative.firstName.trim()) newErrors.firstName = "First name is required";
                if (!representative.lastName.trim()) newErrors.lastName = "Last name is required";
                if (!representative.email.trim()) newErrors.email = "Email is required";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(representative.email))
                    newErrors.email = "Invalid email address";
                if (!representative.phone.trim()) newErrors.phone = "Phone number is required";
                if (!representative.dobMonth) newErrors.dobMonth = "Month is required";
                if (!representative.dobDay) newErrors.dobDay = "Day is required";
                if (!representative.dobYear) newErrors.dobYear = "Year is required";
                if (!representative.ssnLast4.trim()) newErrors.ssnLast4 = "SSN last 4 is required";
                else if (!/^\d{4}$/.test(representative.ssnLast4))
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
                if (!bank.accountNumber.trim()) newErrors.accountNumber = "Account number is required";
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
        [representative, address, bank, effectiveHolderName, tosAccepted]
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
            const detailsPayload: UpdateFirmDetailsPayload = {
                company_name: company.companyName,
                company_phone: company.companyPhone || undefined,
                company_tax_id: company.companyTaxId || undefined,
                first_name: representative.firstName,
                last_name: representative.lastName,
                email: representative.email,
                phone: representative.phone,
                dob: {
                    month: parseInt(representative.dobMonth),
                    day: parseInt(representative.dobDay),
                    year: parseInt(representative.dobYear),
                },
                ssn_last_4: representative.ssnLast4,
                address: {
                    line1: address.line1,
                    city: address.city,
                    state: address.state,
                    postal_code: address.postalCode,
                },
            };
            await connectStatus.updateDetails(detailsPayload);

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
                    account_holder_type: "company",
                } as any,
            );

            if (tokenError || !bankToken) {
                throw new Error(tokenError?.message || "Failed to verify bank details. Please check your information and try again.");
            }

            await connectStatus.addBankAccount({ token: bankToken.id });

            const tosResult = await connectStatus.acceptTos();

            if (tosResult.needs_identity_verification) {
                setShowVerification(true);
            }
        } catch (err: any) {
            setSubmitError(err?.message || "Something went wrong. Please try again.");
            setCurrentStep(2);
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
            title="Set Up Firm Payouts"
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
                <CompanyRepStep
                    company={company}
                    representative={representative}
                    onCompanyChange={setCompany}
                    onRepChange={setRepresentative}
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
                    company={company}
                    representative={representative}
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
