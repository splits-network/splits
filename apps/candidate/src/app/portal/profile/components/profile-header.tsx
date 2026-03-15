"use client";

import { useRef } from "react";
import { useScrollReveal } from "@splits-network/basel-ui";

export function ProfileHeader() {
    const headerRef = useRef<HTMLElement>(null);
    useScrollReveal(headerRef);

    return (
        <section
            ref={headerRef}
            className="relative bg-base-300 text-base-content py-16 lg:py-20"
        >
            <div
                className="absolute top-0 right-0 w-2/5 h-full bg-primary/10"
                style={{
                    clipPath: "polygon(15% 0,100% 0,100% 100%,0% 100%)",
                }}
            />
            <div className="relative container mx-auto px-6 lg:px-12">
                <div className="max-w-3xl">
                    <p className="scroll-reveal fade-up text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4">
                        Account
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                        <span className="scroll-reveal fade-up inline-block">
                            Your
                        </span>{" "}
                        <span className="scroll-reveal fade-up inline-block text-primary">
                            profile.
                        </span>
                    </h1>
                    <p className="scroll-reveal fade-up text-base text-base-content/50 max-w-xl">
                        Manage your profile, career preferences, privacy, and
                        connected services all in one place.
                    </p>
                </div>
            </div>
        </section>
    );
}
