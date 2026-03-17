"use client";

import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    BaselSkillPicker,
    BaselBadge,
    type SkillOption,
} from "@splits-network/basel-ui";
import type { ResumeSkill } from "@splits-network/shared-types";
import { useToast } from "@/lib/toast-context";

interface SectionSkillsProps {
    candidateId: string;
    resumeSkills?: ResumeSkill[];
}

export default function SectionSkills({
    candidateId,
    resumeSkills = [],
}: SectionSkillsProps) {
    const { getToken } = useAuth();
    const toast = useToast();
    const [skills, setSkills] = useState<SkillOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Load existing candidate skills
    useEffect(() => {
        async function load() {
            try {
                const token = await getToken();
                if (!token) {
                    console.error("Authentication required");
                    setLoading(false);
                    return;
                }
                const client = createAuthenticatedClient(token);
                const response = await client.get<{
                    data: Array<{ skill_id: string; skill: SkillOption }>;
                }>(`/candidate-skills?candidate_id=${candidateId}`);
                const loaded = (response.data || [])
                    .filter((cs: any) => cs.skill)
                    .map((cs: any) => cs.skill as SkillOption);
                setSkills(loaded);
            } catch (err) {
                console.error("Failed to load skills:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [candidateId]); // eslint-disable-line react-hooks/exhaustive-deps

    const searchSkills = useCallback(
        async (query: string): Promise<SkillOption[]> => {
            const token = await getToken();
            if (!token) {
                console.error("Authentication required");
                return [];
            }
            const client = createAuthenticatedClient(token);
            const response = await client.get<{ data: SkillOption[] }>(
                `/skills?q=${encodeURIComponent(query)}&limit=10`,
            );
            return response.data || [];
        },
        [],
    ); // eslint-disable-line react-hooks/exhaustive-deps

    const createSkill = useCallback(
        async (name: string): Promise<SkillOption> => {
            const token = await getToken();
            if (!token) {
                throw new Error("Authentication required");
            }
            const client = createAuthenticatedClient(token);
            const response = await client.post<{ data: SkillOption }>(
                "/skills",
                { name },
            );
            return response.data;
        },
        [],
    ); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSkillsChange = useCallback(
        async (newSkills: SkillOption[]) => {
            setSkills(newSkills);

            // Auto-save via bulk replace
            setSaving(true);
            try {
                const token = await getToken();
                if (!token) {
                    throw new Error("Authentication required");
                }
                const client = createAuthenticatedClient(token);
                await client.put(
                    `/candidate-skills/candidate/${candidateId}/bulk-replace`,
                    {
                        skills: newSkills.map((s) => ({
                            skill_id: s.id,
                            source: "manual",
                        })),
                    },
                );
            } catch (err) {
                console.error("Failed to save skills:", err);
                toast.error("Skills couldn't be saved. Try again.");
            } finally {
                setSaving(false);
            }
        },
        [candidateId],
    ); // eslint-disable-line react-hooks/exhaustive-deps

    const addResumeSkill = useCallback(
        async (resumeSkill: ResumeSkill) => {
            // First find-or-create the skill
            try {
                const skill = await createSkill(resumeSkill.name);
                if (!skills.some((s) => s.id === skill.id)) {
                    await handleSkillsChange([...skills, skill]);
                    toast.success(`Added "${resumeSkill.name}" to your skills`);
                }
            } catch (err) {
                console.error("Failed to add resume skill:", err);
                toast.error("Skill couldn't be added. Try again.");
            }
        },
        [skills, createSkill, handleSkillsChange, toast],
    );

    // Resume skills not already in user's skills list
    const unadded = resumeSkills.filter(
        (rs) =>
            !skills.some((s) => s.name.toLowerCase() === rs.name.toLowerCase()),
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
            {/* User-managed skills */}
            <div>
                <h3 className="text-lg font-bold text-base-content mb-1">
                    Your Skills
                </h3>
                <p className="text-sm text-base-content/50 mb-4">
                    Add skills to improve your match quality with open roles.
                </p>
                <BaselSkillPicker
                    selectedSkills={skills}
                    onSkillsChange={handleSkillsChange}
                    searchFn={searchSkills}
                    createFn={createSkill}
                    placeholder="Search for a skill..."
                    maxSkills={50}
                />
                {saving && (
                    <p className="text-xs text-base-content/40 mt-2 flex items-center gap-1.5">
                        <span className="loading loading-spinner loading-xs" />
                        Saving...
                    </p>
                )}
            </div>

            {/* AI-Extracted Skills */}
            {unadded.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold text-base-content mb-1">
                        AI-Extracted Skills
                    </h3>
                    <p className="text-sm text-base-content/50 mb-4">
                        These skills were extracted from your resume. Click to
                        add them to your profile.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {unadded.map((rs) => (
                            <button
                                key={rs.name}
                                type="button"
                                onClick={() => addResumeSkill(rs)}
                                className="group"
                            >
                                <BaselBadge
                                    variant="outline"
                                    size="sm"
                                    className="cursor-pointer group-hover:border-primary group-hover:text-primary transition-colors"
                                >
                                    <i className="fa-solid fa-plus text-[8px] mr-1 opacity-50 group-hover:opacity-100" />
                                    {rs.name}
                                </BaselBadge>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
