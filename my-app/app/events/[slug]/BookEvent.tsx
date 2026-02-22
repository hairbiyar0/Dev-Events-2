"use client";

import { FormEvent, useState } from "react";

// Use relative URL for API calls (works in both dev and production)
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

interface BookEventProps {
  eventId: string;
}

const BookEvent = ({ eventId }: BookEventProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch(`${BASE_URL}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.message ?? "Booking failed. Please try again.");
        return;
      }

      setStatus("success");
      setMessage("You're registered! Check your email for details.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <div id="book-event">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Booking..." : "Book My Spot"}
        </button>
      </form>

      {status === "success" && (
        <p className="text-green-400 text-sm">{message}</p>
      )}
      {status === "error" && (
        <p className="text-red-400 text-sm">{message}</p>
      )}
    </div>
  );
};

export default BookEvent;
