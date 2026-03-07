"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useChatSidebar } from "@splits-network/chat-ui";
import { createAuthenticatedClient } from "@/lib/api-client";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import { useUserProfile } from "@/contexts";
import { WizardShell } from "../../shared/wizard-shell";
import { RecruiterCompanyAgreement } from "../../shared/agreement-clauses";
import { PermissionConfigurator } from "../../shared/permission-configurator";
import type {
    InvitationRelationship,
    RecruiterCompanyPermissions,
    WizardStep,
} from "../../shared/types";
import { DEFAULT_PERMISSIONS } from "../../shared/types";

const STEPS: WizardStep[] = [
    { num: "01", label: "The Recruiter", icon: "fa-duotone fa-regular fa-user-tie" },
    { num: "02", label: "The Agreement", icon: "fa-duotone fa-regular fa-file-contract" },
    { num: "03", label: "Your Decision", icon: "fa-duotone fa-regular fa-gavel" },
];

export default function InvitationCompanyClient({
    relationshipId,
}: {
    relationshipId: string;
}) {
    const router = useRouter();
    const { getToken } = useAuth();
    const { profile } = useUserProfile();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relationship, setRelationship] = useState<InvitationRelationship | null>(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [permissions, setPermissions] = useState<RecruiterCompanyPermissions>(DEFAULT_PERMISSIONS);
    const [processing, setProcessing] = useState(false);
    const [showDeclineForm, setShowDeclineForm] = useState(false);
    const [declineReason, setDeclineReason] = useState("");

    /* Load relationship */
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const token = await getToken();
                if (!token) return;

                const client = createAuthenticatedClient(token);
                const res = await client.get(`/recruiter-companies/${relationshipId}`);
                const data = res.data;

                if (data.status !== "pending") {
                    setError("This invitation has already been responded to.");
                    return;
                }

                setRelationship(data);
            } catch {
                setError("Failed to load invitation details.");
            } finally {
                setLoading(false);
            }
        };

        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [relationshipId]);

    /* Accept */
    const handleAccept = useCallback(async () => {
        if (!relationship || !agreeTerms) return;
        try {
            setProcessing(true);
            setError(null);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.patch(`/recruiter-companies/${relationshipId}/respond`, {
                accept: true,
                permissions,
            });
            router.push(`/portal/invitation/company/${relationshipId}/accepted`);
        } catch {
            setError("Failed to accept representation request.");
            setProcessing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [relationship, agreeTerms, relationshipId, permissions, router]);

    /* Decline */
    const handleDecline = useCallback(async () => {
        if (!relationship) return;
        try {
            setProcessing(true);
            setError(null);
            const token = await getToken();
            if (!token) return;

            const client = createAuthenticatedClient(token);
            await client.patch(`/recruiter-companies/${relationshipId}/respond`, {
                accept: false,
            });
            router.push(`/portal/invitation/company/${relationshipId}/declined`);
        } catch {
            setError("Failed to decline representation request.");
            setProcessing(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [relationship, relationshipId, router]);

    /* Navigation */
    const handleNext = () => setCurrentStep((s) => Math.min(s + 1, 2));
    const handleBack = () => {
        setShowDeclineForm(false);
        setCurrentStep((s) => Math.max(s - 1, 0));
    };

    if (loading) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary" />
                    <p className="mt-4 text-base-content/70">Loading invitation...</p>
                </div>
            </main>
        );
    }

    if (error && !relationship) {
        return (
            <main className="min-h-[70vh] flex items-center justify-center p-6">
                <div className="bg-base-200 border-l-4 border-error p-8 max-w-md w-full">
                    <div className="flex items-start gap-4">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation text-error text-2xl mt-1" />
                        <div>
                            <h1 className="text-xl font-black mb-2">Unable to Load Invitation</h1>
                            <p className="text-sm text-base-content/60 leading-relaxed">{error}</p>
                            <button
                                onClick={() => router.push("/portal/companies")}
                                className="btn btn-primary btn-sm mt-4"
                            >
                                Go to Companies
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (!relationship) return null;

    const recruiterName = relationship.recruiter.user.name;
    const companyName = relationship.company.name;
    const initials = recruiterName
        ?.split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <WizardShell
            kicker="Representation Request"
            title={
                <>
                    <span className="inline-block">Review</span>{" "}
                    <span className="inline-block text-primary">representation</span>{" "}
                    <span className="inline-block">request</span>
                </>
            }
            subtitle={`${recruiterName} is requesting to represent ${companyName} as a recruiting partner. Review the details below and decide how you'd like to respond.`}
            steps={STEPS}
            currentStep={currentStep}
            onStepClick={setCurrentStep}
            sidebar={
                <Sidebar
                    recruiterName={recruiterName}
                    recruiterEmail={relationship.recruiter.user.email}
                    recruiterUserId={relationship.recruiter.user_id}
                    companyName={companyName}
                    initials={initials}
                    currentStep={currentStep}
                />
            }
        >
            {/* Step 1: The Recruiter */}
            {currentStep === 0 && (
                <div>
                    <h2 className="text-2xl font-black tracking-tight mb-1">
                        About the Recruiter
                    </h2>
                    <p className="text-sm text-base-content/50 mb-8">
                        {recruiterName} is requesting to represent{" "}
                        {companyName} as a recruiting partner on Splits Network.
                    </p>

                    {/* Recruiter Card */}
                    <div className="flex items-start gap-5 bg-base-200 p-6 mb-6">
                        <div className="w-14 h-14 bg-primary text-primary-content flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-black">{initials}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-black">{recruiterName}</h3>
                            <p className="text-sm text-base-content/60">
                                {relationship.recruiter.user.email}
                            </p>
                        </div>
                    </div>

                    {/* Recruiter's personal message */}
                    {relationship.request_message && (
                        <div className="bg-base-200 p-4 border-l-4 border-info mb-8">
                            <p className="text-sm font-bold uppercase tracking-wider text-base-content/40 mb-2">
                                Message from {recruiterName}
                            </p>
                            <p className="text-sm text-base-content/70 leading-relaxed">
                                {relationship.request_message}
                            </p>
                        </div>
                    )}

                    {/* What this means */}
                    <h3 className="text-sm font-black uppercase tracking-wider text-base-content/50 mb-4">
                        What does accepting mean?
                    </h3>
                    <div className="space-y-4">
                        {[
                            {
                                icon: "fa-duotone fa-regular fa-user-plus",
                                title: "Recruiter Representation",
                                text: "The recruiter will represent your company and can interact with your job listings and candidate pipeline based on the permissions you grant.",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-sliders",
                                title: "You Control Permissions",
                                text: "You decide exactly what the recruiter can do — view jobs, submit candidates, advance applications, or manage job listings. You can change these at any time.",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-coins",
                                title: "Placement Attribution",
                                text: "When the recruiter submits a candidate who gets hired, they receive placement attribution and associated fees per your company's billing terms.",
                            },
                            {
                                icon: "fa-duotone fa-regular fa-link-slash",
                                title: "Easy Termination",
                                text: "You can end the relationship at any time from your network dashboard. Active applications continue through completion.",
                            },
                        ].map((prop) => (
                            <div
                                key={prop.title}
                                className="flex items-start gap-4 border-l-4 border-base-300 pl-4 py-2"
                            >
                                <i className={`${prop.icon} text-primary mt-0.5`} />
                                <div>
                                    <p className="text-sm font-bold">{prop.title}</p>
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
                        Recruiter Relationship Agreement
                    </h2>
                    <p className="text-sm text-base-content/50 mb-8">
                        Read the agreement below carefully. It defines how{" "}
                        {recruiterName} will work with {companyName} and what both
                        parties are responsible for.
                    </p>
                    <RecruiterCompanyAgreement
                        recruiterName={recruiterName}
                        companyName={companyName}
                        direction="recruiter-to-company"
                    />
                </div>
            )}

            {/* Step 3: Your Decision */}
            {currentStep === 2 && (
                <div>
                    <h2 className="text-2xl font-black tracking-tight mb-1">
                        Make Your Decision
                    </h2>
                    <p className="text-sm text-base-content/50 mb-8">
                        Configure the recruiter&apos;s permissions, then accept or
                        decline the representation request.
                    </p>

                    {!showDeclineForm ? (
                        <div className="space-y-8">
                            {/* Permission Configurator */}
                            <PermissionConfigurator
                                permissions={permissions}
                                onChange={setPermissions}
                                recruiterName={recruiterName}
                            />

                            {/* Accept Checkbox */}
                            <label
                                className={`flex items-start gap-3 p-4 border cursor-pointer transition-all ${
                                    agreeTerms
                                        ? "border-primary bg-primary/5"
                                        : "border-base-300 bg-base-200"
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    className="checkbox checkbox-primary mt-0.5"
                                    checked={agreeTerms}
                                    onChange={(e) => setAgreeTerms(e.target.checked)}
                                />
                                <span className="text-sm text-base-content/80">
                                    I have reviewed the recruiter relationship agreement
                                    and I authorize{" "}
                                    <strong>{recruiterName}</strong> to represent{" "}
                                    <strong>{companyName}</strong> with the permissions
                                    configured above.
                                </span>
                            </label>

                            {error && (
                                <div className="bg-error/10 border border-error/30 p-3 text-sm text-error">
                                    {error}
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAccept}
                                    className="btn btn-primary gap-2 flex-1"
                                    disabled={!agreeTerms || processing}
                                >
                                    {processing ? (
                                        <span className="loading loading-spinner loading-xs" />
                                    ) : (
                                        <i className="fa-duotone fa-regular fa-check" />
                                    )}
                                    Accept Representation
                                </button>
                                <button
                                    onClick={() => setShowDeclineForm(true)}
                                    className="btn btn-ghost text-error gap-2"
                                    disabled={processing}
                                >
                                    <i className="fa-duotone fa-regular fa-xmark" />
                                    Decline
                                </button>
                            </div>

                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-error/5 border border-error/20 p-6">
                                <h3 className="text-lg font-black text-error mb-2">
                                    Decline Representation Request
                                </h3>
                                <p className="text-sm text-base-content/60 mb-4">
                                    This will decline {recruiterName}&apos;s request to
                                    represent {companyName}. Optionally provide a
                                    reason.
                                </p>
                                <textarea
                                    className="textarea textarea-bordered w-full"
                                    placeholder="Reason for declining (optional)"
                                    rows={3}
                                    maxLength={500}
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="bg-error/10 border border-error/30 p-3 text-sm text-error">
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleDecline}
                                    className="btn btn-error gap-2"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <span className="loading loading-spinner loading-xs" />
                                    ) : (
                                        <i className="fa-duotone fa-regular fa-xmark" />
                                    )}
                                    Confirm Decline
                                </button>
                                <button
                                    onClick={() => setShowDeclineForm(false)}
                                    className="btn btn-ghost"
                                    disabled={processing}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </WizardShell>
    );
}

/* ─── Sidebar ───────────────────────────────────────────────────────────── */

function Sidebar({
    recruiterName,
    recruiterEmail,
    recruiterUserId,
    companyName,
    initials,
    currentStep,
}: {
    recruiterName: string;
    recruiterEmail: string;
    recruiterUserId: string;
    companyName: string;
    initials: string;
    currentStep: number;
}) {
    const { getToken } = useAuth();
    const chatSidebar = useChatSidebar();
    const toast = useToast();
    const [startingChat, setStartingChat] = useState(false);

    const handleMessage = async () => {
        try {
            setStartingChat(true);
            const conversationId = await startChatConversation(
                getToken,
                recruiterUserId,
                {},
            );
            chatSidebar.openToThread(conversationId, {
                otherUserName: recruiterName,
            });
        } catch (err: any) {
            console.error("Failed to start chat:", err);
            toast.error(err?.message || "Failed to start chat");
        } finally {
            setStartingChat(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Recruiter Summary Card */}
            <div className="bg-base-200 border-t-4 border-primary p-6">
                <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                    The Recruiter
                </h3>
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-black">{initials}</span>
                    </div>
                    <div>
                        <p className="text-sm font-bold">{recruiterName}</p>
                        <p className="text-sm text-base-content/50">{recruiterEmail}</p>
                    </div>
                </div>

                {/* Contact Details */}
                <div className="text-sm space-y-2 border-t border-base-300 pt-3 mb-4">
                    <div className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-envelope w-4 text-center text-base-content/40" />
                        <span className="text-base-content/70">{recruiterEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <i className="fa-duotone fa-regular fa-building w-4 text-center text-base-content/40" />
                        <span className="text-base-content/50">
                            Requesting to represent {companyName}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 border-t border-base-300 pt-3 mb-4">
                    <button
                        onClick={handleMessage}
                        disabled={startingChat}
                        className="btn btn-secondary btn-md w-full gap-2"
                    >
                        {startingChat ? (
                            <span className="loading loading-spinner loading-xs" />
                        ) : (
                            <i className="fa-duotone fa-regular fa-comment" />
                        )}
                        Message {recruiterName.split(" ")[0]}
                    </button>
                </div>

                {/* Invitation Info */}
                <div className="text-sm text-base-content/50 space-y-1 border-t border-base-300 pt-3">
                    <p>
                        <i className="fa-duotone fa-regular fa-handshake w-4 text-center mr-1" />
                        Relationship type: Recruiter
                    </p>
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
                                className={`w-6 h-6 flex items-center justify-center text-sm font-bold ${
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
            </div>

            {/* Help */}
            <div className="bg-base-200 p-4">
                <p className="text-sm text-base-content/50 leading-relaxed">
                    <i className="fa-duotone fa-regular fa-circle-info text-info mr-1" />
                    Not sure? You can decline now and the recruiter can send a new
                    request later. Or message them first to discuss.
                </p>
            </div>
        </div>
    );
}
