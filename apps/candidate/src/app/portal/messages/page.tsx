import { Suspense } from "react";
import BrowseMessagesClient from "./components/browse/browse-messages-client";
import { PageTitle } from "@/components/page-title";

type MessagesSearchParams = {
    conversationId?: string;
};

type MessagesPageProps = {
    searchParams?: Promise<MessagesSearchParams>;
};

export default async function MessagesPage({
    searchParams,
}: MessagesPageProps) {
    const resolvedParams = await searchParams;
    return (
        <div className="container mx-auto space-y-6">
            <PageTitle
                title="Messages"
                subtitle="Manage your recruiter and company conversations."
            />

            <Suspense
                fallback={
                    <div className="p-8 text-center text-base-content/60">
                        <span className="loading loading-spinner loading-md mb-2"></span>
                        <p>Loading conversations...</p>
                    </div>
                }
            >
                <BrowseMessagesClient
                    initialConversationId={
                        resolvedParams?.conversationId ?? null
                    }
                />
            </Suspense>
        </div>
    );
}
