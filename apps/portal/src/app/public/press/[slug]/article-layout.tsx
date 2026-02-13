"use client";

import Link from "next/link";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
    duration,
    easing,
    prefersReducedMotion,
} from "@/components/landing/shared/animation-utils";
import type { PressArticleMeta } from "@/lib/press";

interface ArticleLayoutProps {
    article: PressArticleMeta;
    children: React.ReactNode;
}

export function ArticleLayout({ article, children }: ArticleLayoutProps) {
    const heroRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useGSAP(
        () => {
            if (!heroRef.current || prefersReducedMotion()) return;

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
                    }
                );
            }
        },
        { scope: heroRef }
    );

    useGSAP(
        () => {
            if (!contentRef.current || prefersReducedMotion()) return;

            gsap.fromTo(
                contentRef.current,
                { opacity: 0, y: 30 },
                {
                    opacity: 1,
                    y: 0,
                    duration: duration.normal,
                    ease: easing.smooth,
                    delay: 0.3,
                }
            );
        },
        { scope: contentRef }
    );

    const formattedDate = new Date(article.date + "T00:00:00").toLocaleDateString(
        "en-US",
        {
            year: "numeric",
            month: "long",
            day: "numeric",
        }
    );

    return (
        <>
            {/* Hero */}
            <section
                ref={heroRef}
                className="hero bg-info text-info-content py-20 overflow-hidden"
            >
                <div className="hero-content text-center max-w-5xl">
                    <div>
                        <div className="breadcrumbs text-sm mb-6 opacity-80 flex justify-center">
                            <ul>
                                <li>
                                    <Link href="/public/press">Press</Link>
                                </li>
                                <li className="truncate max-w-xs">
                                    {article.title}
                                </li>
                            </ul>
                        </div>
                        <h1 className="text-5xl font-bold mb-4">
                            {article.title}
                        </h1>
                        <div className="flex items-center justify-center gap-4 text-sm opacity-80">
                            <time dateTime={article.date}>
                                {formattedDate}
                            </time>
                            {article.version && (
                                <span className="badge badge-outline">
                                    v{article.version}
                                </span>
                            )}
                        </div>
                        {article.tags.length > 0 && (
                            <div className="flex justify-center gap-2 mt-4">
                                {article.tags.map((tag) => (
                                    <span key={tag} className="badge badge-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Article Body */}
            <section className="py-16 bg-base-100">
                <div className="container mx-auto px-4">
                    <div
                        ref={contentRef}
                        className="max-w-3xl mx-auto"
                    >
                        {children}
                    </div>
                </div>
            </section>

            {/* Back to Press */}
            <section className="py-12 bg-base-200">
                <div className="container mx-auto px-4 text-center">
                    <Link href="/public/press" className="btn btn-primary">
                        <i className="fa-duotone fa-regular fa-arrow-left" />
                        Back to Press Kit
                    </Link>
                </div>
            </section>
        </>
    );
}
