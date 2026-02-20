"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    Input,
    Select,
    Button,
    DetailSection,
} from "@splits-network/memphis-ui";
import { MarkdownEditor, ButtonLoading } from "@splits-network/shared-ui";
import type { Company } from "../types";

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
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="border-4 border-error bg-error-light p-4">
                    <p className="text-sm font-bold text-dark flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error" />
                        {error}
                    </p>
                </div>
            )}

            {success && (
                <div className="border-4 border-teal bg-teal-light p-4">
                    <p className="text-sm font-bold text-dark flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-circle-check text-teal" />
                        Company settings saved successfully!
                    </p>
                </div>
            )}

            <DetailSection
                title="Company Information"
                icon="fa-duotone fa-regular fa-building"
                accent="coral"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <Input
                            label="Company Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Acme Corporation"
                            required
                        />
                    </div>

                    <Input
                        label="Website"
                        name="website"
                        type="url"
                        value={formData.website}
                        onChange={handleChange}
                        placeholder="https://example.com"
                    />

                    <Select
                        label="Industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleChange}
                        options={INDUSTRIES}
                        placeholder="Select industry..."
                    />

                    <Select
                        label="Company Size"
                        name="company_size"
                        value={formData.company_size}
                        onChange={handleChange}
                        options={COMPANY_SIZES}
                        placeholder="Select size..."
                    />

                    <Input
                        label="Headquarters Location"
                        name="headquarters_location"
                        value={formData.headquarters_location}
                        onChange={handleChange}
                        placeholder="San Francisco, CA"
                    />

                    <div className="md:col-span-2">
                        <label className="flex items-center gap-1 text-sm font-black uppercase tracking-[0.15em] text-dark mb-2">
                            Company Description
                        </label>
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
                    </div>

                    <div className="md:col-span-2">
                        <Input
                            label="Logo URL"
                            name="logo_url"
                            type="url"
                            value={formData.logo_url}
                            onChange={handleChange}
                            placeholder="https://example.com/logo.png"
                        />
                        <p className="text-xs text-dark/50 mt-1">
                            Enter a direct link to your company logo image
                        </p>
                    </div>
                </div>
            </DetailSection>

            {/* Save Actions */}
            <div className="flex gap-3 justify-end">
                <Button
                    type="button"
                    color="dark"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={saving}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    color="coral"
                    disabled={saving || !formData.name.trim()}
                >
                    <ButtonLoading
                        loading={saving}
                        text="Save Company"
                        loadingText="Saving..."
                        icon="fa-duotone fa-regular fa-floppy-disk"
                    />
                </Button>
            </div>
        </form>
    );
}
