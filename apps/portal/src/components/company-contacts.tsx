"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { LoadingSpinner } from "@splits-network/shared-ui";
import type { CompanyContact } from "@/app/portal/companies/types";
import { getRelationshipStatusBadgeClass } from "@/app/portal/companies/types";

interface CompanyContactsProps {
    companyId: string;
    compact?: boolean;
}

interface RelationshipInfo {
    status: string;
    relationship_type: string;
}

function getRoleBadge(role: string) {
    switch (role) {
        case "hiring_manager":
            return { label: "Hiring Manager", className: "badge-primary" };
        case "company_admin":
            return { label: "Company Admin", className: "badge-secondary" };
        default:
            return { label: role, className: "badge-ghost" };
    }
}

function getInitials(name: string | null): string {
    if (!name) return "??";
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export default function CompanyContacts({
    companyId,
    compact = false,
}: CompanyContactsProps) {
    const { getToken } = useAuth();
    const [contacts, setContacts] = useState<CompanyContact[]>([]);
    const [relationship, setRelationship] = useState<RelationshipInfo | null>(
        null,
    );
    const [loading, setLoading] = useState(false);

    const fetchData = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);

            // Fetch contacts and relationship in parallel
            const [contactsRes, relationshipRes] = await Promise.all([
                client.get(`/companies/${companyId}/contacts`).catch(() => ({
                    data: [],
                })),
                client
                    .get("/recruiter-companies", {
                        params: { company_id: companyId, limit: 1 },
                    })
                    .catch(() => ({ data: [] })),
            ]);

            setContacts((contactsRes as any).data || []);

            const relationships = (relationshipRes as any).data;
            if (relationships && relationships.length > 0) {
                setRelationship({
                    status: relationships[0].status,
                    relationship_type: relationships[0].relationship_type,
                });
            } else {
                setRelationship(null);
            }
        } catch (err) {
            console.error("Failed to fetch company contacts:", err);
        } finally {
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) {
        return (
            <div className="flex items-center justify-center p-4">
                <LoadingSpinner size="sm" />
            </div>
        );
    }

    if (contacts.length === 0 && !relationship) {
        return (
            <div className="p-4 text-center text-base-content/40">
                <i className="fa-duotone fa-users text-2xl mb-2 block opacity-50" />
                <p className="text-sm">No team contacts available</p>
            </div>
        );
    }

    return (
        <div className={compact ? "space-y-2" : "space-y-3"}>
            {/* Relationship badge */}
            {relationship && (
                <div className="flex items-center gap-2 mb-1">
                    <i className="fa-duotone fa-handshake text-base-content/60 text-xs" />
                    <span className="text-xs text-base-content/60">
                        Relationship:
                    </span>
                    <span
                        className={`badge badge-xs ${getRelationshipStatusBadgeClass(relationship.status)}`}
                    >
                        {relationship.status}
                    </span>
                    <span className="text-xs text-base-content/40 capitalize">
                        ({relationship.relationship_type})
                    </span>
                </div>
            )}

            {/* Contact cards */}
            {contacts.map((contact) => {
                const roleBadge = getRoleBadge(contact.role);
                const initials = getInitials(contact.name);

                return (
                    <div
                        key={contact.id}
                        className="flex items-center gap-3 p-3 rounded-lg bg-base-200/50"
                    >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0 flex items-center justify-center">
                            {contact.profile_image_url ? (
                                <img
                                    src={contact.profile_image_url}
                                    alt={contact.name || "Contact"}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-sm font-bold text-primary">
                                    {initials}
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm truncate">
                                    {contact.name || "Unknown"}
                                </span>
                                <span
                                    className={`badge badge-xs ${roleBadge.className}`}
                                >
                                    {roleBadge.label}
                                </span>
                            </div>
                            {contact.email && (
                                <div className="text-xs text-base-content/60 truncate">
                                    {contact.email}
                                </div>
                            )}
                        </div>

                        {/* Quick actions */}
                        <div className="flex items-center gap-1">
                            {contact.email && (
                                <a
                                    href={`mailto:${contact.email}`}
                                    className="btn btn-ghost btn-xs btn-square"
                                    title={`Email ${contact.name}`}
                                >
                                    <i className="fa-duotone fa-envelope text-xs" />
                                </a>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
