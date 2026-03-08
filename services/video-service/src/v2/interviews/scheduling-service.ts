import { InterviewRepository } from './repository';
import { IEventPublisher } from '../shared/events';
import { Interview, InterviewRescheduleRequest } from './types';

interface BusySlot {
    start: string;
    end: string;
}

interface AvailableSlotParams {
    busySlots: BusySlot[];
    startDate: string;
    endDate: string;
    workingHoursStart: string;
    workingHoursEnd: string;
    workingDays: number[];
    timezone: string;
    durationMinutes: number;
}

interface TimeSlot {
    start: string;
    end: string;
}

export class SchedulingService {
    constructor(
        private repository: InterviewRepository,
        private eventPublisher: IEventPublisher,
    ) {}

    /**
     * Compute available time slots given busy periods and working hour constraints.
     * All times handled in the specified timezone using Intl.DateTimeFormat.
     */
    getAvailableSlots(params: AvailableSlotParams): TimeSlot[] {
        const {
            busySlots,
            startDate,
            endDate,
            workingHoursStart,
            workingHoursEnd,
            workingDays,
            timezone,
            durationMinutes,
        } = params;

        const slots: TimeSlot[] = [];
        const [workStartHour, workStartMin] = workingHoursStart.split(':').map(Number);
        const [workEndHour, workEndMin] = workingHoursEnd.split(':').map(Number);

        // Parse busy slots into epoch ranges for fast overlap checks
        const busyRanges = busySlots.map((b) => ({
            start: new Date(b.start).getTime(),
            end: new Date(b.end).getTime(),
        }));

        // Iterate day by day from startDate to endDate
        const current = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');

        while (current <= end) {
            const dayOfWeek = getIsoDayOfWeek(current);

            if (workingDays.includes(dayOfWeek)) {
                // Build working hours start/end in the target timezone for this day
                const dayStr = formatDateInTimezone(current, timezone);
                const workStart = new Date(
                    `${dayStr}T${pad(workStartHour)}:${pad(workStartMin)}:00`,
                );
                const workEnd = new Date(
                    `${dayStr}T${pad(workEndHour)}:${pad(workEndMin)}:00`,
                );

                // Adjust for timezone: create dates in the target timezone
                const workStartUtc = dateInTimezone(dayStr, workStartHour, workStartMin, timezone);
                const workEndUtc = dateInTimezone(dayStr, workEndHour, workEndMin, timezone);

                // Generate 30-minute increment candidate slots
                const slotIncrementMs = 30 * 60 * 1000;
                const durationMs = durationMinutes * 60 * 1000;
                let slotStart = workStartUtc;

                while (slotStart + durationMs <= workEndUtc) {
                    const slotEnd = slotStart + durationMs;

                    // Check if this slot overlaps with any busy period
                    const overlaps = busyRanges.some(
                        (busy) => slotStart < busy.end && slotEnd > busy.start,
                    );

                    if (!overlaps) {
                        slots.push({
                            start: new Date(slotStart).toISOString(),
                            end: new Date(slotEnd).toISOString(),
                        });
                    }

                    slotStart += slotIncrementMs;
                }
            }

            // Move to next day
            current.setDate(current.getDate() + 1);
        }

        return slots;
    }

    /**
     * Reschedule an interview to a new time.
     */
    async rescheduleInterview(
        interviewId: string,
        newScheduledAt: string,
        newDurationMinutes?: number,
        reason?: string,
        rescheduledByUserId?: string,
    ): Promise<Interview> {
        const interview = await this.repository.findById(interviewId);
        if (!interview) {
            throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
        }

        if (interview.status !== 'scheduled') {
            throw Object.assign(
                new Error(`Cannot reschedule interview with status '${interview.status}'`),
                { statusCode: 400 },
            );
        }

        const newTime = new Date(newScheduledAt);
        if (newTime <= new Date()) {
            throw Object.assign(
                new Error('New scheduled time must be in the future'),
                { statusCode: 400 },
            );
        }

        const oldScheduledAt = interview.scheduled_at;

        const updates: Record<string, any> = {
            scheduled_at: newScheduledAt,
            reschedule_count: interview.reschedule_count + 1,
            reschedule_notes: reason || null,
            reschedule_requested_by: rescheduledByUserId || null,
            reschedule_requested_at: new Date().toISOString(),
        };

        // Preserve original time on first reschedule
        if (!interview.original_scheduled_at) {
            updates.original_scheduled_at = oldScheduledAt;
        }

        if (newDurationMinutes !== undefined) {
            updates.scheduled_duration_minutes = newDurationMinutes;
        }

        const updated = await this.repository.updateInterview(interviewId, updates);

        await this.eventPublisher.publish('interview.rescheduled', {
            interview_id: interviewId,
            application_id: interview.application_id,
            old_scheduled_at: oldScheduledAt,
            new_scheduled_at: newScheduledAt,
            reason: reason || null,
            rescheduled_by: rescheduledByUserId || null,
        });

        return updated;
    }

    /**
     * Create a reschedule request (typically from candidate via magic link).
     */
    async createRescheduleRequest(
        interviewId: string,
        requestedBy: string,
        requestedByUserId: string | undefined,
        proposedTimes: Array<{ start: string; end: string }>,
        notes?: string,
    ): Promise<InterviewRescheduleRequest> {
        const interview = await this.repository.findById(interviewId);
        if (!interview) {
            throw Object.assign(new Error('Interview not found'), { statusCode: 404 });
        }

        if (interview.status !== 'scheduled') {
            throw Object.assign(
                new Error(`Cannot request reschedule for interview with status '${interview.status}'`),
                { statusCode: 400 },
            );
        }

        // Candidates can only reschedule up to 2 times
        if (requestedBy === 'candidate' && interview.reschedule_count >= 2) {
            throw Object.assign(
                new Error('Maximum reschedule limit reached for this interview'),
                { statusCode: 400 },
            );
        }

        if (!proposedTimes || proposedTimes.length === 0) {
            throw Object.assign(
                new Error('At least one proposed time is required'),
                { statusCode: 400 },
            );
        }

        const request = await this.repository.createRescheduleRequest({
            interview_id: interviewId,
            requested_by: requestedBy,
            requested_by_user_id: requestedByUserId,
            proposed_times: proposedTimes,
            notes,
        });

        await this.eventPublisher.publish('interview.reschedule_requested', {
            interview_id: interviewId,
            application_id: interview.application_id,
            request_id: request.id,
            requested_by: requestedBy,
            proposed_times: proposedTimes,
        });

        return request;
    }

    /**
     * Accept a reschedule request and reschedule the interview.
     */
    async acceptRescheduleRequest(
        requestId: string,
        acceptedTime: string,
    ): Promise<Interview> {
        const request = await this.repository.findRescheduleRequestById(requestId);
        if (!request) {
            throw Object.assign(new Error('Reschedule request not found'), { statusCode: 404 });
        }

        if (request.status !== 'pending') {
            throw Object.assign(
                new Error(`Reschedule request is already '${request.status}'`),
                { statusCode: 400 },
            );
        }

        // Update request status
        await this.repository.updateRescheduleRequest(requestId, {
            status: 'accepted',
            accepted_time: acceptedTime,
        });

        // Reschedule the interview
        const updated = await this.rescheduleInterview(
            request.interview_id,
            acceptedTime,
        );

        await this.eventPublisher.publish('interview.reschedule_accepted', {
            interview_id: request.interview_id,
            request_id: requestId,
            accepted_time: acceptedTime,
        });

        return updated;
    }
}

/** Get ISO day of week (1=Monday, 7=Sunday) from a Date */
function getIsoDayOfWeek(date: Date): number {
    const day = date.getDay();
    return day === 0 ? 7 : day;
}

/** Pad a number to 2 digits */
function pad(n: number): string {
    return n.toString().padStart(2, '0');
}

/** Format a Date as YYYY-MM-DD string in a given timezone */
function formatDateInTimezone(date: Date, timezone: string): string {
    const formatter = new Intl.DateTimeFormat('en-CA', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    return formatter.format(date);
}

/**
 * Convert a date string + hours/minutes in a timezone to a UTC epoch timestamp.
 * Uses the timezone offset to compute the correct UTC time.
 */
function dateInTimezone(
    dateStr: string,
    hours: number,
    minutes: number,
    timezone: string,
): number {
    // Create a date at the specified local time (treating as UTC first)
    const utcGuess = new Date(`${dateStr}T${pad(hours)}:${pad(minutes)}:00Z`);

    // Get the offset for this timezone at this approximate time
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });

    const parts = formatter.formatToParts(utcGuess);
    const tzHour = Number(parts.find((p) => p.type === 'hour')?.value || '0');
    const tzMin = Number(parts.find((p) => p.type === 'minute')?.value || '0');

    // The difference between what we asked for in UTC and what the timezone shows
    // tells us the offset
    const utcMinutes = utcGuess.getUTCHours() * 60 + utcGuess.getUTCMinutes();
    const tzMinutes = tzHour * 60 + tzMin;
    const offsetMinutes = tzMinutes - utcMinutes;

    // The actual UTC time = local time - offset
    const targetUtc = new Date(`${dateStr}T${pad(hours)}:${pad(minutes)}:00Z`);
    targetUtc.setMinutes(targetUtc.getMinutes() - offsetMinutes);

    return targetUtc.getTime();
}
