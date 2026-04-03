"use client";

import { getStageDisplay, semanticPill } from "@splits-network/basel-ui";
import type { Application } from "../../types";
import {
    companyName,
    salaryDisplay,
} from "./helpers";
import ActionsToolbar from "./actions-toolbar";

interface ApplicationDetailHeaderProps {
    application: Application;
    onClose?: () => void;
    onRefresh?: () => void;
}

export function ApplicationDetailHeader({
    application,
    onClose,
    onRefresh,
}: ApplicationDetailHeaderProps) {
    const name = companyName(application);
    const salary = salaryDisplay(application);
    const job = application.job;
    const stage = getStageDisplay(application.stage, {
        acceptedByCandidate: application.accepted_by_candidate,
    });

    return (
        <div className="sticky top-0 bg-base-100 border-b-2 border-base-300 px-6 py-4 shrink-0">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span
                            className={`text-sm uppercase tracking-[0.2em] font-bold px-2 py-1 ${semanticPill[stage.color]}`}
                        >
                            {stage.label}
                        </span>
                    </div>

                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary mb-2">
                        {name}
                    </p>

                    <h2 className="text-2xl lg:text-3xl font-black leading-[0.95] tracking-tight mb-3">
                        {job?.title || "Unknown Position"}
                    </h2>

                    <div className="flex flex-wrap gap-3 text-sm text-base-content/60">
                        <span>
                            <i className="fa-duotone fa-regular fa-building mr-1" />
                            {name}
                        </span>
                        {job?.location && (
                            <span>
                                <i className="fa-duotone fa-regular fa-location-dot mr-1" />
                                {job.location}
                            </span>
                        )}
                        {salary && (
                            <span>
                                <i className="fa-duotone fa-regular fa-money-bill mr-1" />
                                {salary}
                            </span>
                        )}
                    </div>
                </div>

                {onClose && (
                    <button
                        onClick={onClose}
                        className="btn btn-sm btn-square btn-ghost"
                        style={{ borderRadius: 0 }}
                    >
                        <i className="fa-duotone fa-regular fa-xmark text-lg" />
                    </button>
                )}
            </div>

            <div className="mt-4">
                <ActionsToolbar
                    item={application}
                    variant="descriptive"
                    size="sm"
                    onStageChange={onRefresh}
                />
            </div>
        </div>
    );
}
