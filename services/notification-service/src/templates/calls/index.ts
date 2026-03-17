/**
 * Call Email Templates -- Barrel Export
 * Templates for call confirmation, reminders, cancellation,
 * reschedule, recording ready, and instant call notifications.
 */

export { callConfirmationEmail } from './confirmation';
export type { CallConfirmationData } from './confirmation';

export { callReminderEmail } from './reminder';
export type { CallReminderData } from './reminder';

export { callCancellationEmail } from './cancellation';
export type { CallCancellationData } from './cancellation';

export { callRescheduleEmail } from './reschedule';
export type { CallRescheduleData } from './reschedule';

export { callRecordingReadyEmail } from './recording-ready';
export type { CallRecordingReadyData } from './recording-ready';

export { instantCallEmail } from './instant-call';
export type { InstantCallData } from './instant-call';
