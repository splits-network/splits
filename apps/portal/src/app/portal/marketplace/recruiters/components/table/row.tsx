"use client";

import {
    ExpandableTableRow,
    ExpandedDetailGrid,
    ExpandedDetailItem,
    ExpandedDetailSection,
} from "@/components/ui/tables";
import UserAvatar from "@/components/common/UserAvatar";
import { RecruiterWithUser, getDisplayName } from "../../types";
import RecruiterActionsToolbar from "../shared/actions-toolbar";

interface RowProps {
    item: RecruiterWithUser;
    onViewDetails: (id: string) => void;
}

export default function Row({ item, onViewDetails }: RowProps) {
    const displayName = getDisplayName(item);
    const specialties = item.specialties || [];
    const primarySpecialty = specialties[0] || null;

    const cells = (
        <>
            {/* Name */}
            <td className="py-4">
                <div className="flex items-center gap-3">
                    <UserAvatar
                        user={{
                            name: displayName,
                            profile_image_url: item.users?.profile_image_url,
                        }}
                        size="sm"
                        className="shrink-0"
                    />
                    <div className="min-w-0">
                        <div className="font-medium text-sm truncate">
                            {displayName}
                        </div>
                        <div className="text-xs text-base-content/60 truncate">
                            {item.tagline || item.location || "Recruiter"}
                        </div>
                    </div>
                </div>
            </td>

            {/* Specialty */}
            <td>
                {primarySpecialty ? (
                    <span className="badge badge-sm badge-primary badge-soft border-0">
                        {primarySpecialty}
                    </span>
                ) : (
                    <span className="text-base-content/40">—</span>
                )}
            </td>

            {/* Location */}
            <td className="hidden lg:table-cell">
                <span className="text-sm text-base-content/70">
                    {item.location || "—"}
                </span>
            </td>

            {/* Placements */}
            <td>
                <span className="text-sm font-mono">
                    {item.total_placements ?? "—"}
                </span>
            </td>

            {/* Reputation */}
            <td className="hidden md:table-cell">
                {item.reputation_score !== undefined ? (
                    <span
                        className={`text-sm font-mono ${item.reputation_score >= 80 ? "text-warning" : ""}`}
                    >
                        {item.reputation_score}
                        {item.reputation_score >= 80 && (
                            <i className="fa-duotone fa-regular fa-star text-warning ml-1 text-xs" />
                        )}
                    </span>
                ) : (
                    <span className="text-base-content/40">—</span>
                )}
            </td>

            {/* Experience */}
            <td className="hidden xl:table-cell">
                <span className="text-sm">
                    {item.years_experience
                        ? `${item.years_experience}+ yrs`
                        : "—"}
                </span>
            </td>

            {/* Actions */}
            <td onClick={(e) => e.stopPropagation()}>
                <RecruiterActionsToolbar
                    recruiter={item}
                    variant="icon-only"
                    size="xs"
                    showActions={{ viewDetails: true }}
                    onViewDetails={() => onViewDetails(item.id)}
                />
            </td>
        </>
    );

    const expandedContent = (
        <div className="space-y-4">
            {/* Bio excerpt */}
            {(item.bio ||
                item.marketplace_profile?.description ||
                item.marketplace_profile?.bio) && (
                <ExpandedDetailSection title="About">
                    <p className="text-sm text-base-content/70 line-clamp-3">
                        {item.marketplace_profile?.description ||
                            item.marketplace_profile?.bio ||
                            item.bio}
                    </p>
                </ExpandedDetailSection>
            )}

            <ExpandedDetailSection title="Details">
                <ExpandedDetailGrid>
                    <ExpandedDetailItem
                        label="Email"
                        value={item.users?.email || item.email || "—"}
                    />
                    <ExpandedDetailItem
                        label="Phone"
                        value={item.phone || "—"}
                    />
                    <ExpandedDetailItem
                        label="Success Rate"
                        value={
                            item.success_rate !== undefined
                                ? `${Math.round(item.success_rate)}%`
                                : "—"
                        }
                    />
                    <ExpandedDetailItem
                        label="Avg. Time to Hire"
                        value={
                            item.average_time_to_hire !== undefined
                                ? `${item.average_time_to_hire} days`
                                : "—"
                        }
                    />
                </ExpandedDetailGrid>
            </ExpandedDetailSection>

            {/* Specialties */}
            {specialties.length > 0 && (
                <ExpandedDetailSection title="Specialties">
                    <div className="flex flex-wrap gap-1.5">
                        {specialties.map((s, i) => (
                            <span
                                key={i}
                                className="badge badge-sm bg-primary/10 text-primary border-primary/20"
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                </ExpandedDetailSection>
            )}

            {/* Industries */}
            {(item.industries || []).length > 0 && (
                <ExpandedDetailSection title="Industries">
                    <div className="flex flex-wrap gap-1.5">
                        {(item.industries || []).map((ind, i) => (
                            <span
                                key={i}
                                className="badge badge-sm bg-secondary/10 text-secondary border-secondary/20"
                            >
                                {ind}
                            </span>
                        ))}
                    </div>
                </ExpandedDetailSection>
            )}
        </div>
    );

    return (
        <ExpandableTableRow
            rowId={`recruiter-${item.id}`}
            cells={cells}
            expandedContent={expandedContent}
            showToggle={true}
        />
    );
}
