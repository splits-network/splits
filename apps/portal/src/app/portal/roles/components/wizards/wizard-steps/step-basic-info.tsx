"use client";

import { WizardHelpZone } from "@splits-network/basel-ui";
import type { FormData, Company } from "./types";

const STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "paused", label: "Paused" },
    { value: "filled", label: "Filled" },
    { value: "closed", label: "Closed" },
];

interface StepBasicInfoProps {
    formData: FormData;
    onChange: (updates: Partial<FormData>) => void;
    companies: Company[];
    userFirms: Array<{ id: string; name: string }>;
    roleSource: "company" | "firm";
    onRoleSourceChange: (source: "company" | "firm") => void;
    isOffPlatform: boolean;
    hasBothOptions: boolean;
    showCompanySelect: boolean;
    mode: "create" | "edit";
    isRecruiter: boolean;
    billingReady?: boolean;
}

export function StepBasicInfo({
    formData,
    onChange,
    companies,
    userFirms,
    roleSource,
    onRoleSourceChange,
    isOffPlatform,
    hasBothOptions,
    showCompanySelect,
    mode,
    isRecruiter,
    billingReady = true,
}: StepBasicInfoProps) {
    return (
        <div className="space-y-4">
            <WizardHelpZone
                title="Job Title"
                description="The public-facing title for this role. This appears on the marketplace and in candidate searches."
                tips={["Use standard industry titles for better search visibility", "Avoid internal jargon or abbreviations"]}
            >
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                        Job Title *
                    </legend>
                    <input
                        className="input w-full"
                        value={formData.title}
                        onChange={(e) => onChange({ title: e.target.value })}
                        placeholder="e.g., Senior Software Engineer"
                    />
                </fieldset>
            </WizardHelpZone>

            {/* Role type toggle — only when recruiter has both companies and firms */}
            {hasBothOptions && mode === "create" && (
                <WizardHelpZone
                    title="Role Type"
                    description="Choose whether this role is for a company you manage on Splits Network or an off-platform agency client."
                    tips={["Managed Company: the company is on the platform and controls billing", "Agency Client: you manage the role through your firm"]}
                >
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                            Role Type *
                        </legend>
                        <div className="join w-full">
                            <button
                                type="button"
                                onClick={() => {
                                    onRoleSourceChange("company");
                                    onChange({ source_firm_id: undefined });
                                }}
                                className={`join-item btn btn-sm flex-1 rounded-none ${
                                    roleSource === "company" ? "btn-active" : ""
                                }`}
                            >
                                <i className="fa-duotone fa-regular fa-building" />
                                Managed Company
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    onRoleSourceChange("firm");
                                    onChange({ company_id: "", source_firm_id: userFirms[0]?.id });
                                }}
                                className={`join-item btn btn-sm flex-1 rounded-none ${
                                    roleSource === "firm" ? "btn-active" : ""
                                }`}
                            >
                                <i className="fa-duotone fa-regular fa-users-rectangle" />
                                Agency Client
                            </button>
                        </div>
                    </fieldset>
                </WizardHelpZone>
            )}

            {/* Company/firm selection based on role source */}
            {isOffPlatform ? (
                <WizardHelpZone
                    title="Agency"
                    description="The recruiting firm that owns this off-platform role."
                >
                    {userFirms.length > 1 ? (
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                                Agency *
                            </legend>
                            <select
                                className="select w-full"
                                value={formData.source_firm_id || ""}
                                onChange={(e) => onChange({ source_firm_id: e.target.value })}
                            >
                                {userFirms.map((firm) => (
                                    <option key={firm.id} value={firm.id}>
                                        {firm.name}
                                    </option>
                                ))}
                            </select>
                        </fieldset>
                    ) : (
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                                Agency
                            </legend>
                            <input className="input w-full" value={userFirms[0]?.name || ""} disabled readOnly />
                        </fieldset>
                    )}
                </WizardHelpZone>
            ) : (
                <WizardHelpZone
                    title="Company"
                    description="The company hiring for this role. This determines billing and who manages the role."
                >
                    {showCompanySelect ? (
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                                Company *
                            </legend>
                            <select
                                className="select w-full"
                                value={formData.company_id}
                                onChange={(e) => onChange({ company_id: e.target.value })}
                            >
                                <option value="">Select a company...</option>
                                {companies.map((c) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </fieldset>
                    ) : (
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                                Company *
                            </legend>
                            <input className="input w-full" value={companies[0]?.name || "Loading..."} disabled readOnly />
                        </fieldset>
                    )}
                </WizardHelpZone>
            )}

            <div className="grid grid-cols-2 gap-4">
                <WizardHelpZone
                    title="Location"
                    description="Where the role is based. Use 'Remote' if fully remote."
                    tips={["Include city and state for in-office roles", "Candidates filter by location — accuracy matters"]}
                >
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                            Location
                        </legend>
                        <input
                            className="input w-full"
                            value={formData.location}
                            onChange={(e) => onChange({ location: e.target.value })}
                            placeholder="e.g., New York, NY or Remote"
                        />
                    </fieldset>
                </WizardHelpZone>
                <WizardHelpZone
                    title="Department"
                    description="The team or department this role belongs to. Helps with internal organization."
                >
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                            Department
                        </legend>
                        <input
                            className="input w-full"
                            value={formData.department}
                            onChange={(e) => onChange({ department: e.target.value })}
                            placeholder="e.g., Engineering"
                        />
                    </fieldset>
                </WizardHelpZone>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <WizardHelpZone
                    title="Status"
                    description="Controls the role's visibility on the marketplace."
                    tips={["Draft: hidden from recruiters", "Active: live on the marketplace", "Pending: awaiting company approval"]}
                >
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                            Status *
                        </legend>
                        <select
                            className="select w-full"
                            value={!billingReady ? "draft" : formData.status}
                            onChange={(e) => onChange({ status: e.target.value as FormData["status"] })}
                            disabled={!billingReady}
                        >
                            {(!billingReady
                                ? STATUS_OPTIONS.filter((opt) => opt.value === "draft")
                                : isRecruiter && roleSource === "company"
                                    ? STATUS_OPTIONS.filter((opt) => opt.value === "draft" || opt.value === "pending")
                                    : STATUS_OPTIONS
                            ).map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {!billingReady && (
                            <p className="text-sm text-warning mt-1">
                                Billing setup required to change status. This role will be saved as a draft.
                            </p>
                        )}
                    </fieldset>
                </WizardHelpZone>

                <WizardHelpZone
                    title="Activation Date"
                    description="When this role goes live on the marketplace. Required for Early Access roles."
                    tips={["Leave blank for immediate activation", "Early Access roles must have an activation date"]}
                >
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                            Activation Date{formData.is_early_access ? " *" : ""}
                        </legend>
                        <input
                            type="datetime-local"
                            className="input w-full"
                            value={formData.activates_at}
                            onChange={(e) => onChange({ activates_at: e.target.value })}
                            min={new Date().toISOString().slice(0, 16)}
                            required={formData.is_early_access}
                        />
                        <p className="text-sm text-base-content/50 mt-1">
                            {formData.is_early_access
                                ? "Required. The role will go live to all recruiters on this date."
                                : "Optional. The role will automatically go live on this date."}
                        </p>
                    </fieldset>
                </WizardHelpZone>

                <WizardHelpZone
                    title="Close Date"
                    description="When this role automatically stops accepting applications."
                >
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                            Close Date
                        </legend>
                        <input
                            type="datetime-local"
                            className="input w-full"
                            value={formData.closes_at}
                            onChange={(e) => onChange({ closes_at: e.target.value })}
                            min={new Date().toISOString().slice(0, 16)}
                        />
                        <p className="text-sm text-base-content/50 mt-1">
                            Optional. The role will automatically close on this date.
                        </p>
                    </fieldset>
                </WizardHelpZone>
            </div>

            {/* Visibility modifiers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WizardHelpZone
                    title="Early Access"
                    description="Restricts visibility to partner-tier recruiters until the activation date."
                    tips={["Great for confidential searches", "Only top-tier recruiters see the role initially"]}
                >
                    <label className={`flex items-center gap-3 cursor-pointer border-2 p-4 transition-colors ${
                        formData.is_early_access
                            ? "border-accent bg-accent/5"
                            : "border-base-300"
                    }`}>
                        <input
                            type="checkbox"
                            className="toggle toggle-accent toggle-sm"
                            checked={formData.is_early_access}
                            onChange={(e) => onChange({ is_early_access: e.target.checked })}
                        />
                        <div>
                            <span className="text-sm font-bold flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-lock text-accent" />
                                Early Access
                            </span>
                            <p className="text-sm text-base-content/50">
                                Only partner-tier recruiters can see this role until the activation date.
                            </p>
                        </div>
                    </label>
                </WizardHelpZone>

                <WizardHelpZone
                    title="Priority"
                    description="Boosts this role with featured placement and higher visibility in the marketplace."
                    tips={["Priority roles appear first in search results", "Attracts more recruiter attention"]}
                >
                    <label className={`flex items-center gap-3 cursor-pointer border-2 p-4 transition-colors ${
                        formData.is_priority
                            ? "border-primary bg-primary/5"
                            : "border-base-300"
                    }`}>
                        <input
                            type="checkbox"
                            className="toggle toggle-primary toggle-sm"
                            checked={formData.is_priority}
                            onChange={(e) => onChange({ is_priority: e.target.checked })}
                        />
                        <div>
                            <span className="text-sm font-bold flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-bolt text-primary" />
                                Priority
                            </span>
                            <p className="text-sm text-base-content/50">
                                Boost this role with featured placement and higher visibility.
                            </p>
                        </div>
                    </label>
                </WizardHelpZone>
            </div>
        </div>
    );
}
