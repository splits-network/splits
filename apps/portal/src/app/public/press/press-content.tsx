"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
    duration,
    easing,
    stagger,
} from "@/components/landing/shared/animation-utils";
import type { PressArticleMeta } from "@/lib/press";

gsap.registerPlugin(ScrollTrigger);

function formatArticleDate(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });
}

interface PressContentProps {
    articles: PressArticleMeta[];
}

export function PressContent({ articles }: PressContentProps) {
    const heroRef = useRef<HTMLDivElement>(null);
    const newsRef = useRef<HTMLDivElement>(null);

    // Hero animation - no scroll trigger (visible on load)
    useGSAP(
        () => {
            if (!heroRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const content = heroRef.current.querySelector(".hero-content");
            if (content) {
                gsap.fromTo(
                    content,
                    { opacity: 0, y: 40 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: duration.hero,
                        ease: easing.smooth,
                    },
                );
            }
        },
        { scope: heroRef },
    );

    // News animation
    useGSAP(
        () => {
            if (!newsRef.current) return;
            const prefersReducedMotion = window.matchMedia(
                "(prefers-reduced-motion: reduce)",
            ).matches;
            if (prefersReducedMotion) return;

            const cards = newsRef.current.querySelectorAll(".news-card");

            if (cards.length > 0) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, x: -30 },
                    {
                        opacity: 1,
                        x: 0,
                        duration: duration.normal,
                        ease: easing.smooth,
                        stagger: stagger.normal,
                        scrollTrigger: {
                            trigger: newsRef.current,
                            start: "top 80%",
                        },
                    },
                );
            }
        },
        { scope: newsRef },
    );

    return (
        <>
            {/* Hero Section */}
            <section
                ref={heroRef}
                className="hero bg-info text-info-content py-20 overflow-hidden"
            >
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <h1 className="text-5xl font-bold mb-6">
                            Press & Updates
                        </h1>
                        <p className="text-xl opacity-90 max-w-3xl mx-auto">
                            The latest features, improvements, and platform
                            news from Splits Network
                        </p>
                        <Link
                            href="/public/brand"
                            className="btn btn-ghost btn-sm mt-6 border-info-content/30"
                        >
                            <i className="fa-duotone fa-regular fa-palette"></i>
                            Looking for brand assets?
                        </Link>
                    </div>
                </div>
            </section>

            {/* Articles */}
            <section
                ref={newsRef}
                className="py-20 bg-base-100 overflow-hidden"
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-5xl mx-auto">
                        <div className="space-y-6">
                            {articles.map((article) => (
                                <Link
                                    key={article.slug}
                                    href={`/public/press/${article.slug}`}
                                    className="news-card card bg-base-200 shadow hover:shadow-lg transition-shadow block"
                                >
                                    <div className="card-body">
                                        <div className="flex items-start gap-4">
                                            <div className="badge badge-primary whitespace-nowrap">
                                                {formatArticleDate(
                                                    article.date,
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <h3 className="font-bold text-lg mb-2">
                                                    {article.title}
                                                </h3>
                                                <p className="text-sm text-base-content/70">
                                                    {article.summary}
                                                </p>
                                                {article.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-3">
                                                        {article.tags.map(
                                                            (tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="badge badge-outline badge-sm"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ),
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            <i className="fa-duotone fa-regular fa-arrow-right text-primary mt-1" />
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
