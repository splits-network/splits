import type { Metadata } from "next";
import SavedJobsContent from "./saved-jobs-content";

export const metadata: Metadata = {
    title: "Saved Jobs | Applicant Network",
    description: "View jobs you have saved for later.",
};

export default function SavedJobsPage() {
    return <SavedJobsContent />;
}
