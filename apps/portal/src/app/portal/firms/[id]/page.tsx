"use client";

import { use } from "react";
import FirmDetailContent from "./firm-detail-content";

export default function FirmDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    return <FirmDetailContent firmId={resolvedParams.id} />;
}
