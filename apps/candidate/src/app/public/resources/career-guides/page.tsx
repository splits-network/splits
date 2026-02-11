import type { Metadata } from "next";
import { CareerGuidesContent } from "./career-guides-content";
import { buildCanonical } from "@/lib/seo";

export const metadata: Metadata = {
    title: "Career Guides",
    description: "Actionable career guides to help you grow, switch roles, and negotiate offers.",
    ...buildCanonical("/public/resources/career-guides"),
};

export default function CareerGuidesPage() {
    return <CareerGuidesContent />;
}