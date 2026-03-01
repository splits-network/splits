import { Suspense } from "react";
import BrowseMessagesClient from "./components/browse/browse-messages-client";
import { MessagesHeader } from "./components/messages-header";

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
        <div className="space-y-0">
            <MessagesHeader conversationCount={0} unreadCount={0} />
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
