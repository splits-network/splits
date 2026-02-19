"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    useMemo,
    useRef,
    type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useDebouncedCallback } from "@/hooks/use-debounce";
import type { MarketplaceProfile } from "@splits-network/shared-types";
import {
    calculateProfileCompleteness,
    getCompletionTierBadge,
    getTopPriorityFields,
    getCompletionIncentives,
    type CompletenessResult,
    type ProfileField,
} from "@/lib/utils/profile-completeness";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export interface MarketplaceSettingsData {
    marketplace_enabled: boolean;
    marketplace_visibility: "public" | "limited" | "hidden";
    industries: string[];
    specialties: string[];
    location: string;
    phone: string;
    tagline: string;
    years_experience: number;
    bio: string;
    marketplace_profile: MarketplaceProfile;
    show_success_metrics: boolean;
    show_contact_info: boolean;
}

interface MarketplaceContextValue {
    settings: MarketplaceSettingsData;
    recruiterId: string | null;
    updateSettings: (updates: Partial<MarketplaceSettingsData>) => void;
    toggleIndustry: (industry: string) => void;
    toggleSpecialty: (specialty: string) => void;
    updateBioRich: (bio_rich: string) => void;
    completeness: CompletenessResult;
    tierBadge: ReturnType<typeof getCompletionTierBadge>;
    topPriorities: ProfileField[];
    incentives: string[];
    loading: boolean;
    saving: boolean;
    lastSaved: Date | null;
    error: string;
}

/* ─── Context ────────────────────────────────────────────────────────────── */

const MarketplaceContext = createContext<MarketplaceContextValue | null>(null);

export function useMarketplaceSettings() {
    const ctx = useContext(MarketplaceContext);
    if (!ctx)
        throw new Error(
            "useMarketplaceSettings must be used within MarketplaceSettingsProvider",
        );
    return ctx;
}

/* ─── Provider ───────────────────────────────────────────────────────────── */

const DEFAULT_SETTINGS: MarketplaceSettingsData = {
    marketplace_enabled: false,
    marketplace_visibility: "public",
    industries: [],
    specialties: [],
    location: "",
    phone: "",
    tagline: "",
    years_experience: 0,
    bio: "",
    marketplace_profile: {},
    show_success_metrics: false,
    show_contact_info: true,
};

export function MarketplaceSettingsProvider({
    children,
}: {
    children: ReactNode;
}) {
    const { getToken } = useAuth();
    const [settings, setSettings] =
        useState<MarketplaceSettingsData>(DEFAULT_SETTINGS);
    const [recruiterId, setRecruiterId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const pendingChangesRef = useRef<Partial<MarketplaceSettingsData>>({});

    useEffect(() => {
        loadSettings();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const token = await getToken();
            if (!token) {
                setError("Please sign in to manage marketplace settings.");
                setLoading(false);
                return;
            }
            const client = createAuthenticatedClient(token);
            const result = await client.getCurrentRecruiter();
            const data = result.data;
            setRecruiterId(data.id);
            setSettings({
                marketplace_enabled: data.marketplace_enabled ?? false,
                marketplace_visibility:
                    data.marketplace_visibility || "public",
                industries: data.industries || [],
                specialties: data.specialties || [],
                location: data.location || "",
                phone: data.phone || "",
                tagline: data.tagline || "",
                years_experience: data.years_experience || 0,
                bio: data.bio || "",
                marketplace_profile: data.marketplace_profile || {},
                show_success_metrics: data.show_success_metrics ?? false,
                show_contact_info: data.show_contact_info !== false,
            });
        } catch (err) {
            console.error("Failed to load marketplace settings:", err);
            setError("Failed to load settings. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const debouncedSave = useDebouncedCallback(async () => {
        if (Object.keys(pendingChangesRef.current).length === 0) return;
        setSaving(true);
        try {
            const token = await getToken();
            if (!token) {
                setError("Please sign in.");
                return;
            }
            if (!recruiterId) {
                setError("Recruiter profile not loaded.");
                return;
            }
            const client = createAuthenticatedClient(token);
            const changesToSave = { ...pendingChangesRef.current };
            pendingChangesRef.current = {};
            const payload = {
                marketplace_enabled:
                    changesToSave.marketplace_enabled ??
                    settings.marketplace_enabled,
                marketplace_visibility:
                    changesToSave.marketplace_visibility ??
                    settings.marketplace_visibility,
                industries: changesToSave.industries ?? settings.industries,
                specialties: changesToSave.specialties ?? settings.specialties,
                location: changesToSave.location ?? settings.location,
                phone: changesToSave.phone ?? settings.phone,
                tagline: changesToSave.tagline ?? settings.tagline,
                years_experience:
                    changesToSave.years_experience ?? settings.years_experience,
                bio: changesToSave.bio ?? settings.bio,
                marketplace_profile:
                    changesToSave.marketplace_profile ??
                    settings.marketplace_profile,
                show_success_metrics:
                    changesToSave.show_success_metrics ??
                    settings.show_success_metrics,
                show_contact_info:
                    changesToSave.show_contact_info ??
                    settings.show_contact_info,
            };
            await client.patch(`/recruiters/${recruiterId}`, payload);
            setLastSaved(new Date());
            setError("");
        } catch (err) {
            console.error("Failed to update marketplace settings:", err);
            setError("Failed to auto-save. Please try again.");
        } finally {
            setSaving(false);
        }
    }, 1000);

    const updateSettings = (updates: Partial<MarketplaceSettingsData>) => {
        setSettings((prev) => ({ ...prev, ...updates }));
        pendingChangesRef.current = {
            ...pendingChangesRef.current,
            ...updates,
        };
        debouncedSave();
    };

    const toggleIndustry = (industry: string) => {
        const newIndustries = settings.industries.includes(industry)
            ? settings.industries.filter((i) => i !== industry)
            : [...settings.industries, industry];
        updateSettings({ industries: newIndustries });
    };

    const toggleSpecialty = (specialty: string) => {
        const newSpecialties = settings.specialties.includes(specialty)
            ? settings.specialties.filter((s) => s !== specialty)
            : [...settings.specialties, specialty];
        updateSettings({ specialties: newSpecialties });
    };

    const updateBioRich = (bio_rich: string) => {
        updateSettings({
            marketplace_profile: {
                ...settings.marketplace_profile,
                bio_rich,
            },
        });
    };

    const completeness = useMemo(
        () => calculateProfileCompleteness(settings),
        [settings],
    );
    const tierBadge = getCompletionTierBadge(completeness.tier);
    const topPriorities = getTopPriorityFields(completeness.missingFields, 3);
    const incentives = getCompletionIncentives(completeness.tier);

    return (
        <MarketplaceContext.Provider
            value={{
                settings,
                recruiterId,
                updateSettings,
                toggleIndustry,
                toggleSpecialty,
                updateBioRich,
                completeness,
                tierBadge,
                topPriorities,
                incentives,
                loading,
                saving,
                lastSaved,
                error,
            }}
        >
            {children}
        </MarketplaceContext.Provider>
    );
}
