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

interface ArticleLayoutProps {
    article: PressArticleMeta;
    prevArticle: PressArticleMeta | null;
    nextArticle: PressArticleMeta | null;
    children: React.ReactNode;
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

export function ArticleLayout({
    article,
    prevArticle,
    nextArticle,
    children,
}: ArticleLayoutProps) {
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
                $1(".article-kicker"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
            )
                .fromTo(
                    $(".article-title-word"),
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
                    $(".article-meta"),
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 },
                    "-=0.3",
                )
                .fromTo(
                    $(".article-tag"),
                    { opacity: 0, y: 10 },
                    { opacity: 1, y: 0, duration: 0.3, stagger: 0.04 },
                    "-=0.2",
                );

            /* ── Content + Sidebar scroll animation ─────────── */
            $(".article-section").forEach((section) => {
                gsap.fromTo(
                    section,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: "power3.out",
                        scrollTrigger: { trigger: section, start: "top 85%" },
                    },
                );
            });
        },
        { scope: mainRef },
    );

    /* Split title into words for staggered animation */
    const titleWords = article.title.split(" ");

    return (
        <div ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Hero ────────────────────────────────────────── */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-4xl">
                        {/* Breadcrumb */}
                        <div className="article-kicker flex items-center gap-2 text-sm text-neutral-content/40 mb-6 opacity-0">
                            <Link
                                href="/press"
                                className="hover:text-neutral-content transition-colors"
                            >
                                Press
                            </Link>
                            <i className="fa-solid fa-chevron-right text-[8px]" />
                            <span className="text-neutral-content/70 truncate max-w-xs">
                                {article.title}
                            </span>
                        </div>

                        {/* Title + Initials badge */}
                        <div className="flex items-start gap-5 mb-6">
                            <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center font-black text-lg flex-shrink-0">
                                SN
                            </div>
                            <div>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.95] tracking-tight">
                                    {titleWords.map((word, i) => (
                                        <span
                                            key={i}
                                            className="article-title-word inline-block opacity-0 mr-3"
                                        >
                                            {word}
                                        </span>
                                    ))}
                                </h1>
                            </div>
                        </div>

                        {/* Meta */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            {[
                                {
                                    icon: "fa-duotone fa-regular fa-calendar",
                                    text: formatDate(article.date),
                                },
                                {
                                    icon: "fa-duotone fa-regular fa-user",
                                    text: article.author,
                                },
                                ...(article.version
                                    ? [
                                          {
                                              icon: "fa-duotone fa-regular fa-code-branch",
                                              text: `v${article.version}`,
                                          },
                                      ]
                                    : []),
                            ].map((tag) => (
                                <span
                                    key={tag.text}
                                    className="article-meta opacity-0 flex items-center gap-1.5 px-3 py-1.5 bg-neutral-content/10 text-sm"
                                >
                                    <i
                                        className={`${tag.icon} text-xs text-secondary`}
                                    />
                                    {tag.text}
                                </span>
                            ))}
                        </div>

                        {/* Tags */}
                        {article.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {article.tags.map((tag) => (
                                    <span
                                        key={tag}
                                        className="article-tag opacity-0 px-3 py-1 bg-neutral-content/10 text-xs font-semibold text-neutral-content/60 uppercase tracking-wider"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Content Area ─────────────────────────────── */}
            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
                    {/* Main Content */}
                    <div className="lg:col-span-3 article-section opacity-0">
                        <div className="prose-portal">{children}</div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-2">
                        {/* Article Info */}
                        <div className="article-section opacity-0 bg-primary text-primary-content p-6 mb-6">
                            <h3 className="text-lg font-black mb-3">
                                Article Info
                            </h3>
                            <div className="text-xs opacity-60 space-y-0">
                                <div className="flex justify-between py-1.5 border-b border-white/10">
                                    <span>Published</span>
                                    <span className="font-bold">
                                        {formatDate(article.date)}
                                    </span>
                                </div>
                                <div className="flex justify-between py-1.5 border-b border-white/10">
                                    <span>Author</span>
                                    <span className="font-bold">
                                        {article.author}
                                    </span>
                                </div>
                                {article.version && (
                                    <div className="flex justify-between py-1.5 border-b border-white/10">
                                        <span>Version</span>
                                        <span className="font-bold">
                                            v{article.version}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between py-1.5">
                                    <span>Tags</span>
                                    <span className="font-bold">
                                        {article.tags.length > 0
                                            ? article.tags.join(", ")
                                            : "—"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="article-section opacity-0 bg-base-200 border-t-4 border-secondary p-6 mb-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                                Navigation
                            </h3>
                            <Link
                                href="/press"
                                className="flex items-center gap-2 p-3 bg-base-100 border border-base-300 hover:border-primary/50 transition-colors mb-3"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left text-primary text-sm" />
                                <span className="text-sm font-bold">
                                    Back to Press
                                </span>
                            </Link>

                            {nextArticle && (
                                <Link
                                    href={`/press/${nextArticle.slug}`}
                                    className="block p-3 bg-base-100 border border-base-300 hover:border-primary/50 transition-colors mb-3"
                                >
                                    <div className="text-[10px] text-base-content/40 uppercase tracking-wider mb-1">
                                        Newer
                                    </div>
                                    <div className="font-bold text-sm truncate">
                                        {nextArticle.title}
                                    </div>
                                    <div className="text-xs text-base-content/50 mt-0.5">
                                        {formatDate(nextArticle.date)}
                                    </div>
                                </Link>
                            )}

                            {prevArticle && (
                                <Link
                                    href={`/press/${prevArticle.slug}`}
                                    className="block p-3 bg-base-100 border border-base-300 hover:border-primary/50 transition-colors"
                                >
                                    <div className="text-[10px] text-base-content/40 uppercase tracking-wider mb-1">
                                        Older
                                    </div>
                                    <div className="font-bold text-sm truncate">
                                        {prevArticle.title}
                                    </div>
                                    <div className="text-xs text-base-content/50 mt-0.5">
                                        {formatDate(prevArticle.date)}
                                    </div>
                                </Link>
                            )}
                        </div>

                        {/* Share */}
                        <div className="article-section opacity-0 bg-base-200 p-6 sticky top-24">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                                Share
                            </h3>
                            <div className="flex gap-2">
                                <button className="btn btn-sm btn-ghost border-base-300 flex-1">
                                    <i className="fa-brands fa-x-twitter" />
                                </button>
                                <button className="btn btn-sm btn-ghost border-base-300 flex-1">
                                    <i className="fa-brands fa-linkedin" />
                                </button>
                                <button className="btn btn-sm btn-ghost border-base-300 flex-1">
                                    <i className="fa-duotone fa-regular fa-link" />
                                </button>
                                <button className="btn btn-sm btn-ghost border-base-300 flex-1">
                                    <i className="fa-duotone fa-regular fa-print" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
