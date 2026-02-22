"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

// Use relative URL for API calls (works in both dev and production)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const CreateEventPage = () => {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

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

    try {
      const res = await fetch(`${BASE_URL}/api/events`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message ?? "Failed to create event.", "error");
        setLoading(false);
        return;
      }

      showToast("Event created successfully!", "success");
      router.push(`/events/${data.event.slug}`);
    } catch {
      showToast("Something went wrong. Please try again.", "error");
      setLoading(false);
    }
  };

  return (
    <section>
      <h1 className="!text-4xl">Create a New Event</h1>
      <p className="mt-3 text-light-200">
        Fill in the details below to publish your event.
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
            placeholder="e.g. React Conf 2026"
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
            placeholder="What is this event about?"
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
            placeholder="One-liner about the event"
            className="bg-dark-200 rounded-[6px] px-5 py-2.5"
          />
        </div>

        {/* Image */}
        <div className="flex flex-col gap-2">
          <label htmlFor="image">Event Image</label>
          <input
            name="image"
            id="image"
            type="file"
            accept="image/*"
            required
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
              placeholder="e.g. Moscone Center"
              className="bg-dark-200 rounded-[6px] px-5 py-2.5"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="location">Location</label>
            <input
              name="location"
              id="location"
              required
              placeholder="e.g. San Francisco, CA"
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
              className="bg-dark-200 rounded-[6px] px-5 py-2.5"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="mode">Mode</label>
            <select
              name="mode"
              id="mode"
              required
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
              placeholder="e.g. Developers, Designers"
              className="bg-dark-200 rounded-[6px] px-5 py-2.5"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="organizer">Organizer</label>
            <input
              name="organizer"
              id="organizer"
              required
              placeholder="e.g. DevEvent Team"
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
            placeholder="e.g. react, frontend, conference"
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
            placeholder={"Keynote\nWorkshop\nNetworking"}
            className="bg-dark-200 rounded-[6px] px-5 py-2.5 resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary/90 cursor-pointer rounded-[6px] px-4 py-2.5 text-lg font-semibold text-black disabled:opacity-50"
        >
          {loading ? "Creating..." : "Create Event"}
        </button>
      </form>
    </section>
  );
};

export default CreateEventPage;
