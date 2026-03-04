"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Company, CompanyRelationship } from "../../types";
import { formatDate, formatCompanySize } from "../../types";
import { statusColor } from "./status-color";
import { companyInitials, formatStatus, formatSalary } from "./helpers";
import { LevelBadge, BadgeGrid, useGamification } from "@splits-network/shared-gamification";
import { BaselBadge } from "@splits-network/basel-ui";
import CompanyActionsToolbar from "./actions-toolbar";
import CompanyContacts from "@/components/company-contacts";

/* -- Detail Panel -- */

export function CompanyDetail({
    company,
    relationship,
    onClose,
    onRefresh,
    techStack = [],
    perks = [],
    cultureTags = [],
}: {
    company: Company;
    relationship: CompanyRelationship | null;
    onClose?: () => void;
    onRefresh?: () => void;
    techStack?: string[];
    perks?: string[];
    cultureTags?: string[];
}) {
    const { registerEntities, getLevel, getBadges } = useGamification();

    useEffect(() => {
        registerEntities("company", [company.id]);
    }, [company.id, registerEntities]);

    const level = getLevel(company.id);
    const badges = getBadges(company.id);

    return (
        <div>
            {/* Header */}
            <div className="sticky top-0 bg-base-100 border-b-2 border-base-300 px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="relative flex-shrink-0">
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
                                {level && (
                                    <div className="absolute -bottom-1.5 -right-2">
                                        <LevelBadge level={level} size="sm" />
                                    </div>
                                )}
                            </div>
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
                                    className={`text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 ${statusColor(relationship.status)}`}
                                >
                                    {formatStatus(relationship.status)}
                                </span>
                            )}
                            {company.company_size && (
                                <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-base-200 text-base-content/50">
                                    {formatCompanySize(company.company_size)}
                                </span>
                            )}
                            {company.headquarters_location && (
                                <span className="text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 bg-base-200 text-base-content/50">
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
                {/* Stats grid — Size, Stage, Founded, Open Roles */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px] bg-base-300">
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Size
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {company.company_size || "N/A"}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Stage
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {company.stage || "N/A"}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Founded
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {company.founded_year || "N/A"}
                        </p>
                    </div>
                    <div className="bg-base-100 p-4">
                        <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                            Open Roles
                        </p>
                        <p className="text-lg font-black tracking-tight">
                            {company.open_roles_count ?? 0}
                        </p>
                    </div>
                    {company.avg_salary != null && (
                        <div className="bg-base-100 p-4 col-span-2 md:col-span-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Avg Salary
                            </p>
                            <p className="text-lg font-black tracking-tight">
                                {formatSalary(company.avg_salary)}
                            </p>
                        </div>
                    )}
                </div>

                {/* Tagline */}
                {company.tagline && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Tagline
                        </h3>
                        <p className="text-lg italic text-base-content/70 border-l-4 border-primary pl-4">
                            {company.tagline}
                        </p>
                    </div>
                )}

                {/* About / Description */}
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

                {/* Social Links */}
                {(company.linkedin_url || company.twitter_url || company.glassdoor_url) && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Social
                        </h3>
                        <div className="flex items-center gap-4">
                            {company.linkedin_url && (
                                <a
                                    href={company.linkedin_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                                >
                                    <i className="fa-brands fa-linkedin text-lg" />
                                    LinkedIn
                                </a>
                            )}
                            {company.twitter_url && (
                                <a
                                    href={company.twitter_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                                >
                                    <i className="fa-brands fa-x-twitter text-lg" />
                                    X / Twitter
                                </a>
                            )}
                            {company.glassdoor_url && (
                                <a
                                    href={company.glassdoor_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                                >
                                    <i className="fa-duotone fa-regular fa-star text-lg" />
                                    Glassdoor
                                </a>
                            )}
                        </div>
                    </div>
                )}

                {/* Tech Stack */}
                {techStack.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Tech Stack
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {techStack.map((skill) => (
                                <BaselBadge key={skill} variant="outline" size="sm">
                                    {skill}
                                </BaselBadge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Perks & Benefits */}
                {perks.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Perks & Benefits
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {perks.map((perk) => (
                                <BaselBadge key={perk} color="secondary" size="sm">
                                    {perk}
                                </BaselBadge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Culture & Values */}
                {cultureTags.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Culture & Values
                        </h3>
                        <div className="flex flex-wrap gap-1.5">
                            {cultureTags.map((tag) => (
                                <BaselBadge key={tag} color="accent" size="sm">
                                    {tag}
                                </BaselBadge>
                            ))}
                        </div>
                    </div>
                )}

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[2px] bg-base-300">
                    {company.headquarters_location && (
                        <div className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
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
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
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
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Industry
                            </p>
                            <p className="font-bold text-sm">
                                {company.industry}
                            </p>
                        </div>
                    )}
                    {company.company_size && (
                        <div className="bg-base-100 p-4">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
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
                                <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                    Status
                                </p>
                                <span
                                    className={`inline-flex items-center px-2 py-0.5 text-sm uppercase tracking-[0.15em] font-bold ${statusColor(relationship.status)}`}
                                >
                                    {formatStatus(relationship.status)}
                                </span>
                            </div>
                            <div className="bg-base-100 p-4">
                                <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                    Type
                                </p>
                                <p className="font-bold text-sm capitalize">
                                    {relationship.relationship_type}
                                </p>
                            </div>
                            {relationship.relationship_start_date && (
                                <div className="bg-base-100 p-4">
                                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
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
                                <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
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

                {/* Achievements */}
                {badges.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-3">
                            Achievements
                        </h3>
                        <BadgeGrid badges={badges} maxVisible={6} />
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
    const [skills, setSkills] = useState<string[]>([]);
    const [perks, setPerks] = useState<string[]>([]);
    const [cultureTags, setCultureTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchDetail = useCallback(
        async (id: string, signal?: { cancelled: boolean }) => {
            try {
                const token = await getToken();
                if (!token || signal?.cancelled) return;
                const client = createAuthenticatedClient(token);

                const companyRes = await client.get<{ data: Company }>(
                    `/companies/${id}`,
                );
                if (!signal?.cancelled) setCompany(companyRes.data);

                // Check for existing relationship
                const relRes: any = await client.get("/recruiter-companies", {
                    params: { company_id: id, limit: 1 },
                });
                if (
                    !signal?.cancelled &&
                    relRes.data &&
                    relRes.data.length > 0
                ) {
                    setRelationship(relRes.data[0]);
                }

                // Fetch junction data in parallel
                const [skillsRes, perksRes, cultureRes] = await Promise.all([
                    client.get<{ data: Array<{ skill?: { name: string } }> }>(
                        `/company-skills?company_id=${id}`,
                    ),
                    client.get<{ data: Array<{ perk?: { name: string } }> }>(
                        `/company-perks?company_id=${id}`,
                    ),
                    client.get<{ data: Array<{ culture_tag?: { name: string } }> }>(
                        `/company-culture-tags?company_id=${id}`,
                    ),
                ]);

                if (!signal?.cancelled) {
                    setSkills(
                        skillsRes.data
                            .filter((r) => r.skill)
                            .map((r) => r.skill!.name),
                    );
                    setPerks(
                        perksRes.data
                            .filter((r) => r.perk)
                            .map((r) => r.perk!.name),
                    );
                    setCultureTags(
                        cultureRes.data
                            .filter((r) => r.culture_tag)
                            .map((r) => r.culture_tag!.name),
                    );
                }
            } catch (err) {
                console.error("Failed to fetch company detail:", err);
            }
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [],
    );

    useEffect(() => {
        const signal = { cancelled: false };
        setLoading(true);

        fetchDetail(companyId, signal).finally(() => {
            if (!signal.cancelled) setLoading(false);
        });

        return () => {
            signal.cancelled = true;
        };
    }, [companyId, refreshKey, fetchDetail]);

    const handleRefresh = useCallback(() => {
        setRefreshKey((k) => k + 1);
        onRefresh?.();
    }, [onRefresh]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center p-12">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                    <span className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
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
            onRefresh={handleRefresh}
            techStack={skills}
            perks={perks}
            cultureTags={cultureTags}
        />
    );
}
