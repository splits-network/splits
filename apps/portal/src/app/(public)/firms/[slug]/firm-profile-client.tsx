"use client";

import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { apiClient } from "@/lib/api-client";
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
    const pageRef = useRef<HTMLDivElement>(null);

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
                }
            })
            .catch(() => {
                // Enriched data is optional; silently fail
            });
        return () => {
            cancelled = true;
        };
    }, [firm.slug]);

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
        { scope: pageRef },
    );

    return (
        <div ref={pageRef} className="min-h-screen bg-base-100">
            <HeroSection firm={firm} />

            {/* Tab Nav */}
            <nav className="bg-base-100 border-b border-base-300">
                <div className="max-w-6xl mx-auto px-8">
                    <div className="flex gap-0">
                        {TABS.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`flex items-center gap-2 px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] border-b-2 transition-colors ${
                                    activeTab === tab.key
                                        ? "border-primary text-primary"
                                        : "border-transparent text-base-content/40 hover:text-base-content/60 hover:border-base-300"
                                }`}
                            >
                                <i className={`${tab.icon} text-sm`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </nav>

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
