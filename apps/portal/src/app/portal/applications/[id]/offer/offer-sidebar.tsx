"use client";

import { useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useChatSidebar } from "@splits-network/chat-ui";
import { startChatConversation } from "@/lib/chat-start";
import { useToast } from "@/lib/toast-context";
import type { Application } from "../../types";
import type { WizardStep } from "../../../invitation/shared/types";

interface OfferSidebarProps {
    application: Application;
    steps: WizardStep[];
    currentStep: number;
}

export default function OfferSidebar({ application, steps, currentStep }: OfferSidebarProps) {
    const { getToken } = useAuth();
    const chatSidebar = useChatSidebar();
    const toast = useToast();
    const [startingChat, setStartingChat] = useState(false);

    const job = application.job;
    const recruiter = application.recruiter;
    const recruiterEmail = recruiter?.user?.email || recruiter?.email || "";
    const recruiterName = recruiter?.user?.name || recruiter?.name || recruiterEmail || "Recruiter";
    const recruiterUserId = (recruiter as any)?.user_id;

    const handleMessage = async () => {
        if (!recruiterUserId) return;
        try {
            setStartingChat(true);
            const conversationId = await startChatConversation(
                getToken,
                recruiterUserId,
                { application_id: application.id },
            );
            chatSidebar.openToThread(conversationId, {
                otherUserName: recruiterName,
            });
        } catch (err: any) {
            console.error("Failed to start chat:", err);
            toast.error(err?.message || "Couldn't start conversation. Try again.");
        } finally {
            setStartingChat(false);
        }
    };

    const submittedDate = application.submitted_at
        ? new Date(application.submitted_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : null;

    const salaryRange =
        job?.salary_min || job?.salary_max
            ? `${job.salary_min ? `$${job.salary_min.toLocaleString()}` : "N/A"} - ${job.salary_max ? `$${job.salary_max.toLocaleString()}` : "N/A"}`
            : null;

    const completionPercent = Math.round(((currentStep + 1) / steps.length) * 100);

    return (
        <div className="space-y-6">
            {/* Job Details */}
            {job && (
                <div className="bg-base-200 border-t-4 border-primary p-6">
                    <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                        Job Details
                    </h3>
                    <div className="text-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <i className="fa-duotone fa-regular fa-briefcase w-4 text-center text-base-content/40" />
                            <span className="font-semibold">{job.title}</span>
                        </div>
                        {job.company?.name && (
                            <div className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-building w-4 text-center text-base-content/40" />
                                <span className="text-base-content/70">{job.company.name}</span>
                            </div>
                        )}
                        {job.location && (
                            <div className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-location-dot w-4 text-center text-base-content/40" />
                                <span className="text-base-content/70">{job.location}</span>
                            </div>
                        )}
                        {job.employment_type && (
                            <div className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-clock w-4 text-center text-base-content/40" />
                                <span className="text-base-content/70 capitalize">
                                    {job.employment_type.replace(/_/g, " ")}
                                </span>
                            </div>
                        )}
                        {salaryRange && (
                            <div className="flex items-center gap-2">
                                <i className="fa-duotone fa-regular fa-money-bill w-4 text-center text-base-content/40" />
                                <span className="text-base-content/70">{salaryRange}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Recruiter Info */}
            {recruiter && (
                <div className="bg-base-200 p-6">
                    <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                        Recruiter
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-primary text-primary-content flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-black">
                                {recruiterName
                                    .split(" ")
                                    .map((w: string) => w[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <p className="text-sm font-bold">{recruiterName}</p>
                            {recruiterEmail && (
                                <p className="text-sm text-base-content/50">{recruiterEmail}</p>
                            )}
                        </div>
                    </div>

                    {recruiterUserId && (
                        <button
                            onClick={handleMessage}
                            disabled={startingChat}
                            className="btn btn-secondary btn-sm w-full gap-2"
                            style={{ borderRadius: 0 }}
                        >
                            {startingChat ? (
                                <span className="loading loading-spinner loading-xs" />
                            ) : (
                                <i className="fa-duotone fa-regular fa-comment" />
                            )}
                            Message {recruiterName.split(" ")[0]}
                        </button>
                    )}
                </div>
            )}

            {/* Application Info */}
            {submittedDate && (
                <div className="bg-base-200 p-4">
                    <p className="text-sm text-base-content/50">
                        <i className="fa-duotone fa-regular fa-calendar w-4 text-center mr-1" />
                        Application submitted {submittedDate}
                    </p>
                </div>
            )}

            {/* Progress Tracker */}
            <div className="bg-base-200 border-t-4 border-secondary p-6">
                <h3 className="text-sm font-black uppercase tracking-wider mb-4">
                    Your Progress
                </h3>
                <div className="space-y-3">
                    {steps.map((step, i) => (
                        <div key={step.num} className="flex items-center gap-3">
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
                <div className="mt-4 pt-4 border-t border-base-300">
                    <div className="flex justify-between text-sm text-base-content/50 mb-1">
                        <span>Completion</span>
                        <span>{completionPercent}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-base-300">
                        <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${completionPercent}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
