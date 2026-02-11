import type { Metadata } from "next";
import { InterviewPrepContent } from "./interview-prep-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Interview Prep",
    description: "Prepare for interviews with expert tips, questions, and strategies.",
    ...buildCanonical("/public/resources/interview-prep"),
};

export default function InterviewPrepPage() {
    return <InterviewPrepContent />;
}