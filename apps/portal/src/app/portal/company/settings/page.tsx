import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createAuthenticatedClient } from "@/lib/api-client";
import SettingsContent from "./settings-content";

export default async function CompanySettingsPage() {
    const { getToken } = await auth();

    const token = await getToken();
    if (!token) {
        redirect("/sign-in");
    }

    const client = createAuthenticatedClient(token);

    let company = null;
    let companyId: string | null = null;
    let organizationId: string | null = null;

    try {
        const profileResponse: any = await client.get("/users/me");
        const profile = profileResponse?.data;

        // Resolve organization ID
        if (profile?.organization_ids && profile.organization_ids.length > 0) {
            organizationId = profile.organization_ids[0];

            // Resolve company ID (try company_ids first, fall back to org lookup)
            if (
                Array.isArray(profile.company_ids) &&
                profile.company_ids.length > 0
            ) {
                companyId = profile.company_ids[0];
            }

            // Fetch company details
            const companiesResponse: any = await client.get("/companies");
            const companies = companiesResponse?.data || [];
            company =
                companies.find(
                    (c: any) =>
                        c.identity_organization_id === organizationId,
                ) || null;

            // If we didn't get companyId from profile, get it from company
            if (!companyId && company) {
                companyId = company.id;
            }
        }
    } catch (error) {
        console.error("[Company Settings] Failed to fetch data:", error);
    }

    return (
        <SettingsContent
            company={company}
            companyId={companyId}
            organizationId={organizationId}
        />
    );
}
