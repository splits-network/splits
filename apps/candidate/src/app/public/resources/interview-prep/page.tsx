import type { Metadata } from "next";
import { InterviewPrepContent } from "./interview-prep-content";

export const metadata: Metadata = {
    title: "Interview Prep",
    description: "Prepare for interviews with expert tips, questions, and strategies.",
};

export default function InterviewPrepPage() {
    return <InterviewPrepContent />;
}
