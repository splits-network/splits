"use client";

import { useState, useEffect, useRef, useMemo, FormEvent } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { createAuthenticatedClient, ApiClient } from "@/lib/api-client";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import { useToast } from "@/lib/toast-context";
import type { EntityLevelInfo } from "@splits-network/shared-gamification";
import { XpLevelBar, MiniLeaderboard, AchievementsSection } from "@splits-network/shared-gamification";
import { ProfileHeader } from "./profile-header";
import { ProfileCompletenessCard } from "./profile-completeness-card";
import { SectionProfile } from "./section-profile";
import { SectionMarketplace } from "./section-marketplace";
import { SectionOnline } from "./section-online";
import { SectionCareer } from "./section-career";
import { SectionPrivacy } from "./section-privacy";
import { SectionConnections } from "./section-connections";
import SectionSkills from "./section-skills";
import { CandidateSettings, ProfileSection } from "./types";

const NAV_ITEMS: { id: ProfileSection; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "fa-duotone fa-regular fa-user" },
    {
        id: "marketplace",
        label: "Marketplace",
        icon: "fa-duotone fa-regular fa-store",
    },
    {
        id: "online",
        label: "Online",
        icon: "fa-duotone fa-regular fa-globe",
    },
    {
        id: "career",
        label: "Career",
        icon: "fa-duotone fa-regular fa-briefcase",
    },
    {
        id: "skills",
        label: "Skills",
        icon: "fa-duotone fa-regular fa-tags",
    },
    {
        id: "privacy",
        label: "Privacy",
        icon: "fa-duotone fa-regular fa-eye-slash",
    },
    {
        id: "connections",
        label: "Connections",
        icon: "fa-duotone fa-regular fa-plug",
    },
    {
        id: "achievements",
        label: "Achievements",
        icon: "fa-duotone fa-regular fa-trophy",
    },
];

export function ProfileSettingsShell() {
    const { getToken } = useAuth();
    const { user: clerkUser } = useUser();
    const toast = useToast();
    const publicClient = useMemo(() => new ApiClient(), []);

    const [activeSection, setActiveSection] =
        useState<ProfileSection>("profile");
    const [settings, setSettings] = useState<CandidateSettings | null>(null);
    const [candidateId, setCandidateId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    // Gamification level
    const [level, setLevel] = useState<EntityLevelInfo | null>(null);
    const [resumeSkills, setResumeSkills] = useState<any[]>([]);

    // Name editing
    const [name, setName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [nameSuccess, setNameSuccess] = useState("");

    // Batch save ref
    const pendingChangesRef = useRef<Partial<CandidateSettings>>({});

    useEffect(() => {
        loadSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Fetch gamification level once candidateId is known
    useEffect(() => {
        if (!candidateId) return;
        const client = new ApiClient();
        client
            .get<{ data: EntityLevelInfo }>("/xp/level", {
                params: { entity_type: "candidate", entity_id: candidateId },
            })
            .then((res) => setLevel(res.data))
            .catch(() => {});
    }, [candidateId]);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                setError("Please sign in to manage profile settings.");
                setLoading(false);
                return;
            }

            const client = createAuthenticatedClient(token);
            const result = await client.get("/candidates/me", {
                params: { include: "user" },
            });
            const dataArray = result.data || result;
            let data = Array.isArray(dataArray) ? dataArray[0] : dataArray;

            if (!data) {
                try {
                    const createResult = await client.post("/candidates", {
                        full_name:
                            clerkUser?.fullName ||
                            clerkUser?.firstName ||
                            "New Candidate",
                        email:
                            clerkUser?.primaryEmailAddress?.emailAddress || "",
                    });
                    data = createResult.data || createResult;
                } catch (createErr) {
                    console.error("Failed to create candidate:", createErr);
                    setError("Failed to create candidate profile.");
                    setLoading(false);
                    return;
                }
            }

            setCandidateId(data.id);
            setResumeSkills(data.resume_metadata?.skills || []);
            setSettings({
                id: data.id,
                phone: data.phone || "",
                location: data.location || "",
                current_title: data.current_title || "",
                current_company: data.current_company || "",
                linkedin_url: data.linkedin_url || "",
                github_url: data.github_url || "",
                portfolio_url: data.portfolio_url || "",
                bio: data.bio || "",
                marketplace_profile: data.marketplace_profile || {},
                marketplace_visibility: data.marketplace_visibility || "public",
                show_email: data.show_email ?? true,
                show_phone: data.show_phone ?? true,
                show_location: data.show_location ?? true,
                show_current_company: data.show_current_company ?? true,
                show_salary_expectations:
                    data.show_salary_expectations ?? false,
                desired_salary_min: data.desired_salary_min || undefined,
                desired_salary_max: data.desired_salary_max || undefined,
                desired_job_type: data.desired_job_type || "",
                open_to_remote: data.open_to_remote ?? false,
                open_to_relocation: data.open_to_relocation ?? false,
                availability: data.availability || "",
                user: {
                    id: data.user?.id,
                    email: data.user?.email,
                    name: data.user?.name,
                },
            });
            setName(data.user?.name || "");
            setLoading(false);
        } catch (err: any) {
            console.error("Failed to load settings:", err);
            setError(err.message || "Failed to load settings");
            setLoading(false);
        }
    };

    const debouncedSave = useDebouncedCallback(async () => {
        if (!candidateId || Object.keys(pendingChangesRef.current).length === 0)
            return;

        setSaving(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const changesToSave = { ...pendingChangesRef.current };
            pendingChangesRef.current = {};
            await client.patch(`/candidates/${candidateId}`, changesToSave);
            toast.success("Profile updated!");
        } catch (err) {
            console.error("Failed to save:", err);
            toast.error("Failed to save changes");
        } finally {
            setSaving(false);
        }
    }, 1000);

    const updateSettings = (updates: Partial<CandidateSettings>) => {
        if (!settings) return;
        setSettings({ ...settings, ...updates });
        pendingChangesRef.current = {
            ...pendingChangesRef.current,
            ...updates,
        };
        debouncedSave();
    };

    const handleNameSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError("Name is required");
            return;
        }

        setSubmitting(true);
        setError("");
        setNameSuccess("");
        try {
            const token = await getToken();
            if (!token || !candidateId) {
                setError("Please sign in.");
                setSubmitting(false);
                return;
            }
            const client = createAuthenticatedClient(token);
            await client.patch(`/candidates/${candidateId}`, {
                full_name: name.trim(),
            });
            await client.patch(`/users/me`, { name: name.trim() });
            if (settings) {
                setSettings({
                    ...settings,
                    user: { ...settings.user!, name: name.trim() },
                });
            }
            setNameSuccess("Name updated successfully!");
            setTimeout(() => setNameSuccess(""), 3000);
        } catch (err) {
            console.error("Failed to update name:", err);
            setError("Failed to update name. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <span className="loading loading-spinner loading-lg" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-100">
            <ProfileHeader />

            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                {error && (
                    <div className="alert alert-error mb-6">
                        <i className="fa-duotone fa-regular fa-circle-exclamation" />
                        <span>{error}</span>
                    </div>
                )}

                <div className="grid lg:grid-cols-6 gap-10 lg:gap-14">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1">
                        <nav className="space-y-1">
                            {NAV_ITEMS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all text-left ${
                                        activeSection === item.id
                                            ? "bg-primary text-primary-content"
                                            : "text-base-content/60 hover:bg-base-200"
                                    }`}
                                >
                                    <i
                                        className={`${item.icon} w-4 text-center`}
                                    />
                                    {item.label}
                                </button>
                            ))}
                        </nav>

                        {/* Saving indicator */}
                        {saving && (
                            <div className="mt-4 flex items-center gap-2 text-xs text-base-content/40 px-4">
                                <span className="loading loading-spinner loading-xs" />
                                Saving...
                            </div>
                        )}
                    </div>

                    {/* Main Panel */}
                    <div className="lg:col-span-4">
                        {settings && (
                            <>
                                {activeSection === "profile" && (
                                    <SectionProfile
                                        settings={settings}
                                        name={name}
                                        onNameChange={setName}
                                        onNameSubmit={handleNameSubmit}
                                        submitting={submitting}
                                        nameSuccess={nameSuccess}
                                        onUpdate={updateSettings}
                                    />
                                )}
                                {activeSection === "marketplace" && (
                                    <SectionMarketplace
                                        settings={settings}
                                        onUpdate={updateSettings}
                                    />
                                )}
                                {activeSection === "online" && (
                                    <SectionOnline
                                        settings={settings}
                                        onUpdate={updateSettings}
                                    />
                                )}
                                {activeSection === "career" && (
                                    <SectionCareer
                                        settings={settings}
                                        onUpdate={updateSettings}
                                    />
                                )}
                                {activeSection === "skills" && candidateId && (
                                    <SectionSkills
                                        candidateId={candidateId}
                                        resumeSkills={resumeSkills}
                                    />
                                )}
                                {activeSection === "privacy" && (
                                    <SectionPrivacy
                                        settings={settings}
                                        onUpdate={updateSettings}
                                    />
                                )}
                                {activeSection === "connections" && (
                                    <SectionConnections />
                                )}
                                {activeSection === "achievements" &&
                                    candidateId && (
                                        <AchievementsSection
                                            entityId={candidateId}
                                            entityType="candidate"
                                            getToken={getToken}
                                            createClient={
                                                createAuthenticatedClient
                                            }
                                        />
                                    )}
                            </>
                        )}
                    </div>

                    {/* Completeness Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        <ProfileCompletenessCard settings={settings} />
                        {level && <XpLevelBar level={level} />}
                        {candidateId && (
                            <MiniLeaderboard
                                entityType="candidate"
                                entityId={candidateId}
                                client={publicClient}
                                showToggle={false}
                                fullLeaderboardHref="/portal/leaderboard"
                            />
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
