import type {
    ApplicationNote,
    ApplicationNoteType,
    ApplicationNoteCreatorType,
    ApplicationNoteVisibility,
} from '@splits-network/shared-types';

export type { ApplicationNote, ApplicationNoteType, ApplicationNoteCreatorType, ApplicationNoteVisibility };

export interface ApplicationNotesConfig {
    /** The application ID to display/create notes for */
    applicationId: string;
    /** The current user's ID */
    currentUserId: string;
    /** The current user's creator type for new notes */
    currentUserCreatorType: ApplicationNoteCreatorType;
    /** Function to fetch notes from API */
    fetchNotes: (applicationId: string) => Promise<ApplicationNote[]>;
    /** Function to create a note */
    createNote: (data: CreateNoteData) => Promise<ApplicationNote>;
    /** Function to update a note */
    updateNote?: (noteId: string, data: UpdateNoteData) => Promise<ApplicationNote>;
    /** Function to delete a note */
    deleteNote?: (noteId: string) => Promise<void>;
    /** Whether the current user is on the candidate side */
    isOnCandidateSide?: boolean;
    /** Whether the current user is on the company side */
    isOnCompanySide?: boolean;
    /** Whether to allow adding notes (defaults to true) */
    allowAddNote?: boolean;
    /** Whether to allow editing notes (defaults to true for own notes) */
    allowEditNote?: boolean;
    /** Whether to allow deleting notes (defaults to true for own notes) */
    allowDeleteNote?: boolean;
    /** Custom empty state message */
    emptyStateMessage?: string;
}

export interface CreateNoteData {
    application_id: string;
    created_by_user_id: string;
    created_by_type: ApplicationNoteCreatorType;
    note_type: ApplicationNoteType;
    visibility: ApplicationNoteVisibility;
    message_text: string;
    in_response_to_id?: string;
}

export interface UpdateNoteData {
    message_text?: string;
    visibility?: ApplicationNoteVisibility;
}

// Note type display configuration
export const NOTE_TYPE_CONFIG: Record<ApplicationNoteType, { label: string; icon: string; color: string }> = {
    info_request: {
        label: 'Info Request',
        icon: 'fa-circle-question',
        color: 'badge-info',
    },
    info_response: {
        label: 'Response',
        icon: 'fa-message-check',
        color: 'badge-success',
    },
    note: {
        label: 'Note',
        icon: 'fa-sticky-note',
        color: 'badge-neutral',
    },
    improvement_request: {
        label: 'Improvement',
        icon: 'fa-arrow-up-right',
        color: 'badge-warning',
    },
    stage_transition: {
        label: 'Stage Change',
        icon: 'fa-arrow-right-arrow-left',
        color: 'badge-primary',
    },
    interview_feedback: {
        label: 'Interview',
        icon: 'fa-comments',
        color: 'badge-accent',
    },
    general: {
        label: 'General',
        icon: 'fa-comment',
        color: 'badge-neutral',
    },
};

// Creator type display configuration
export const CREATOR_TYPE_CONFIG: Record<ApplicationNoteCreatorType, { label: string; color: string }> = {
    candidate: {
        label: 'Candidate',
        color: 'text-info',
    },
    candidate_recruiter: {
        label: 'Recruiter',
        color: 'text-primary',
    },
    company_recruiter: {
        label: 'Company Recruiter',
        color: 'text-secondary',
    },
    hiring_manager: {
        label: 'Hiring Manager',
        color: 'text-accent',
    },
    company_admin: {
        label: 'Company Admin',
        color: 'text-warning',
    },
    platform_admin: {
        label: 'Admin',
        color: 'text-error',
    },
};

// Visibility display configuration
export const VISIBILITY_CONFIG: Record<ApplicationNoteVisibility, { label: string; icon: string; description: string }> = {
    shared: {
        label: 'All Parties',
        icon: 'fa-users',
        description: 'Visible to everyone on this application',
    },
    company_only: {
        label: 'Company Only',
        icon: 'fa-building',
        description: 'Only visible to company team members',
    },
    candidate_only: {
        label: 'Candidate Side',
        icon: 'fa-user',
        description: 'Only visible to candidate and their recruiter',
    },
};
