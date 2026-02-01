import type { Metadata } from "next";
import { CareerGuidesContent } from "./career-guides-content";

export const metadata: Metadata = {
    title: "Career Guides",
    description: "Actionable career guides to help you grow, switch roles, and negotiate offers.",
};

export default function CareerGuidesPage() {
    return <CareerGuidesContent />;
}
