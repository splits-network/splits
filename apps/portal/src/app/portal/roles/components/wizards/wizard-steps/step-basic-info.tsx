"use client";

import type { FormData, Company } from "./types";

const STATUS_OPTIONS = [
    { value: "draft", label: "Draft" },
    { value: "pending", label: "Pending" },
    { value: "early", label: "Early Access" },
    { value: "active", label: "Active" },
    { value: "priority", label: "Priority" },
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
}: StepBasicInfoProps) {
    return (
        <div className="space-y-4">
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

            {/* Role type toggle — only when recruiter has both companies and firms */}
            {hasBothOptions && mode === "create" && (
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                        Role Type *
                    </legend>
                    <div className="flex bg-base-200 p-1">
                        <button
                            type="button"
                            onClick={() => {
                                onRoleSourceChange("company");
                                onChange({ source_firm_id: undefined });
                            }}
                            className={`flex-1 px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                                roleSource === "company"
                                    ? "bg-primary text-primary-content"
                                    : "text-base-content/50 hover:text-base-content"
                            }`}
                        >
                            <i className="fa-duotone fa-regular fa-building mr-2" />
                            Managed Company
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                onRoleSourceChange("firm");
                                onChange({ company_id: "", source_firm_id: userFirms[0]?.id });
                            }}
                            className={`flex-1 px-3 py-2 text-sm font-bold uppercase tracking-wider transition-colors ${
                                roleSource === "firm"
                                    ? "bg-primary text-primary-content"
                                    : "text-base-content/50 hover:text-base-content"
                            }`}
                        >
                            <i className="fa-duotone fa-regular fa-users-rectangle mr-2" />
                            Agency Client
                        </button>
                    </div>
                </fieldset>
            )}

            {/* Company/firm selection based on role source */}
            {isOffPlatform ? (
                <>
                    {userFirms.length > 1 && (
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
                    )}
                    {userFirms.length === 1 && (
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                                Agency
                            </legend>
                            <input className="input w-full" value={userFirms[0].name} disabled readOnly />
                        </fieldset>
                    )}
                </>
            ) : showCompanySelect ? (
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                        Status *
                    </legend>
                    <select
                        className="select w-full"
                        value={formData.status}
                        onChange={(e) => onChange({ status: e.target.value as FormData["status"] })}
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </fieldset>

                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                        Activation Date{formData.status === "early" ? " *" : ""}
                    </legend>
                    <input
                        type="datetime-local"
                        className="input w-full"
                        value={formData.activates_at}
                        onChange={(e) => onChange({ activates_at: e.target.value })}
                        min={new Date().toISOString().slice(0, 16)}
                        required={formData.status === "early"}
                    />
                    <p className="text-sm text-base-content/50 mt-1">
                        The role will automatically go live on this date.
                    </p>
                </fieldset>

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
            </div>
        </div>
    );
}
