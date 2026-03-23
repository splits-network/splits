"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { Job } from "../../types";
import { companyName, companyInitials } from "./helpers";
import { BaselBadge } from "@splits-network/basel-ui";
import { CompanyTeamMembers } from "./company-team-members";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface CompanyMember {
    id: string;
    user_id: string;
    role_name: string;
    users?: {
        id: string;
        first_name?: string;
        last_name?: string;
        email?: string;
        avatar_url?: string;
    };
    roles?: { display_name?: string };
}

interface CompanyProfile {
    id: string;
    name: string;
    industry?: string;
    company_size?: string;
    headquarters_location?: string;
    logo_url?: string;
    description?: string;
    website?: string;
    stage?: string;
    founded_year?: number;
    tagline?: string;
    linkedin_url?: string;
    twitter_url?: string;
    glassdoor_url?: string;
    open_roles_count?: number;
    avg_salary?: number;
}

interface TagItem {
    name: string;
}

/* ─── Data Hook ──────────────────────────────────────────────────────────── */

function useCompanyData(companyId: string | null | undefined) {
    const { getToken } = useAuth();
    const [company, setCompany] = useState<CompanyProfile | null>(null);
    const [members, setMembers] = useState<CompanyMember[]>([]);
    const [perks, setPerks] = useState<TagItem[]>([]);
    const [cultureTags, setCultureTags] = useState<TagItem[]>([]);
    const [skills, setSkills] = useState<TagItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;
        if (!companyId) {
            setLoading(false);
            return;
        }

        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);

                const [companyRes, membersRes, perksRes, cultureRes, skillsRes] =
                    await Promise.all([
                        client.get<{ data: CompanyProfile }>(`/companies/${companyId}`),
                        client.get<{ data: CompanyMember[] }>("/memberships/views/detail", {
                            params: { company_id: companyId, limit: 50 },
                        }),
                        client.get<{ data: any[] }>("/company-perks", {
                            params: { company_id: companyId },
                        }),
                        client.get<{ data: any[] }>("/company-culture-tags", {
                            params: { company_id: companyId },
                        }),
                        client.get<{ data: any[] }>("/company-skills", {
                            params: { company_id: companyId },
                        }),
                    ]);

                if (cancelled) return;
                setCompany(companyRes.data);
                setMembers(Array.isArray(membersRes.data) ? membersRes.data : []);
                setPerks((perksRes.data || []).map((p: any) => p.perk).filter(Boolean));
                setCultureTags((cultureRes.data || []).map((c: any) => c.culture_tag).filter(Boolean));
                setSkills((skillsRes.data || []).map((s: any) => s.skill).filter(Boolean));
            } catch (err) {
                console.error("Failed to fetch company data:", err);
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    return { company, members, perks, cultureTags, skills, loading };
}

/* ─── Component ──────────────────────────────────────────────────────────── */

export function CompanyTab({ job }: { job: Job }) {
    const name = companyName(job);
    const { company, members, perks, cultureTags, skills, loading } =
        useCompanyData(job.company_id);

    /* ── 3rd-party firm job (no company_id, sourced by firm) ── */
    if (!job.company_id && job.source_firm_id) {
        const logoUrl = job.firm?.logo_url;
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={name}
                            className="w-14 h-14 object-contain border-2 border-secondary/30 bg-base-100 p-1"
                        />
                    ) : (
                        <div className="w-14 h-14 flex items-center justify-center border-2 border-secondary/30 bg-secondary/10 font-bold text-lg text-secondary">
                            {companyInitials(name)}
                        </div>
                    )}
                    <div>
                        <div className="flex items-center gap-2">
                            <p className="text-lg font-black">{name}</p>
                            <BaselBadge color="secondary" variant="soft" size="sm" icon="fa-handshake">3rd Party</BaselBadge>
                        </div>
                        <p className="text-sm text-base-content/50">Recruiting firm</p>
                    </div>
                </div>
                <div className="bg-base-200 p-4">
                    <p className="text-sm text-base-content/60">
                        This role is managed by a recruiting firm on the Splits Network.
                        The hiring company is not directly on the platform.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="py-12 text-center">
                <span className="loading loading-spinner loading-lg text-primary mb-4 block" />
                <p className="text-sm uppercase tracking-[0.2em] font-bold text-base-content/40">
                    Loading company...
                </p>
            </div>
        );
    }

    const c = company;

    return (
        <div className="space-y-8">
            {/* ── Header ── */}
            <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    {c?.logo_url ? (
                        <img src={c.logo_url} alt={name} className="w-14 h-14 object-contain border-2 border-base-300" />
                    ) : (
                        <div className="w-14 h-14 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-lg">
                            {companyInitials(name)}
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <p className="text-lg font-black">{c?.name || name}</p>
                    {c?.tagline && (
                        <p className="text-sm text-base-content/60 italic">{c.tagline}</p>
                    )}
                    {c?.industry && (
                        <p className="text-sm text-base-content/50">{c.industry}</p>
                    )}
                </div>
            </div>

            {/* ── Quick facts grid ── */}
            <CompanyFactsGrid company={c} />

            {/* ── About ── */}
            {c?.description && (
                <Section title="About">
                    <div className="border-l-4 border-l-primary pl-6">
                        <p className="text-sm text-base-content/70 leading-relaxed">{c.description}</p>
                    </div>
                </Section>
            )}

            {/* ── Culture Tags ── */}
            {cultureTags.length > 0 && (
                <Section title="Culture">
                    <div className="flex flex-wrap gap-2">
                        {cultureTags.map((t) => (
                            <BaselBadge key={t.name} color="secondary" variant="soft" size="sm">{t.name}</BaselBadge>
                        ))}
                    </div>
                </Section>
            )}

            {/* ── Perks ── */}
            {perks.length > 0 && (
                <Section title="Perks &amp; Benefits">
                    <div className="flex flex-wrap gap-2">
                        {perks.map((p) => (
                            <BaselBadge key={p.name} color="accent" variant="soft" size="sm" icon="fa-gift">{p.name}</BaselBadge>
                        ))}
                    </div>
                </Section>
            )}

            {/* ── Tech Stack / Skills ── */}
            {skills.length > 0 && (
                <Section title="Tech Stack">
                    <div className="flex flex-wrap gap-2">
                        {skills.map((s) => (
                            <BaselBadge key={s.name} color="primary" variant="soft" size="sm">{s.name}</BaselBadge>
                        ))}
                    </div>
                </Section>
            )}

            {/* ── Links ── */}
            {(c?.website || c?.linkedin_url || c?.twitter_url || c?.glassdoor_url) && (
                <Section title="Links">
                    <div className="flex flex-wrap gap-4">
                        {c.website && <SocialLink href={c.website} icon="fa-globe" label="Website" />}
                        {c.linkedin_url && <SocialLink href={c.linkedin_url} icon="fa-linkedin" label="LinkedIn" fa="fa-brands" />}
                        {c.twitter_url && <SocialLink href={c.twitter_url} icon="fa-x-twitter" label="X" fa="fa-brands" />}
                        {c.glassdoor_url && <SocialLink href={c.glassdoor_url} icon="fa-building" label="Glassdoor" />}
                    </div>
                </Section>
            )}

            {/* ── Team Members ── */}
            <CompanyTeamMembers members={members} loading={false} />
        </div>
    );
}

/* ─── Sub-components ─────────────────────────────────────────────────────── */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-3">
                {title}
            </h3>
            {children}
        </div>
    );
}

function CompanyFactsGrid({ company }: { company: CompanyProfile | null }) {
    if (!company) return null;

    const facts: { label: string; value: string | null; icon: string }[] = [
        { label: "HQ", value: company.headquarters_location || null, icon: "fa-location-dot" },
        { label: "Size", value: company.company_size || null, icon: "fa-users" },
        { label: "Stage", value: company.stage || null, icon: "fa-seedling" },
        { label: "Founded", value: company.founded_year ? String(company.founded_year) : null, icon: "fa-calendar" },
        { label: "Open Roles", value: company.open_roles_count != null ? String(company.open_roles_count) : null, icon: "fa-briefcase" },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-[2px] bg-base-300">
            {facts.map((f) => (
                <div key={f.label} className="bg-base-100 p-3">
                    <p className="text-xs font-bold uppercase tracking-[0.22em] text-base-content/30 mb-1">
                        <i className={`fa-duotone fa-regular ${f.icon} mr-1`} />
                        {f.label}
                    </p>
                    <p className={`font-bold text-sm ${!f.value ? "text-base-content/30 italic font-normal" : ""}`}>
                        {f.value || "Not specified"}
                    </p>
                </div>
            ))}
        </div>
    );
}

function SocialLink({
    href,
    icon,
    label,
    fa = "fa-duotone fa-regular",
}: {
    href: string;
    icon: string;
    label: string;
    fa?: string;
}) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center gap-1.5"
        >
            <i className={`${fa} ${icon}`} />
            {label}
        </a>
    );
}
