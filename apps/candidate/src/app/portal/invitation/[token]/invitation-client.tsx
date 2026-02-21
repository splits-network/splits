"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { createAuthenticatedClient } from "@/lib/api-client";

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

/* ─── Steps ───────────────────────────────────────────────────────────────── */

const STEPS = [
    {
        num: "01",
        label: "Your Recruiter",
        icon: "fa-duotone fa-regular fa-user-tie",
    },
    {
        num: "02",
        label: "The Agreement",
        icon: "fa-duotone fa-regular fa-file-contract",
    },
    {
        num: "03",
        label: "Your Decision",
        icon: "fa-duotone fa-regular fa-gavel",
    },
];

/* ─── Value Props ─────────────────────────────────────────────────────────── */

const VALUE_PROPS = [
    {
        icon: "fa-duotone fa-regular fa-radar",
        title: "Track Opportunities",
        text: "Every role a recruiter submits you for appears in your dashboard. No more wondering where your resume went.",
    },
    {
        icon: "fa-duotone fa-regular fa-objects-column",
        title: "Centralized Applications",
        text: "Multiple recruiters, one view. See every active submission, interview, and offer across all your representatives.",
    },
    {
        icon: "fa-duotone fa-regular fa-comments",
        title: "Direct Communication",
        text: "Message your recruiters directly through the platform. Every conversation is logged and accessible when you need it.",
    },
    {
        icon: "fa-duotone fa-regular fa-signal-stream",
        title: "Progress Updates",
        text: "Real-time status changes on every opportunity. You will know when you advance, when feedback arrives, and when a decision is made.",
    },
];

/* ─── Component ───────────────────────────────────────────────────────────── */

export default function InvitationWizardClient({
    token,
}: {
    token: string;
}) {
    const router = useRouter();
    const { getToken, isSignedIn, isLoaded } = useAuth();
    const mainRef = useRef<HTMLElement>(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [invitation, setInvitation] = useState<InvitationData | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [showDeclineForm, setShowDeclineForm] = useState(false);
    const [declineReason, setDeclineReason] = useState("");

    /* ── Auth guard ── */
    useEffect(() => {
        if (!isLoaded) return;
        if (!isSignedIn) {
            router.replace(
                `/sign-up?redirect_url=${encodeURIComponent(`/portal/invitation/${token}`)}`,
            );
        }
    }, [isLoaded, isSignedIn, token, router]);

    /* ── Load invitation ── */
    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const authToken = await getToken();
                if (!authToken) throw new Error("Not authenticated");

                const client = createAuthenticatedClient(authToken);
                const response = await client.get(
                    `/recruiter-candidates/invitations/${token}`,
                );
                setInvitation(response.data);
            } catch (err) {
                if (err instanceof Response) {
                    if (err.status === 404) {
                        setError(
                            "This invitation does not exist or has been revoked.",
                        );
                    } else if (err.status === 410) {
                        setError(
                            "This invitation has expired. Please contact your recruiter for a new invitation.",
                        );
                    } else if (err.status === 409) {
                        try {
                            const data = await err.json();
                            setError(
                                data.error?.message || "Conflict occurred.",
                            );
                        } catch {
                            setError("This invitation has already been responded to.");
                        }
                    } else {
                        setError("Failed to load invitation details.");
                    }
                } else {
                    setError("An unexpected error occurred.");
                }
            } finally {
                setLoading(false);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoaded, isSignedIn, token]);

    /* ── Accept ── */
    const handleAccept = useCallback(async () => {
        if (!invitation || !agreeTerms) return;
        try {
            setProcessing(true);
            setError(null);
            const authToken = await getToken();
            if (!authToken) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(authToken);
            await client.post(
                `/recruiter-candidates/invitations/${token}/accept`,
            );
            router.push(`/portal/invitation/${token}/accepted`);
        } catch (err) {
            if (err instanceof Response) {
                try {
                    const data = await err.json();
                    setError(
                        data.error?.message || "Failed to accept invitation.",
                    );
                } catch {
                    setError("Failed to accept invitation.");
                }
            } else {
                setError("An unexpected error occurred.");
            }
            setProcessing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invitation, agreeTerms, token, router]);

    /* ── Decline ── */
    const handleDecline = useCallback(async () => {
        if (!invitation) return;
        try {
            setProcessing(true);
            setError(null);
            const authToken = await getToken();
            if (!authToken) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(authToken);
            await client.post(
                `/recruiter-candidates/invitations/${token}/decline`,
                { decline_reason: declineReason || undefined },
            );
            router.push(`/portal/invitation/${token}/declined`);
        } catch (err) {
            if (err instanceof Response) {
                try {
                    const data = await err.json();
                    setError(
                        data.error?.message || "Failed to decline invitation.",
                    );
                } catch {
                    setError("Failed to decline invitation.");
                }
            } else {
                setError("An unexpected error occurred.");
            }
            setProcessing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [invitation, token, declineReason, router]);

    /* ── Navigation ── */
    const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 2));
    const handleBack = () => {
        setShowDeclineForm(false);
        setCurrentStep((s) => Math.max(s - 1, 0));
    };

    /* ── GSAP entrance ── */
    useGSAP(
        () => {
            if (loading || !mainRef.current) return;
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
                $1(".wizard-kicker"),
                { opacity: 0, y: 20 },
                { opacity: 1, y: 0, duration: 0.5 },
            )
                .fromTo(
                    $(".wizard-title-word"),
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
                    $1(".wizard-subtitle"),
                    { opacity: 0, y: 15 },
                    { opacity: 1, y: 0, duration: 0.5 },
                    "-=0.4",
                )
                .fromTo(
                    $(".step-ind"),
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 },
                    "-=0.3",
                )
                .fromTo(
                    $1(".wizard-container"),
                    { opacity: 0, y: 30 },
                    { opacity: 1, y: 0, duration: 0.6 },
                    "-=0.2",
                );
        },
        { scope: mainRef, dependencies: [loading] },
    );

    /* ── Loading ── */
    if (loading) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-base-content/70">
                        Loading invitation...
                    </p>
                </div>
            </main>
        );
    }

    /* ── Error (no invitation data) ── */
    if (error && !invitation) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center p-6">
                <div className="bg-base-200 border-l-4 border-error p-8 max-w-md w-full">
                    <div className="flex items-start gap-4">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-2xl mt-1"></i>
                        <div>
                            <h1 className="text-xl font-black mb-2">
                                Unable to Load Invitation
                            </h1>
                            <p className="text-sm text-base-content/60 leading-relaxed">
                                {error}
                            </p>
                            <button
                                onClick={() => router.push("/portal/dashboard")}
                                className="btn btn-primary btn-sm mt-4"
                            >
                                Go to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!invitation) return null;

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
    const daysLeft = Math.max(
        0,
        Math.ceil(
            (new Date(invitation.expires_at).getTime() - Date.now()) /
                (1000 * 60 * 60 * 24),
        ),
    );

    return (
        <main ref={mainRef}>
            {/* ── Hero Header ── */}
            <section className="relative bg-neutral text-neutral-content py-12 lg:py-16">
                <div
                    className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                    style={{
                        clipPath: "polygon(20% 0,100% 0,100% 100%,0% 100%)",
                    }}
                />
                <div className="relative z-10 container mx-auto px-6 lg:px-12">
                    <div className="max-w-3xl">
                        <p className="wizard-kicker text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-4 opacity-0">
                            Invitation
                        </p>
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.92] tracking-tight mb-4">
                            <span className="wizard-title-word inline-block opacity-0">
                                Review your
                            </span>{" "}
                            <span className="wizard-title-word inline-block opacity-0 text-primary">
                                representation
                            </span>{" "}
                            <span className="wizard-title-word inline-block opacity-0">
                                agreement
                            </span>
                        </h1>
                        <p className="wizard-subtitle text-base text-neutral-content/50 max-w-xl opacity-0">
                            {invitation.recruiter_name} has invited you to join
                            their network. Walk through the details below and
                            decide how you would like to respond.
                        </p>
                    </div>
                </div>
            </section>

            {/* ── Step Indicators ── */}
            <section className="bg-base-200 border-b border-base-300">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex overflow-x-auto">
                        {STEPS.map((step, i) => (
                            <button
                                key={step.num}
                                onClick={() => {
                                    if (i < currentStep) setCurrentStep(i);
                                }}
                                className={`step-ind opacity-0 flex items-center gap-3 px-6 py-4 border-b-2 transition-all text-sm font-semibold whitespace-nowrap ${
                                    i === currentStep
                                        ? "border-primary text-primary"
                                        : i < currentStep
                                          ? "border-success text-success cursor-pointer"
                                          : "border-transparent text-base-content/30"
                                }`}
                            >
                                <span
                                    className={`w-7 h-7 flex items-center justify-center text-xs font-bold ${
                                        i === currentStep
                                            ? "bg-primary text-primary-content"
                                            : i < currentStep
                                              ? "bg-success text-success-content"
                                              : "bg-base-300 text-base-content/40"
                                    }`}
                                >
                                    {i < currentStep ? (
                                        <i className="fa-duotone fa-regular fa-check text-[10px]" />
                                    ) : (
                                        step.num
                                    )}
                                </span>
                                <span className="hidden sm:inline">
                                    {step.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Wizard Content ── */}
            <section className="container mx-auto px-6 lg:px-12 py-10 lg:py-14">
                <div className="wizard-container opacity-0 grid lg:grid-cols-5 gap-10 lg:gap-16">
                    {/* ── Main Panel ── */}
                    <div className="lg:col-span-3">
                        {/* Step 1: Your Recruiter */}
                        {currentStep === 0 && (
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">
                                    Meet Your Recruiter
                                </h2>
                                <p className="text-sm text-base-content/50 mb-8">
                                    {invitation.recruiter_name} wants to
                                    represent you as a candidate in their
                                    recruiting network. Before you decide, here
                                    is what working through Applicant Network
                                    looks like.
                                </p>

                                {/* Recruiter Card */}
                                <div className="flex items-start gap-5 bg-base-200 p-6 mb-8">
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

                                {/* Value Props */}
                                <h3 className="text-sm font-black uppercase tracking-wider text-base-content/50 mb-4">
                                    What is Applicant Network?
                                </h3>
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
                                                    {prop.text}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 2: The Agreement */}
                        {currentStep === 1 && (
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">
                                    Right to Represent Agreement
                                </h2>
                                <p className="text-sm text-base-content/50 mb-8">
                                    Read the agreement below carefully. It
                                    defines how {invitation.recruiter_name} will
                                    represent you and what both parties are
                                    responsible for.
                                </p>

                                <div className="bg-base-200 p-6 space-y-4 text-sm">
                                    <AgreementClause num={1} title="Authorization to Represent">
                                        By accepting this invitation, I hereby
                                        authorize {invitation.recruiter_name}{" "}
                                        (&quot;Recruiter&quot;) to represent me
                                        in seeking employment opportunities and
                                        to submit my profile, resume, and
                                        related information to potential
                                        employers.
                                    </AgreementClause>

                                    <AgreementClause num={2} title="Exclusive Representation Period">
                                        I acknowledge that for any position to
                                        which the Recruiter submits my profile,
                                        the Recruiter shall have the exclusive
                                        right to represent me for that specific
                                        position for a period of twelve (12)
                                        months from the date of submission, or
                                        until I am hired for that position,
                                        whichever occurs first.
                                    </AgreementClause>

                                    <AgreementClause num={3} title="No Duplicate Submissions">
                                        I agree not to apply directly to any
                                        company or through any other recruiter
                                        for positions to which the Recruiter has
                                        already submitted my profile during the
                                        exclusive representation period, unless I
                                        have notified the Recruiter in writing
                                        and received acknowledgment of
                                        withdrawal.
                                    </AgreementClause>

                                    <AgreementClause num={4} title="Recruiter's Commission">
                                        I understand that the Recruiter&apos;s
                                        compensation is paid directly by the
                                        hiring employer upon successful
                                        placement, and I will not be responsible
                                        for any fees or commissions related to
                                        the Recruiter&apos;s services.
                                    </AgreementClause>

                                    <AgreementClause num={5} title="Accuracy of Information">
                                        I confirm that all information provided
                                        in my profile, resume, and
                                        communications with the Recruiter is
                                        accurate and complete to the best of my
                                        knowledge. I will promptly notify the
                                        Recruiter of any material changes to my
                                        employment status or availability.
                                    </AgreementClause>

                                    <AgreementClause num={6} title="Communication and Updates">
                                        I agree to maintain reasonable
                                        communication with the Recruiter
                                        throughout the recruitment process and to
                                        provide timely updates regarding
                                        interviews, offers, and my continued
                                        interest in opportunities presented.
                                    </AgreementClause>

                                    <AgreementClause num={7} title="Confidentiality">
                                        I understand that the Recruiter may share
                                        my information with potential employers
                                        in confidence, and I authorize such
                                        disclosure for the purpose of securing
                                        employment opportunities.
                                    </AgreementClause>

                                    <AgreementClause num={8} title="Right to Decline">
                                        I retain the right to decline any
                                        opportunity presented by the Recruiter
                                        without penalty. This agreement does not
                                        obligate me to accept any position
                                        offered through the Recruiter&apos;s
                                        efforts.
                                    </AgreementClause>

                                    <AgreementClause num={9} title="Termination">
                                        Either party may terminate this agreement
                                        at any time by providing written notice
                                        through the Applicant Network platform.
                                        Termination will not affect the
                                        Recruiter&apos;s rights regarding
                                        positions to which my profile was
                                        submitted prior to termination.
                                    </AgreementClause>

                                    <AgreementClause num={10} title="Governing Terms">
                                        This agreement is governed by the terms
                                        of service of Applicant Network and
                                        applicable employment laws. By accepting
                                        this invitation, I acknowledge that I
                                        have read, understood, and agree to these
                                        terms.
                                    </AgreementClause>

                                    <div className="bg-base-100 p-4 border-l-4 border-primary mt-4">
                                        <p className="text-xs text-base-content/70">
                                            <strong>Effective Date:</strong> This
                                            agreement takes effect immediately
                                            upon acceptance and remains in effect
                                            as outlined in the terms above.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Your Decision */}
                        {currentStep === 2 && (
                            <div>
                                <h2 className="text-2xl font-black tracking-tight mb-1">
                                    Make Your Decision
                                </h2>
                                <p className="text-sm text-base-content/50 mb-8">
                                    You have reviewed the recruiter and the
                                    agreement. Choose how you would like to
                                    proceed.
                                </p>

                                {!showDeclineForm ? (
                                    <div className="space-y-6">
                                        {/* Accept Section */}
                                        <div className="space-y-4">
                                            <label
                                                className={`flex items-start gap-3 p-4 border cursor-pointer transition-all ${
                                                    agreeTerms
                                                        ? "border-primary bg-primary/5"
                                                        : "border-base-300 bg-base-200"
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={agreeTerms}
                                                    onChange={(e) =>
                                                        setAgreeTerms(
                                                            e.target.checked,
                                                        )
                                                    }
                                                    className="checkbox checkbox-primary checkbox-sm mt-0.5"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        I have read and agree to
                                                        the Right to Represent
                                                        agreement with{" "}
                                                        {
                                                            invitation.recruiter_name
                                                        }
                                                    </p>
                                                </div>
                                            </label>

                                            <div className="border-l-4 border-info bg-info/5 p-4 flex items-start gap-3">
                                                <i className="fa-duotone fa-regular fa-info-circle text-info mt-0.5"></i>
                                                <p className="text-sm text-base-content/70">
                                                    By accepting, you authorize{" "}
                                                    {
                                                        invitation.recruiter_name
                                                    }{" "}
                                                    to represent you as a
                                                    candidate and submit your
                                                    profile to prospective
                                                    employers under the terms
                                                    outlined in the agreement.
                                                </p>
                                            </div>

                                            <button
                                                onClick={handleAccept}
                                                disabled={
                                                    !agreeTerms || processing
                                                }
                                                className="btn btn-primary w-full"
                                            >
                                                {processing ? (
                                                    <>
                                                        <span className="loading loading-spinner loading-sm"></span>
                                                        Accepting...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fa-duotone fa-regular fa-check"></i>
                                                        Accept Agreement
                                                    </>
                                                )}
                                            </button>
                                        </div>

                                        {/* Divider */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 border-t border-base-300"></div>
                                            <span className="text-xs text-base-content/30 font-semibold uppercase tracking-wider">
                                                or
                                            </span>
                                            <div className="flex-1 border-t border-base-300"></div>
                                        </div>

                                        {/* Decline Button */}
                                        <button
                                            onClick={() =>
                                                setShowDeclineForm(true)
                                            }
                                            disabled={processing}
                                            className="btn btn-ghost w-full"
                                        >
                                            <i className="fa-duotone fa-regular fa-xmark"></i>
                                            Decline Invitation
                                        </button>
                                    </div>
                                ) : (
                                    /* Decline Form */
                                    <div className="space-y-6">
                                        <div className="border-l-4 border-warning bg-warning/5 p-4">
                                            <h3 className="text-sm font-bold mb-1">
                                                Decline this invitation?
                                            </h3>
                                            <p className="text-sm text-base-content/60">
                                                {invitation.recruiter_name} will
                                                be notified that you have
                                                declined. You will not be added
                                                to their candidate network. This
                                                does not affect any other
                                                recruiter relationships you may
                                                have.
                                            </p>
                                        </div>

                                        <fieldset>
                                            <label className="text-xs font-semibold uppercase tracking-widest text-base-content/50 mb-2 block">
                                                Let{" "}
                                                {
                                                    invitation.recruiter_name?.split(
                                                        " ",
                                                    )[0]
                                                }{" "}
                                                know why (optional)
                                            </label>
                                            <textarea
                                                value={declineReason}
                                                onChange={(e) =>
                                                    setDeclineReason(
                                                        e.target.value,
                                                    )
                                                }
                                                rows={4}
                                                placeholder="For example: I am not currently looking, or I am already represented for these roles."
                                                className="textarea w-full bg-base-200 border-base-300 focus:border-primary focus:outline-none leading-relaxed"
                                                disabled={processing}
                                            />
                                        </fieldset>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() =>
                                                    setShowDeclineForm(false)
                                                }
                                                disabled={processing}
                                                className="btn btn-ghost flex-1"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleDecline}
                                                disabled={processing}
                                                className="btn btn-error flex-1"
                                            >
                                                {processing ? (
                                                    <>
                                                        <span className="loading loading-spinner loading-sm"></span>
                                                        Declining...
                                                    </>
                                                ) : (
                                                    "Confirm Decline"
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Error */}
                                {error && (
                                    <div className="mt-4 border-l-4 border-error bg-error/5 p-4 flex items-start gap-3">
                                        <i className="fa-duotone fa-regular fa-circle-exclamation text-error"></i>
                                        <span className="text-sm">
                                            {error}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── Navigation ── */}
                        <div className="flex items-center justify-between mt-10 pt-6 border-t border-base-300">
                            <button
                                onClick={handleBack}
                                disabled={currentStep === 0}
                                className="btn btn-ghost btn-sm disabled:opacity-30"
                            >
                                <i className="fa-duotone fa-regular fa-arrow-left" />{" "}
                                Back
                            </button>
                            {currentStep < 2 && (
                                <button
                                    onClick={handleNext}
                                    className="btn btn-primary btn-sm"
                                >
                                    Continue{" "}
                                    <i className="fa-duotone fa-regular fa-arrow-right" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ── Sidebar ── */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Recruiter Card */}
                        <div className="bg-base-200 border-t-4 border-primary p-6">
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
                            <div className="mt-4 pt-3 border-t border-base-300 flex items-center gap-2 text-xs">
                                <i className="fa-duotone fa-regular fa-clock text-warning"></i>
                                <span className="text-base-content/50">
                                    {daysLeft} days remaining to respond
                                </span>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="bg-base-200 border-t-4 border-secondary p-6">
                            <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                                Your Progress
                            </h3>
                            <div className="space-y-3">
                                {STEPS.map((step, i) => (
                                    <div
                                        key={step.num}
                                        className="flex items-center gap-3"
                                    >
                                        <div
                                            className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold ${
                                                i < currentStep
                                                    ? "bg-success text-success-content"
                                                    : i === currentStep
                                                      ? "bg-primary text-primary-content"
                                                      : "bg-base-300 text-base-content/30"
                                            }`}
                                        >
                                            {i < currentStep ? (
                                                <i className="fa-solid fa-check" />
                                            ) : (
                                                step.num
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm ${
                                                i <= currentStep
                                                    ? "font-semibold text-base-content"
                                                    : "text-base-content/40"
                                            }`}
                                        >
                                            {step.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-base-300">
                                <div className="flex justify-between text-xs text-base-content/50 mb-1">
                                    <span>Completion</span>
                                    <span>
                                        {Math.round(
                                            ((currentStep + 1) / 3) * 100,
                                        )}
                                        %
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-base-300">
                                    <div
                                        className="h-full bg-primary transition-all duration-500"
                                        style={{
                                            width: `${((currentStep + 1) / 3) * 100}%`,
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
}

/* ─── Agreement Clause Sub-Component ──────────────────────────────────────── */

function AgreementClause({
    num,
    title,
    children,
}: {
    num: number;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="border-l-4 border-base-300 pl-4 py-1">
            <p className="text-base-content/80 leading-relaxed">
                <strong>
                    {num}. {title}:
                </strong>{" "}
                {children}
            </p>
        </div>
    );
}
