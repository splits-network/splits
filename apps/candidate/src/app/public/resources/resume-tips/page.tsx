import type { Metadata } from "next";
import { ResumeTipsContent } from "./resume-tips-content";

export const metadata: Metadata = {
    title: "Resume Tips",
    description: "Craft a standout resume with proven tips and examples.",
};

export default function ResumeTipsPage() {
    return <ResumeTipsContent />;
}
