"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import {
    GeometricDecoration,
    ColorBar,
    HeaderLogo,
} from "@splits-network/memphis-ui";

const VALUE_PROPS = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Split-Fee Marketplace",
        description:
            "Fair, transparent fee splits on every placement. No mystery math.",
    },
    {
        icon: "fa-duotone fa-regular fa-bullseye-arrow",
        title: "Curated Role Matching",
        description:
            "Access roles that match your niche. No cold outreach needed.",
    },
    {
        icon: "fa-duotone fa-regular fa-chart-line-up",
        title: "Real-Time Pipeline",
        description:
            "Track every candidate, submission, and placement in one dashboard.",
    },
    {
        icon: "fa-duotone fa-regular fa-users",
        title: "Network Effect",
        description:
            "Connect with 500+ recruiters. More partners means more placements.",
    },
];

const ROTATING_HEADLINES = [
    "Where recruiters build partnerships",
    "Where placements happen faster",
    "Where split fees are transparent",
    "Where your network grows daily",
];

export function AuthHeroPanel() {
    const panelRef = useRef<HTMLDivElement>(null);
    const headlineRef = useRef<HTMLHeadingElement>(null);
    const propsRef = useRef<HTMLDivElement>(null);
    const statsRef = useRef<HTMLDivElement>(null);
    const headlineIndex = useRef(0);

    useEffect(() => {
        if (
            !panelRef.current ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
            return;

        const ctx = gsap.context(() => {
            // Animate geometric shapes
            const shapes = panelRef.current!.querySelectorAll(".memphis-shape");
            gsap.fromTo(
                shapes,
                { opacity: 0, scale: 0, rotation: -180 },
                {
                    opacity: 0.12,
                    scale: 1,
                    rotation: 0,
                    duration: 0.6,
                    ease: "elastic.out(1, 0.5)",
                    stagger: { each: 0.08, from: "random" },
                    delay: 0.2,
                },
            );
            shapes.forEach((s, i) => {
                gsap.to(s, {
                    y: `+=${8 + (i % 3) * 5}`,
                    rotation: `+=${(i % 2 === 0 ? 1 : -1) * 8}`,
                    duration: 4 + i * 0.4,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });
            });

            // Stagger in the value prop cards
            const cards = propsRef.current?.querySelectorAll(".value-card");
            if (cards?.length) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: 0.5,
                        ease: "power2.out",
                        stagger: 0.12,
                        delay: 0.4,
                    },
                );
            }

            // Stagger in stats
            const statEls = statsRef.current?.querySelectorAll(".stat-item");
            if (statEls?.length) {
                gsap.fromTo(
                    statEls,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        ease: "power2.out",
                        stagger: 0.1,
                        delay: 0.8,
                    },
                );
            }

            // Rotating headline animation
            if (headlineRef.current) {
                const rotateHeadline = () => {
                    headlineIndex.current =
                        (headlineIndex.current + 1) % ROTATING_HEADLINES.length;
                    const tl = gsap.timeline();
                    tl.to(headlineRef.current, {
                        opacity: 0,
                        y: -12,
                        duration: 0.3,
                        ease: "power2.in",
                    });
                    tl.call(() => {
                        if (headlineRef.current) {
                            headlineRef.current.textContent =
                                ROTATING_HEADLINES[headlineIndex.current];
                        }
                    });
                    tl.to(headlineRef.current, {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        ease: "power2.out",
                    });
                };

                // Initial fade in
                gsap.fromTo(
                    headlineRef.current,
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power2.out",
                        delay: 0.3,
                    },
                );

                // Rotate every 3.5 seconds
                const interval = setInterval(rotateHeadline, 3500);
                return () => clearInterval(interval);
            }
        }, panelRef);

        return () => ctx.revert();
    }, []);

    return (
        <div
            ref={panelRef}
            className="hidden lg:flex flex-col relative overflow-hidden bg-dark"
        >
            {/* Color bar at very top */}
            <ColorBar height="h-1" />

            {/* Memphis background shapes */}
            <div className="absolute inset-0 pointer-events-none">
                <GeometricDecoration
                    shape="circle"
                    color="coral"
                    size={100}
                    className="memphis-shape absolute top-[6%] left-[8%]"
                />
                <GeometricDecoration
                    shape="square"
                    color="teal"
                    size={60}
                    className="memphis-shape absolute top-[18%] right-[12%] rotate-12"
                />
                <GeometricDecoration
                    shape="triangle"
                    color="yellow"
                    size={50}
                    className="memphis-shape absolute bottom-[22%] left-[5%]"
                />
                <GeometricDecoration
                    shape="circle"
                    color="purple"
                    size={70}
                    className="memphis-shape absolute bottom-[10%] right-[8%]"
                />
                <GeometricDecoration
                    shape="zigzag"
                    color="coral"
                    size={90}
                    className="memphis-shape absolute top-[50%] left-[60%]"
                />
                <GeometricDecoration
                    shape="cross"
                    color="teal"
                    size={45}
                    className="memphis-shape absolute top-[75%] left-[25%]"
                />
                <GeometricDecoration
                    shape="square"
                    color="yellow"
                    size={35}
                    className="memphis-shape absolute top-[40%] left-[3%] rotate-45"
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-12 xl:px-16 py-12">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <HeaderLogo />
                </div>

                {/* Rotating headline */}
                <div className="mb-8">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-coral mb-3">
                        The Recruiting Marketplace
                    </p>
                    <h1
                        ref={headlineRef}
                        className="text-2xl xl:text-3xl font-black uppercase tracking-wider text-white leading-tight"
                    >
                        {ROTATING_HEADLINES[0]}
                    </h1>
                </div>

                {/* Value props */}
                <div ref={propsRef} className="space-y-4 mb-10">
                    {VALUE_PROPS.map((prop) => (
                        <div
                            key={prop.title}
                            className="value-card flex items-start gap-3 opacity-0"
                        >
                            <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center border-4 border-teal bg-teal/20">
                                <i
                                    className={`${prop.icon} text-sm text-teal`}
                                />
                            </div>
                            <div>
                                <p className="text-sm font-black uppercase tracking-wider text-white">
                                    {prop.title}
                                </p>
                                <p className="text-sm text-white/50 mt-0.5">
                                    {prop.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats row */}
                <div
                    ref={statsRef}
                    className="flex gap-6 pt-6 border-t-4 border-white/10"
                >
                    {[
                        { value: "500+", label: "Recruiters" },
                        { value: "2,400+", label: "Placements" },
                        { value: "98%", label: "Satisfaction" },
                    ].map((stat) => (
                        <div key={stat.label} className="stat-item opacity-0">
                            <p className="text-xl font-black text-coral">
                                {stat.value}
                            </p>
                            <p className="text-sm font-bold uppercase tracking-wider text-white/40">
                                {stat.label}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
