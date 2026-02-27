import type { Metadata } from "next";
import MatchesContent from "./matches-content";

export const metadata: Metadata = {
    title: "Your Matches | Applicant Network",
    description:
        "View your personalized job matches based on your skills, experience, and preferences.",
};

export default function MatchesPage() {
    return <MatchesContent />;
}
