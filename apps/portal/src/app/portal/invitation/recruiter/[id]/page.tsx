import InvitationRecruiterClient from "./invitation-client";

export default async function InvitationRecruiterPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <InvitationRecruiterClient relationshipId={id} />;
}
