import { ApplicationFeedback, ApplicationFeedbackType, ApplicationFeedbackCreatorType } from '@splits-network/shared-types';

export interface ApplicationFeedbackFilters {
    application_id?: string;
    feedback_type?: ApplicationFeedbackType;
    created_by_type?: ApplicationFeedbackCreatorType;
    in_response_to_id?: string;
    page?: number;
    limit?: number;
}

export interface ApplicationFeedbackCreate {
    application_id: string;
    created_by_user_id: string;
    created_by_type: ApplicationFeedbackCreatorType;
    feedback_type: ApplicationFeedbackType;
    message_text: string;
    in_response_to_id?: string;
}

export interface ApplicationFeedbackUpdate {
    message_text?: string;
}
