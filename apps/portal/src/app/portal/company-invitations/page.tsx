"use client";

import { PageTitle } from "@/components/page-title";
import { CompanyInvitationsClient } from "./components/company-invitations-client";

export default function CompanyInvitationsPage() {
    return (
        <>
            <PageTitle
                title="Company Invitations"
                subtitle="View and respond to invitations from companies"
            />
            <CompanyInvitationsClient />
        </>
    );
}
