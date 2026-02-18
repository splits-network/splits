"use client";

import { use } from "react";
import TeamDetailContent from "./team-detail-content";

export default function TeamDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    return <TeamDetailContent teamId={resolvedParams.id} />;
}
