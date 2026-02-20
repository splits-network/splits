"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import { BaselFormField } from "@splits-network/basel-ui";
import { MarkdownEditor, ButtonLoading } from "@splits-network/shared-ui";
import type { Company } from "@/app/portal/company/settings/types";

const COMPANY_SIZES = [
    { value: "1-10", label: "1-10 employees" },
    { value: "11-50", label: "11-50 employees" },
    { value: "51-200", label: "51-200 employees" },
    { value: "201-500", label: "201-500 employees" },
    { value: "501-1000", label: "501-1000 employees" },
    { value: "1000+", label: "1000+ employees" },
];

const INDUSTRIES = [
    { value: "Technology", label: "Technology" },
    { value: "Healthcare", label: "Healthcare" },
    { value: "Finance", label: "Finance" },
    { value: "Manufacturing", label: "Manufacturing" },
    { value: "Retail", label: "Retail" },
    { value: "Education", label: "Education" },
    { value: "Consulting", label: "Consulting" },
    { value: "Professional Services", label: "Professional Services" },
    { value: "Real Estate", label: "Real Estate" },
    { value: "Recruitment", label: "Recruitment" },
    { value: "Hospitality", label: "Hospitality" },
    { value: "Construction", label: "Construction" },
    { value: "Energy", label: "Energy" },
    { value: "Telecommunications", label: "Telecommunications" },
    { value: "Media & Entertainment", label: "Media & Entertainment" },
    { value: "Transportation", label: "Transportation" },
    { value: "Other", label: "Other" },
];

interface CompanyTabProps {
    company: Company | null;
    organizationId: string;
}

export function CompanyTab({ company, organizationId }: CompanyTabProps) {
    const { getToken } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: company?.name || "",
        website: company?.website || "",
        industry: company?.industry || "",
        company_size: company?.company_size || "",
        headquarters_location: company?.headquarters_location || "",
        description: company?.description || "",
        logo_url: company?.logo_url || "",
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const token = await getToken();
            if (!token) {
                setError("Authentication required");
                setSaving(false);
                return;
            }

            const client = createAuthenticatedClient(token);

            if (company) {
                await client.patch(`/companies/${company.id}`, formData);
            } else {
                await client.post("/companies", {
                    ...formData,
                    identity_organization_id: organizationId,
                });
            }

            setSuccess(true);
            router.refresh();
        } catch (err: any) {
            console.error("Failed to save company:", err);
            setError(err.message || "Failed to save company settings");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-black tracking-tight mb-1">
                Company Information
            </h2>
            <p className="text-sm text-base-content/50 mb-8">
                Update your company profile and public details.
            </p>

            {error && (
                <div className="bg-error/5 border border-error/20 p-4 mb-6">
                    <p className="text-sm font-semibold text-error flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-circle-exclamation" />
                        {error}
                    </p>
                </div>
            )}

            {success && (
                <div className="bg-success/5 border border-success/20 p-4 mb-6">
                    <p className="text-sm font-semibold text-success flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-circle-check" />
                        Company settings saved successfully!
                    </p>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <BaselFormField
                        label="Company Name"
                        required
                        className="md:col-span-2"
                    >
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Acme Corporation"
                            className="input input-bordered w-full"
                            required
                        />
                    </BaselFormField>

                    <BaselFormField label="Website">
                        <input
                            type="url"
                            name="website"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            className="input input-bordered w-full"
                        />
                    </BaselFormField>

                    <BaselFormField label="Industry">
                        <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                        >
                            <option value="">Select industry...</option>
                            {INDUSTRIES.map((i) => (
                                <option key={i.value} value={i.value}>
                                    {i.label}
                                </option>
                            ))}
                        </select>
                    </BaselFormField>

                    <BaselFormField label="Company Size">
                        <select
                            name="company_size"
                            value={formData.company_size}
                            onChange={handleChange}
                            className="select select-bordered w-full"
                        >
                            <option value="">Select size...</option>
                            {COMPANY_SIZES.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </BaselFormField>

                    <BaselFormField label="Headquarters Location">
                        <input
                            type="text"
                            name="headquarters_location"
                            value={formData.headquarters_location}
                            onChange={handleChange}
                            placeholder="San Francisco, CA"
                            className="input input-bordered w-full"
                        />
                    </BaselFormField>

                    <div className="md:col-span-2">
                        <BaselFormField label="Company Description">
                            <MarkdownEditor
                                value={formData.description}
                                onChange={(value) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        description: value,
                                    }))
                                }
                                placeholder="Tell us about your company, culture, and what makes you unique..."
                                helperText="This description will be visible to recruiters"
                                height={200}
                            />
                        </BaselFormField>
                    </div>

                    <BaselFormField
                        label="Logo URL"
                        hint="Enter a direct link to your company logo image"
                        className="md:col-span-2"
                    >
                        <input
                            type="url"
                            name="logo_url"
                            value={formData.logo_url}
                            onChange={handleChange}
                            placeholder="https://example.com/logo.png"
                            className="input input-bordered w-full"
                        />
                    </BaselFormField>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-base-300">
                    <p className="text-xs text-base-content/30">
                        Changes are saved to your company profile
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => router.back()}
                            disabled={saving}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving || !formData.name.trim()}
                        >
                            <ButtonLoading
                                loading={saving}
                                text={company ? "Save Company" : "Create Company"}
                                loadingText="Saving..."
                                icon="fa-duotone fa-regular fa-floppy-disk"
                            />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}