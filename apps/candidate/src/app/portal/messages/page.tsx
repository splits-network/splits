import BrowseMessagesClient from "./components/browse/browse-messages-client";

export default function MessagesPage() {
    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Messages</h1>
                <p className="text-base-content/70">
                    Manage your recruiter and company conversations.
                </p>
            </div>

            <BrowseMessagesClient />
        </div>
    );
}
