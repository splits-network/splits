import DashboardClient from "./components/dashboard-client";
import { PageTitle } from "@/components/page-title";

export default function DashboardPage() {
    return (
        <>
            <PageTitle
                title="Dashboard"
                subtitle="Overview of your recruiting activity"
            />
            <DashboardClient />
        </>
    );
}
