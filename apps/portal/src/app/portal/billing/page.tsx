import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import BillingContent from "./billing-content";

export default async function BillingMemphisPage() {
    const { getToken } = await auth();

    const token = await getToken();
    if (!token) {
        redirect("/sign-in");
    }

    return <BillingContent />;
}
