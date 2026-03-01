"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface MessagesHeaderProps {
    conversationCount: number;
    unreadCount: number;
}

export function MessagesHeader({
    conversationCount,
    unreadCount,
}: MessagesHeaderProps) {
    const headerRef = useRef<HTMLElement>(null);

    useGSAP(
        () => {
            if (!headerRef.current) return;
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                headerRef.current
                    .querySelectorAll(".opacity-0")
                    .forEach((el) => {
                        (el as HTMLElement).style.opacity = "1";
                    });
                return;
            }

            const $ = (s: string) => headerRef.current!.querySelectorAll(s);
            const $1 = (s: string) => headerRef.current!.querySelector(s);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                $1(".msg-kicker"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" },
            )
                .fromTo(
                    $(".msg-title-word"),
                    { opacity: 0, y: 60, rotateX: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        rotateX: 0,
                        duration: 0.8,
                        stagger: 0.1,
                        clearProps: "transform",
                    },
                    "-=0.3",
                )
                .fromTo(
                    $1(".msg-stat-bar"),
                    { opacity: 0, y: 20 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.5,
                        clearProps: "transform",
                    },
                    "-=0.4",
                );
        },
        { scope: headerRef },
    );

    return (
        <section
            ref={headerRef}
            className="relative bg-neutral text-neutral-content py-16 lg:py-20"
        >
            <div
                className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                style={{
                    clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                }}
            />
            <div className="relative container mx-auto px-6 lg:px-12">
                <div className="max-w-4xl">
                    <p className="msg-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                        Communications Hub
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="msg-title-word inline-block opacity-0">
                            Your
                        </span>{" "}
                        <span className="msg-title-word inline-block opacity-0 text-primary">
                            messages.
                        </span>
                    </h1>

                    <div className="msg-stat-bar flex flex-wrap gap-8 mt-8 opacity-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-envelope text-primary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {conversationCount}
                                </div>
                                <div className="text-xs uppercase tracking-wider opacity-60">
                                    Conversations
                                </div>
                            </div>
                        </div>
                        {unreadCount > 0 && (
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-accent flex items-center justify-center">
                                    <i className="fa-duotone fa-regular fa-bell text-accent-content" />
                                </div>
                                <div>
                                    <div className="text-2xl font-black">
                                        {unreadCount}
                                    </div>
                                    <div className="text-xs uppercase tracking-wider opacity-60">
                                        Unread
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}
