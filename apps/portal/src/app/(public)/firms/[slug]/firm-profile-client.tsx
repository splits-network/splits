"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { apiClient, createAuthenticatedClient } from "@/lib/api-client";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import { useGamification } from "@splits-network/shared-gamification";
import { BaselTabBar } from "@splits-network/basel-ui";
import type { PublicFirm, EnrichedPublicFirmProfile, FirmRecentPlacement } from "../types";
import HeroSection from "./hero-section";
import ContentTabs from "./content-tabs";
import Sidebar from "./sidebar";

if (typeof window !== "undefined") {
    const { ScrollTrigger } = require("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);
}

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
            toast.error("Unable to contact this firm right now.");
            return;
        }
        try {
            const conversationId = await startChatConversation(getToken, contactUserId);
            setConnected(true);
            toast.success("Chat started! Send a message to request partnership.");
            window.location.href = `/portal/messages?conversation=${conversationId}`;
        } catch {
            toast.error("Failed to start conversation. Please try again.");
        }
    }

    useGSAP(
        () => {
            if (!pageRef.current) return;

            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                gsap.set(
                    pageRef.current.querySelectorAll("[class*='opacity-0']"),
                    { opacity: 1 },
                );
                return;
            }

            const $1 = (sel: string) => pageRef.current!.querySelector(sel);
            const $ = (sel: string) => pageRef.current!.querySelectorAll(sel);

            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            const avatar = $1(".firm-avatar");
            if (avatar) {
                tl.fromTo(
                    avatar,
                    { opacity: 0, scale: 0.9 },
                    { opacity: 1, scale: 1, duration: 0.5, clearProps: "transform" },
                );
            }

            const name = $1(".firm-name");
            if (name) {
                tl.fromTo(
                    name,
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6, clearProps: "transform" },
                    "-=0.3",
                );
            }

            const meta = $(".firm-meta");
            if (meta.length) {
                tl.fromTo(
                    meta,
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, clearProps: "transform" },
                    "-=0.2",
                );
            }

            const statBlocks = $(".stat-block");
            if (statBlocks.length) {
                tl.fromTo(
                    statBlocks,
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, clearProps: "transform" },
                    "-=0.2",
                );
            }

            const actions = $(".firm-action");
            if (actions.length) {
                tl.fromTo(
                    actions,
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, clearProps: "transform" },
                    "-=0.2",
                );
            }

            const sections = $(".profile-section");
            sections.forEach((el) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        clearProps: "transform",
                        scrollTrigger: { trigger: el, start: "top 85%" },
                    },
                );
            });

            const cards = $(".sidebar-card");
            cards.forEach((el, i) => {
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        delay: i * 0.1,
                        clearProps: "transform",
                        scrollTrigger: { trigger: el, start: "top 90%" },
                    },
                );
            });
        },
        { scope: pageRef, dependencies: [activeTab], revertOnUpdate: true },
    );

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
