import type { Metadata } from "next";
import ContactMemphisClient from "./contact-memphis-client";

export const metadata: Metadata = {
    title: "Contact Us | Applicant Network",
    description:
        "Get in touch with the Applicant Network team. Questions about jobs, applications, or your profile? We're here to help you land your next role.",
};

export default function ContactMemphisPage() {
    return <ContactMemphisClient />;
}
