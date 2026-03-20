"use client";

import { WizardHelpZone } from "@splits-network/basel-ui";
import type { FormData } from "./types";

const COMMUTE_OPTIONS = [
    { value: "remote", label: "Remote" },
    { value: "hybrid_1", label: "Hybrid (1 day)" },
    { value: "hybrid_2", label: "Hybrid (2 days)" },
    { value: "hybrid_3", label: "Hybrid (3 days)" },
    { value: "hybrid_4", label: "Hybrid (4 days)" },
    { value: "in_office", label: "In Office" },
];

const JOB_LEVEL_OPTIONS = [
    { value: "", label: "Select Level" },
    { value: "entry", label: "Entry Level" },
    { value: "mid", label: "Mid Level" },
    { value: "senior", label: "Senior" },
    { value: "lead", label: "Lead" },
    { value: "manager", label: "Manager" },
    { value: "director", label: "Director" },
    { value: "vp", label: "VP" },
    { value: "c_suite", label: "C-Suite" },
];

const EMPLOYMENT_TYPE_OPTIONS = [
    { value: "full_time", label: "Full Time" },
    { value: "part_time", label: "Part Time" },
    { value: "contract", label: "Contract" },
    { value: "temporary", label: "Temporary" },
];

const GUARANTEE_OPTIONS = [
    { value: "0", label: "No guarantee" },
    { value: "15", label: "15 days" },
    { value: "30", label: "30 days" },
    { value: "60", label: "60 days" },
    { value: "90", label: "90 days" },
];

interface StepCompensationProps {
    formData: FormData;
    onChange: (updates: Partial<FormData>) => void;
    mode?: "create" | "edit";
}

export function StepCompensation({ formData, onChange, mode = "create" }: StepCompensationProps) {
    const toggleCommute = (value: string) => {
        const updated = formData.commute_types.includes(value)
            ? formData.commute_types.filter((t) => t !== value)
            : [...formData.commute_types, value];
        onChange({ commute_types: updated });
    };

    return (
        <div className="space-y-4">
            <WizardHelpZone
                title="Salary Range"
                description="The annual base salary range for this role in USD. Helps recruiters match candidates with aligned compensation expectations."
                tips={["Use annual base salary, not total compensation", "Wider ranges attract more candidates", "Showing salary to candidates increases application rates"]}
            >
                <div className="grid grid-cols-2 gap-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                            Minimum Salary (USD)
                        </legend>
                        <input
                            className="input w-full"
                            type="number"
                            value={formData.salary_min}
                            onChange={(e) => onChange({ salary_min: e.target.value })}
                            placeholder="120,000"
                        />
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                            Maximum Salary (USD)
                        </legend>
                        <input
                            className="input w-full"
                            type="number"
                            value={formData.salary_max}
                            onChange={(e) => onChange({ salary_max: e.target.value })}
                            placeholder="150,000"
                        />
                    </fieldset>
                </div>
            </WizardHelpZone>

            <WizardHelpZone
                title="Show Salary to Candidates"
                description="Controls whether the salary range is visible on the public job listing."
                tips={["Roles with visible salary get 30% more applications", "You can change this later"]}
            >
                <div className={`flex items-center justify-between border-2 p-4 transition-colors ${
                    formData.show_salary_range
                        ? "border-success bg-success/5"
                        : "border-base-300"
                }`}>
                    <span className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <i className={`fa-duotone fa-regular fa-eye text-sm ${formData.show_salary_range ? "text-success" : "text-base-content/40"}`} />
                        Show Salary to Candidates
                    </span>
                    <input
                        type="checkbox"
                        className="toggle toggle-success"
                        checked={formData.show_salary_range}
                        onChange={(e) => onChange({ show_salary_range: e.target.checked })}
                    />
                </div>
            </WizardHelpZone>

            <WizardHelpZone
                title="Fee & Guarantee"
                description="The recruiter placement fee and guarantee period. These are the commercial terms of the split-fee arrangement."
                tips={["20% is the industry standard fee", "Higher fees attract more recruiter attention", "90-day guarantee is most common for permanent roles", "These terms are locked after the first application"]}
            >
                <div className="grid grid-cols-2 gap-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                            Fee Percentage *
                        </legend>
                        <input
                            className="input w-full"
                            type="number"
                            value={formData.fee_percentage.toString()}
                            onChange={(e) => onChange({ fee_percentage: parseFloat(e.target.value) || 0 })}
                            placeholder="20"
                            disabled={mode === "edit"}
                        />
                        {mode === "edit" && (
                            <p className="text-sm text-base-content/50 mt-1">Set by company</p>
                        )}
                    </fieldset>
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                            Guarantee Period *
                        </legend>
                        <select
                            className="select w-full"
                            value={(formData.guarantee_days ?? 0).toString()}
                            onChange={(e) => onChange({ guarantee_days: parseInt(e.target.value, 10) })}
                            disabled={mode === "edit"}
                        >
                            {GUARANTEE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        {mode === "edit" && (
                            <p className="text-sm text-base-content/50 mt-1">Set by company</p>
                        )}
                    </fieldset>
                </div>
            </WizardHelpZone>

            <WizardHelpZone
                title="Employment Type"
                description="The type of employment contract for this role."
            >
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                        Employment Type *
                    </legend>
                    <select
                        className="select w-full"
                        value={formData.employment_type}
                        onChange={(e) => onChange({ employment_type: e.target.value as FormData["employment_type"] })}
                    >
                        {EMPLOYMENT_TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </fieldset>
            </WizardHelpZone>

            <WizardHelpZone
                title="Commute Type"
                description="Select all work arrangement options available for this role. Candidates can filter by commute type."
                tips={["Select multiple if the role is flexible", "Remote roles get significantly more applications"]}
            >
                <div>
                    <span className="block font-bold text-sm uppercase tracking-wider mb-3">
                        Commute Type
                    </span>
                    <div className="flex flex-wrap gap-2">
                        {COMMUTE_OPTIONS.map((opt) => {
                            const selected = formData.commute_types.includes(opt.value);
                            return (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => toggleCommute(opt.value)}
                                    className={`btn btn-sm ${selected ? "btn-primary" : "btn-outline"}`}
                                >
                                    {selected && <i className="fa-solid fa-check mr-1 text-sm" />}
                                    {opt.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </WizardHelpZone>

            <WizardHelpZone
                title="Job Level"
                description="The seniority level for this position. Used for candidate matching and search filtering."
            >
                <fieldset className="fieldset">
                    <legend className="fieldset-legend text-sm uppercase tracking-[0.2em] font-bold">
                        Job Level
                    </legend>
                    <select
                        className="select w-full"
                        value={formData.job_level}
                        onChange={(e) => onChange({ job_level: e.target.value })}
                    >
                        {JOB_LEVEL_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </fieldset>
            </WizardHelpZone>

            <WizardHelpZone
                title="Open to Relocation"
                description="Whether candidates who would need to relocate should be considered for this role."
            >
                <div className={`flex items-center justify-between border-2 p-4 transition-colors ${
                    formData.open_to_relocation
                        ? "border-info bg-info/5"
                        : "border-base-300"
                }`}>
                    <span className="font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                        <i className={`fa-duotone fa-regular fa-plane text-sm ${formData.open_to_relocation ? "text-info" : "text-base-content/40"}`} />
                        Open to Relocation
                    </span>
                    <input
                        type="checkbox"
                        className="toggle toggle-info"
                        checked={formData.open_to_relocation}
                        onChange={(e) => onChange({ open_to_relocation: e.target.checked })}
                    />
                </div>
            </WizardHelpZone>
        </div>
    );
}
