import { Metadata } from "next";
import InvitationsPageClient from "./components/invitations-client";
import { PageTitle } from "@/components/page-title";

export const metadata: Metadata = {
    title: "Candidate Invitations | Splits Network",
    description: "Track and manage your candidate invitations",
};

export default function InvitationsPage() {
    return (
        <>
            <PageTitle
                title="Invitations"
                subtitle="Track and manage your candidate invitations"
            />
            <InvitationsPageClient />
        </>
    );
}
