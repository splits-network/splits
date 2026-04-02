"use client";

import { useState, useEffect, useCallback } from "react";
import { createAuthenticatedClient } from "@/lib/api-client";
import type { SmartResumeData, SmartResumeProfile } from "./types";

type ResourceName =
    | "experiences"
    | "projects"
    | "tasks"
    | "skills"
    | "education"
    | "certifications"
    | "publications";

const RESOURCE_ENDPOINTS: Record<ResourceName, string> = {
    experiences: "smart-resume-experiences",
    projects: "smart-resume-projects",
    tasks: "smart-resume-tasks",
    skills: "smart-resume-skills",
    education: "smart-resume-education",
    certifications: "smart-resume-certifications",
    publications: "smart-resume-publications",
};

export function useSmartResume(getToken: () => Promise<string | null>) {
    const [data, setData] = useState<SmartResumeData>({
        profile: null,
        experiences: [],
        projects: [],
        tasks: [],
        skills: [],
        education: [],
        certifications: [],
        publications: [],
    });
    const [candidateId, setCandidateId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const getClient = useCallback(async () => {
        const token = await getToken();
        if (!token) throw new Error("Not authenticated");
        return createAuthenticatedClient(token);
    }, [getToken]);

    const loadFullProfile = useCallback(
        async (profileId: string) => {
            const client = await getClient();
            const result = await client.get(
                `/smart-resume-profiles/${profileId}/view/full`
            );
            const full = result.data || result;
            setData({
                profile: full.profile || full,
                experiences: full.experiences || [],
                projects: full.projects || [],
                tasks: full.tasks || [],
                skills: full.skills || [],
                education: full.education || [],
                certifications: full.certifications || [],
                publications: full.publications || [],
            });
        },
        [getClient]
    );

    const initialize = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const client = await getClient();

            // Get candidate
            const meResult = await client.get("/candidates/me");
            const candidate = Array.isArray(meResult.data)
                ? meResult.data[0]
                : meResult.data || meResult;
            if (!candidate?.id) {
                setError("Candidate profile not found.");
                return;
            }
            setCandidateId(candidate.id);

            // Get or create smart resume profile
            const profileResult = await client.get("/smart-resume-profiles", {
                params: { candidate_id: candidate.id },
            });
            const profiles = profileResult.data || profileResult;
            let profile: SmartResumeProfile;

            if (Array.isArray(profiles) && profiles.length > 0) {
                profile = profiles[0];
            } else {
                const createResult = await client.post(
                    "/smart-resume-profiles",
                    { candidate_id: candidate.id }
                );
                profile = createResult.data || createResult;
            }

            await loadFullProfile(profile.id);
        } catch (err: any) {
            console.error("Failed to load smart resume:", err);
            setError(err.message || "Failed to load smart resume");
        } finally {
            setLoading(false);
        }
    }, [getClient, loadFullProfile]);

    useEffect(() => {
        initialize();
    }, [initialize]);

    const updateProfile = useCallback(
        async (updates: Partial<SmartResumeProfile>) => {
            if (!data.profile) return;
            const client = await getClient();
            await client.patch(
                `/smart-resume-profiles/${data.profile.id}`,
                updates
            );
            setData((prev) => ({
                ...prev,
                profile: prev.profile
                    ? { ...prev.profile, ...updates }
                    : null,
            }));
        },
        [data.profile, getClient]
    );

    const createEntry = useCallback(
        async (resource: ResourceName, fields: Record<string, any>) => {
            if (!data.profile) return;
            const client = await getClient();
            const endpoint = RESOURCE_ENDPOINTS[resource];
            const result = await client.post(`/${endpoint}`, {
                profile_id: data.profile.id,
                ...fields,
            });
            const entry = result.data || result;
            setData((prev) => ({
                ...prev,
                [resource]: [...prev[resource], entry],
            }));
            return entry;
        },
        [data.profile, getClient]
    );

    const updateEntry = useCallback(
        async (
            resource: ResourceName,
            id: string,
            fields: Record<string, any>
        ) => {
            const client = await getClient();
            const endpoint = RESOURCE_ENDPOINTS[resource];
            await client.patch(`/${endpoint}/${id}`, fields);
            setData((prev) => ({
                ...prev,
                [resource]: (prev[resource] as any[]).map((item: any) =>
                    item.id === id ? { ...item, ...fields } : item
                ),
            }));
        },
        [getClient]
    );

    const deleteEntry = useCallback(
        async (resource: ResourceName, id: string) => {
            const client = await getClient();
            const endpoint = RESOURCE_ENDPOINTS[resource];
            await client.delete(`/${endpoint}/${id}`);
            setData((prev) => ({
                ...prev,
                [resource]: (prev[resource] as any[]).filter(
                    (item: any) => item.id !== id
                ),
            }));
        },
        [getClient]
    );

    const toggleVisibility = useCallback(
        async (resource: ResourceName, id: string, currentValue: boolean) => {
            await updateEntry(resource, id, {
                visible_to_matching: !currentValue,
            });
        },
        [updateEntry]
    );

    const parseResume = useCallback(
        async (documentId: string) => {
            if (!candidateId) return null;
            const client = await getClient();
            const result = await client.post(
                "/smart-resume-profiles/actions/parse-resume",
                { candidate_id: candidateId, document_id: documentId }
            );
            return result.data || result;
        },
        [candidateId, getClient]
    );

    const commitImport = useCallback(
        async (selections: any[], profileUpdates?: Record<string, any>, documentId?: string) => {
            if (!candidateId || !data.profile) return;
            const client = await getClient();
            await client.post("/smart-resume-profiles/actions/commit-import", {
                candidate_id: candidateId,
                document_id: documentId,
                profile_updates: profileUpdates,
                selections,
            });
            await loadFullProfile(data.profile.id);
        },
        [candidateId, data.profile, getClient, loadFullProfile]
    );

    const generateResume = useCallback(
        async (jobId: string) => {
            if (!candidateId) return;
            const client = await getClient();
            const result = await client.post(
                "/ai-reviews/actions/generate-resume",
                { candidate_id: candidateId, job_id: jobId }
            );
            return result.data || result;
        },
        [candidateId, getClient]
    );

    return {
        ...data,
        candidateId,
        loading,
        error,
        refresh: initialize,
        updateProfile,
        createEntry,
        updateEntry,
        deleteEntry,
        toggleVisibility,
        parseResume,
        commitImport,
        generateResume,
    };
}
