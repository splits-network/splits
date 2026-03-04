"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { BaselSkillPicker, type SkillOption } from "@splits-network/basel-ui";

interface CompanyTagsSectionProps {
    companyId: string;
}

export function CompanyTagsSection({ companyId }: CompanyTagsSectionProps) {
    const { getToken } = useAuth();

    const [skills, setSkills] = useState<SkillOption[]>([]);
    const [perks, setPerks] = useState<SkillOption[]>([]);
    const [cultureTags, setCultureTags] = useState<SkillOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<
        "skills" | "perks" | "culture-tags" | null
    >(null);

    // Load existing junction data on mount
    useEffect(() => {
        async function load() {
            try {
                const token = await getToken();
                if (!token) {
                    console.error("Authentication required");
                    return;
                }
                const client = createAuthenticatedClient(token);

                const [skillsRes, perksRes, cultureRes] = await Promise.all([
                    client.get(`/company-skills?company_id=${companyId}`),
                    client.get(`/company-perks?company_id=${companyId}`),
                    client.get(`/company-culture-tags?company_id=${companyId}`),
                ]);

                setSkills(
                    (skillsRes.data || [])
                        .filter((r: any) => r.skill)
                        .map((r: any) => r.skill as SkillOption),
                );
                setPerks(
                    (perksRes.data || [])
                        .filter((r: any) => r.perk)
                        .map((r: any) => r.perk as SkillOption),
                );
                setCultureTags(
                    (cultureRes.data || [])
                        .filter((r: any) => r.culture_tag)
                        .map((r: any) => r.culture_tag as SkillOption),
                );
            } catch (err) {
                console.error("Failed to load company tags:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [companyId]); // eslint-disable-line react-hooks/exhaustive-deps

    // Search functions
    const searchSkills = useCallback(
        async (query: string): Promise<SkillOption[]> => {
            const token = await getToken();
            if (!token) return [];
            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: SkillOption[] }>(
                `/skills?q=${encodeURIComponent(query)}&limit=10`,
            );
            return response.data || [];
        },
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const searchPerks = useCallback(
        async (query: string): Promise<SkillOption[]> => {
            const token = await getToken();
            if (!token) return [];
            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: SkillOption[] }>(
                `/perks?q=${encodeURIComponent(query)}&limit=10`,
            );
            return response.data || [];
        },
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const searchCultureTags = useCallback(
        async (query: string): Promise<SkillOption[]> => {
            const token = await getToken();
            if (!token) return [];
            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: SkillOption[] }>(
                `/culture-tags?q=${encodeURIComponent(query)}&limit=10`,
            );
            return response.data || [];
        },
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    // Create functions
    const createSkill = useCallback(
        async (name: string): Promise<SkillOption> => {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");
            const client = createAuthenticatedClient(token);
            const response = await client.post<{ data: SkillOption }>(
                "/skills",
                { name },
            );
            return response.data;
        },
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const createPerk = useCallback(
        async (name: string): Promise<SkillOption> => {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");
            const client = createAuthenticatedClient(token);
            const response = await client.post<{ data: SkillOption }>(
                "/perks",
                { name },
            );
            return response.data;
        },
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const createCultureTag = useCallback(
        async (name: string): Promise<SkillOption> => {
            const token = await getToken();
            if (!token) throw new Error("Authentication required");
            const client = createAuthenticatedClient(token);
            const response = await client.post<{ data: SkillOption }>(
                "/culture-tags",
                { name },
            );
            return response.data;
        },
        [], // eslint-disable-line react-hooks/exhaustive-deps
    );

    // Change handlers with auto-save via bulk-replace
    const handleSkillsChange = useCallback(
        async (newSkills: SkillOption[]) => {
            setSkills(newSkills);
            setSaving("skills");
            try {
                const token = await getToken();
                if (!token) throw new Error("Authentication required");
                const client = createAuthenticatedClient(token);
                await client.put(`/companies/${companyId}/skills`, {
                    skills: newSkills.map((s) => ({ skill_id: s.id })),
                });
            } catch (err) {
                console.error("Failed to save skills:", err);
            } finally {
                setSaving(null);
            }
        },
        [companyId], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const handlePerksChange = useCallback(
        async (newPerks: SkillOption[]) => {
            setPerks(newPerks);
            setSaving("perks");
            try {
                const token = await getToken();
                if (!token) throw new Error("Authentication required");
                const client = createAuthenticatedClient(token);
                await client.put(`/companies/${companyId}/perks`, {
                    perks: newPerks.map((p) => ({ perk_id: p.id })),
                });
            } catch (err) {
                console.error("Failed to save perks:", err);
            } finally {
                setSaving(null);
            }
        },
        [companyId], // eslint-disable-line react-hooks/exhaustive-deps
    );

    const handleCultureTagsChange = useCallback(
        async (newTags: SkillOption[]) => {
            setCultureTags(newTags);
            setSaving("culture-tags");
            try {
                const token = await getToken();
                if (!token) throw new Error("Authentication required");
                const client = createAuthenticatedClient(token);
                await client.put(`/companies/${companyId}/culture-tags`, {
                    culture_tags: newTags.map((t) => ({ culture_tag_id: t.id })),
                });
            } catch (err) {
                console.error("Failed to save culture tags:", err);
            } finally {
                setSaving(null);
            }
        },
        [companyId], // eslint-disable-line react-hooks/exhaustive-deps
    );

    if (loading) {
        return (
            <div className="py-8 flex items-center justify-center">
                <span className="loading loading-spinner loading-md text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Tech Stack */}
            <div>
                <h3 className="text-lg font-bold text-base-content mb-1">
                    Tech Stack
                </h3>
                <p className="text-sm text-base-content/50 mb-4">
                    Add the technologies your team uses. This helps recruiters
                    find candidates with the right technical background.
                </p>
                <BaselSkillPicker
                    selectedSkills={skills}
                    onSkillsChange={handleSkillsChange}
                    searchFn={searchSkills}
                    createFn={createSkill}
                    placeholder="Search for a technology..."
                    maxSkills={30}
                />
                {saving === "skills" && (
                    <p className="text-xs text-base-content/40 mt-2 flex items-center gap-1.5">
                        <span className="loading loading-spinner loading-xs" />
                        Saving...
                    </p>
                )}
            </div>

            {/* Perks & Benefits */}
            <div>
                <h3 className="text-lg font-bold text-base-content mb-1">
                    Perks &amp; Benefits
                </h3>
                <p className="text-sm text-base-content/50 mb-4">
                    Highlight the perks and benefits you offer to attract top
                    talent.
                </p>
                <BaselSkillPicker
                    selectedSkills={perks}
                    onSkillsChange={handlePerksChange}
                    searchFn={searchPerks}
                    createFn={createPerk}
                    placeholder="Search for a perk..."
                    maxSkills={30}
                />
                {saving === "perks" && (
                    <p className="text-xs text-base-content/40 mt-2 flex items-center gap-1.5">
                        <span className="loading loading-spinner loading-xs" />
                        Saving...
                    </p>
                )}
            </div>

            {/* Culture Tags */}
            <div>
                <h3 className="text-lg font-bold text-base-content mb-1">
                    Culture &amp; Values
                </h3>
                <p className="text-sm text-base-content/50 mb-4">
                    Describe your company culture and values to help candidates
                    find their ideal fit.
                </p>
                <BaselSkillPicker
                    selectedSkills={cultureTags}
                    onSkillsChange={handleCultureTagsChange}
                    searchFn={searchCultureTags}
                    createFn={createCultureTag}
                    placeholder="Search for a culture tag..."
                    maxSkills={20}
                />
                {saving === "culture-tags" && (
                    <p className="text-xs text-base-content/40 mt-2 flex items-center gap-1.5">
                        <span className="loading loading-spinner loading-xs" />
                        Saving...
                    </p>
                )}
            </div>
        </div>
    );
}
