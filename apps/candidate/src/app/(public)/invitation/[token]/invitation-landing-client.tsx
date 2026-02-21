"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ApiClient } from "@/lib/api-client";

/* ─── Types ───────────────────────────────────────────────────────────────── */

interface InvitationData {
    relationship_id: string;
    recruiter_id: string;
    candidate_id: string;
    invited_at: string;
    expires_at: string;
    status: string;
    recruiter_name: string;
    recruiter_email: string;
    recruiter_bio?: string;
}

type PageState =
    | { kind: "loading" }
    | { kind: "ready"; invitation: InvitationData }
    | { kind: "expired"; recruiterName?: string }
    | { kind: "accepted" }
    | { kind: "declined"; recruiterName?: string }
    | { kind: "not_found" }
    | { kind: "error"; message: string };

/* ─── Value Props ─────────────────────────────────────────────────────────── */

const VALUE_PROPS = [
    {
        icon: "fa-duotone fa-regular fa-radar",
        title: "Track Opportunities",
        description:
            "Every role a recruiter submits you for appears in your dashboard. No more wondering where your resume went.",
    },
    {
        icon: "fa-duotone fa-regular fa-objects-column",
        title: "Centralized Applications",
        description:
            "Multiple recruiters, one view. See every active submission, interview, and offer across all your representatives.",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Direct Communication",
        description:
            "Message your recruiters directly through the platform. Every conversation is logged and accessible when you need it.",
    },
    {
        icon: "fa-duotone fa-regular fa-signal-stream",
        title: "Progress Updates",
        description:
            "Real-time status changes on every opportunity. You will know when you advance, when feedback arrives, and when a decision is made.",
    },
];

const AGREEMENT_POINTS = [
    {
        icon: "fa-duotone fa-regular fa-handshake",
        title: "Formalizes Your Relationship",
        description:
            "This agreement confirms that your recruiter is authorized to present your profile to employers on your behalf. Nothing happens without your knowledge.",
    },
    {
        icon: "fa-duotone fa-regular fa-shield-halved",
        title: "Prevents Duplicate Submissions",
        description:
            "When a recruiter formally represents you, employers know exactly who introduced you. This eliminates confusion when multiple agencies are involved.",
    },
    {
        icon: "fa-duotone fa-regular fa-award",
        title: "Protects Credit",
        description:
            "Your recruiter invested time learning your background and matching you to roles. This agreement ensures that work is recognized if you are hired.",
    },
    {
        icon: "fa-duotone fa-regular fa-user-check",
        title: "Safeguards Your Interests",
        description:
            "The agreement defines the scope of representation clearly. Your recruiter can only act within the terms you accept, and you can review those terms before agreeing.",
    },
];

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function InvitationLandingClient({ token }: { token: string }) {
    const mainRef = useRef<HTMLElement>(null);
    const [state, setState] = useState<PageState>({ kind: "loading" });

    useEffect(() => {
        const client = new ApiClient();
        client
            .get<{ data: InvitationData }>(
                `/recruiter-candidates/invitations/${token}`,
            )
            .then((res) => {
                setState({ kind: "ready", invitation: res.data });
            })
            .catch(async (err) => {
                if (err instanceof Response) {
                    const status = err.status;
                    if (status === 404) {
                        setState({ kind: "not_found" });
                    } else if (status === 410) {
                        setState({ kind: "expired" });
                    } else if (status === 409) {
                        try {
                            const data = await err.json();
                            const msg = data.error?.message || "";
                            if (msg.toLowerCase().includes("accepted")) {
                                setState({ kind: "accepted" });
                            } else {
                                setState({ kind: "declined" });
                            }
                        } catch {
                            setState({ kind: "accepted" });
                        }
                    } else {
                        setState({
                            kind: "error",
                            message: "We could not load this invitation.",
                        });
                    }
                } else {
                    setState({
                        kind: "error",
                        message: "We could not load this invitation. Try again, or contact support if the problem continues.",
                    });
                }
            });
    }, [token]);

    /* ── GSAP entrance ── */
    useGSAP(
        () => {
            if (state.kind !== "ready" || !mainRef.current) return;
            if (
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ) {
                mainRef.current
                    .querySelectorAll(".opacity-0")
                    .forEach((el) => ((el as HTMLElement).style.opacity = "1"));
                return;
            }

            const $ = (s: string) => mainRef.current!.querySelectorAll(s);
            const $1 = (s: string) => mainRef.current!.querySelector(s);
            const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

            tl.fromTo(
                $1(".landing-kicker"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
            )
                .fromTo(
                    $(".landing-title-word"),
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
                    $1(".landing-subtitle"),
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.4",
                )
                .fromTo(
                    $(".landing-card"),
                    { opacity: 0, y: 25 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 },
                    "-=0.3",
                )
                .fromTo(
                    $(".landing-sidebar"),
                    { opacity: 0, x: 20 },
                    { opacity: 1, x: 0, duration: 0.5, stagger: 0.1 },
                    "-=0.4",
                );
        },
        { scope: mainRef, dependencies: [state.kind] },
    );

    /* ── Loading ── */
    if (state.kind === "loading") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-base-100">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-base-content/70">
                        Loading invitation...
                    </p>
                </div>
            </main>
        );
    }

    /* ── Error States ── */
    if (state.kind !== "ready") {
        return <ErrorState state={state} token={token} />;
    }

    const { invitation } = state;
    const expiryDate = new Date(invitation.expires_at).toLocaleDateString(
        "en-US",
        { month: "long", day: "numeric", year: "numeric" },
    );
    const initials = invitation.recruiter_name
        ?.split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const signUpUrl = `/sign-up?redirect_url=${encodeURIComponent(`/portal/invitation/${token}`)}`;
    const signInUrl = `/sign-in?redirect_url=${encodeURIComponent(`/portal/invitation/${token}`)}`;

    return (
        <main ref={mainRef} className="min-h-screen bg-base-100">
            {/* ── Hero ── */}
            <section className="relative bg-neutral text-neutral-content py-16 lg:py-20">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="landing-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                            Your Invitation
                        </p>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black leading-[0.92] tracking-tight mb-4">
                            <span className="landing-title-word inline-block opacity-0">
                                {invitation.recruiter_name}
                            </span>{" "}
                            <span className="landing-title-word inline-block opacity-0 text-primary">
                                wants to
                            </span>{" "}
                            <span className="landing-title-word inline-block opacity-0">
                                represent you
                            </span>
                        </h1>
                        <p className="landing-subtitle text-base text-neutral-content/50 max-w-xl opacity-0">
                            You have been invited to join Applicant Network,
                            where recruiters compete to find the right
                            opportunities for you. Review the details below,
                            then create your free account to respond.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Content ── */}
            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">
                    {/* ── Main Panel ── */}
                    <div className="lg:col-span-3 space-y-10">
                        {/* About Your Recruiter */}
                        <div className="landing-card opacity-0">
                            <h2 className="text-2xl font-black tracking-tight mb-1">
                                About Your Recruiter
                            </h2>
                            <p className="text-sm text-base-content/50 mb-6">
                                The professional who invited you to their
                                network
                            </p>

                            <div className="flex items-start gap-5 bg-base-200 p-6">
                                <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg font-black">
                                        {initials}
                                    </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black">
                                        {invitation.recruiter_name}
                                    </h3>
                                    <p className="text-sm text-base-content/60">
                                        {invitation.recruiter_email}
                                    </p>
                                    {invitation.recruiter_bio && (
                                        <p className="mt-3 text-sm text-base-content/70 leading-relaxed">
                                            {invitation.recruiter_bio}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* What is Applicant Network? */}
                        <div className="landing-card opacity-0">
                            <h2 className="text-2xl font-black tracking-tight mb-1">
                                What is Applicant Network?
                            </h2>
                            <p className="text-sm text-base-content/50 mb-6">
                                Applicant Network gives you a single place to
                                manage every recruiter relationship and track
                                every opportunity they bring to you.
                            </p>

                            <div className="space-y-4">
                                {VALUE_PROPS.map((prop) => (
                                    <div
                                        key={prop.title}
                                        className="flex items-start gap-4 border-l-4 border-base-300 pl-4 py-2"
                                    >
                                        <i
                                            className={`${prop.icon} text-primary mt-0.5`}
                                        ></i>
                                        <div>
                                            <p className="text-sm font-bold">
                                                {prop.title}
                                            </p>
                                            <p className="text-sm text-base-content/60 leading-relaxed">
                                                {prop.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* What Does This Agreement Mean? */}
                        <div className="landing-card opacity-0">
                            <h2 className="text-2xl font-black tracking-tight mb-1">
                                What Does This Agreement Mean?
                            </h2>
                            <p className="text-sm text-base-content/50 mb-6">
                                A Right to Represent agreement is standard in
                                professional recruiting. It establishes a clear,
                                transparent relationship between you and your
                                recruiter.
                            </p>

                            <div className="space-y-4">
                                {AGREEMENT_POINTS.map((point) => (
                                    <div
                                        key={point.title}
                                        className="flex items-start gap-4 bg-base-200 p-4"
                                    >
                                        <i
                                            className={`${point.icon} text-primary mt-0.5`}
                                        ></i>
                                        <div>
                                            <p className="text-sm font-bold">
                                                {point.title}
                                            </p>
                                            <p className="text-sm text-base-content/60 leading-relaxed">
                                                {point.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Expiry Warning */}
                        <div className="landing-card opacity-0 border-l-4 border-warning bg-warning/5 p-4 flex items-start gap-3">
                            <i className="fa-duotone fa-regular fa-clock text-warning mt-0.5"></i>
                            <div>
                                <p className="text-sm font-bold">
                                    Time Sensitive
                                </p>
                                <p className="text-sm text-base-content/60">
                                    This invitation expires on {expiryDate}. If
                                    you don&apos;t respond by then,{" "}
                                    {
                                        invitation.recruiter_name?.split(
                                            " ",
                                        )[0]
                                    }{" "}
                                    will need to send a new invitation.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recruiter Card */}
                        <div className="landing-sidebar opacity-0 bg-base-200 border-t-4 border-primary p-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                                Your Recruiter
                            </h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center flex-shrink-0">
                                    <span className="text-xs font-black">
                                        {initials}
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold">
                                        {invitation.recruiter_name}
                                    </p>
                                    <p className="text-xs text-base-content/50">
                                        {invitation.recruiter_email}
                                    </p>
                                </div>
                            </div>
                            {invitation.recruiter_bio && (
                                <p className="text-xs text-base-content/60 leading-relaxed border-t border-base-300 pt-3">
                                    {invitation.recruiter_bio}
                                </p>
                            )}
                        </div>

                        {/* CTA Card */}
                        <div className="landing-sidebar opacity-0 bg-base-200 p-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                                Get Started
                            </h3>
                            <Link
                                href={signUpUrl}
                                className="btn btn-primary w-full mb-3"
                            >
                                <i className="fa-duotone fa-regular fa-user-plus"></i>
                                Create Your Account
                            </Link>
                            <Link
                                href={signInUrl}
                                className="btn btn-ghost btn-sm w-full text-primary"
                            >
                                Already have an account? Sign in
                            </Link>
                        </div>

                        {/* Trust Signals */}
                        <div className="landing-sidebar opacity-0 bg-base-200 p-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-xs text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-lock text-success"></i>
                                    <span>
                                        Your data is encrypted and never shared
                                        without your consent
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-user-shield text-success"></i>
                                    <span>
                                        You control which recruiters can
                                        represent you
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-base-content/60">
                                    <i className="fa-duotone fa-regular fa-badge-check text-success"></i>
                                    <span>Free for candidates, always</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-base-300 flex items-center gap-2 text-xs text-base-content/50">
                                <i className="fa-duotone fa-regular fa-clock text-warning"></i>
                                <span>
                                    This invitation expires on {expiryDate}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

/* ─── Error State Component ───────────────────────────────────────────────── */

function ErrorState({
    state,
    token,
}: {
    state: Exclude<PageState, { kind: "loading" } | { kind: "ready" }>;
    token: string;
}) {
    const configs: Record<
        string,
        { icon: string; accent: string; heading: string; description: string; cta?: { label: string; href: string } }
    > = {
        expired: {
            icon: "fa-duotone fa-regular fa-clock",
            accent: "border-warning",
            heading: "This invitation has expired",
            description:
                "Contact your recruiter to request a new one.",
            cta: {
                label: "Go to Homepage",
                href: "/",
            },
        },
        accepted: {
            icon: "fa-duotone fa-regular fa-check-circle",
            accent: "border-success",
            heading: "You have already accepted this invitation",
            description:
                "Sign in to your dashboard to view your recruiter relationship.",
            cta: {
                label: "Sign In",
                href: `/sign-in?redirect_url=${encodeURIComponent("/portal/dashboard")}`,
            },
        },
        declined: {
            icon: "fa-duotone fa-regular fa-circle-xmark",
            accent: "border-base-300",
            heading: "You have already declined this invitation",
            description:
                "If you have changed your mind, contact your recruiter directly.",
            cta: {
                label: "Go to Homepage",
                href: "/",
            },
        },
        not_found: {
            icon: "fa-duotone fa-regular fa-circle-question",
            accent: "border-error",
            heading: "Invitation not found",
            description:
                "This link may be incorrect or the invitation may have been withdrawn. Check with your recruiter.",
            cta: {
                label: "Go to Homepage",
                href: "/",
            },
        },
        error: {
            icon: "fa-duotone fa-regular fa-triangle-exclamation",
            accent: "border-error",
            heading: "Something went wrong",
            description:
                state.kind === "error"
                    ? state.message
                    : "We could not load this invitation.",
            cta: {
                label: "Go to Homepage",
                href: "/",
            },
        },
    };

    const config = configs[state.kind] || configs.error;

    return (
        <main className="min-h-screen bg-base-100 flex items-center justify-center p-6">
            <div
                className={`bg-base-200 border-l-4 ${config.accent} p-8 max-w-md w-full`}
            >
                <div className="flex items-start gap-4">
                    <i className={`${config.icon} text-2xl mt-1`}></i>
                    <div>
                        <h1 className="text-xl font-black mb-2">
                            {config.heading}
                        </h1>
                        <p className="text-sm text-base-content/60 leading-relaxed">
                            {config.description}
                        </p>
                        {config.cta && (
                            <Link
                                href={config.cta.href}
                                className="btn btn-primary btn-sm mt-4"
                            >
                                {config.cta.label}
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
