"use client";

import { useState } from "react";

export interface DemoCandidate {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    current_title?: string;
    current_company?: string;
    location?: string;
    status?: string;
    [key: string]: any;
}

export interface ActionsToolbarProps {
    candidate: DemoCandidate;
    variant: "icon-only" | "descriptive";
    layout?: "horizontal" | "vertical";
    size?: "xs" | "sm" | "md";
    showActions?: {
        viewDetails?: boolean;
        message?: boolean;
        sendJobOpportunity?: boolean;
        edit?: boolean;
        verify?: boolean;
    };
    onViewDetails?: (candidateId: string) => void;
    onEdit?: (candidateId: string) => void;
    onMessage?: (candidate: DemoCandidate) => void;
    onSendJobOpportunity?: (candidate: DemoCandidate) => void;
    className?: string;
}

export default function ActionsToolbar({
    candidate,
    variant,
    layout = "horizontal",
    size = "sm",
    showActions = {
        viewDetails: true,
        message: true,
        sendJobOpportunity: true,
        edit: true,
    },
    onViewDetails,
    onEdit,
    onMessage,
    onSendJobOpportunity,
    className = "",
}: ActionsToolbarProps) {
    const [loading, setLoading] = useState<string | null>(null);

    const handleAction = async (action: string, callback?: () => void) => {
        setLoading(action);
        // Simulate action delay
        setTimeout(() => {
            callback?.();
            setLoading(null);
        }, 500);
    };

    const buttonSizeClass = {
        xs: "btn-xs",
        sm: "btn-sm",
        md: "btn-md",
    }[size];

    const iconSizeClass = {
        xs: "text-xs",
        sm: "text-sm",
        md: "text-base",
    }[size];

    const containerClass =
        layout === "vertical" ? "flex flex-col gap-2" : "flex gap-2";
    const buttonClass =
        variant === "icon-only"
            ? `btn btn-ghost btn-square ${buttonSizeClass}`
            : `btn btn-ghost ${buttonSizeClass}`;

    return (
        <div className={`${containerClass} ${className}`}>
            {showActions.viewDetails && (
                <div className="tooltip tooltip-top" data-tip="View Details">
                    <button
                        className={buttonClass}
                        onClick={() =>
                            handleAction("view", () =>
                                onViewDetails?.(candidate.id),
                            )
                        }
                        disabled={loading === "view"}
                    >
                        {loading === "view" ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <i
                                className={`fa-duotone fa-regular fa-eye ${iconSizeClass}`}
                            ></i>
                        )}
                        {variant === "descriptive" && (
                            <span className="ml-2">View</span>
                        )}
                    </button>
                </div>
            )}

            {showActions.message && (
                <div className="tooltip tooltip-top" data-tip="Send Message">
                    <button
                        className={buttonClass}
                        onClick={() =>
                            handleAction("message", () =>
                                onMessage?.(candidate),
                            )
                        }
                        disabled={loading === "message"}
                    >
                        {loading === "message" ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <i
                                className={`fa-duotone fa-regular fa-message ${iconSizeClass}`}
                            ></i>
                        )}
                        {variant === "descriptive" && (
                            <span className="ml-2">Message</span>
                        )}
                    </button>
                </div>
            )}

            {showActions.sendJobOpportunity && (
                <div className="tooltip tooltip-top" data-tip="Send Job">
                    <button
                        className={buttonClass}
                        onClick={() =>
                            handleAction("job", () =>
                                onSendJobOpportunity?.(candidate),
                            )
                        }
                        disabled={loading === "job"}
                    >
                        {loading === "job" ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <i
                                className={`fa-duotone fa-regular fa-paper-plane ${iconSizeClass}`}
                            ></i>
                        )}
                        {variant === "descriptive" && (
                            <span className="ml-2">Send Job</span>
                        )}
                    </button>
                </div>
            )}

            {showActions.edit && (
                <div className="tooltip tooltip-top" data-tip="Edit">
                    <button
                        className={buttonClass}
                        onClick={() =>
                            handleAction("edit", () => onEdit?.(candidate.id))
                        }
                        disabled={loading === "edit"}
                    >
                        {loading === "edit" ? (
                            <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                            <i
                                className={`fa-duotone fa-regular fa-edit ${iconSizeClass}`}
                            ></i>
                        )}
                        {variant === "descriptive" && (
                            <span className="ml-2">Edit</span>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
}
