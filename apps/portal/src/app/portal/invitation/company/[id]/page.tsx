import InvitationCompanyClient from "./invitation-client";

export default async function InvitationCompanyPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    return <InvitationCompanyClient relationshipId={id} />;
}
