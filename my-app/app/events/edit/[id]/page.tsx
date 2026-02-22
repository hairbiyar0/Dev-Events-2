"use client";

import { FormEvent, useEffect, useState, use } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

// Use relative URL for API calls (works in both dev and production)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

interface EventData {
  _id: string;
  title: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: string;
  audience: string;
  organizer: string;
  tags: string[];
  agenda: string[];
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const EditEventPage = ({ params }: PageProps) => {
  const { id } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/events/${id}`);
        if (!res.ok) {
          showToast("Event not found.", "error");
          router.push("/events");
          return;
        }
        const data = await res.json();
        setEvent(data.event);
      } catch {
        showToast("Failed to load event.", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.currentTarget);

    // Convert comma-separated tags into individual entries
    const tagsRaw = formData.get("tags") as string;
    formData.delete("tags");
    tagsRaw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
      .forEach((tag) => formData.append("tags", tag));

    // Convert newline-separated agenda into individual entries
    const agendaRaw = formData.get("agenda") as string;
    formData.delete("agenda");
    agendaRaw
      .split("\n")
      .map((a) => a.trim())
      .filter(Boolean)
      .forEach((item) => formData.append("agenda", item));

    // Remove empty image file (user didn't pick a new one)
    const imageFile = formData.get("image") as File;
    if (!imageFile || imageFile.size === 0) {
      formData.delete("image");
    }

    try {
      const res = await fetch(`${BASE_URL}/api/events/${id}`, {
        method: "PUT",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message ?? "Update failed.", "error");
        setSubmitting(false);
        return;
      }

      showToast("Event updated successfully!", "success");
      router.push("/events");
    } catch {
      showToast("Something went wrong. Please try again.", "error");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section>
        <p className="text-light-200 text-center mt-20">Loading event...</p>
      </section>
    );
  }

  if (!event) return null;

  return (
    <section>
      <h1 className="!text-4xl">Edit Event</h1>
      <p className="mt-3 text-light-200">
        Update the details below and save your changes.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-10 flex flex-col gap-6 max-w-2xl"
      >
        {/* Title */}
        <div className="flex flex-col gap-2">
          <label htmlFor="title">Title</label>
          <input
            name="title"
            id="title"
            required
            defaultValue={event.title}
            className="bg-dark-200 rounded-[6px] px-5 py-2.5"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label htmlFor="description">Description</label>
          <textarea
            name="description"
            id="description"
            required
            rows={4}
            defaultValue={event.description}
            className="bg-dark-200 rounded-[6px] px-5 py-2.5 resize-none"
          />
        </div>

        {/* Overview */}
        <div className="flex flex-col gap-2">
          <label htmlFor="overview">Overview (short summary)</label>
          <input
            name="overview"
            id="overview"
            required
            defaultValue={event.overview}
            className="bg-dark-200 rounded-[6px] px-5 py-2.5"
          />
        </div>

        {/* Current image preview + optional re-upload */}
        <div className="flex flex-col gap-2">
          <label>Current Image</label>
          <Image
            src={event.image}
            alt={event.title}
            width={400}
            height={200}
            className="rounded-lg object-cover max-h-[200px] w-auto"
          />
          <label htmlFor="image" className="mt-2">
            Replace Image (optional)
          </label>
          <input
            name="image"
            id="image"
            type="file"
            accept="image/*"
            className="bg-dark-200 rounded-[6px] px-5 py-2.5 file:text-white file:bg-transparent file:border-0"
          />
        </div>

        {/* Venue & Location */}
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <div className="flex flex-col gap-2">
            <label htmlFor="venue">Venue</label>
            <input
              name="venue"
              id="venue"
              required
              defaultValue={event.venue}
              className="bg-dark-200 rounded-[6px] px-5 py-2.5"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="location">Location</label>
            <input
              name="location"
              id="location"
              required
              defaultValue={event.location}
              className="bg-dark-200 rounded-[6px] px-5 py-2.5"
            />
          </div>
        </div>

        {/* Date, Time, Mode */}
        <div className="grid grid-cols-3 gap-4 max-sm:grid-cols-1">
          <div className="flex flex-col gap-2">
            <label htmlFor="date">Date</label>
            <input
              name="date"
              id="date"
              type="date"
              required
              defaultValue={event.date}
              className="bg-dark-200 rounded-[6px] px-5 py-2.5"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="time">Time</label>
            <input
              name="time"
              id="time"
              type="time"
              required
              defaultValue={event.time}
              className="bg-dark-200 rounded-[6px] px-5 py-2.5"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="mode">Mode</label>
            <select
              name="mode"
              id="mode"
              required
              defaultValue={event.mode}
              className="bg-dark-200 rounded-[6px] px-5 py-2.5"
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        {/* Audience & Organizer */}
        <div className="grid grid-cols-2 gap-4 max-sm:grid-cols-1">
          <div className="flex flex-col gap-2">
            <label htmlFor="audience">Audience</label>
            <input
              name="audience"
              id="audience"
              required
              defaultValue={event.audience}
              className="bg-dark-200 rounded-[6px] px-5 py-2.5"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="organizer">Organizer</label>
            <input
              name="organizer"
              id="organizer"
              required
              defaultValue={event.organizer}
              className="bg-dark-200 rounded-[6px] px-5 py-2.5"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-col gap-2">
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            name="tags"
            id="tags"
            required
            defaultValue={event.tags.join(", ")}
            className="bg-dark-200 rounded-[6px] px-5 py-2.5"
          />
        </div>

        {/* Agenda */}
        <div className="flex flex-col gap-2">
          <label htmlFor="agenda">Agenda (one item per line)</label>
          <textarea
            name="agenda"
            id="agenda"
            required
            rows={4}
            defaultValue={event.agenda.join("\n")}
            className="bg-dark-200 rounded-[6px] px-5 py-2.5 resize-none"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-primary hover:bg-primary/90 cursor-pointer rounded-[6px] px-4 py-2.5 text-lg font-semibold text-black disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/events")}
            className="flex-1 cursor-pointer rounded-[6px] border border-dark-200 px-4 py-2.5 text-lg text-light-100 hover:bg-dark-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditEventPage;
