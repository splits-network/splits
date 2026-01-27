import CandidatesListClient from "./components/candidates-list-client";
import CandidateHeader from "./components/candidate-header";
import { PageTitle } from "@/components/page-title";

export default function CandidatesPage() {
    return (
        <>
            <PageTitle
                title="Candidates"
                subtitle="Manage your candidate pipeline"
            />
            <div className="space-y-6">
                {/* <CandidateHeader /> */}
                <CandidatesListClient />
            </div>
        </>
    );
}
