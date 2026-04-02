/**
 * Call Email Templates -- Barrel Export
 * Templates for call confirmation, reminders, cancellation,
 * reschedule, recording ready, and instant call notifications.
 */

export { callConfirmationEmail } from './confirmation.js';
export type { CallConfirmationData } from './confirmation.js';

export { callReminderEmail } from './reminder.js';
export type { CallReminderData } from './reminder.js';

export { callCancellationEmail } from './cancellation.js';
export type { CallCancellationData } from './cancellation.js';

export { callRescheduleEmail } from './reschedule.js';
export type { CallRescheduleData } from './reschedule.js';

export { callRecordingReadyEmail } from './recording-ready.js';
export type { CallRecordingReadyData } from './recording-ready.js';

export { instantCallEmail } from './instant-call.js';
export type { InstantCallData } from './instant-call.js';
