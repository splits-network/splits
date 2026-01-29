"use client";

import { useParams } from "next/navigation";
import { PageTitle } from "@/components/page-title";
import ThreadPanel from "../components/thread-panel";

export default function MessageThreadPage() {
    const params = useParams();
    const conversationId = params.id as string;

    return (
        <>
            <PageTitle title="Messages" subtitle="Chat thread" />
            <div className="rounded-xl border border-base-300 bg-base-100 overflow-hidden">
                <ThreadPanel conversationId={conversationId} showHeader={false} />
            </div>
        </>
    );
}
