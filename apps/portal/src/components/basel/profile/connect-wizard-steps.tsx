"use client";

import { useState, useCallback, useRef } from "react";
import { BaselFormField, BaselReviewSection } from "@splits-network/basel-ui";
import {
    type PersonalInfo,
    type AddressInfo,
    type BankInfo,
    US_STATES,
    MONTHS,
    validateRoutingChecksum,
} from "./connect-wizard-types";

/* ─── Step 1: Personal Information ──────────────────────────────────────── */

export function PersonalInfoStep({
    data,
    onChange,
    errors,
    ssnAlreadyProvided = false,
}: {
    data: PersonalInfo;
    onChange: (d: PersonalInfo) => void;
    errors: Record<string, string>;
    ssnAlreadyProvided?: boolean;
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
                required={!ssnAlreadyProvided}
                error={errors.ssnLast4}
                hint={ssnAlreadyProvided
                    ? "Already on file. Leave blank to keep current, or enter new digits to update."
                    : "Only the last 4 digits of your Social Security Number"
                }
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

/* ─── Step 2: Address ───────────────────────────────────────────────────── */

export function AddressStep({
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

/* ─── Step 3: Bank Account ──────────────────────────────────────────────── */

type RoutingStatus = "idle" | "valid" | "invalid_checksum";
type TokenStatus = "idle" | "validating" | "valid" | "error";

export function BankAccountStep({
    data,
    onChange,
    holderName,
    errors,
    existingBank = null,
}: {
    data: BankInfo;
    onChange: (d: BankInfo) => void;
    holderName: string;
    errors: Record<string, string>;
    existingBank?: { bank_name: string; last4: string; account_type: string } | null;
}) {
    const update = (field: keyof BankInfo, value: string) =>
        onChange({ ...data, [field]: value });

    // ABA checksum status for routing number
    const [routingStatus, setRoutingStatus] = useState<RoutingStatus>("idle");

    // Stripe token pre-validation
    const [tokenStatus, setTokenStatus] = useState<TokenStatus>("idle");
    const [tokenError, setTokenError] = useState<string | null>(null);
    const validationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleRoutingChange = (value: string) => {
        const val = value.replace(/\D/g, "").slice(0, 9);
        update("routingNumber", val);

        // Reset token validation when routing changes
        setTokenStatus("idle");
        setTokenError(null);

        if (val.length < 9) {
            setRoutingStatus("idle");
        } else {
            setRoutingStatus(validateRoutingChecksum(val) ? "valid" : "invalid_checksum");
        }
    };

    // Attempt Stripe token validation when all bank fields are filled
    const attemptTokenValidation = useCallback(() => {
        if (validationTimer.current) clearTimeout(validationTimer.current);

        // Need routing (valid checksum) + account + confirm matching
        const routing = data.routingNumber;
        const account = data.accountNumber;
        const confirm = data.confirmAccountNumber;
        const holder = data.accountHolderName || holderName;

        if (
            routing.length !== 9 ||
            !validateRoutingChecksum(routing) ||
            !account.trim() ||
            !confirm.trim() ||
            account !== confirm ||
            !holder.trim()
        ) {
            return;
        }

        setTokenStatus("validating");
        setTokenError(null);

        // Debounce the Stripe call
        validationTimer.current = setTimeout(async () => {
            try {
                const { loadStripe } = await import("@stripe/stripe-js");
                const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
                if (!key) return;

                const stripe = await loadStripe(key);
                if (!stripe) return;

                const { token, error } = await stripe.createToken(
                    "bank_account" as any,
                    {
                        country: "US",
                        currency: "usd",
                        routing_number: routing,
                        account_number: account,
                        account_holder_name: holder,
                        account_holder_type: "individual",
                    } as any,
                );

                if (error) {
                    setTokenStatus("error");
                    setTokenError(error.message || "Invalid bank details");
                } else if (token) {
                    setTokenStatus("valid");
                    setTokenError(null);
                }
            } catch {
                // Silently fail — form-level validation will catch it on submit
                setTokenStatus("idle");
            }
        }, 600);
    }, [data.routingNumber, data.accountNumber, data.confirmAccountNumber, data.accountHolderName, holderName]);

    const routingHint = (() => {
        if (routingStatus === "valid")
            return "Routing number is valid";
        if (routingStatus === "invalid_checksum")
            return "Invalid routing number — please double-check";
        return "9-digit number found on your check or bank statement";
    })();

    return (
        <div className="space-y-5">
            {existingBank && (
                <div className="bg-base-200 border border-base-300 p-4 flex items-center gap-3">
                    <i className="fa-duotone fa-regular fa-building-columns text-base-content/40" />
                    <div>
                        <p className="text-sm font-bold">
                            Current: {existingBank.bank_name} &#x2022;&#x2022;&#x2022;&#x2022; {existingBank.last4}
                        </p>
                        <p className="text-xs text-base-content/50">
                            Enter new bank details below to replace this account.
                        </p>
                    </div>
                </div>
            )}
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
                error={errors.routingNumber || (routingStatus === "invalid_checksum" ? "Invalid routing number — please double-check" : undefined)}
                hint={!errors.routingNumber && routingStatus !== "invalid_checksum" ? routingHint : undefined}
            >
                <div className="relative">
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={9}
                        className={`input w-full max-w-48 ${
                            errors.routingNumber || routingStatus === "invalid_checksum"
                                ? "input-error"
                                : routingStatus === "valid"
                                  ? "input-success"
                                  : ""
                        }`}
                        value={data.routingNumber}
                        onChange={(e) => handleRoutingChange(e.target.value)}
                        placeholder="110000000"
                    />
                    {routingStatus === "valid" && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success">
                            <i className="fa-duotone fa-regular fa-circle-check" />
                        </span>
                    )}
                    {routingStatus === "invalid_checksum" && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-error">
                            <i className="fa-duotone fa-regular fa-circle-xmark" />
                        </span>
                    )}
                </div>
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
                        onBlur={attemptTokenValidation}
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
                        onBlur={attemptTokenValidation}
                        placeholder="Re-enter account number"
                    />
                </BaselFormField>
            </div>

            {/* Stripe token pre-validation feedback */}
            {tokenStatus === "validating" && (
                <div className="flex items-center gap-2 text-sm text-base-content/50">
                    <span className="loading loading-spinner loading-xs" />
                    Verifying bank details with Stripe...
                </div>
            )}
            {tokenStatus === "valid" && (
                <div className="flex items-center gap-2 text-sm text-success">
                    <i className="fa-duotone fa-regular fa-circle-check" />
                    Bank details verified successfully
                </div>
            )}
            {tokenStatus === "error" && tokenError && (
                <div className="flex items-center gap-2 text-sm text-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation" />
                    {tokenError}
                </div>
            )}

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

/* ─── Step 4: Review & Submit ───────────────────────────────────────────── */

export function ReviewStep({
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
                    { label: "SSN", value: personal.ssnLast4 ? `***-**-${personal.ssnLast4}` : "On file (unchanged)" },
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
