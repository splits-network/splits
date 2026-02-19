"use client";

/**
 * Step 3b: Company Info Form (Basel Edition)
 * Uses BaselFormField + DaisyUI inputs/selects.
 */

import { useState, FormEvent } from "react";
import { ButtonLoading } from "@splits-network/shared-ui";
import { BaselFormField } from "@splits-network/basel-ui";
import type { OnboardingState, OnboardingActions } from "../types";

const INDUSTRY_OPTIONS = [
    { value: "technology", label: "Technology" },
    { value: "healthcare", label: "Healthcare" },
    { value: "finance", label: "Finance" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "retail", label: "Retail" },
    { value: "education", label: "Education" },
    { value: "consulting", label: "Consulting" },
    { value: "professional_services", label: "Professional Services" },
    { value: "real_estate", label: "Real Estate" },
    { value: "recruitment", label: "Recruitment" },
    { value: "hospitality", label: "Hospitality" },
    { value: "construction", label: "Construction" },
    { value: "energy", label: "Energy" },
    { value: "telecommunications", label: "Telecommunications" },
    { value: "media_entertainment", label: "Media & Entertainment" },
    { value: "transportation", label: "Transportation" },
    { value: "other", label: "Other" },
];

const SIZE_OPTIONS = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "501-1000", label: "501-1000 employees" },
    { value: "1001-5000", label: "1001-5000 employees" },
    { value: "5001+", label: "5001+ employees" },
];

const BILLING_TERMS_OPTIONS = [
    { value: "immediate", label: "Immediate (Charge on completion)" },
    { value: "net_30", label: "Net 30" },
    { value: "net_60", label: "Net 60" },
    { value: "net_90", label: "Net 90" },
];

interface CompanyInfoStepProps {
    state: OnboardingState;
    actions: OnboardingActions;
}

export function CompanyInfoStep({ state, actions }: CompanyInfoStepProps) {
    const [formData, setFormData] = useState({
        name: state.companyInfo?.name || "",
        website: state.companyInfo?.website || "",
        industry: state.companyInfo?.industry || "",
        size: state.companyInfo?.size || "",
        headquarters_location: state.companyInfo?.headquarters_location || "",
        logo_url: state.companyInfo?.logo_url || "",
        billing_terms: state.companyInfo?.billing_terms || "net_30",
        billing_email: state.companyInfo?.billing_email || "",
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        actions.setCompanyInfo(formData);
        actions.setStep(4);
    };

    return (
        <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-3">
                Step 2
            </p>
            <h1 className="text-3xl font-black tracking-tight mb-2">
                Tell us about your company
            </h1>
            <p className="text-base-content/50 mb-8">
                Help recruiters understand your organization and hiring needs.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <BaselFormField label="Company Name" required>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Acme Corporation"
                        required
                    />
                </BaselFormField>

                <BaselFormField label="Company Website" required>
                    <input
                        type="url"
                        className="input input-bordered w-full"
                        value={formData.website}
                        onChange={(e) =>
                            handleChange("website", e.target.value)
                        }
                        placeholder="https://www.example.com"
                        required
                    />
                </BaselFormField>

                <BaselFormField label="Headquarters Location">
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        value={formData.headquarters_location}
                        onChange={(e) =>
                            handleChange(
                                "headquarters_location",
                                e.target.value,
                            )
                        }
                        placeholder="City, Country"
                    />
                </BaselFormField>

                <BaselFormField label="Logo URL">
                    <input
                        type="url"
                        className="input input-bordered w-full"
                        value={formData.logo_url}
                        onChange={(e) =>
                            handleChange("logo_url", e.target.value)
                        }
                        placeholder="https://example.com/logo.png"
                    />
                </BaselFormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <BaselFormField label="Industry" required>
                        <select
                            className="select select-bordered w-full"
                            value={formData.industry}
                            onChange={(e) =>
                                handleChange("industry", e.target.value)
                            }
                            required
                        >
                            <option value="">Select industry...</option>
                            {INDUSTRY_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </BaselFormField>

                    <BaselFormField label="Company Size" required>
                        <select
                            className="select select-bordered w-full"
                            value={formData.size}
                            onChange={(e) =>
                                handleChange("size", e.target.value)
                            }
                            required
                        >
                            <option value="">Select size...</option>
                            {SIZE_OPTIONS.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </BaselFormField>
                </div>

                <BaselFormField
                    label="Billing Terms"
                    required
                    hint="Used for invoice timing after guarantee completion."
                >
                    <select
                        className="select select-bordered w-full"
                        value={formData.billing_terms}
                        onChange={(e) =>
                            handleChange("billing_terms", e.target.value)
                        }
                        required
                    >
                        {BILLING_TERMS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </BaselFormField>

                <BaselFormField label="Billing Email" required>
                    <input
                        type="email"
                        className="input input-bordered w-full"
                        value={formData.billing_email}
                        onChange={(e) =>
                            handleChange("billing_email", e.target.value)
                        }
                        placeholder="billing@company.com"
                        required
                    />
                </BaselFormField>

                {state.error && (
                    <div className="border-l-4 border-error bg-error/5 p-4 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error" />
                        <span className="text-sm font-semibold">
                            {state.error}
                        </span>
                    </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between pt-4 border-t border-base-300">
                    <button
                        type="button"
                        className="btn btn-ghost"
                        onClick={() => actions.setStep(1)}
                        disabled={state.submitting}
                    >
                        <i className="fa-solid fa-arrow-left text-xs" /> Back
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={state.submitting}
                    >
                        <ButtonLoading
                            loading={state.submitting}
                            text="Continue"
                            loadingText="Saving..."
                        />
                        {!state.submitting && (
                            <i className="fa-solid fa-arrow-right text-xs" />
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
