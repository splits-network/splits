import { Application } from "./types";
import { getApplicationStageBadge } from "@/lib/utils/badge-styles";

interface DetailHeaderProps {
    application: Application;
    onClose: () => void;
}

export default function DetailHeader({
    application,
    onClose,
}: DetailHeaderProps) {
    if (!application) {
        return null;
    }

    const stageBadge = getApplicationStageBadge(application.stage);

    return (
        <div className="p-4 sm:p-6 border-b border-base-300 bg-base-100 flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                    <button
                        onClick={onClose}
                        className="md:hidden btn btn-ghost btn-circle btn-sm -ml-2"
                    >
                        <i className="fa-duotone fa-regular fa-arrow-left" />
                    </button>

                    {/* Placeholder for candidate avatar - could be added later */}
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <i className="fa-duotone fa-user text-primary" />
                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold text-base-content line-clamp-1">
                        {application.candidate?.full_name ||
                            "Unnamed Candidate"}
                    </h1>

                    <span className={`badge badge-sm ${stageBadge.className}`}>
                        {stageBadge.label}
                    </span>
                </div>

                <div className="flex items-center gap-2 text-base-content/60 text-sm ml-12 md:ml-0">
                    <i className="fa-duotone fa-briefcase" />
                    <span className="font-medium">
                        {application.job?.title || "Unknown Position"}
                    </span>
                    <span className="mx-1">•</span>
                    <i className="fa-duotone fa-building" />
                    <span>
                        {application.job?.company?.name ||
                            "Confidential Company"}
                    </span>
                    {application.recruiter?.name && (
                        <>
                            <span className="mx-1">•</span>
                            <i className="fa-duotone fa-user-tie" />
                            <span>{application.recruiter.name}</span>
                        </>
                    )}
                </div>

                {application.ai_review?.fit_score &&
                    application.ai_review?.recommendation && (
                        <div className="flex items-center gap-2 text-sm mt-2 ml-12 md:ml-0">
                            <i className="fa-duotone fa-brain text-accent" />
                            <span className="text-base-content/80">
                                AI Fit Score:{" "}
                                {Math.round(
                                    application.ai_review.fit_score * 100,
                                )}
                                %
                            </span>
                            <span
                                className={`badge badge-xs ${
                                    application.ai_review.recommendation ===
                                    "strong_fit"
                                        ? "badge-success"
                                        : application.ai_review
                                                .recommendation === "good_fit"
                                          ? "badge-info"
                                          : application.ai_review
                                                  .recommendation === "fair_fit"
                                            ? "badge-warning"
                                            : "badge-error"
                                }`}
                            >
                                {application.ai_review.recommendation.replace(
                                    "_",
                                    " ",
                                )}
                            </span>
                        </div>
                    )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
                <button className="btn btn-ghost btn-sm hidden sm:inline-flex">
                    <i className="fa-duotone fa-regular fa-comment" />
                    Add Note
                </button>
                <button className="btn btn-primary btn-sm">
                    Advance Stage
                </button>
            </div>
        </div>
    );
}
