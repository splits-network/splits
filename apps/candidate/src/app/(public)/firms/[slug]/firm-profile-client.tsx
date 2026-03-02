"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import type { PublicFirm } from "../types";
import HeroSection from "./hero-section";
import ContentTabs from "./content-tabs";
import Sidebar from "./sidebar";

if (typeof window !== "undefined") {
    const { ScrollTrigger } = require("gsap/ScrollTrigger");
    gsap.registerPlugin(ScrollTrigger);
}

type TabKey = "about" | "specialties" | "team" | "partnership";

interface FirmProfileClientProps {
    firm: PublicFirm;
}

export default function FirmProfileClient({ firm }: FirmProfileClientProps) {
    const [activeTab, setActiveTab] = useState<TabKey>("about");
    const pageRef = useRef<HTMLDivElement>(null);

    const tabs: { key: TabKey; label: string; icon: string }[] = [
        { key: "about", label: "About", icon: "fa-duotone fa-regular fa-building" },
        { key: "specialties", label: "Specialties", icon: "fa-duotone fa-regular fa-bullseye" },
        ...(firm.show_member_count
            ? [{ key: "team" as TabKey, label: "Team", icon: "fa-duotone fa-regular fa-users" }]
            : []),
        { key: "partnership", label: "Partnership", icon: "fa-duotone fa-regular fa-handshake" },
    ];

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
            <div className="h-1 bg-primary" />
            <HeroSection firm={firm} />

            {/* Tab Bar */}
            <div className="border-b border-base-300 px-6 pt-4">
                <div className="container mx-auto">
                    <div className="bg-base-200 p-1 w-fit flex" style={{ borderRadius: 0 }}>
                        {tabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`px-4 py-2 text-sm font-bold flex items-center gap-2 transition-colors ${
                                    activeTab === tab.key
                                        ? "bg-primary text-primary-content"
                                        : "text-base-content/50 hover:text-base-content/70"
                                }`}
                                style={{ borderRadius: 0 }}
                            >
                                <i className={tab.icon} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="container mx-auto px-6 lg:px-12 py-10">
                <div className="lg:grid lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <ContentTabs firm={firm} activeTab={activeTab} />
                    </div>
                    <div className="lg:col-span-2 space-y-6 mt-8 lg:mt-0">
                        <Sidebar firm={firm} />
                    </div>
                </div>
            </div>
        </div>
    );
}
