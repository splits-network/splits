"use client";

import Link from "next/link";
import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
    ExpandedDetailSection,
} from "@/components/ui/tables";
import {
    formatDate,
    getVerificationStatusBadge,
    getVerificationStatusIcon,
} from "@/lib/utils";
import { Candidate } from "../../types";
import ActionsToolbar from "../shared/actions-toolbar";
import { useUserProfile } from "@/contexts";

interface RowProps {
    item: Candidate;
    onViewDetails: () => void;
}

export default function Row({ item, onViewDetails }: RowProps) {
    const { isRecruiter } = useUserProfile();

    const getInitials = (name: string) => {
        const names = name.split(" ");
        const firstInitial = names[0]?.[0]?.toUpperCase() || "";
        const lastInitial = names[names.length - 1]?.[0]?.toUpperCase() || "";
        return names.length > 1 ? firstInitial + lastInitial : firstInitial;
    };

    const cells = (
        <>
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <div className="avatar avatar-placeholder shrink-0">
                        <div className="bg-primary/10 text-primary rounded-full w-10 flex items-center justify-center text-sm font-semibold">
                            {getInitials(item.full_name || "")}
                        </div>
                    </div>
                    <div>
                        <Link
                            href={`/portal/candidates/${item.id}`}
                            className="font-semibold hover:text-primary transition-colors"
                        >
                            {item.full_name}
                        </Link>
                        <div className="text-sm text-base-content/60">
                            {item.email}
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <div className="flex flex-wrap gap-1">
                    {item.verification_status === "verified" && (
                        <div
                            className={`badge badge-sm ${getVerificationStatusBadge(item.verification_status)} gap-1`}
                        >
                            <i
                                className={`fa-duotone fa-regular ${getVerificationStatusIcon(item.verification_status)}`}
                            />
                            Verified
                        </div>
                    )}
                    {isRecruiter && (
                        <>
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
                        </>
                    )}
                </div>
            </td>
            <td>
                <div className="flex gap-1">
                    {item.linkedin_url && (
                        <a
                            href={item.linkedin_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm btn-square"
                            title="LinkedIn"
                        >
                            <i className="fa-brands fa-linkedin text-blue-600 text-sm" />
                        </a>
                    )}
                    {item.portfolio_url && (
                        <a
                            href={item.portfolio_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm btn-square"
                            title="Portfolio"
                        >
                            <i className="fa-duotone fa-regular fa-globe text-purple-600 text-sm" />
                        </a>
                    )}
                    {item.github_url && (
                        <a
                            href={item.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-ghost btn-sm btn-square"
                            title="GitHub"
                        >
                            <i className="fa-brands fa-github text-gray-600 text-sm" />
                        </a>
                    )}
                    {!item.linkedin_url &&
                        !item.portfolio_url &&
                        !item.github_url && (
                            <span className="text-base-content/30 text-sm">
                                —
                            </span>
                        )}
                </div>
            </td>
            <td>
                <span className="text-xs text-base-content/70">
                    {formatDate(item.created_at)}
                </span>
            </td>
            <td onClick={(e) => e.stopPropagation()}>
                <div className="flex gap-1 justify-end">
                    <ActionsToolbar
                        candidate={item}
                        variant="icon-only"
                        layout="horizontal"
                        size="sm"
                        onViewDetails={() => onViewDetails()}
                        showActions={{
                            edit: false,
                            verify: false,
                        }}
                    />
                </div>
            </td>
        </>
    );

    const expandedContent = (
        <div className="space-y-4">
            <ExpandedDetailSection title="Contact Information">
                <ExpandedDetailGrid>
                    <ExpandedDetailItem
                        label="Email"
                        value={
                            item.email ? (
                                <a
                                    href={`mailto:${item.email}`}
                                    className="link link-hover"
                                >
                                    {item.email}
                                </a>
                            ) : undefined
                        }
                    />
                    {item.phone && (
                        <ExpandedDetailItem
                            label="Phone"
                            value={
                                <a
                                    href={`tel:${item.phone}`}
                                    className="link link-hover"
                                >
                                    {item.phone}
                                </a>
                            }
                        />
                    )}
                    {item.location && (
                        <ExpandedDetailItem
                            label="Location"
                            value={item.location}
                        />
                    )}
                    <ExpandedDetailItem
                        label="Added"
                        value={formatDate(item.created_at)}
                    />
                </ExpandedDetailGrid>
            </ExpandedDetailSection>

            {(item.linkedin_url || item.portfolio_url || item.github_url) && (
                <ExpandedDetailSection title="Professional Links">
                    <ExpandedDetailGrid>
                        {item.linkedin_url && (
                            <ExpandedDetailItem
                                label="LinkedIn"
                                value={
                                    <a
                                        href={item.linkedin_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-brands fa-linkedin text-blue-600" />
                                        View Profile
                                    </a>
                                }
                            />
                        )}
                        {item.portfolio_url && (
                            <ExpandedDetailItem
                                label="Portfolio"
                                value={
                                    <a
                                        href={item.portfolio_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-duotone fa-regular fa-globe text-purple-600" />
                                        View Portfolio
                                    </a>
                                }
                            />
                        )}
                        {item.github_url && (
                            <ExpandedDetailItem
                                label="GitHub"
                                value={
                                    <a
                                        href={item.github_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link link-hover flex items-center gap-2"
                                    >
                                        <i className="fa-brands fa-github text-gray-600" />
                                        View Profile
                                    </a>
                                }
                            />
                        )}
                    </ExpandedDetailGrid>
                </ExpandedDetailSection>
            )}

            {isRecruiter && (
                <ExpandedDetailSection title="Relationship">
                    <ExpandedDetailGrid>
                        {item.verification_status && (
                            <ExpandedDetailItem
                                label="Verification"
                                value={
                                    <div
                                        className={`badge badge-sm ${getVerificationStatusBadge(item.verification_status)} gap-1 w-fit`}
                                    >
                                        <i
                                            className={`fa-duotone fa-regular ${getVerificationStatusIcon(item.verification_status)}`}
                                        />
                                        {item.verification_status
                                            .charAt(0)
                                            .toUpperCase() +
                                            item.verification_status.slice(1)}
                                    </div>
                                }
                            />
                        )}
                        {item.is_sourcer && (
                            <ExpandedDetailItem
                                label="Sourcing"
                                value={
                                    <span className="badge badge-sm badge-primary gap-1">
                                        <i className="fa-duotone fa-regular fa-star" />
                                        You sourced this
                                    </span>
                                }
                            />
                        )}
                        {item.has_active_relationship && (
                            <ExpandedDetailItem
                                label="Status"
                                value={
                                    <span className="badge badge-sm badge-success gap-1">
                                        <i className="fa-duotone fa-regular fa-handshake" />
                                        Active relationship
                                    </span>
                                }
                            />
                        )}
                    </ExpandedDetailGrid>

                    <div className="flex items-center gap-2 pt-2 border-t border-base-300">
                        <ActionsToolbar
                            candidate={item}
                            variant="descriptive"
                            layout="horizontal"
                            size="sm"
                            onViewDetails={() => onViewDetails()}
                        />
                    </div>
                </ExpandedDetailSection>
            )}
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`candidate-${item.id}`}
            cells={cells}
            expandedContent={expandedContent}
            showToggle={true}
        />
    );
}
