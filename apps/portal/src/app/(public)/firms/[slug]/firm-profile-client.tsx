"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useScrollReveal } from "@splits-network/basel-ui";
import { apiClient, createAuthenticatedClient } from "@/lib/api-client";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import { useGamification } from "@splits-network/shared-gamification";
import { BaselTabBar } from "@splits-network/basel-ui";
import type { PublicFirm, EnrichedPublicFirmProfile, FirmRecentPlacement } from "../types";
import HeroSection from "./hero-section";
import ContentTabs from "./content-tabs";
import Sidebar from "./sidebar";

type TabKey = "about" | "specialties" | "team" | "reviews";

const TABS: { key: TabKey; label: string; icon: string }[] = [
    { key: "about", label: "About", icon: "fa-duotone fa-regular fa-building" },
    { key: "specialties", label: "Specialties", icon: "fa-duotone fa-regular fa-bullseye" },
    { key: "team", label: "Team", icon: "fa-duotone fa-regular fa-users" },
    { key: "reviews", label: "Reviews", icon: "fa-duotone fa-regular fa-star" },
];

interface FirmProfileClientProps {
    firm: PublicFirm;
}

export default function FirmProfileClient({ firm }: FirmProfileClientProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("about");
    const [recentPlacements, setRecentPlacements] = useState<FirmRecentPlacement[]>([]);
    const [contactUserId, setContactUserId] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);
    const pageRef = useRef<HTMLDivElement>(null);
    const { isSignedIn, getToken } = useAuth();
    const pathname = usePathname();
    const toast = useToast();
    const { registerEntities } = useGamification();

    useEffect(() => {
        registerEntities("firm", [firm.id]);
    }, [firm.id, registerEntities]);

    // Fetch enriched profile data
    useEffect(() => {
        let cancelled = false;
        apiClient
            .get<{ data: EnrichedPublicFirmProfile }>(
                `/public/firms/${firm.slug}/profile`,
            )
            .then((res) => {
                if (!cancelled && res.data) {
                    setRecentPlacements(res.data.recent_placements || []);
                    if (res.data.contact_user_id) {
                        setContactUserId(res.data.contact_user_id);
                    }
                }
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, [firm.slug]);

    // Check if already connected
    useEffect(() => {
        if (!isSignedIn || !contactUserId) return;
        let cancelled = false;
        (async () => {
            try {
                const token = await getToken();
                if (!token || cancelled) return;
                const client = createAuthenticatedClient(token);
                const res: any = await client.get("/chat/conversations", { params: { limit: 100 } });
                const conversations = res?.data || [];
                const isConnected = conversations.some(
                    (c: any) => c.participant_a_id === contactUserId || c.participant_b_id === contactUserId,
                );
                if (!cancelled) setConnected(isConnected);
            } catch {}
        })();
        return () => { cancelled = true; };
    }, [isSignedIn, contactUserId]); // eslint-disable-line react-hooks/exhaustive-deps

    async function handleRequestPartnership() {
        if (!isSignedIn) {
            window.location.href = `/sign-in?redirect_url=${encodeURIComponent(pathname)}`;
            return;
        }
        if (!contactUserId) {
            toast.error("Couldn't reach this firm. Try again.");
            return;
        }
        try {
            const conversationId = await startChatConversation(getToken, contactUserId);
            setConnected(true);
            toast.success("Chat started. Send a message to begin.");
            window.location.href = `/portal/messages?conversation=${conversationId}`;
        } catch {
            toast.error("Failed to start conversation. Please try again.");
        }
    }

    useScrollReveal(pageRef);

    return (
        <div ref={pageRef} className="min-h-screen bg-base-100">
            <HeroSection
                firm={firm}
                connected={connected}
                onRequestPartnership={handleRequestPartnership}
            />

            {/* Tab Nav */}
            <BaselTabBar
                tabs={TABS.map(t => ({ label: t.label, value: t.key, icon: t.icon }))}
                active={activeTab}
                onChange={(v) => setActiveTab(v as TabKey)}
                className="bg-base-100 border-b border-base-300 max-w-6xl mx-auto px-8"
            />

            {/* Content */}
            <div className="max-w-6xl mx-auto px-8 py-12">
                <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
                    <div className="lg:col-span-3">
                        <ContentTabs
                            firm={firm}
                            activeTab={activeTab}
                            recentPlacements={recentPlacements}
                        />
                    </div>
                    <div className="lg:col-span-2">
                        <Sidebar firm={firm} />
                    </div>
                </div>
            </div>
        </div>
    );
}
