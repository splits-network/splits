"use client";

import { useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { createAuthenticatedClient } from "@/lib/api-client";
import { useUserProfile } from "@/contexts";
import {
    ApplicationNotesPanel,
    type CreateNoteData,
} from "@splits-network/shared-ui";
import type {
    ApplicationNote,
    ApplicationNoteCreatorType,
} from "@splits-network/shared-types";

interface NotesTabProps {
    applicationId: string;
}

export function ApplicationNotesTab({ applicationId }: NotesTabProps) {
    const { getToken } = useAuth();
    const { profile, isRecruiter, isCompanyUser } = useUserProfile();

    const getCreatorType = (): ApplicationNoteCreatorType => {
        if (profile?.is_platform_admin) return "platform_admin";
        if (isRecruiter) return "candidate_recruiter";
        if (isCompanyUser) {
            if (profile?.roles.includes("hiring_manager")) return "hiring_manager";
            return "company_admin";
        }
        return "candidate";
    };

    const fetchNotes = useCallback(
        async (appId: string): Promise<ApplicationNote[]> => {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");
            const client = createAuthenticatedClient(token);
            const response = await client.get(`/application-notes`, { params: { application_id: appId } });
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
            const response = await client.post(`/application-notes`, data);
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

    if (!profile) {
        return (
            <div className="text-center p-8 text-base-content/50">
                <i className="fa-duotone fa-comments text-4xl mb-2 block" />
                <p>Loading profile...</p>
            </div>
        );
    }

    return (
        <ApplicationNotesPanel
            applicationId={applicationId}
            currentUserId={profile.id}
            currentUserCreatorType={getCreatorType()}
            fetchNotes={fetchNotes}
            createNote={createNote}
            deleteNote={deleteNote}
            isOnCandidateSide={isRecruiter || !isCompanyUser}
            isOnCompanySide={isCompanyUser}
            allowAddNote={true}
            allowDeleteNote={true}
            emptyStateMessage="No notes yet. Add a note to begin the discussion."
            maxHeight="500px"
        />
    );
}
