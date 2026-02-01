import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import TeamManagementContent from "./components/team-content";
import { createAuthenticatedClient } from "@/lib/api-client";

export default async function CompanyTeamPage() {
    const { userId, getToken } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const token = await getToken();
    if (!token) {
        redirect("/sign-in");
    }

    // Fetch user profile
    const client = createAuthenticatedClient(token);
    const profileResponse: any = await client.get("/users/me");
    console.log("Profile Response:", profileResponse);
    const profile = profileResponse.data || {};
    const roles: string[] = Array.isArray(profile.roles) ? profile.roles : [];

    if (!roles.includes("company_admin")) {
        redirect("/portal/dashboard");
    }

    const organizationId = Array.isArray(profile.organization_ids)
        ? profile.organization_ids[0]
        : null;

    // Get company_id from profile
    const companyId = Array.isArray(profile.company_ids)
        ? profile.company_ids[0]
        : null;

    if (!organizationId) {
        return (
            <div className="container mx-auto py-6 px-4 max-w-6xl">
                <div className="alert alert-error">
                    <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                    <span>
                        You must be associated with an organization to manage team
                        members.
                    </span>
                </div>
            </div>
        );
    }

    // For backwards compatibility: if user doesn't have a company_id yet,
    // we need to fetch their company from the organization
    let finalCompanyId = companyId;
    if (!finalCompanyId) {
        // Try to get company from organization
        try {
            const companiesResponse: any = await client.get(`/companies?organization_id=${organizationId}&limit=1`);
            if (companiesResponse.data && companiesResponse.data.length > 0) {
                finalCompanyId = companiesResponse.data[0].id;
                console.log("Using company from organization:", finalCompanyId);
            }
        } catch (err) {
            console.error("Failed to fetch company:", err);
        }

        if (!finalCompanyId) {
            return (
                <div className="container mx-auto py-6 px-4 max-w-6xl">
                    <div className="alert alert-error">
                        <i className="fa-duotone fa-regular fa-circle-exclamation"></i>
                        <span>
                            No company found for your organization. Please contact support.
                        </span>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="container mx-auto py-6 px-4 max-w-6xl">
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Team Management</h1>
                <p className="text-base-content/70 mt-2">
                    Manage your company's team members and their roles
                </p>
            </div>

            <TeamManagementContent
                organizationId={organizationId}
                companyId={finalCompanyId}
            />
        </div>
    );
}
