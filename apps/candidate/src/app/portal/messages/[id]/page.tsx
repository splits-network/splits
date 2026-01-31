import { redirect } from "next/navigation";

interface MessageThreadPageProps {
    params: Promise<{ id: string }>;
}

export default async function CandidateMessageThreadPage({
    params,
}: MessageThreadPageProps) {
    const { id } = await params;
    redirect(`/portal/messages?conversationId=${id}`);
}
