"use client";

import { useState, useEffect } from "react";
import { MarkdownEditor, ButtonLoading } from "@splits-network/shared-ui";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import { ContentCard } from "@/components/ui/cards";
import { PageTitle } from "@/components/page-title";

interface Company {
    id: string;
    name: string;
    identity_organization_id?: string;
    website?: string;
    industry?: string;
    company_size?: string;
    headquarters_location?: string;
    description?: string;
    logo_url?: string;
    created_at: string;
    updated_at: string;
}

interface CompanySettingsFormProps {
    company: Company | null;
    organizationId: string;
    onBillingProfileSaved?: () => void;
}

export default function CompanySettingsForm({
    company: initialCompany,
    organizationId,
    onBillingProfileSaved,
}: CompanySettingsFormProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const [billingLoaded, setBillingLoaded] = useState(false);

    const [formData, setFormData] = useState({
        name: initialCompany?.name || "",
        website: initialCompany?.website || "",
        industry: initialCompany?.industry || "",
        company_size: initialCompany?.company_size || "",
        headquarters_location: initialCompany?.headquarters_location || "",
        description: initialCompany?.description || "",
        logo_url: initialCompany?.logo_url || "",
        billing_terms: "net_30",
        billing_email: "",
        billing_contact_name: "",
        billing_address_street: "",
        billing_address_city: "",
        billing_address_state: "",
        billing_address_zip: "",
        billing_address_country: "United States",
        stripe_tax_id: "",
        invoice_delivery_method: "email",
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const loadBillingProfile = async () => {
            if (!initialCompany?.id || billingLoaded) return;
            try {
                const token = await getToken();
                if (!token) return;
                const client = createAuthenticatedClient(token);
                const response = await client.get(
                    `/company-billing-profiles/${initialCompany.id}`,
                );
                const profile = response?.data;
                if (profile) {
                    setFormData((prev) => ({
                        ...prev,
                        billing_terms: profile.billing_terms || "net_30",
                        billing_email: profile.billing_email || "",
                        billing_contact_name:
                            profile.billing_contact_name || "",
                        billing_address_street:
                            profile.billing_address?.street || "",
                        billing_address_city:
                            profile.billing_address?.city || "",
                        billing_address_state:
                            profile.billing_address?.state || "",
                        billing_address_zip: profile.billing_address?.zip || "",
                        billing_address_country:
                            profile.billing_address?.country || "United States",
                        stripe_tax_id: profile.stripe_tax_id || "",
                        invoice_delivery_method:
                            profile.invoice_delivery_method || "email",
                    }));
                }
                setBillingLoaded(true);
            } catch (loadError: any) {
                console.error("Failed to load billing profile:", loadError);
                setBillingLoaded(true);
            }
        };

        loadBillingProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialCompany?.id, billingLoaded]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setSuccess(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSaving(true);

        try {
            const billingEmail = formData.billing_email.trim();
            if (!billingEmail) {
                setError("Billing email is required");
                setSaving(false);
                return;
            }

            const token = await getToken();
            if (!token) {
                setError("Authentication required");
                setSaving(false);
                return;
            }

            const client = createAuthenticatedClient(token);

            // Build billing address object
            const billingAddress: Record<string, string> = {};
            if (formData.billing_address_street)
                billingAddress.street = formData.billing_address_street;
            if (formData.billing_address_city)
                billingAddress.city = formData.billing_address_city;
            if (formData.billing_address_state)
                billingAddress.state = formData.billing_address_state;
            if (formData.billing_address_zip)
                billingAddress.zip = formData.billing_address_zip;
            if (formData.billing_address_country)
                billingAddress.country = formData.billing_address_country;

            const billingPayload = {
                billing_terms: formData.billing_terms,
                billing_email: billingEmail,
                billing_contact_name:
                    formData.billing_contact_name.trim() || null,
                billing_address:
                    Object.keys(billingAddress).length > 0
                        ? billingAddress
                        : null,
                stripe_tax_id: formData.stripe_tax_id.trim() || null,
                invoice_delivery_method: formData.invoice_delivery_method,
            };

            if (initialCompany) {
                const {
                    billing_terms,
                    billing_email: _be,
                    billing_contact_name,
                    billing_address_street,
                    billing_address_city,
                    billing_address_state,
                    billing_address_zip,
                    billing_address_country,
                    stripe_tax_id,
                    invoice_delivery_method,
                    ...companyPayload
                } = formData;
                await client.patch(
                    `/companies/${initialCompany.id}`,
                    companyPayload,
                );
                await client.post(
                    `/company-billing-profiles/${initialCompany.id}`,
                    billingPayload,
                );
            } else {
                const {
                    billing_terms,
                    billing_email: _be,
                    billing_contact_name,
                    billing_address_street,
                    billing_address_city,
                    billing_address_state,
                    billing_address_zip,
                    billing_address_country,
                    stripe_tax_id,
                    invoice_delivery_method,
                    ...companyPayload
                } = formData;
                const companyResponse = await client.post("/companies", {
                    ...companyPayload,
                    identity_organization_id: organizationId,
                });

                const companyId = companyResponse?.data?.id;
                if (companyId) {
                    await client.post(
                        `/company-billing-profiles/${companyId}`,
                        billingPayload,
                    );
                }
            }

            setSuccess(true);
            onBillingProfileSaved?.();
            router.refresh();
        } catch (error: any) {
            console.error("Failed to save company:", error);
            setError(error.message || "Failed to save company settings");
        } finally {
            setSaving(false);
        }
    };

    const companySizes = [
        "1-10",
        "11-50",
        "51-200",
        "201-500",
        "501-1000",
        "1000+",
    ];

    const industries = [
        "Technology",
        "Healthcare",
        "Finance",
        "Manufacturing",
        "Retail",
        "Education",
        "Consulting",
        "Professional Services",
        "Real Estate",
        "Recruitment",
        "Hospitality",
        "Construction",
        "Energy",
        "Telecommunications",
        "Media & Entertainment",
        "Transportation",
        "Other",
    ];

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-6"
            id="company-settings-form"
        >
            {error && (
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="alert alert-success">
                    <i className="fa-duotone fa-regular fa-circle-check"></i>
                    <span>Company settings saved successfully!</span>
                </div>
            )}
            <PageTitle
                title="Company Settings"
                subtitle="Manage your company profile, billing, and preferences2"
            >
                {/* Save Actions */}
                <div className="flex gap-2 justify-end">
                    <button
                        type="submit"
                        className="btn btn-sm btn-primary"
                        disabled={saving || !formData.name.trim()}
                    >
                        <ButtonLoading
                            loading={saving}
                            text="Save Settings"
                            loadingText="Saving..."
                            icon="fa-duotone fa-regular fa-save"
                        />
                    </button>
                    <button
                        type="button"
                        className="btn btn-sm"
                        onClick={() => router.back()}
                        disabled={saving}
                    >
                        Cancel
                    </button>
                </div>
            </PageTitle>
            {/* Company Information */}
            <ContentCard
                title="Company Information"
                icon="fa-building"
                subtitle="Your public company profile visible to recruiters"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <fieldset className="fieldset md:col-span-2">
                        <legend className="fieldset-legend">
                            Company Name *
                        </legend>
                        <input
                            type="text"
                            name="name"
                            className="input w-full"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Acme Corporation"
                            required
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Website</legend>
                        <input
                            type="url"
                            name="website"
                            className="input w-full"
                            value={formData.website}
                            onChange={handleChange}
                            placeholder="https://example.com"
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">Industry</legend>
                        <select
                            name="industry"
                            className="select w-full"
                            value={formData.industry}
                            onChange={handleChange}
                        >
                            <option value="">Select industry...</option>
                            {industries.map((industry) => (
                                <option key={industry} value={industry}>
                                    {industry}
                                </option>
                            ))}
                        </select>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Company Size
                        </legend>
                        <select
                            name="company_size"
                            className="select w-full"
                            value={formData.company_size}
                            onChange={handleChange}
                        >
                            <option value="">Select size...</option>
                            {companySizes.map((size) => (
                                <option key={size} value={size}>
                                    {size} employees
                                </option>
                            ))}
                        </select>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Headquarters Location
                        </legend>
                        <input
                            type="text"
                            name="headquarters_location"
                            className="input w-full"
                            value={formData.headquarters_location}
                            onChange={handleChange}
                            placeholder="San Francisco, CA"
                        />
                    </fieldset>

                    <MarkdownEditor
                        className="fieldset md:col-span-2"
                        label="Company Description"
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

                    <fieldset className="fieldset md:col-span-2">
                        <legend className="fieldset-legend">Logo URL</legend>
                        <input
                            type="url"
                            name="logo_url"
                            className="input w-full"
                            value={formData.logo_url}
                            onChange={handleChange}
                            placeholder="https://example.com/logo.png"
                        />
                        <p className="fieldset-label">
                            Enter a direct link to your company logo image
                        </p>
                    </fieldset>
                </div>
            </ContentCard>

            {/* Billing Profile */}
            <ContentCard
                title="Billing Profile"
                icon="fa-file-invoice-dollar"
                subtitle="Billing details for placement invoicing"
            >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Payment Terms *
                        </legend>
                        <select
                            name="billing_terms"
                            className="select w-full"
                            value={formData.billing_terms}
                            onChange={handleChange}
                            required
                        >
                            <option value="immediate">
                                Immediate (Charge on completion)
                            </option>
                            <option value="net_30">Net 30</option>
                            <option value="net_60">Net 60</option>
                            <option value="net_90">Net 90</option>
                        </select>
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Billing Email *
                        </legend>
                        <input
                            type="email"
                            name="billing_email"
                            className="input w-full"
                            value={formData.billing_email}
                            onChange={handleChange}
                            placeholder="billing@company.com"
                            required
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Billing Contact Name
                        </legend>
                        <input
                            type="text"
                            name="billing_contact_name"
                            className="input w-full"
                            value={formData.billing_contact_name}
                            onChange={handleChange}
                            placeholder="Jane Smith"
                        />
                    </fieldset>

                    <fieldset className="fieldset">
                        <legend className="fieldset-legend">
                            Invoice Delivery
                        </legend>
                        <select
                            name="invoice_delivery_method"
                            className="select w-full"
                            value={formData.invoice_delivery_method}
                            onChange={handleChange}
                        >
                            <option value="email">Email</option>
                            <option value="none">None</option>
                        </select>
                    </fieldset>
                </div>

                {/* Billing Address */}
                <div className="mt-4 pt-4 border-t border-base-300/50">
                    <p className="text-sm font-medium text-base-content/70 mb-3 flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-location-dot text-xs"></i>
                        Billing Address
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <fieldset className="fieldset md:col-span-2">
                            <legend className="fieldset-legend">
                                Street Address
                            </legend>
                            <input
                                type="text"
                                name="billing_address_street"
                                className="input w-full"
                                value={formData.billing_address_street}
                                onChange={handleChange}
                                placeholder="123 Main Street"
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">City</legend>
                            <input
                                type="text"
                                name="billing_address_city"
                                className="input w-full"
                                value={formData.billing_address_city}
                                onChange={handleChange}
                                placeholder="New York"
                            />
                        </fieldset>

                        <div className="grid grid-cols-2 gap-4">
                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">
                                    State
                                </legend>
                                <input
                                    type="text"
                                    name="billing_address_state"
                                    className="input w-full"
                                    value={formData.billing_address_state}
                                    onChange={handleChange}
                                    placeholder="NY"
                                />
                            </fieldset>

                            <fieldset className="fieldset">
                                <legend className="fieldset-legend">ZIP</legend>
                                <input
                                    type="text"
                                    name="billing_address_zip"
                                    className="input w-full"
                                    value={formData.billing_address_zip}
                                    onChange={handleChange}
                                    placeholder="10001"
                                />
                            </fieldset>
                        </div>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Country</legend>
                            <input
                                type="text"
                                name="billing_address_country"
                                className="input w-full"
                                value={formData.billing_address_country}
                                onChange={handleChange}
                                placeholder="United States"
                            />
                        </fieldset>

                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Tax ID (EIN)
                            </legend>
                            <input
                                type="text"
                                name="stripe_tax_id"
                                className="input w-full"
                                value={formData.stripe_tax_id}
                                onChange={handleChange}
                                placeholder="12-3456789"
                            />
                            <p className="fieldset-label">Optional</p>
                        </fieldset>
                    </div>
                </div>
            </ContentCard>

            {/* Save Actions */}
            <div className="flex gap-2 justify-end">
                <button
                    type="button"
                    className="btn"
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
                        text="Save Settings"
                        loadingText="Saving..."
                        icon="fa-duotone fa-regular fa-save"
                    />
                </button>
            </div>
        </form>
    );
}
