import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IEvent } from "@/database";
import BookEvent from "./BookEvent";
import connectDB from "@/lib/mongodb";
import Event from "@/database/models/event.model";

interface PageProps {
  params: Promise<{ slug: string }>;
}

const EventDetails = async ({ params }: PageProps) => {
  const { slug } = await params;

  try {
    // Connect to database and fetch event directly (server component best practice)
    await connectDB();
    const event = await Event.findOne({ slug }).lean().exec();

    if (!event) {
      return notFound();
    }

    return (
    <section id="event">
      {/* Header */}
      <div className="header">
        <Link href="/" className="flex-row-gap-2 text-light-200 text-sm mb-2">
          &larr; Back to Events
        </Link>

        <h1 className="!text-4xl">{event.title}</h1>
        <p>{event.overview}</p>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          {event.tags?.map((tag: string) => (
            <span key={tag} className="pill">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Main content + sidebar */}
      <div className="details">
        {/* Left column — image, description, agenda */}
        <div className="content">
          <Image
            src={event.image}
            alt={event.title}
            width={800}
            height={457}
            className="banner"
            priority
          />

          {/* Quick-info bar */}
          <div className="flex flex-wrap gap-6">
            <div className="flex-row-gap-2">
              <Image src="/icons/calendar.svg" alt="date" width={16} height={16} />
              <p>{event.date}</p>
            </div>
            <div className="flex-row-gap-2">
              <Image src="/icons/clock.svg" alt="time" width={16} height={16} />
              <p>{event.time}</p>
            </div>
            <div className="flex-row-gap-2">
              <Image src="/icons/pin.svg" alt="location" width={16} height={16} />
              <p>{event.location}</p>
            </div>
            <div className="flex-row-gap-2">
              <Image src="/icons/mode.svg" alt="mode" width={16} height={16} />
              <p className="capitalize">{event.mode}</p>
            </div>
            <div className="flex-row-gap-2">
              <Image src="/icons/audience.svg" alt="audience" width={16} height={16} />
              <p>{event.audience}</p>
            </div>
          </div>

          {/* Description */}
          <div className="flex-col-gap-2">
            <h2>About the Event</h2>
            <p>{event.description}</p>
          </div>

          {/* Agenda */}
          {event.agenda?.length > 0 && (
            <div className="agenda">
              <h2>Agenda</h2>
              <ul>
                {event.agenda.map((item: string) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Organizer */}
          <div className="flex-col-gap-2">
            <h2>Organizer</h2>
            <p>{event.organizer}</p>
          </div>
        </div>

        {/* Right column — booking card */}
        <aside className="booking">
          <div className="signup-card">
            <h2>Register for this Event</h2>
            <p>Secure your spot — sign up with your email below.</p>
            <BookEvent eventId={String(event._id)} />
          </div>
        </aside>
      </div>
    </section>
  );
  } catch (error) {
    console.error('Error fetching event:', error);
    return notFound();
  }
};

export default EventDetails;