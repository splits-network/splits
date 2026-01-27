import RolesList from "./components/roles-list";
import RolesHeader from "./components/roles-header";
import { PageTitle } from "@/components/page-title";

export default function RolesPage() {
    return (
        <>
            <PageTitle
                title="Roles"
                subtitle="Browse and manage job opportunities"
            />
            <div className="space-y-6">
                <RolesList />
            </div>
        </>
    );
}
