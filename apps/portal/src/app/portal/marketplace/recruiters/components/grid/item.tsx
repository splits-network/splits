"use client";

import UserAvatar from "@/components/common/UserAvatar";
import RecruiterReputationBadge from "@/components/recruiter-reputation-badge";
import {
    EntityCard,
    DataRow,
    DataList,
    VerticalDataRow,
} from "@/components/ui/cards";
import { RecruiterWithUser, getDisplayName } from "../../types";
import RecruiterActionsToolbar from "../shared/actions-toolbar";

interface ItemProps {
    item: RecruiterWithUser;
    onViewDetails: (id: string) => void;
}

export default function Item({ item, onViewDetails }: ItemProps) {
    const displayName = getDisplayName(item);
    const specialties = item.specialties || [];
    const industries = item.industries || [];

    return (
        <EntityCard className="group hover:shadow-lg transition-all duration-200">
            <EntityCard.Header>
                <div className="flex items-center justify-between gap-3 min-w-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                            user={{
                                name: displayName,
                                profile_image_url: item.users?.profile_image_url,
                            }}
                            size="md"
                            className="shrink-0"
                        />
                        <div className="flex flex-col min-w-0">
                            <h3 className="font-semibold text-md truncate">
                                {displayName}
                            </h3>
                            <div className="text-sm text-base-content/70 truncate">
                                {item.tagline || item.location || "Recruiter"}
                            </div>
                        </div>
                    </div>
                    <RecruiterReputationBadge
                        reputation={{
                            total_submissions: (item as any).total_submissions || 0,
                            total_hires: (item as any).total_hires || 0,
                            hire_rate: (item as any).hire_rate || null,
                            completion_rate: (item as any).completion_rate || null,
                            reputation_score: item.reputation_score ?? null,
                        }}
                        compact
                    />
                </div>
            </EntityCard.Header>

            <EntityCard.Body>
                <DataList compact>
                    {item.bio && (
                        <VerticalDataRow label="Bio" icon="fa-user-circle">
                            <span className="w-full text-sm text-base-content/80 line-clamp-2">
                                {item.bio.length > 80
                                    ? item.bio.substring(0, 80) + "..."
                                    : item.bio}
                            </span>
                        </VerticalDataRow>
                    )}
                    <DataRow
                        label="Location"
                        icon="fa-location-dot"
                        value={item.location || "Not provided"}
                    />
                    <DataRow
                        label="Experience"
                        icon="fa-hourglass-half"
                        value={
                            item.years_experience
                                ? `${item.years_experience}+ years`
                                : "Not specified"
                        }
                    />
                    {specialties.length > 0 && (
                        <VerticalDataRow label="Specialties" icon="fa-briefcase">
                            <div className="flex flex-wrap gap-1">
                                {specialties.slice(0, 3).map((specialty) => (
                                    <span
                                        key={specialty}
                                        className="badge badge-sm badge-primary badge-soft border-0"
                                    >
                                        {specialty}
                                    </span>
                                ))}
                                {specialties.length > 3 && (
                                    <span className="badge badge-sm badge-ghost border-0">
                                        +{specialties.length - 3}
                                    </span>
                                )}
                            </div>
                        </VerticalDataRow>
                    )}
                    {industries.length > 0 && (
                        <VerticalDataRow label="Industries" icon="fa-industry">
                            <div className="flex flex-wrap gap-1">
                                {industries.slice(0, 3).map((industry) => (
                                    <span
                                        key={industry}
                                        className="badge badge-sm badge-outline"
                                    >
                                        {industry}
                                    </span>
                                ))}
                                {industries.length > 3 && (
                                    <span className="badge badge-sm badge-ghost border-0">
                                        +{industries.length - 3}
                                    </span>
                                )}
                            </div>
                        </VerticalDataRow>
                    )}
                </DataList>
            </EntityCard.Body>

            <EntityCard.Footer>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-sm text-base-content/60">
                        {item.total_placements !== undefined &&
                            item.total_placements > 0 && (
                                <span className="flex items-center gap-1">
                                    <i className="fa-duotone fa-regular fa-handshake text-success"></i>
                                    {item.total_placements} placements
                                </span>
                            )}
                        {item.success_rate !== undefined && (
                            <span className="flex items-center gap-1">
                                <i className="fa-duotone fa-regular fa-bullseye text-info"></i>
                                {Math.round(item.success_rate)}%
                            </span>
                        )}
                    </div>
                    <RecruiterActionsToolbar
                        recruiter={item}
                        variant="icon-only"
                        layout="horizontal"
                        size="xs"
                        showActions={{ viewDetails: true }}
                        onViewDetails={() => onViewDetails(item.id)}
                    />
                </div>
            </EntityCard.Footer>
        </EntityCard>
    );
}
