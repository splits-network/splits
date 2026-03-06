"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
    gsap.registerPlugin();
}

export function ProfileHeader() {
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
            const tl = gsap.timeline({ defaults: { ease: "power3.out", clearProps: "transform" } });

            tl.fromTo(
                $1(".profile-kicker"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" },
            )
                .fromTo(
                    $(".profile-title-word"),
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
                    $1(".profile-desc"),
                    { opacity: 0, y: 15 },
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
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{
                    clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                }}
            />
            <div className="relative container mx-auto px-6 lg:px-12">
                <div className="max-w-3xl">
                    <p className="profile-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                        Account
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                        <span className="profile-title-word inline-block opacity-0">
                            Your
                        </span>{" "}
                        <span className="profile-title-word inline-block opacity-0 text-primary">
                            profile.
                        </span>
                    </h1>
                    <p className="profile-desc text-base text-neutral-content/50 max-w-xl opacity-0">
                        Manage your profile, career preferences, privacy, and
                        connected services all in one place.
                    </p>
                </div>
            </div>
        </section>
    );
}
