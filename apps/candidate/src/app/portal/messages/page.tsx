import { Suspense } from "react";
import BrowseMessagesClient from "./components/browse/browse-messages-client";

type MessagesSearchParams = {
    conversationId?: string;
};

type MessagesPageProps = {
    searchParams?: Promise<MessagesSearchParams>;
};

export default async function MessagesPage({ searchParams }: MessagesPageProps) {
    const resolvedParams = await searchParams;
    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Messages</h1>
                <p className="text-base-content/70">
                    Manage your recruiter and company conversations.
                </p>
            </div>

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
