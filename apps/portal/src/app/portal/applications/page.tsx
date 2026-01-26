import ApplicationsList from "./components/applications-list";
import { PageTitle } from "@/components/page-title";

export default function ApplicationsPage() {
    return (
        <>
            <PageTitle
                title="Applications"
                subtitle="Track candidate applications"
            />
            <div className="space-y-6">
                <ApplicationsList />
            </div>
        </>
    );
}
