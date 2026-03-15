import type { Metadata } from "next";
import { CallDetailClient } from "./call-detail-client";

export const metadata: Metadata = {
    title: "Call Detail | Splits Network",
};

export default async function CallDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <CallDetailClient callId={id} />;
}
