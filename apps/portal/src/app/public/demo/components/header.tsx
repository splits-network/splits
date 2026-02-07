"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { ViewToggle } from "@/components/ui/view-toggle";

const landingNavLinks = [
    { label: "For Recruiters", href: "/public/for-recruiters" },
    { label: "For Companies", href: "/public/for-companies" },
    { label: "How It Works", href: "/public/how-it-works" },
    { label: "Pricing", href: "/public/pricing" },
];

export function Header() {
    const pathname = usePathname();
    const { isSignedIn } = useAuth();
    const [isDark, setIsDark] = useState(false);
    const [viewMode, setViewMode] = useState<"browse" | "table" | "grid">(
        "browse",
    );

    const isPortalPage = pathname?.startsWith("/portal");

    useEffect(() => {
        try {
            const saved = localStorage.getItem("theme") || "splits-light";
            setIsDark(saved === "splits-dark");
        } catch {}
    }, []);

    const handleThemeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.currentTarget.checked;
        const theme = checked ? "splits-dark" : "splits-light";
        document.documentElement.setAttribute("data-theme", theme);
        setIsDark(checked);
        try {
            localStorage.setItem("theme", theme);
        } catch {}
    };

    const handleSmoothScroll = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string,
    ) => {
        if (href.startsWith("#")) {
            e.preventDefault();
            const element = document.querySelector(href);
            if (element) {
                element.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    };

    // Don't show header on auth pages
    const isAuthPage =
        pathname?.startsWith("/sign-in") ||
        pathname?.startsWith("/sign-up") ||
        pathname?.startsWith("/sso-callback");
    if (isAuthPage) return null;

    return (
        <header className="navbar bg-base-100/95 backdrop-blur-sm border-b border-base-200 sticky top-0 z-50">
            <div className="container mx-auto px-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Left: Logo */}
                    <div className="flex-shrink-0">
                        <Link href="/">
                            <img
                                src="/logo.svg"
                                alt="Splits Network"
                                className="h-10"
                            />
                        </Link>
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="badge badge-primary badge-outline">
                                Demo Mode
                            </div>
                            <ViewToggle
                                viewMode={viewMode}
                                onViewChange={setViewMode}
                            />
                        </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme toggle */}
                        <label
                            className="swap swap-rotate cursor-pointer btn btn-ghost btn-sm btn-circle"
                            title="Toggle Theme"
                        >
                            <input
                                type="checkbox"
                                checked={isDark}
                                onChange={handleThemeChange}
                                className="theme-controller"
                            />
                            <i className="fa-duotone fa-regular fa-sun-bright swap-off text-lg"></i>
                            <i className="fa-duotone fa-regular fa-moon swap-on text-lg"></i>
                        </label>
                        <Link href="/sign-in" className="btn btn-ghost btn-sm">
                            Sign In
                        </Link>
                        <Link
                            href="/sign-up"
                            className="btn btn-primary btn-sm"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
