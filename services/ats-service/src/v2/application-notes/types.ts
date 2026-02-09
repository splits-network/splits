import { ApplicationNote, ApplicationNoteType, ApplicationNoteCreatorType, ApplicationNoteVisibility } from '@splits-network/shared-types';

export interface ApplicationNoteFilters {
    application_id?: string;
    note_type?: ApplicationNoteType;
    created_by_type?: ApplicationNoteCreatorType;
    visibility?: ApplicationNoteVisibility;
    in_response_to_id?: string;
    page?: number;
    limit?: number;
}

export interface ApplicationNoteCreate {
    application_id: string;
    created_by_user_id: string;
    created_by_type: ApplicationNoteCreatorType;
    note_type: ApplicationNoteType;
    visibility: ApplicationNoteVisibility;
    message_text: string;
    in_response_to_id?: string;
}

export interface ApplicationNoteUpdate {
    message_text?: string;
    visibility?: ApplicationNoteVisibility;
}

// Re-export types for convenience
export type { ApplicationNote, ApplicationNoteType, ApplicationNoteCreatorType, ApplicationNoteVisibility };
