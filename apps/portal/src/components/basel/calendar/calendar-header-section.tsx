"use client";

/**
 * Basel editorial header for calendar — diagonal clip-path accent,
 * large display heading, stat bar.
 */

import { useCalendar } from "./calendar-context";

export default function CalendarHeaderSection() {
    const { events, calendars, connections } = useCalendar();

    const upcomingCount = events.filter((e) => {
        const start = e.start.dateTime || e.start.date;
        return start && new Date(start) > new Date();
    }).length;

    return (
        <section className="relative bg-neutral text-neutral-content py-12 lg:py-16">
            {/* Diagonal accent bar */}
            <div
                className="absolute top-0 right-0 w-1/3 h-full bg-primary/10"
                style={{
                    clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
                }}
            />

            <div className="relative container mx-auto px-6 lg:px-12">
                <div className="max-w-4xl">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary mb-3">
                        Calendar Hub
                    </p>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-black leading-[0.92] tracking-tight mb-6">
                        <span className="inline-block">Your</span>{" "}
                        <span className="inline-block text-primary">
                            schedule.
                        </span>{" "}
                        <br className="hidden md:block" />
                        <span className="inline-block">Organized.</span>
                    </h1>

                    {/* Stat bar */}
                    <div className="flex flex-wrap gap-8 mt-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-calendar-check text-primary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {events.length}
                                </div>
                                <div className="text-sm uppercase tracking-wider opacity-60">
                                    Events
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-clock text-accent-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {upcomingCount}
                                </div>
                                <div className="text-sm uppercase tracking-wider opacity-60">
                                    Upcoming
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-secondary flex items-center justify-center">
                                <i className="fa-duotone fa-regular fa-plug text-secondary-content" />
                            </div>
                            <div>
                                <div className="text-2xl font-black">
                                    {connections.length}
                                </div>
                                <div className="text-sm uppercase tracking-wider opacity-60">
                                    Accounts
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
