import type { Metadata } from "next";
import { UpdatesContent } from "./updates-content";

export const metadata: Metadata = {
    title: "Product Updates",
    description: "Latest releases and improvements across the Splits Network platform.",
};

export default function UpdatesPage() {
    return <UpdatesContent />;
}
