"use client";

import { useCallback } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import {
    ApplicationNotesPanel,
    type CreateNoteData,
} from "@splits-network/shared-ui";
import type { ApplicationNote } from "@splits-network/shared-types";

interface ApplicationNotesTabProps {
    applicationId: string;
}

export function ApplicationNotesTab({ applicationId }: ApplicationNotesTabProps) {
    const { user } = useUser();
    const { getToken } = useAuth();

    const fetchNotes = useCallback(
        async (appId: string): Promise<ApplicationNote[]> => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const response = await client.get(`/applications/${appId}/notes`);
            return response.data || [];
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const createNote = useCallback(
        async (data: CreateNoteData): Promise<ApplicationNote> => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const response = await client.post(
                `/applications/${data.application_id}/notes`,
                data,
            );
            return response.data;
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    const deleteNote = useCallback(
        async (noteId: string): Promise<void> => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            await client.delete(`/application-notes/${noteId}`);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    if (!user) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-regular fa-comments text-4xl mb-2 block" />
                <p>Sign in to view notes.</p>
            </div>
        );
    }

    return (
        <ApplicationNotesPanel
            applicationId={applicationId}
            currentUserId={user.id}
            currentUserCreatorType="candidate"
            fetchNotes={fetchNotes}
            createNote={createNote}
            deleteNote={deleteNote}
            isOnCandidateSide={true}
            isOnCompanySide={false}
            allowAddNote={true}
            allowDeleteNote={true}
            emptyStateMessage="No notes yet. Add one to communicate with your recruiter."
            maxHeight="500px"
        />
    );
}
