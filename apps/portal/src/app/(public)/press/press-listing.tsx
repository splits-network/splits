"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type { PressArticleMeta } from "@/lib/press";

if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

interface PressListingProps {
    articles: PressArticleMeta[];
}

export function PressListing({ articles }: PressListingProps) {
    const mainRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!mainRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                mainRef.current
                    .querySelectorAll(".opacity-0")
                    .forEach((el) => {
                        (el as HTMLElement).style.opacity = "1";
                    });
                return;
            }

            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);

            /* ── Hero timeline ─────────────────────────────── */
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                $1(".press-kicker"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
            )
                .fromTo(
                    $(".press-title-word"),
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".press-subtitle"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.3",
                )
                .fromTo(
                    $(".press-meta"),
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 },
                    "-=0.2",
                )
                .fromTo(
                    $1(".press-cta"),
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.3 },
                    "-=0.2",
                );

            /* ── Article cards scroll animation ────────────── */
            $(".press-card").forEach((card) => {
                gsap.fromTo(
                    card,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power3.out",
                        scrollTrigger: { trigger: card, start: "top 85%" },
                    },
                );
            });
        },
        { scope: mainRef },
    );

    const titleWords = ["Press", "&", "Updates"];

    return (
        <div ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Hero ────────────────────────────────────────── */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-24">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl">
                        {/* Breadcrumb */}
                        <div className="press-kicker flex items-center gap-2 text-sm text-neutral-content/40 mb-6 opacity-0">
                            <Link
                                href="/"
                                className="hover:text-neutral-content transition-colors"
                            >
                                Home
                            </Link>
                            <i className="fa-solid fa-chevron-right text-[8px]" />
                            <span className="text-neutral-content/70">
                                Press & Updates
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-6">
                            {titleWords.map((word, i) => (
                                <span
                                    key={i}
                                    className="press-title-word inline-block opacity-0 mr-4"
                                >
                                    {word}
                                </span>
                            ))}
                        </h1>

                        <p className="press-subtitle text-lg text-neutral-content/60 max-w-2xl mb-8 opacity-0">
                            Platform news, feature releases, and engineering
                            updates from the Splits Network team.
                        </p>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-3 mb-8">
                            {[
                                {
                                    icon: "fa-duotone fa-regular fa-newspaper",
                                    text: `${articles.length} articles`,
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-calendar",
                                    text:
                                        articles.length > 0
                                            ? `Latest: ${formatDate(articles[0].date)}`
                                            : "No articles yet",
                                },
                            ].map((tag) => (
                                <span
                                    key={tag.text}
                                    className="press-meta opacity-0 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-content/10 text-sm"
                                >
                                    <i
                                        className={`${tag.icon} text-xs text-secondary`}
                                    />
                                    {tag.text}
                                </span>
                            ))}
                        </div>

                        <Link
                            href="/brand"
                            className="press-cta opacity-0 btn btn-ghost border-neutral-content/20"
                        >
                            <i className="fa-duotone fa-regular fa-palette" />
                            Brand Assets
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Article List ─────────────────────────────── */}
            <section className="container mx-auto px-6 lg:px-12 py-12 lg:py-16">
                <div className="max-w-4xl">
                    <div className="space-y-4">
                        {articles.map((article) => (
                            <Link
                                key={article.slug}
                                href={`/press/${article.slug}`}
                                className="press-card opacity-0 block border-l-4 border-primary bg-base-200 p-6 hover:bg-base-300 transition-colors group"
                            >
                                <div className="flex items-center gap-2 text-xs text-base-content/40 mb-2">
                                    <i className="fa-duotone fa-regular fa-calendar text-primary" />
                                    <time dateTime={article.date}>
                                        {formatDate(article.date)}
                                    </time>
                                    {article.version && (
                                        <>
                                            <span className="text-base-content/20">
                                                |
                                            </span>
                                            <span className="font-semibold text-primary">
                                                v{article.version}
                                            </span>
                                        </>
                                    )}
                                </div>
                                <h2 className="text-lg font-black tracking-tight mb-2 group-hover:text-primary transition-colors">
                                    {article.title}
                                </h2>
                                <p className="text-sm text-base-content/60 leading-relaxed mb-3">
                                    {article.summary}
                                </p>
                                {article.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {article.tags.map((tag) => (
                                            <span
                                                key={tag}
                                                className="px-2 py-0.5 bg-base-300 text-[10px] font-semibold text-base-content/50 uppercase tracking-wider"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
