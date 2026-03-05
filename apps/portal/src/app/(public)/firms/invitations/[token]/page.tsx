import { currentUser } from "@clerk/nextjs/server";
import AcceptFirmInvitationClient from "./accept-firm-invitation-client";
import { AuthShell } from "@/components/basel/auth/auth-shell";

interface PageProps {
    params: Promise<{ token: string }>;
}

export default async function AcceptFirmInvitationPage({ params }: PageProps) {
    const { token } = await params;

    const user = await currentUser();
    const userEmail = user?.emailAddresses.find(
        (e) => e.id === user.primaryEmailAddressId,
    )?.emailAddress;

    return (
        <AuthShell>
            <AcceptFirmInvitationClient
                token={token}
                userId={user?.id || ""}
                userEmail={userEmail || ""}
            />
        </AuthShell>
    );
}
