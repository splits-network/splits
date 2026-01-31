import { PageTitle } from "@/components/page-title";
import BrowseMessagesClient from "./components/browse/browse-messages-client";

type MessagesPageProps = {
    searchParams?: {
        conversationId?: string;
    };
};

export default function MessagesPage({ searchParams }: MessagesPageProps) {
    return (
        <>
            <PageTitle
                title="Messages"
                subtitle="Manage candidate and company conversations"
            />
            <div className="space-y-6">
                <BrowseMessagesClient
                    initialConversationId={searchParams?.conversationId ?? null}
                />
            </div>
        </>
    );
}
