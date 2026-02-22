"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

// Use relative URL for API calls (works in both dev and production)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

interface EventItem {
  _id: string;
  title: string;
  slug: string;
  image: string;
  date: string;
  time: string;
  mode: string;
  location: string;
}

const EventsPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/events`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Failed to fetch events' }));
        console.error('API Error:', errorData);
        showToast(errorData.message || "Failed to load events.", "error");
        setEvents([]);
        return;
      }
      
      const data = await res.json();
      console.log('Events data:', data); // Debug log
      
      // Handle both response formats: { events: [...] } or just [...]
      const eventsList = data.events || data || [];
      setEvents(Array.isArray(eventsList) ? eventsList : []);
    } catch (error) {
      console.error('Fetch error:', error);
      showToast("Failed to load events. Please check your connection.", "error");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string, title: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${title}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(id);
    try {
      const res = await fetch(`${BASE_URL}/api/events/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.message ?? "Delete failed.", "error");
        return;
      }

      showToast("Event deleted successfully.", "success");
      setEvents((prev) => prev.filter((e) => e._id !== id));
    } catch {
      showToast("Something went wrong.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="!text-4xl">All Events</h1>
          <p className="mt-2 text-light-200">
            Browse, edit, or remove your events.
          </p>
        </div>
        <Link
          href="/events/create"
          className="bg-primary hover:bg-primary/90 rounded-[6px] px-5 py-2.5 text-sm font-semibold text-black whitespace-nowrap"
        >
          + New Event
        </Link>
      </div>

      {loading ? (
        <p className="text-light-200 text-center mt-20">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-light-200 text-center mt-20">
          No events yet.{" "}
          <Link href="/events/create" className="text-primary underline">
            Create one
          </Link>
        </p>
      ) : (
        <ul className="events">
          {events.map((event) => (
            <li key={event._id} className="list-none">
              <div className="flex flex-col gap-3 bg-dark-100 border border-dark-200 rounded-lg overflow-hidden">
                {/* Clickable card image + info */}
                <Link href={`/events/${event.slug}`}>
                  <Image
                    src={event.image}
                    alt={event.title}
                    width={410}
                    height={300}
                    className="h-[220px] w-full object-cover"
                  />
                </Link>

                <div className="px-4 pb-4 flex flex-col gap-3">
                  <Link href={`/events/${event.slug}`}>
                    <p className="text-lg font-semibold line-clamp-1">
                      {event.title}
                    </p>
                  </Link>

                  <div className="flex flex-wrap gap-3 text-light-200 text-xs">
                    <span className="flex items-center gap-1">
                      <Image src="/icons/calendar.svg" alt="date" width={12} height={12} />
                      {event.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Image src="/icons/pin.svg" alt="location" width={12} height={12} />
                      {event.location}
                    </span>
                    <span className="pill capitalize">{event.mode}</span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 mt-1">
                    <button
                      onClick={() => router.push(`/events/edit/${event._id}`)}
                      className="flex-1 cursor-pointer rounded-[6px] border border-dark-200 px-3 py-2 text-sm text-light-100 hover:bg-dark-200 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id, event.title)}
                      disabled={deletingId === event._id}
                      className="flex-1 cursor-pointer rounded-[6px] border border-red-500/30 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                    >
                      {deletingId === event._id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default EventsPage;
