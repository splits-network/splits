import { PageTitle } from "@/components/page-title";
import ChatModerationClient from "./components/chat-moderation-client";

export default function ChatModerationPage() {
    return (
        <>
            <PageTitle
                title="Chat Moderation"
                subtitle="Review reports, evidence bundles, and actions"
            />
            <ChatModerationClient />
        </>
    );
}
