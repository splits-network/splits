"use client";

import { PageTitle } from "@/components/page-title";
import { InviteCompaniesClient } from "./components/invite-companies-client";

export default function InviteCompaniesPage() {
    return (
        <>
            <PageTitle
                title="Invite Companies"
                subtitle="Invite companies to join Splits Network and grow your network"
            />
            <InviteCompaniesClient />
        </>
    );
}
