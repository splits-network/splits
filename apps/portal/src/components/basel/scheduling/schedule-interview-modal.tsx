"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@clerk/nextjs";
import gsap from "gsap";
import { createAuthenticatedClient } from "@/lib/api-client";
import type {
    OAuthConnectionPublic,
    CalendarInfo,
    CalendarEvent,
} from "@splits-network/shared-types";
import { ModalPortal } from "@splits-network/shared-ui";

/* ─── Types ────────────────────────────────────────────────────────────── */

interface ScheduleInterviewModalProps {
    candidateName: string;
    candidateEmail?: string;
    jobTitle?: string;
    onClose: () => void;
    onSuccess?: (event: CalendarEvent) => void;
}

type Step = "select-calendar" | "pick-time" | "confirm";

/* ─── Component ────────────────────────────────────────────────────────── */

export default function ScheduleInterviewModal({
    candidateName,
    candidateEmail,
    jobTitle,
    onClose,
    onSuccess,
}: ScheduleInterviewModalProps) {
    const { getToken } = useAuth();
    const panelRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);

    /* ── State ── */
    const [step, setStep] = useState<Step>("select-calendar");
    const [connections, setConnections] = useState<OAuthConnectionPublic[]>([]);
    const [calendars, setCalendars] = useState<CalendarInfo[]>([]);
    const [selectedConnection, setSelectedConnection] = useState<OAuthConnectionPublic | null>(null);
    const [selectedCalendar, setSelectedCalendar] = useState<CalendarInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    /* ── Form fields ── */
    const [title, setTitle] = useState(
        jobTitle
            ? `Interview: ${candidateName} — ${jobTitle}`
            : `Interview with ${candidateName}`,
    );
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [startTime, setStartTime] = useState("09:00");
    const [duration, setDuration] = useState(60);
    const [timeZone, setTimeZone] = useState(
        Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    const [addMeet, setAddMeet] = useState(true);
    const [attendeeEmails, setAttendeeEmails] = useState(candidateEmail || "");

    /* ── GSAP entrance (runs after portal mounts into DOM) ── */
    useEffect(() => {
        if (!panelRef.current || !backdropRef.current) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            gsap.set(panelRef.current, { x: 0, opacity: 1 });
            gsap.set(backdropRef.current, { opacity: 1 });
            return;
        }
        const ctx = gsap.context(() => {
            gsap.fromTo(
                backdropRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.3, ease: "power3.out" },
            );
            gsap.fromTo(
                panelRef.current,
                { x: "100%", opacity: 0 },
                { x: 0, opacity: 1, duration: 0.4, ease: "power3.out", delay: 0.1 },
            );
        });
        return () => ctx.revert();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Fetch calendar connections ── */
    const fetchConnections = useCallback(async () => {
        try {
            const token = await getToken();
            if (!token) return;
            const client = createAuthenticatedClient(token);
            const res = await client.get("/integrations/connections") as { data: OAuthConnectionPublic[] };
            const calendarConns = (res.data ?? []).filter(
                (c) => c.provider_slug.includes("calendar") && c.status === "active",
            );
            setConnections(calendarConns);

            // Auto-select if only one
            if (calendarConns.length === 1) {
                setSelectedConnection(calendarConns[0]);
                await fetchCalendars(calendarConns[0].id, token);
            }
        } catch (err: any) {
            setError("Failed to load calendar connections");
        } finally {
            setLoading(false);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const fetchCalendars = async (connectionId: string, token?: string) => {
        try {
            const t = token || (await getToken());
            if (!t) return;
            const client = createAuthenticatedClient(t);
            const res = await client.get(
                `/integrations/calendar/${connectionId}/calendars`,
            ) as { data: CalendarInfo[] };
            const cals = res.data ?? [];
            setCalendars(cals);

            // Auto-select primary calendar
            const primary = cals.find((c) => c.primary);
            if (primary) setSelectedCalendar(primary);
        } catch (err: any) {
            setError("Failed to load calendars. Your connection may have expired.");
        }
    };

    useEffect(() => {
        fetchConnections();
    }, [fetchConnections]);

    /* ── Handlers ── */

    const handleSelectConnection = async (conn: OAuthConnectionPublic) => {
        setSelectedConnection(conn);
        setCalendars([]);
        setSelectedCalendar(null);
        await fetchCalendars(conn.id);
    };

    const handleNext = () => {
        if (step === "select-calendar" && selectedCalendar) {
            setStep("pick-time");
        } else if (step === "pick-time" && date && startTime) {
            setStep("confirm");
        }
    };

    const handleBack = () => {
        if (step === "confirm") setStep("pick-time");
        else if (step === "pick-time") setStep("select-calendar");
    };

    const handleSubmit = async () => {
        if (!selectedConnection || !selectedCalendar || !date || !startTime) return;
        setSubmitting(true);
        setError("");

        try {
            const token = await getToken();
            if (!token) throw new Error("Not authenticated");

            const client = createAuthenticatedClient(token);

            const startDateTime = `${date}T${startTime}:00`;
            const endMs = new Date(`${date}T${startTime}:00`).getTime() + duration * 60_000;
            const endDate = new Date(endMs);
            const endDateTime = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, "0")}-${String(endDate.getDate()).padStart(2, "0")}T${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}:00`;

            const emails = attendeeEmails
                .split(",")
                .map((e) => e.trim())
                .filter(Boolean);

            const res = await client.post(
                `/integrations/calendar/${selectedConnection.id}/events`,
                {
                    calendar_id: selectedCalendar.id,
                    summary: title,
                    description,
                    start_date_time: startDateTime,
                    end_date_time: endDateTime,
                    time_zone: timeZone,
                    attendee_emails: emails,
                    add_video_conference: addMeet,
                },
            ) as { data: CalendarEvent };

            onSuccess?.(res.data);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to create event");
        } finally {
            setSubmitting(false);
        }
    };

    /* ── No calendar connections ── */
    const noConnections = !loading && connections.length === 0;

    /* ── Render ── */
    return (
        <ModalPortal>
            {/* Backdrop */}
            <div
                ref={backdropRef}
                className="fixed inset-0 z-50 bg-black/40 opacity-0"
                onClick={onClose}
            />

            {/* Slide-over panel */}
            <div
                ref={panelRef}
                className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-base-100 shadow-2xl flex flex-col opacity-0"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-primary px-6 py-5 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary-content/60">
                            Schedule Interview
                        </p>
                        <h2 className="text-lg font-black text-primary-content mt-0.5">
                            {candidateName}
                        </h2>
                        {jobTitle && (
                            <p className="text-xs text-primary-content/70 mt-0.5">{jobTitle}</p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle text-primary-content hover:bg-primary-content/10"
                    >
                        <i className="fa-solid fa-xmark text-lg" />
                    </button>
                </div>

                {/* Step indicator */}
                <div className="px-6 py-3 border-b border-base-300 flex items-center gap-2 text-xs">
                    {(["select-calendar", "pick-time", "confirm"] as Step[]).map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            {i > 0 && <div className="w-6 h-px bg-base-300" />}
                            <div
                                className={`w-6 h-6 flex items-center justify-center text-[10px] font-bold ${
                                    step === s
                                        ? "bg-primary text-primary-content"
                                        : "bg-base-200 text-base-content/40"
                                }`}
                            >
                                {i + 1}
                            </div>
                            <span
                                className={`font-semibold ${
                                    step === s ? "text-base-content" : "text-base-content/40"
                                }`}
                            >
                                {s === "select-calendar" ? "Calendar" : s === "pick-time" ? "Date & Time" : "Confirm"}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    {/* Error */}
                    {error && (
                        <div className="bg-error/5 border-l-4 border-error px-4 py-3 mb-5">
                            <p className="text-sm font-semibold text-error">{error}</p>
                        </div>
                    )}

                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-16">
                            <span className="loading loading-spinner loading-md" />
                        </div>
                    )}

                    {/* No connections */}
                    {noConnections && (
                        <div className="text-center py-12">
                            <div className="w-16 h-16 bg-base-200 border border-base-300 flex items-center justify-center mx-auto mb-4">
                                <i className="fa-duotone fa-regular fa-calendar-xmark text-2xl text-base-content/30" />
                            </div>
                            <p className="text-sm font-bold text-base-content/50 mb-2">
                                No calendar connected
                            </p>
                            <p className="text-xs text-base-content/40 mb-4">
                                Connect Google Calendar or Microsoft Outlook to schedule interviews directly from Splits.
                            </p>
                            <a
                                href="/portal/integrations-basel"
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: 0 }}
                            >
                                <i className="fa-duotone fa-regular fa-plug mr-2" />
                                Connect Calendar
                            </a>
                        </div>
                    )}

                    {/* Step 1: Select Calendar */}
                    {!loading && !noConnections && step === "select-calendar" && (
                        <div className="space-y-4">
                            {/* Connection selector (if multiple) */}
                            {connections.length > 1 && (
                                <fieldset>
                                    <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                        Calendar Account
                                    </legend>
                                    <div className="space-y-2">
                                        {connections.map((conn) => (
                                            <button
                                                key={conn.id}
                                                onClick={() => handleSelectConnection(conn)}
                                                className={`w-full text-left px-4 py-3 border transition-colors ${
                                                    selectedConnection?.id === conn.id
                                                        ? "border-primary bg-primary/5"
                                                        : "border-base-300 hover:border-primary/30"
                                                }`}
                                            >
                                                <p className="text-sm font-bold">{conn.provider_account_name || conn.provider_slug}</p>
                                                <p className="text-xs text-base-content/50">{conn.provider_account_id}</p>
                                            </button>
                                        ))}
                                    </div>
                                </fieldset>
                            )}

                            {/* Calendar selector */}
                            {calendars.length > 0 && (
                                <fieldset>
                                    <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                        Calendar
                                    </legend>
                                    <div className="space-y-2">
                                        {calendars
                                            .filter((c) => c.accessRole === "owner" || c.accessRole === "writer")
                                            .map((cal) => (
                                                <button
                                                    key={cal.id}
                                                    onClick={() => setSelectedCalendar(cal)}
                                                    className={`w-full text-left px-4 py-3 border transition-colors ${
                                                        selectedCalendar?.id === cal.id
                                                            ? "border-primary bg-primary/5"
                                                            : "border-base-300 hover:border-primary/30"
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <i className="fa-duotone fa-regular fa-calendar text-primary" />
                                                        <div>
                                                            <p className="text-sm font-bold">
                                                                {cal.summary}
                                                                {cal.primary && (
                                                                    <span className="ml-2 text-[10px] font-bold uppercase bg-primary/10 text-primary px-1.5 py-0.5">
                                                                        Primary
                                                                    </span>
                                                                )}
                                                            </p>
                                                            {cal.description && (
                                                                <p className="text-xs text-base-content/50">{cal.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                    </div>
                                </fieldset>
                            )}

                            {selectedConnection && calendars.length === 0 && !loading && (
                                <div className="text-center py-8">
                                    <span className="loading loading-spinner loading-sm" />
                                    <p className="text-xs text-base-content/50 mt-2">Loading calendars...</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 2: Pick Date & Time */}
                    {step === "pick-time" && (
                        <div className="space-y-4">
                            <fieldset>
                                <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Event Title
                                </legend>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="input input-bordered w-full"
                                    style={{ borderRadius: 0 }}
                                />
                            </fieldset>

                            <div className="grid grid-cols-2 gap-4">
                                <fieldset>
                                    <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                        Date
                                    </legend>
                                    <input
                                        type="date"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                        className="input input-bordered w-full"
                                        style={{ borderRadius: 0 }}
                                    />
                                </fieldset>

                                <fieldset>
                                    <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                        Start Time
                                    </legend>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="input input-bordered w-full"
                                        style={{ borderRadius: 0 }}
                                    />
                                </fieldset>
                            </div>

                            <fieldset>
                                <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Duration
                                </legend>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="select select-bordered w-full"
                                    style={{ borderRadius: 0 }}
                                >
                                    <option value={15}>15 minutes</option>
                                    <option value={30}>30 minutes</option>
                                    <option value={45}>45 minutes</option>
                                    <option value={60}>1 hour</option>
                                    <option value={90}>1.5 hours</option>
                                    <option value={120}>2 hours</option>
                                </select>
                            </fieldset>

                            <fieldset>
                                <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Description
                                </legend>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Interview notes, preparation details..."
                                    rows={3}
                                    className="textarea textarea-bordered w-full"
                                    style={{ borderRadius: 0 }}
                                />
                            </fieldset>

                            <fieldset>
                                <legend className="text-xs font-bold uppercase tracking-wider text-base-content/50 mb-2">
                                    Attendee Emails
                                </legend>
                                <input
                                    type="text"
                                    value={attendeeEmails}
                                    onChange={(e) => setAttendeeEmails(e.target.value)}
                                    placeholder="email1@example.com, email2@example.com"
                                    className="input input-bordered w-full"
                                    style={{ borderRadius: 0 }}
                                />
                                <p className="text-[11px] text-base-content/40 mt-1">
                                    Comma-separated email addresses
                                </p>
                            </fieldset>

                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={addMeet}
                                    onChange={(e) => setAddMeet(e.target.checked)}
                                    className="checkbox checkbox-sm checkbox-primary"
                                />
                                <span className="text-sm font-semibold">
                                    {selectedConnection?.provider_slug.startsWith("microsoft_") ? (
                                        <>
                                            <i className="fa-brands fa-microsoft mr-1.5 text-primary" />
                                            Add Teams meeting link
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa-brands fa-google mr-1.5 text-primary" />
                                            Add Google Meet link
                                        </>
                                    )}
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Step 3: Confirm */}
                    {step === "confirm" && (
                        <div className="space-y-4">
                            <div className="bg-base-200 border border-base-300 p-5">
                                <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-base-content/50 mb-3">
                                    Review Details
                                </p>

                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs font-bold text-base-content/50 uppercase">Title</p>
                                        <p className="text-sm font-semibold">{title}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <p className="text-xs font-bold text-base-content/50 uppercase">Date</p>
                                            <p className="text-sm font-semibold">
                                                {new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                                                    weekday: "long",
                                                    month: "long",
                                                    day: "numeric",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-base-content/50 uppercase">Time</p>
                                            <p className="text-sm font-semibold">
                                                {startTime} ({duration} min)
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-base-content/50 uppercase">Calendar</p>
                                        <p className="text-sm font-semibold">{selectedCalendar?.summary}</p>
                                    </div>

                                    {description && (
                                        <div>
                                            <p className="text-xs font-bold text-base-content/50 uppercase">Description</p>
                                            <p className="text-sm text-base-content/70">{description}</p>
                                        </div>
                                    )}

                                    {attendeeEmails && (
                                        <div>
                                            <p className="text-xs font-bold text-base-content/50 uppercase">Attendees</p>
                                            <p className="text-sm text-base-content/70">{attendeeEmails}</p>
                                        </div>
                                    )}

                                    {addMeet && (
                                        <div className="flex items-center gap-2 pt-1">
                                            {selectedConnection?.provider_slug.startsWith("microsoft_") ? (
                                                <>
                                                    <i className="fa-brands fa-microsoft text-primary text-sm" />
                                                    <p className="text-sm font-semibold text-primary">Teams meeting included</p>
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fa-brands fa-google text-primary text-sm" />
                                                    <p className="text-sm font-semibold text-primary">Google Meet included</p>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                {!loading && !noConnections && (
                    <div className="px-6 py-4 border-t border-base-300 flex items-center justify-between">
                        {step !== "select-calendar" ? (
                            <button
                                onClick={handleBack}
                                className="btn btn-ghost btn-sm"
                                style={{ borderRadius: 0 }}
                            >
                                <i className="fa-solid fa-arrow-left mr-2" />
                                Back
                            </button>
                        ) : (
                            <div />
                        )}

                        {step === "confirm" ? (
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: 0 }}
                            >
                                {submitting ? (
                                    <span className="loading loading-spinner loading-xs" />
                                ) : (
                                    <>
                                        <i className="fa-duotone fa-regular fa-calendar-check mr-2" />
                                        Create Event
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={
                                    (step === "select-calendar" && !selectedCalendar) ||
                                    (step === "pick-time" && (!date || !startTime))
                                }
                                className="btn btn-primary btn-sm"
                                style={{ borderRadius: 0 }}
                            >
                                Next
                                <i className="fa-solid fa-arrow-right ml-2" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </ModalPortal>
    );
}
