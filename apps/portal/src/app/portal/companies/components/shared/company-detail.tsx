"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Company, CompanyRelationship } from "../../types";
import { formatCompanySize } from "../../types";
import { statusColorName } from "./status-color";
import { companyInitials, formatStatus } from "./helpers";
import { LevelBadge, useGamification } from "@splits-network/shared-gamification";
import { PanelHeader, PanelTabs } from "@splits-network/basel-ui";
import CompanyActionsToolbar from "./actions-toolbar";
import { CompanyOverviewTab } from "./company-overview-tab";
import { CompanyRolesTab } from "./company-roles-tab";
import { CompanyContactsTab } from "./company-contacts-tab";
import { CompanyCallsTab } from "./company-calls-tab";
import { CompanyRelationshipTab } from "./company-relationship-tab";

/* ─── Detail Panel ─────────────────────────────────────────────────────── */

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
    const { registerEntities, getLevel } = useGamification();

    useEffect(() => {
        registerEntities("company", [company.id]);
    }, [company.id, registerEntities]);

    const level = getLevel(company.id);

    const badges = [];
    if (relationship) {
        badges.push({
            label: formatStatus(relationship.status),
            className: `badge-${statusColorName(relationship.status)}`,
        });
    }
    if (company.company_size) {
        badges.push({ label: formatCompanySize(company.company_size), className: "badge-ghost" });
    }

    const meta = [];
    if (company.headquarters_location) {
        meta.push({ icon: "fa-duotone fa-regular fa-location-dot", text: company.headquarters_location });
    }
    if (company.website) {
        meta.push({ icon: "fa-duotone fa-regular fa-globe", text: company.website });
    }

    const stats = [
        { label: "Size", value: company.company_size || "N/A", icon: "fa-duotone fa-regular fa-users" },
        { label: "Stage", value: company.stage || "N/A", icon: "fa-duotone fa-regular fa-chart-line" },
        { label: "Founded", value: company.founded_year ? String(company.founded_year) : "N/A", icon: "fa-duotone fa-regular fa-calendar" },
        { label: "Open Roles", value: String(company.open_roles_count ?? 0), icon: "fa-duotone fa-regular fa-briefcase" },
    ];

    return (
        <div>
            <PanelHeader
                kicker={company.industry || "Company"}
                badges={badges}
                avatar={{ initials: companyInitials(company.name) }}
                avatarOverlay={
                    level ? (
                        <div className="absolute -bottom-1.5 -right-2">
                            <LevelBadge level={level} size="sm" />
                        </div>
                    ) : undefined
                }
                title={company.name}
                subtitle={company.industry}
                meta={meta}
                stats={stats}
                actions={
                    <CompanyActionsToolbar
                        company={company}
                        relationship={relationship}
                        variant="descriptive"
                        size="sm"
                        onRefresh={onRefresh}
                    />
                }
                onClose={onClose}
            />

            <PanelTabs
                tabs={[
                    { label: "Overview", value: "overview", icon: "fa-duotone fa-regular fa-building" },
                    { label: "Roles", value: "roles", icon: "fa-duotone fa-regular fa-briefcase" },
                    { label: "Contacts", value: "contacts", icon: "fa-duotone fa-regular fa-address-book" },
                    { label: "Relationship", value: "relationship", icon: "fa-duotone fa-regular fa-handshake" },
                    { label: "Calls", value: "calls", icon: "fa-duotone fa-regular fa-video" },
                ]}
                defaultTab="overview"
            >
                {(tab) => {
                    if (tab === "overview") {
                        return (
                            <CompanyOverviewTab
                                company={company}
                                relationship={relationship}
                                techStack={techStack}
                                perks={perks}
                                cultureTags={cultureTags}
                            />
                        );
                    }
                    if (tab === "roles") return <CompanyRolesTab companyId={company.id} />;
                    if (tab === "contacts") return <CompanyContactsTab companyId={company.id} />;
                    if (tab === "relationship") return <CompanyRelationshipTab relationship={relationship} />;
                    return <CompanyCallsTab companyId={company.id} companyName={company.name} />;
                }}
            </PanelTabs>
        </div>
    );
}

/* ─── Detail Loading Wrapper ───────────────────────────────────────────── */

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
    const [relationship, setRelationship] = useState<CompanyRelationship | null>(null);
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

                const companyRes = await client.get<{ data: Company }>(`/companies/${id}`);
                if (!signal?.cancelled) setCompany(companyRes.data);

                const relRes: any = await client.get("/recruiter-companies", {
                    params: { company_id: id, limit: 1 },
                });
                if (!signal?.cancelled && relRes.data && relRes.data.length > 0) {
                    setRelationship(relRes.data[0]);
                }

                const [skillsRes, perksRes, cultureRes] = await Promise.all([
                    client.get<{ data: Array<{ skill?: { name: string } }> }>(`/company-skills?company_id=${id}`),
                    client.get<{ data: Array<{ perk?: { name: string } }> }>(`/company-perks?company_id=${id}`),
                    client.get<{ data: Array<{ culture_tag?: { name: string } }> }>(`/company-culture-tags?company_id=${id}`),
                ]);

                if (!signal?.cancelled) {
                    setSkills(skillsRes.data.filter((r) => r.skill).map((r) => r.skill!.name));
                    setPerks(perksRes.data.filter((r) => r.perk).map((r) => r.perk!.name));
                    setCultureTags(cultureRes.data.filter((r) => r.culture_tag).map((r) => r.culture_tag!.name));
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
        return () => { signal.cancelled = true; };
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
