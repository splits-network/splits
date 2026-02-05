import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import AcceptInvitationClient from "./AcceptInvitationClient";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function AcceptInvitationPage({ params }: PageProps) {
    const { id } = await params;
    const user = await currentUser();

    // If not logged in, redirect to sign up with redirect back to invitation page
    if (!user) {
        // Use Clerk's redirect_url mechanism to return here after sign-up
        const redirectUrl = encodeURIComponent(`/accept-invitation/${id}`);
        const signUpUrl = `/sign-up?redirect_url=${redirectUrl}`;
        redirect(signUpUrl);
    }

    // Get user email for validation (will be done client-side)
    const userEmail = user.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress;

    // Pass the invitation ID and user info to the client component
    // The client will fetch the invitation details and handle all validation
    return (
        <AcceptInvitationClient
            invitationId={id}
            userId={user.id}
            userEmail={userEmail || ""}
        />
    );
}
