"use client";

import {
    CalendarProvider,
    useCalendar,
} from "@/components/basel/calendar/calendar-context";
import CalendarHeaderSection from "@/components/basel/calendar/calendar-header-section";
import CalendarSplitView from "@/components/basel/calendar/calendar-split-view";
import CreateEventModal from "@/components/basel/calendar/create-event-modal";

function CalendarPageInner() {
    const { showCreate, closeCreate, refresh, prefillTime } = useCalendar();

    return (
        <>
            <CalendarHeaderSection />

            <section className="bg-base-100">
                <div className="container mx-auto px-4 lg:px-8 py-8 lg:py-12">
                    <CalendarSplitView />
                </div>
            </section>

            {/* Footer accent */}
            <section className="bg-neutral text-neutral-content py-8">
                <div className="container mx-auto px-6 lg:px-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-calendar text-primary-content" />
                            </div>
                            <div>
                                <p className="text-sm font-bold">
                                    Splits Network Calendar
                                </p>
                                <p className="text-sm opacity-50">
                                    View and manage your schedule from connected
                                    calendar accounts
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6 text-sm opacity-50">
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-plug" />
                                Google &amp; Outlook
                            </span>
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-lock" />
                                OAuth secured
                            </span>
                            <span className="flex items-center gap-1.5">
                                <i className="fa-duotone fa-regular fa-video" />
                                Meet &amp; Teams
                            </span>
                        </div>
                    </div>
                </div>
            </section>

            {showCreate && (
                <CreateEventModal
                    onClose={closeCreate}
                    onSuccess={() => {
                        closeCreate();
                        refresh();
                    }}
                    prefillDate={prefillTime?.date}
                    prefillStartTime={prefillTime?.startTime}
                />
            )}
        </>
    );
}

export default function CalendarPage() {
    return (
        <CalendarProvider>
            <CalendarPageInner />
        </CalendarProvider>
    );
}
