"use client";

/**
 * Step 3b: Company Info Form
 * Shown when user selects "Company Admin" role
 */

import { useState, FormEvent } from "react";
import { MarkdownEditor, ButtonLoading } from "@splits-network/shared-ui";
import { useOnboarding } from "../onboarding-provider";

export function CompanyInfoStep() {
    const { state, actions } = useOnboarding();

    const [formData, setFormData] = useState({
        name: state.companyInfo?.name || "",
        website: state.companyInfo?.website || "",
        industry: state.companyInfo?.industry || "",
        size: state.companyInfo?.size || "",
        description: state.companyInfo?.description || "",
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
        <div className="space-y-6 max-w-3xl w-xl mx-auto">
            <div className="text-center">
                <h2 className="text-2xl font-bold">
                    Tell Us About Your Company
                </h2>
                <p className="text-base-content/70 mt-2">
                    Help recruiters understand your organization and hiring
                    needs
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Company Name */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Company Name *</legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        placeholder="Acme Corporation"
                        required
                    />
                </fieldset>

                {/* Website */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                        Company Website *
                    </legend>
                    <input
                        type="url"
                        className="input w-full"
                        value={formData.website}
                        onChange={(e) =>
                            handleChange("website", e.target.value)
                        }
                        placeholder="https://www.example.com"
                        required
                    />
                </fieldset>

                {/* Headquarters Location */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">
                        Headquarters Location
                    </legend>
                    <input
                        type="text"
                        className="input w-full"
                        value={formData.headquarters_location}
                        onChange={(e) =>
                            handleChange(
                                "headquarters_location",
                                e.target.value,
                            )
                        }
                        placeholder="City, Country"
                    />
                </fieldset>

                {/* Logo URL */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Logo URL</legend>
                    <input
                        type="url"
                        className="input w-full"
                        value={formData.logo_url}
                        onChange={(e) =>
                            handleChange("logo_url", e.target.value)
                        }
                        placeholder="https://example.com/logo.png"
                    />
                </fieldset>

                {/* Industry */}
                <div className="flex justify-evenly gap-4">
                    <fieldset className="fieldset w-full">
                        <legend className="fieldset-legend">Industry *</legend>
                        <select
                            className="select"
                            value={formData.industry}
                            onChange={(e) =>
                                handleChange("industry", e.target.value)
                            }
                            required
                        >
                            <option value="">Select industry...</option>
                            <option value="technology">Technology</option>
                            <option value="healthcare">Healthcare</option>
                            <option value="finance">Finance</option>
                            <option value="manufacturing">Manufacturing</option>
                            <option value="retail">Retail</option>
                            <option value="education">Education</option>
                            <option value="consulting">Consulting</option>
                            <option value="professional_services">
                                Professional Services
                            </option>
                            <option value="real_estate">Real Estate</option>
                            <option value="recruitment">Recruitment</option>
                            <option value="hospitality">Hospitality</option>
                            <option value="construction">Construction</option>
                            <option value="energy">Energy</option>
                            <option value="telecommunications">
                                Telecommunications
                            </option>
                            <option value="media_entertainment">
                                Media & Entertainment
                            </option>
                            <option value="transportation">
                                Transportation
                            </option>
                            <option value="other">Other</option>
                        </select>
                    </fieldset>

                    {/* Company Size */}
                    <fieldset className="fieldset w-full">
                        <legend className="fieldset-legend">
                            Company Size *
                        </legend>
                        <select
                            className="select"
                            value={formData.size}
                            onChange={(e) =>
                                handleChange("size", e.target.value)
                            }
                            required
                        >
                            <option value="">Select size...</option>
                            <option value="1-10">1-10 employees</option>
                            <option value="11-50">11-50 employees</option>
                            <option value="51-200">51-200 employees</option>
                            <option value="201-500">201-500 employees</option>
                            <option value="501-1000">501-1000 employees</option>
                            <option value="1001-5000">
                                1001-5000 employees
                            </option>
                            <option value="5001+">5001+ employees</option>
                        </select>
                    </fieldset>
                </div>

                {/* Billing Terms */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Billing Terms *</legend>
                    <select
                        className="select w-full"
                        value={formData.billing_terms}
                        onChange={(e) =>
                            handleChange("billing_terms", e.target.value)
                        }
                        required
                    >
                        <option value="immediate">
                            Immediate (Charge on completion)
                        </option>
                        <option value="net_30">Net 30</option>
                        <option value="net_60">Net 60</option>
                        <option value="net_90">Net 90</option>
                    </select>
                    <p className="fieldset-label">
                        Used for invoice timing after guarantee completion.
                    </p>
                </fieldset>

                {/* Billing Email */}
                <fieldset className="fieldset">
                    <legend className="fieldset-legend">Billing Email *</legend>
                    <input
                        type="email"
                        className="input w-full"
                        value={formData.billing_email}
                        onChange={(e) =>
                            handleChange("billing_email", e.target.value)
                        }
                        placeholder="billing@company.com"
                        required
                    />
                </fieldset>

                {/* Description */}
                <MarkdownEditor
                    className="fieldset"
                    label="Description"
                    value={formData.description}
                    onChange={(value) => handleChange("description", value)}
                    placeholder="Brief description of your company..."
                    height={140}
                />

                {state.error && (
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>{state.error}</span>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-2 justify-between">
                    <button
                        type="button"
                        onClick={handleBack}
                        className="btn"
                        disabled={state.submitting}
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left"></i>
                        Back
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
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
                                <i className="fa-duotone fa-regular fa-arrow-right"></i>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
