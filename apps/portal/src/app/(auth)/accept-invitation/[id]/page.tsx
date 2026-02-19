import { currentUser } from "@clerk/nextjs/server";
import AcceptInvitationClient from "./AcceptInvitationClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AcceptInvitationPage({ params }: PageProps) {
    const { id } = await params;

    // Check if the user is already signed in so the client can skip the auth prompt.
    // We intentionally do NOT redirect unauthenticated users — they should see the
    // invitation details first and then choose to sign in or create an account.
    const user = await currentUser();
    const userEmail = user?.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress;

    return (
        <AcceptInvitationClient
            invitationId={id}
            userId={user?.id || ""}
            userEmail={userEmail || ""}
        />
    );
}
