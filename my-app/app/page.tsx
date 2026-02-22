"use client";

import { useEffect, useState } from "react";
import ExploreBtn from "@/components/ExploreBtn";
import EventCard from "@/components/EventCard";
import {IEvent} from "@/database";

const BASE_URL = '';

const Page = () => {
    const [events, setEvents] = useState<IEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`${BASE_URL}/api/events`);
                const data = await response.json();
                setEvents(data.events || []);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    return (
        <section>
            <h1 className="text-center">The Hub for Every Dev <br /> Event You Can't Miss</h1>
            <p className="text-center mt-5">Hackathons, Meetups, and Conferences, All in One Place</p>

            <ExploreBtn />

            <div className="mt-20 space-y-7">
                <h3>Featured Events</h3>

                {loading ? (
                    <p className="text-center">Loading events...</p>
                ) : (
                    <ul className="events">
                        {events && events.length > 0 && events.map((event: IEvent) => (
                            <li key={String(event._id)} className="list-none">
                                <EventCard {...event} />
                            </li>
                        ))}
                        {(!events || events.length === 0) && (
                            <p className="text-center">No events found.</p>
                        )}
                    </ul>
                )}
            </div>
        </section>
    )
}

export default Page;
