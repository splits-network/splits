import { PageTitle } from "@/components/page-title";
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
        <>
            <PageTitle
                title="Messages"
                subtitle="Manage candidate and company conversations"
            />
            <div className="space-y-6">
                <BrowseMessagesClient
                    initialConversationId={
                        resolvedParams?.conversationId ?? null
                    }
                />
            </div>
        </>
    );
}
