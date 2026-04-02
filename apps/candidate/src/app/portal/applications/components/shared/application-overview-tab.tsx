"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStageDisplay } from "@splits-network/basel-ui";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import { formatDate } from "@/lib/utils";
import type { Application } from "../../types";
import {
    companyName,
    recruiterName,
    appliedAgo,
} from "./helpers";

interface ApplicationOverviewTabProps {
    application: Application;
    onRefresh?: () => void;
}

export function ApplicationOverviewTab({
    application,
    onRefresh,
}: ApplicationOverviewTabProps) {
    const { getToken } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const [startingChat, setStartingChat] = useState(false);

    const name = companyName(application);
    const recName = recruiterName(application);
    const ago = appliedAgo(application);
    const job = application.job;

    return (
        <div className="space-y-8">
            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-[2px] bg-base-300">
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                        Status
                    </p>
                    <p className="text-lg font-black tracking-tight">
                        {getStageDisplay(application.stage, { acceptedByCandidate: application.accepted_by_candidate }).label}
                    </p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                        Applied
                    </p>
                    <p className="text-lg font-black tracking-tight">{ago}</p>
                    <p className="text-sm text-base-content/40">
                        {formatDate(application.submitted_at || application.created_at)}
                    </p>
                </div>
                <div className="bg-base-100 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                        Your Recruiter
                    </p>
                    <p className="text-lg font-black tracking-tight">{recName}</p>
                    {application.recruiter?.tagline && (
                        <p className="text-sm text-base-content/40 italic">
                            {application.recruiter.tagline}
                        </p>
                    )}

                    <div className="flex flex-col gap-1 mt-2">
                        {(application.recruiter?.user?.email || application.recruiter?.email) && (
                            <a
                                href={`mailto:${application.recruiter?.user?.email || application.recruiter?.email}`}
                                className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors truncate"
                            >
                                <i className="fa-duotone fa-regular fa-envelope w-3.5 text-center flex-shrink-0" />
                                <span className="truncate">
                                    {application.recruiter?.user?.email || application.recruiter?.email}
                                </span>
                            </a>
                        )}
                        {application.recruiter?.phone && (
                            <a
                                href={`tel:${application.recruiter.phone}`}
                                className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-phone w-3.5 text-center flex-shrink-0" />
                                {application.recruiter.phone}
                            </a>
                        )}
                        {application.recruiter?.id && (
                            <Link
                                href={`/marketplace/${application.recruiter.id}`}
                                className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors"
                            >
                                <i className="fa-duotone fa-regular fa-user w-3.5 text-center flex-shrink-0" />
                                View Profile
                            </Link>
                        )}
                        {application.recruiter?.user?.id && (
                            <button
                                className="inline-flex items-center gap-1.5 text-sm text-base-content/60 hover:text-primary transition-colors disabled:opacity-50"
                                disabled={startingChat}
                                onClick={async () => {
                                    const recruiterUserId = application.recruiter?.user?.id;
                                    if (!recruiterUserId) return;
                                    try {
                                        setStartingChat(true);
                                        const conversationId = await startChatConversation(
                                            getToken,
                                            recruiterUserId,
                                            {
                                                application_id: application.id,
                                                job_id: application.job?.id ?? application.job_id,
                                                company_id: application.job?.company?.id ?? application.company?.id ?? null,
                                            },
                                        );
                                        router.push(`/portal/messages?conversationId=${conversationId}`);
                                    } catch (err: any) {
                                        toast.error(err?.message || "Couldn't start conversation. Try again.");
                                    } finally {
                                        setStartingChat(false);
                                    }
                                }}
                            >
                                {startingChat ? (
                                    <span className="loading loading-spinner loading-xs w-3.5" />
                                ) : (
                                    <i className="fa-duotone fa-regular fa-comment w-3.5 text-center flex-shrink-0" />
                                )}
                                Send a Message
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Job closed warning */}
            {job?.status && ["closed", "filled", "cancelled"].includes(job.status) && (
                <div className="bg-warning/5 border-l-4 border-warning p-4">
                    <h3 className="font-bold">
                        <i className="fa-duotone fa-regular fa-triangle-exclamation mr-2" />
                        This position is no longer available
                    </h3>
                    <p className="text-sm mt-1 text-base-content/70">
                        The company has closed this position and is not accepting new applications.
                    </p>
                </div>
            )}

            {/* Proposal banner */}
            {application.stage === "recruiter_proposed" && (
                <div className="bg-info/5 border-l-4 border-info p-6">
                    <h3 className="font-bold text-lg mb-1">
                        <i className="fa-duotone fa-regular fa-handshake mr-2" />
                        {recName} thinks you'd be a great fit for this role!
                    </h3>
                    {application.recruiter_notes && (
                        <div className="mt-3 p-3 bg-base-100 border-2 border-base-300">
                            <p className="text-sm uppercase tracking-[0.2em] text-base-content/40 mb-1">
                                Recruiter's Message
                            </p>
                            <p className="whitespace-pre-wrap text-sm text-base-content/70">
                                {application.recruiter_notes}
                            </p>
                        </div>
                    )}
                    <p className="text-sm text-base-content/60 mt-3">
                        Use the toolbar buttons above to accept or decline this proposal.
                    </p>
                </div>
            )}

            {/* Offer banner */}
            {application.stage === "offer" && (
                <div
                    className={`border-2 p-6 ${application.accepted_by_candidate ? "border-success bg-success/5" : "border-primary bg-primary/5"}`}
                >
                    <p
                        className={`text-sm font-bold uppercase tracking-[0.2em] ${application.accepted_by_candidate ? "text-success" : "text-primary"} mb-2`}
                    >
                        <i
                            className={`fa-duotone fa-regular ${application.accepted_by_candidate ? "fa-check-double" : "fa-file-signature"} mr-2`}
                        />
                        {application.accepted_by_candidate ? "Offer Accepted" : "You Have an Offer"}
                    </p>
                    <h3 className="text-lg font-black tracking-tight mb-3">
                        {application.accepted_by_candidate
                            ? "Congratulations \u2014 you've accepted this offer!"
                            : `${name} has extended you a formal offer`}
                    </h3>
                    {!application.accepted_by_candidate && (
                        <Link
                            href={`/portal/applications/${application.id}/offer`}
                            className="btn btn-success btn-sm gap-2"
                            style={{ borderRadius: 0 }}
                        >
                            <i className="fa-duotone fa-regular fa-file-signature" />
                            Review & Accept Offer
                        </Link>
                    )}
                </div>
            )}

            {/* Company Info */}
            {job?.company && (
                <CompanyInfo name={name} company={job.company} />
            )}
        </div>
    );
}

function CompanyInfo({
    name,
    company,
}: {
    name: string;
    company: NonNullable<Application["job"]>["company"];
}) {
    if (!company) return null;

    const initials = name
        .split(/\s+/)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    return (
        <div className="border-t-2 border-base-300 pt-6">
            <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-base-content/40 mb-4">
                Company
            </h3>
            <div className="flex items-center gap-4">
                {company.logo_url ? (
                    <img
                        src={company.logo_url}
                        alt={name}
                        className="w-12 h-12 object-contain"
                    />
                ) : (
                    <div className="w-12 h-12 flex items-center justify-center border-2 border-base-300 bg-base-200 font-bold text-sm">
                        {initials}
                    </div>
                )}
                <div>
                    <p className="font-bold">{name}</p>
                    {company.industry && (
                        <p className="text-sm text-base-content/50">{company.industry}</p>
                    )}
                    {company.headquarters_location && (
                        <p className="text-sm text-base-content/50">
                            <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                            {company.headquarters_location}
                        </p>
                    )}
                </div>
            </div>
            {company.description && (
                <p className="text-sm text-base-content/70 mt-3">{company.description}</p>
            )}
        </div>
    );
}
