"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
    AuthCard,
    GeometricDecoration,
    HeaderLogo,
} from "@splits-network/memphis-ui";
import { AuthHeroPanel } from "./auth-hero-panel";

interface AuthShellProps {
    children: React.ReactNode;
}

/**
 * AuthShell - Shared split-panel wrapper for all auth pages.
 *
 * Left: AuthHeroPanel (desktop only)
 * Right: AuthCard with mobile logo + mobile geometric decorations
 * Handles GSAP entrance animations for the card and mobile shapes.
 */
export function AuthShell({ children }: AuthShellProps) {
    const formRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (
            !cardRef.current ||
            window.matchMedia("(prefers-reduced-motion: reduce)").matches
        )
            return;
        gsap.fromTo(
            cardRef.current,
            { opacity: 0, y: 30, scale: 0.97 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.5,
                ease: "back.out(1.5)",
                delay: 0.15,
            },
        );

        const shapes = formRef.current?.querySelectorAll(
            ".memphis-shape-mobile",
        );
        if (shapes?.length) {
            gsap.fromTo(
                shapes,
                { opacity: 0, scale: 0 },
                {
                    opacity: 0.08,
                    scale: 1,
                    duration: 0.4,
                    stagger: 0.06,
                    delay: 0.3,
                },
            );
        }
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100svh-var(--header-h))]">
            <AuthHeroPanel />

            <div
                ref={formRef}
                className="relative flex items-center justify-center bg-dark lg:bg-cream px-4 py-12 overflow-hidden"
            >
                {/* Mobile-only background shapes */}
                <div className="absolute inset-0 pointer-events-none lg:hidden">
                    <GeometricDecoration
                        shape="circle"
                        color="coral"
                        size={70}
                        className="memphis-shape-mobile absolute top-[5%] left-[3%]"
                    />
                    <GeometricDecoration
                        shape="square"
                        color="teal"
                        size={45}
                        className="memphis-shape-mobile absolute bottom-[8%] right-[5%] rotate-45"
                    />
                    <GeometricDecoration
                        shape="triangle"
                        color="purple"
                        size={40}
                        className="memphis-shape-mobile absolute top-[60%] left-[8%]"
                    />
                    <GeometricDecoration
                        shape="zigzag"
                        color="yellow"
                        size={70}
                        className="memphis-shape-mobile absolute top-[15%] right-[10%]"
                    />
                </div>

                <div ref={cardRef} className="relative z-10 w-full max-w-md">
                    <AuthCard
                        logo={
                            <Link href="/" className="flex justify-center mb-2">
                                <HeaderLogo
                                    brand="splits"
                                    //size="sm"
                                    variant="dark"
                                />
                            </Link>
                        }
                    >
                        {children}
                    </AuthCard>
                </div>
            </div>
        </div>
    );
}
