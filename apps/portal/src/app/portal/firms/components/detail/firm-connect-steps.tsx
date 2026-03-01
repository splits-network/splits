"use client";

import { BaselFormField, BaselReviewSection } from "@splits-network/basel-ui";

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

export { MONTHS };

/* ─── Form Types ──────────────────────────────────────────────────────────── */

export interface CompanyInfo {
    companyName: string;
    companyPhone: string;
    companyTaxId: string;
}

export interface RepresentativeInfo {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dobMonth: string;
    dobDay: string;
    dobYear: string;
    ssnLast4: string;
}

export interface AddressInfo {
    line1: string;
    city: string;
    state: string;
    postalCode: string;
}

export interface BankInfo {
    accountHolderName: string;
    routingNumber: string;
    accountNumber: string;
    confirmAccountNumber: string;
}

/* ─── Step 1: Company & Representative ────────────────────────────────────── */

export function CompanyRepStep({
    company,
    representative,
    onCompanyChange,
    onRepChange,
    errors,
}: {
    company: CompanyInfo;
    representative: RepresentativeInfo;
    onCompanyChange: (d: CompanyInfo) => void;
    onRepChange: (d: RepresentativeInfo) => void;
    errors: Record<string, string>;
}) {
    const updateC = (field: keyof CompanyInfo, value: string) =>
        onCompanyChange({ ...company, [field]: value });
    const updateR = (field: keyof RepresentativeInfo, value: string) =>
        onRepChange({ ...representative, [field]: value });

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 83 }, (_, i) => currentYear - 18 - i);

    return (
        <div className="space-y-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-base-content/50">
                Company Information
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaselFormField label="Company Name" error={errors.companyName}>
                    <input
                        type="text"
                        className={`input w-full ${errors.companyName ? "input-error" : ""}`}
                        value={company.companyName}
                        onChange={(e) => updateC("companyName", e.target.value)}
                        placeholder="Acme Recruiting Inc."
                    />
                </BaselFormField>
                <BaselFormField label="Company Phone" error={errors.companyPhone}>
                    <input
                        type="tel"
                        className={`input w-full ${errors.companyPhone ? "input-error" : ""}`}
                        value={company.companyPhone}
                        onChange={(e) => updateC("companyPhone", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                    />
                </BaselFormField>
            </div>
            <BaselFormField label="Tax ID (EIN)" error={errors.companyTaxId} hint="Your firm's Employer Identification Number">
                <input
                    type="text"
                    className={`input w-full max-w-48 ${errors.companyTaxId ? "input-error" : ""}`}
                    value={company.companyTaxId}
                    onChange={(e) => updateC("companyTaxId", e.target.value)}
                    placeholder="12-3456789"
                />
            </BaselFormField>

            <div className="border-t border-base-300 pt-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-4">
                    Account Representative
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaselFormField label="First Name" required error={errors.firstName}>
                    <input
                        type="text"
                        className={`input w-full ${errors.firstName ? "input-error" : ""}`}
                        value={representative.firstName}
                        onChange={(e) => updateR("firstName", e.target.value)}
                        placeholder="John"
                    />
                </BaselFormField>
                <BaselFormField label="Last Name" required error={errors.lastName}>
                    <input
                        type="text"
                        className={`input w-full ${errors.lastName ? "input-error" : ""}`}
                        value={representative.lastName}
                        onChange={(e) => updateR("lastName", e.target.value)}
                        placeholder="Smith"
                    />
                </BaselFormField>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <BaselFormField label="Email" required error={errors.email}>
                    <input
                        type="email"
                        className={`input w-full ${errors.email ? "input-error" : ""}`}
                        value={representative.email}
                        onChange={(e) => updateR("email", e.target.value)}
                        placeholder="john@firm.com"
                    />
                </BaselFormField>
                <BaselFormField label="Phone" required error={errors.phone}>
                    <input
                        type="tel"
                        className={`input w-full ${errors.phone ? "input-error" : ""}`}
                        value={representative.phone}
                        onChange={(e) => updateR("phone", e.target.value)}
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
                        value={representative.dobMonth}
                        onChange={(e) => updateR("dobMonth", e.target.value)}
                    >
                        <option value="">Month</option>
                        {MONTHS.map((m, i) => (
                            <option key={m} value={String(i + 1)}>{m}</option>
                        ))}
                    </select>
                    <select
                        className={`select w-full ${errors.dobDay ? "select-error" : ""}`}
                        value={representative.dobDay}
                        onChange={(e) => updateR("dobDay", e.target.value)}
                    >
                        <option value="">Day</option>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={String(d)}>{d}</option>
                        ))}
                    </select>
                    <select
                        className={`select w-full ${errors.dobYear ? "select-error" : ""}`}
                        value={representative.dobYear}
                        onChange={(e) => updateR("dobYear", e.target.value)}
                    >
                        <option value="">Year</option>
                        {yearOptions.map((y) => (
                            <option key={y} value={String(y)}>{y}</option>
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
                hint="Only the last 4 digits of the representative's SSN"
            >
                <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    className={`input w-full max-w-32 ${errors.ssnLast4 ? "input-error" : ""}`}
                    value={representative.ssnLast4}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 4);
                        updateR("ssnLast4", val);
                    }}
                    placeholder="1234"
                />
            </BaselFormField>
        </div>
    );
}

/* ─── Step 2: Address ─────────────────────────────────────────────────────── */

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
                            <option key={s} value={s}>{s}</option>
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

/* ─── Step 3: Bank Account ────────────────────────────────────────────────── */

export function BankAccountStep({
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
            <BaselFormField label="Account Holder Name" required error={errors.accountHolderName}>
                <input
                    type="text"
                    className={`input w-full ${errors.accountHolderName ? "input-error" : ""}`}
                    value={data.accountHolderName || holderName}
                    onChange={(e) => update("accountHolderName", e.target.value)}
                    placeholder="Acme Recruiting Inc."
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
                <BaselFormField label="Account Number" required error={errors.accountNumber}>
                    <input
                        type="password"
                        inputMode="numeric"
                        className={`input w-full ${errors.accountNumber ? "input-error" : ""}`}
                        value={data.accountNumber}
                        onChange={(e) => update("accountNumber", e.target.value)}
                        placeholder="Enter account number"
                    />
                </BaselFormField>
                <BaselFormField label="Confirm Account Number" required error={errors.confirmAccountNumber}>
                    <input
                        type="password"
                        inputMode="numeric"
                        className={`input w-full ${errors.confirmAccountNumber ? "input-error" : ""}`}
                        value={data.confirmAccountNumber}
                        onChange={(e) => update("confirmAccountNumber", e.target.value)}
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

/* ─── Step 4: Review & Submit ─────────────────────────────────────────────── */

export function ReviewStep({
    company,
    representative,
    address,
    bank,
    holderName,
    tosAccepted,
    onTosChange,
    onEditStep,
    errors,
}: {
    company: CompanyInfo;
    representative: RepresentativeInfo;
    address: AddressInfo;
    bank: BankInfo;
    holderName: string;
    tosAccepted: boolean;
    onTosChange: (v: boolean) => void;
    onEditStep: (step: number) => void;
    errors: Record<string, string>;
}) {
    const dobDisplay =
        representative.dobMonth && representative.dobDay && representative.dobYear
            ? `${MONTHS[parseInt(representative.dobMonth) - 1]} ${representative.dobDay}, ${representative.dobYear}`
            : "Not set";

    return (
        <div className="space-y-5">
            <BaselReviewSection
                title="Company Information"
                onEdit={() => onEditStep(0)}
                items={[
                    { label: "Company", value: company.companyName || "—" },
                    { label: "Phone", value: company.companyPhone || "—" },
                    { label: "Tax ID", value: company.companyTaxId || "—" },
                ]}
            />

            <BaselReviewSection
                title="Account Representative"
                onEdit={() => onEditStep(0)}
                items={[
                    { label: "Name", value: `${representative.firstName} ${representative.lastName}` },
                    { label: "Email", value: representative.email },
                    { label: "Phone", value: representative.phone },
                    { label: "Date of Birth", value: dobDisplay },
                    { label: "SSN", value: `***-**-${representative.ssnLast4}` },
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
                    { label: "Account Number", value: `****${bank.accountNumber.slice(-4)}` },
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
