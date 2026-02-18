"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { Badge } from "@splits-network/memphis-ui";
import type { Company, CompanyRelationship } from "../../types";
import { formatDate, formatCompanySize } from "../../types";
import type { AccentClasses } from "./accent";
import { relationshipStatusVariant } from "./accent";
import { companyInitials } from "./helpers";
import CompanyActionsToolbar from "./actions-toolbar";
import CompanyContacts from "@/components/company-contacts";

// ─── Detail Panel ───────────────────────────────────────────────────────────

export function CompanyDetail({
    company,
    relationship,
    accent,
    onClose,
    onRefresh,
}: {
    company: Company;
    relationship: CompanyRelationship | null;
    accent: AccentClasses;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    return (
        <div>
            {/* Header */}
            <div className={`p-6 border-b-4 ${accent.border}`}>
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            {company.logo_url ? (
                                <img
                                    src={company.logo_url}
                                    alt={company.name}
                                    className={`w-14 h-14 object-contain border-2 ${accent.border} bg-cream p-1`}
                                />
                            ) : (
                                <div
                                    className={`w-14 h-14 flex items-center justify-center border-2 ${accent.border} bg-cream text-lg font-bold text-dark`}
                                >
                                    {companyInitials(company.name)}
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight leading-tight text-dark">
                                    {company.name}
                                </h2>
                                {company.industry && (
                                    <span className={`text-sm font-bold ${accent.text}`}>
                                        {company.industry}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Meta pills */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {relationship && (
                                <Badge color={relationshipStatusVariant(relationship.status)} variant="outline">
                                    {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
                                </Badge>
                            )}
                            {company.company_size && (
                                <Badge color="dark" variant="outline">
                                    {formatCompanySize(company.company_size)}
                                </Badge>
                            )}
                            {company.headquarters_location && (
                                <Badge color="dark" variant="outline">
                                    <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                    {company.headquarters_location}
                                </Badge>
                            )}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-coral flex-shrink-0"
                        >
                            <i className="fa-duotone fa-regular fa-xmark" />
                        </button>
                    )}
                </div>

                {/* Actions */}
                <div className="mt-4">
                    <CompanyActionsToolbar
                        company={company}
                        relationship={relationship}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                    />
                </div>
            </div>

            {/* Stats Row */}
            <div className={`grid grid-cols-3 border-b-4 ${accent.border}`}>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {company.company_size || "N/A"}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Size
                    </div>
                </div>
                <div className="p-4 text-center border-r-2 border-dark/10">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {relationship ? (
                            <span className="capitalize">{relationship.relationship_type}</span>
                        ) : "—"}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Relationship
                    </div>
                </div>
                <div className="p-4 text-center">
                    <div className={`text-lg font-black ${accent.text}`}>
                        {relationship?.can_manage_company_jobs ? "Yes" : "No"}
                    </div>
                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Manage Jobs
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="p-6">
                {company.description && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="badge badge-xs badge-coral">
                                <i className="fa-duotone fa-regular fa-building" />
                            </span>
                            About
                        </h3>
                        <p className="text-sm text-dark/80 leading-relaxed">
                            {company.description}
                        </p>
                    </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    {company.headquarters_location && (
                        <div className="p-3 border-2 border-dark/20">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Location
                            </div>
                            <div className="text-sm font-bold text-dark">
                                <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                {company.headquarters_location}
                            </div>
                        </div>
                    )}
                    {company.website && (
                        <div className="p-3 border-2 border-dark/20">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Website
                            </div>
                            <a
                                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`text-sm font-bold ${accent.text} hover:underline`}
                            >
                                {company.website}
                            </a>
                        </div>
                    )}
                    {company.industry && (
                        <div className="p-3 border-2 border-dark/20">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Industry
                            </div>
                            <div className="text-sm font-bold text-dark">
                                {company.industry}
                            </div>
                        </div>
                    )}
                    {company.company_size && (
                        <div className="p-3 border-2 border-dark/20">
                            <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                Company Size
                            </div>
                            <div className="text-sm font-bold text-dark">
                                {formatCompanySize(company.company_size)}
                            </div>
                        </div>
                    )}
                </div>

                {/* Relationship details */}
                {relationship && (
                    <div className="mb-6">
                        <h3 className="font-black text-sm uppercase tracking-wider mb-3 flex items-center gap-2 text-dark">
                            <span className="badge badge-xs badge-teal">
                                <i className="fa-duotone fa-regular fa-handshake" />
                            </span>
                            Relationship
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 border-2 border-dark/20">
                                <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                    Status
                                </div>
                                <Badge color={relationshipStatusVariant(relationship.status)}>
                                    {relationship.status.charAt(0).toUpperCase() + relationship.status.slice(1)}
                                </Badge>
                            </div>
                            <div className="p-3 border-2 border-dark/20">
                                <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                    Type
                                </div>
                                <div className="text-sm font-bold text-dark capitalize">
                                    {relationship.relationship_type}
                                </div>
                            </div>
                            {relationship.relationship_start_date && (
                                <div className="p-3 border-2 border-dark/20">
                                    <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                        Start Date
                                    </div>
                                    <div className="text-sm font-bold text-dark">
                                        {formatDate(relationship.relationship_start_date)}
                                    </div>
                                </div>
                            )}
                            <div className="p-3 border-2 border-dark/20">
                                <div className="text-sm font-bold uppercase tracking-wider text-dark/50 mb-1">
                                    Can Manage Jobs
                                </div>
                                <div className={`text-sm font-bold ${relationship.can_manage_company_jobs ? "text-teal" : "text-dark/50"}`}>
                                    {relationship.can_manage_company_jobs ? "Yes" : "No"}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contacts */}
                <div className={`p-4 border-4 ${accent.border}`}>
                    <h3 className="font-black text-sm uppercase tracking-wider mb-3 text-dark">
                        Team Contacts
                    </h3>
                    <CompanyContacts companyId={company.id} />
                </div>
            </div>
        </div>
    );
}

// ─── Detail Loading Wrapper ─────────────────────────────────────────────────

export function CompanyDetailLoader({
    companyId,
    accent,
    onClose,
    onRefresh,
}: {
    companyId: string;
    accent: AccentClasses;
    onClose: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);
    const [relationship, setRelationship] = useState<CompanyRelationship | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);

                const companyRes = await client.get<{ data: Company }>(`/companies/${companyId}`);
                if (!cancelled) setCompany(companyRes.data);

                // Check for existing relationship
                const relRes: any = await client.get("/recruiter-companies", {
                    params: { company_id: companyId, limit: 1 },
                });
                if (!cancelled && relRes.data && relRes.data.length > 0) {
                    setRelationship(relRes.data[0]);
                }
            } catch (err) {
                console.error("Failed to fetch company detail:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <div className="flex justify-center gap-3 mb-4">
                        <div className="w-4 h-4 bg-coral animate-pulse" />
                        <div className="w-4 h-4 rounded-full bg-teal animate-pulse" />
                        <div className="w-4 h-4 rotate-45 bg-yellow animate-pulse" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider text-dark/50">
                        Loading details...
                    </span>
                </div>
            </div>
        );
    }

    if (!company) return null;

    return (
        <CompanyDetail
            company={company}
            relationship={relationship}
            accent={accent}
            onClose={onClose}
            onRefresh={onRefresh}
        />
    );
}
