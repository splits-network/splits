import type { Metadata } from "next";
import { SuccessStoriesContent } from "./success-stories-content";

export const metadata: Metadata = {
    title: "Success Stories",
    description: "Read real stories from candidates who landed roles through Applicant Network.",
};

export default function SuccessStoriesPage() {
    return <SuccessStoriesContent />;
}
