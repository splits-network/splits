"use client";

/**
 * Step 3b: Company Info Form (Memphis Edition)
 * Shown when user selects "Company Admin" role
 */

import { useState, FormEvent } from "react";
import { ButtonLoading } from "@splits-network/shared-ui";
import { Input, Select, Button } from "@splits-network/memphis-ui";
import { useOnboarding } from "../onboarding-provider";

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

export function CompanyInfoStep() {
    const { state, actions } = useOnboarding();

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

    const handleBack = () => {
        // Skip step 2 (subscription) as it's not applicable for company admins
        actions.setStep(1);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto">
            {/* Heading */}
            <div className="text-center">
                <h2 className="text-3xl font-black uppercase tracking-tight text-dark">
                    Tell Us About Your Company
                </h2>
                <p className="text-dark/60 mt-2 text-sm">
                    Help recruiters understand your organization and hiring needs
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Company Name */}
                <Input
                    label="Company Name *"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Acme Corporation"
                    required
                />

                {/* Website */}
                <Input
                    label="Company Website *"
                    type="url"
                    value={formData.website}
                    onChange={(e) => handleChange("website", e.target.value)}
                    placeholder="https://www.example.com"
                    required
                />

                {/* Headquarters Location */}
                <Input
                    label="Headquarters Location"
                    type="text"
                    value={formData.headquarters_location}
                    onChange={(e) =>
                        handleChange("headquarters_location", e.target.value)
                    }
                    placeholder="City, Country"
                />

                {/* Logo URL */}
                <Input
                    label="Logo URL"
                    type="url"
                    value={formData.logo_url}
                    onChange={(e) => handleChange("logo_url", e.target.value)}
                    placeholder="https://example.com/logo.png"
                />

                {/* Industry & Size - Two column */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Select
                        label="Industry *"
                        options={INDUSTRY_OPTIONS}
                        placeholder="Select industry..."
                        value={formData.industry}
                        onChange={(e) => handleChange("industry", e.target.value)}
                        required
                    />

                    <Select
                        label="Company Size *"
                        options={SIZE_OPTIONS}
                        placeholder="Select size..."
                        value={formData.size}
                        onChange={(e) => handleChange("size", e.target.value)}
                        required
                    />
                </div>

                {/* Billing Terms */}
                <Select
                    label="Billing Terms *"
                    options={BILLING_TERMS_OPTIONS}
                    value={formData.billing_terms}
                    onChange={(e) => handleChange("billing_terms", e.target.value)}
                    required
                />
                <p className="text-xs text-dark/40 -mt-3">
                    Used for invoice timing after guarantee completion.
                </p>

                {/* Billing Email */}
                <Input
                    label="Billing Email *"
                    type="email"
                    value={formData.billing_email}
                    onChange={(e) => handleChange("billing_email", e.target.value)}
                    placeholder="billing@company.com"
                    required
                />

                {/* Error */}
                {state.error && (
                    <div className="border-4 border-coral bg-coral/10 p-4 flex items-center gap-3">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-coral"></i>
                        <span className="text-sm font-bold text-dark">{state.error}</span>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2 justify-between pt-2">
                    <Button
                        color="dark"
                        variant="outline"
                        type="button"
                        onClick={handleBack}
                        disabled={state.submitting}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left mr-2"></i>
                        Back
                    </Button>
                    <Button
                        color="coral"
                        variant="solid"
                        type="submit"
                        disabled={state.submitting}
                    >
                        {state.submitting ? (
                            <ButtonLoading
                                loading={state.submitting}
                                text="Continue"
                                loadingText="Saving..."
                            />
                        ) : (
                            <>
                                Continue
                                <i className="fa-duotone fa-regular fa-arrow-right ml-2"></i>
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
