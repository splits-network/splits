import AdminDashboardClient from "./admin-dashboard-client";
import { PageTitle } from "@/components/page-title";

export default function AdminPage() {
    return (
        <>
            <PageTitle
                title="Admin Dashboard"
                subtitle="Platform administration and monitoring"
            />
            <AdminDashboardClient />
        </>
    );
}
