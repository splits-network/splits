/**
 * Interview Email Templates — Barrel Export
 * Templates for interview scheduling, cancellation, and rescheduling notifications.
 */

export {
    interviewScheduledEmail,
    interviewCancelledEmail,
    interviewRescheduledEmail,
    rescheduleRequestedEmail,
} from './interviewer-emails';

export type {
    InterviewerScheduledData,
    InterviewerCancelledData,
    InterviewerRescheduledData,
    RescheduleRequestedData,
} from './interviewer-emails';

export {
    candidateInterviewScheduledEmail,
    candidateInterviewCancelledEmail,
    candidateInterviewRescheduledEmail,
    candidateRescheduleAcceptedEmail,
} from './candidate-emails';

export type {
    CandidateInterviewScheduledData,
    CandidateInterviewCancelledData,
    CandidateInterviewRescheduledData,
    CandidateRescheduleAcceptedData,
} from './candidate-emails';
