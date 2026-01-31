import { PageTitle } from "@/components/page-title";
import BrowseMessagesClient from "./components/browse/browse-messages-client";

export default function MessagesPage() {
    return (
        <>
            <PageTitle
                title="Messages"
                subtitle="Manage candidate and company conversations"
            />
            <div className="space-y-6">
                <BrowseMessagesClient />
            </div>
        </>
    );
}
