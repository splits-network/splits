import BrowseRolesClient from "./components/browse-roles-client";
import { PageTitle } from "@/components/page-title";

export const metadata = {
    title: "Browse Roles | Splits Network",
    description: "Find and place candidates for open roles.",
};

export default function BrowseRolesPage() {
    return (
        <>
            <PageTitle
                title="Role Browser"
                subtitle="Find and place candidates for open roles."
            />
            <BrowseRolesClient />
        </>
    );
}
