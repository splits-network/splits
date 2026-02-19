"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Company, CompanyRelationship } from "../../types";
import { formatDate, formatCompanySize } from "../../types";
import { statusColor } from "./status-color";
import { companyInitials, formatStatus } from "./helpers";
import CompanyActionsToolbar from "./actions-toolbar";
import CompanyContacts from "@/components/company-contacts";

/* -- Detail Panel -- */

export function CompanyDetail({
    company,
    relationship,
    onClose,
    onRefresh,
}: {
    company: Company;
    relationship: CompanyRelationship | null;
    onClose?: () => void;
    onRefresh?: () => void;
}) {
    return (
        <div>
            {/* Header */}
            <div className="sticky top-0 z-10 bg-base-100 border-b-2 border-base-300 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            {company.logo_url ? (
                                <img
                                    src={company.logo_url}
                                    alt={company.name}
                                    className="w-14 h-14 object-contain border-2 border-base-300 bg-base-200 p-1"
                                />
                            ) : (
                                <div className="w-14 h-14 flex items-center justify-center border-2 border-base-300 bg-base-200 text-lg font-bold text-base-content/60">
                                    {companyInitials(company.name)}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-1">
                                    {company.industry || "Company"}
                                </p>
                                <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight">
                                    {company.name}
                                </h2>
                            </div>
                        </div>

                        {/* Meta pills */}
                        <div className="flex flex-wrap gap-2 mt-2">
                            {relationship && (
                                <span
                                    className={`text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 ${statusColor(relationship.status)}`}
                                >
                                    {formatStatus(relationship.status)}
                                </span>
                            )}
                            {company.company_size && (
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 bg-base-200 text-base-content/50">
                                    {formatCompanySize(company.company_size)}
                                </span>
                            )}
                            {company.headquarters_location && (
                                <span className="text-[10px] uppercase tracking-[0.2em] font-bold px-2 py-1 bg-base-200 text-base-content/50">
                                    <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                    {company.headquarters_location}
                                </span>
                            )}
                        </div>
                    </div>
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="btn btn-sm btn-square btn-ghost"
                        >
                            <i className="fa-duotone fa-regular fa-xmark text-lg" />
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

            {/* Content */}
            <div className="p-6 space-y-8">
                {/* Stats grid */}
                <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Size
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {company.company_size || "N/A"}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Relationship
                        </p>
                        <p className="text-lg font-black tracking-tight capitalize">
                            {relationship?.relationship_type || "None"}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Manage Jobs
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {relationship?.can_manage_company_jobs ? (
                                <span className="text-success">Yes</span>
                            ) : (
                                "No"
                            )}
                        </p>
                    </div>
                </div>

                {/* Description */}
                {company.description && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            About
                        </h3>
                        <p className="text-base-content/70 leading-relaxed">
                            {company.description}
                        </p>
                    </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    {company.headquarters_location && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Location
                            </p>
                            <p className="font-bold text-sm">
                                <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                {company.headquarters_location}
                            </p>
                        </div>
                    )}
                    {company.website && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Website
                            </p>
                            <a
                                href={
                                    company.website.startsWith("http")
                                        ? company.website
                                        : `https://${company.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-primary hover:underline"
                            >
                                {company.website}
                            </a>
                        </div>
                    )}
                    {company.industry && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Industry
                            </p>
                            <p className="font-bold text-sm">
                                {company.industry}
                            </p>
                        </div>
                    )}
                    {company.company_size && (
                        <div className="bg-base-100 p-4">
                            <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Company Size
                            </p>
                            <p className="font-bold text-sm">
                                {formatCompanySize(company.company_size)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Relationship details */}
                {relationship && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Relationship
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                            <div className="bg-base-100 p-4">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                    Status
                                </p>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 text-[10px] uppercase tracking-[0.15em] font-bold ${statusColor(relationship.status)}`}
                                >
                                    {formatStatus(relationship.status)}
                                </span>
                            </div>
                            <div className="bg-base-100 p-4">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                    Type
                                </p>
                                <p className="font-bold text-sm capitalize">
                                    {relationship.relationship_type}
                                </p>
                            </div>
                            {relationship.relationship_start_date && (
                                <div className="bg-base-100 p-4">
                                    <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                        Start Date
                                    </p>
                                    <p className="font-bold text-sm">
                                        {formatDate(
                                            relationship.relationship_start_date,
                                        )}
                                    </p>
                                </div>
                            )}
                            <div className="bg-base-100 p-4">
                                <p className="text-[10px] uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                    Can Manage Jobs
                                </p>
                                <p
                                    className={`font-bold text-sm ${relationship.can_manage_company_jobs ? "text-success" : "text-base-content/50"}`}
                                >
                                    {relationship.can_manage_company_jobs
                                        ? "Yes"
                                        : "No"}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Contacts */}
                <div className="border-t-2 border-base-300 pt-6">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                        Team Contacts
                    </h3>
                    <CompanyContacts companyId={company.id} />
                </div>
            </div>
        </div>
    );
}

/* -- Detail Loading Wrapper -- */

export function CompanyDetailLoader({
    companyId,
    onClose,
    onRefresh,
}: {
    companyId: string;
    onClose: () => void;
    onRefresh?: () => void;
}) {
    const { getToken } = useAuth();
    const [company, setCompany] = useState<Company | null>(null);
    const [relationship, setRelationship] =
        useState<CompanyRelationship | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);

                const companyRes = await client.get<{ data: Company }>(
                    `/companies/${companyId}`,
                );
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
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-base-content/40">
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
            onClose={onClose}
            onRefresh={onRefresh}
        />
    );
}
