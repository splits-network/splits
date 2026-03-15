"use client";

import Link from "next/link";
import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";
import type { PressArticleMeta } from "@/lib/press";

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

    useScrollReveal(mainRef);

    const titleWords = ["Press", "&", "Updates"];

    return (
        <div ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Hero ────────────────────────────────────────── */}
            <section className="relative bg-base-300 text-base-content py-16 lg:py-24">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative  container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl">
                        {/* Breadcrumb */}
                        <div className="scroll-reveal fade-up flex items-center gap-2 text-sm text-base-content/40 mb-6">
                            <Link
                                href="/"
                                className="hover:text-base-content transition-colors"
                            >
                                Home
                            </Link>
                            <i className="fa-solid fa-chevron-right text-[8px]" />
                            <span className="text-base-content/70">
                                Press & Updates
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.95] tracking-tight mb-6">
                            {titleWords.map((word, i) => (
                                <span
                                    key={i}
                                    className="scroll-reveal fade-up inline-block mr-4"
                                >
                                    {word}
                                </span>
                            ))}
                        </h1>

                        <p className="scroll-reveal fade-up text-lg text-base-content/60 max-w-2xl mb-8">
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
                                    className="scroll-reveal fade-up flex items-center gap-1.5 px-3 py-1.5 bg-neutral-content/10 text-sm"
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
                            className="scroll-reveal fade-up btn btn-ghost border-neutral-content/20"
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
                                className="scroll-reveal fade-up block border-l-4 border-primary bg-base-200 p-6 hover:bg-base-300 transition-colors group"
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
                                                className="px-2 py-0.5 bg-base-300 text-sm font-semibold text-base-content/50 uppercase tracking-wider"
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
