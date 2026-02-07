"use client";

import {
    DataRow,
    InteractiveDataRow,
    DataList,
    EntityCard,
} from "@/components/ui/cards";
import { formatRelativeTime } from "@/lib/utils";
import { Candidate, getVerificationBadgeClass } from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";

interface ItemProps {
    item: Candidate;
    onViewDetails: () => void;
}

export default function Item({ item, onViewDetails }: ItemProps) {
    const initials = (() => {
        const names = (item.full_name || "").split(" ");
        const firstInitial = names[0]?.[0]?.toUpperCase() || "";
        const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || "";
        return names.length > 1 ? firstInitial + lastInitial : firstInitial;
    })();

    return (
        <EntityCard className="group hover:shadow-lg transition-all duration-200">
            <EntityCard.Header>
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex justify-between w-full items-center">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="avatar avatar-placeholder shrink-0">
                                <div className="bg-base-200 text-base-content/70 w-10 h-10 rounded-lg flex items-center justify-center text-sm font-semibold">
                                    {initials}
                                </div>
                            </div>
                            <div className="min-w-0">
                                <h3 className="font-semibold text-base-content group-hover:text-primary transition-colors truncate">
                                    {item.full_name}
                                </h3>
                                <p className="text-sm text-base-content/60 truncate">
                                    {item.current_title}
                                    {item.current_company &&
                                        ` at ${item.current_company}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                            {item.verification_status === "verified" && (
                                <div
                                    className={`badge ${getVerificationBadgeClass(item.verification_status)} shrink-0`}
                                >
                                    Verified
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </EntityCard.Header>

            <EntityCard.Body>
                <DataList compact>
                    <InteractiveDataRow icon="fa-envelope" label="Email">
                        {item.email ? (
                            <a
                                href={`mailto:${item.email}`}
                                className="link link-hover text-sm max-w-xs truncate"
                                onClick={(e) => e.stopPropagation()}
                                title={item.email}
                            >
                                {item.email}
                            </a>
                        ) : (
                            <span className="text-sm text-base-content/40 italic">
                                Not provided
                            </span>
                        )}
                    </InteractiveDataRow>
                    <InteractiveDataRow icon="fa-phone" label="Phone">
                        {item.phone ? (
                            <a
                                href={`tel:${item.phone}`}
                                className="link link-hover"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {item.phone}
                            </a>
                        ) : (
                            <span className="text-sm text-base-content/40 italic">
                                Not provided
                            </span>
                        )}
                    </InteractiveDataRow>
                    <DataRow
                        icon="fa-location-dot"
                        label="Location"
                        value={item.location || "Not provided"}
                    />
                    <DataRow
                        icon="fa-code"
                        label="Skills"
                        value={item.skills || "Not provided"}
                    />
                </DataList>

                {/* Profile Links */}
                {(item.linkedin_url ||
                    item.portfolio_url ||
                    item.github_url) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.linkedin_url && (
                            <a
                                href={item.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="badge badge-sm badge-outline gap-1 transition-colors hover:bg-[#0A66C2] hover:text-white hover:border-[#0A66C2]"
                                onClick={(e) => e.stopPropagation()}
                                title="LinkedIn"
                            >
                                <i className="fa-brands fa-linkedin" />
                                LinkedIn
                            </a>
                        )}
                        {item.portfolio_url && (
                            <a
                                href={item.portfolio_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="badge badge-sm badge-outline gap-1 transition-colors group-hover:badge-accent"
                                onClick={(e) => e.stopPropagation()}
                                title="Portfolio"
                            >
                                <i className="fa-duotone fa-regular fa-globe" />
                                Portfolio
                            </a>
                        )}
                        {item.github_url && (
                            <a
                                href={item.github_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="badge badge-sm badge-outline gap-1 transition-colors hover:bg-[#238636] hover:text-white hover:border-[#238636]"
                                onClick={(e) => e.stopPropagation()}
                                title="GitHub"
                            >
                                <i className="fa-brands fa-github" />
                                GitHub
                            </a>
                        )}
                    </div>
                )}

                {/* Status Badges */}
                {(item.is_sourcer ||
                    item.has_active_relationship ||
                    item.has_other_active_recruiters ||
                    item.is_new) && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.is_sourcer && (
                            <span className="badge badge-sm badge-primary gap-1">
                                <i className="fa-duotone fa-regular fa-star" />
                                Sourcer
                            </span>
                        )}
                        {item.has_active_relationship && (
                            <span className="badge badge-sm badge-success gap-1">
                                <i className="fa-duotone fa-regular fa-handshake" />
                                Active
                            </span>
                        )}
                        {item.has_other_active_recruiters && (
                            <span className="badge badge-sm badge-warning gap-1">
                                <i className="fa-duotone fa-regular fa-users" />
                                Assigned ({item.other_active_recruiters_count || 0})
                            </span>
                        )}
                        {item.is_new && (
                            <span className="badge badge-sm badge-info gap-1">
                                <i className="fa-duotone fa-regular fa-sparkles" />
                                New
                            </span>
                        )}
                    </div>
                )}
            </EntityCard.Body>

            <EntityCard.Footer>
                <div className="flex items-center justify-between w-full">
                    <span className="text-xs text-base-content/50">
                        Added {formatRelativeTime(item.created_at)}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                        <ActionsToolbar
                            candidate={item}
                            variant="icon-only"
                            layout="horizontal"
                            size="xs"
                            onViewDetails={() => onViewDetails()}
                            showActions={{
                                edit: false,
                                verify: false,
                            }}
                        />
                    </div>
                </div>
            </EntityCard.Footer>
        </EntityCard>
    );
}
