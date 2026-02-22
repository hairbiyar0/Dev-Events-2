import { NextRequest, NextResponse } from 'next/server';

import connectDB from '@/lib/mongodb';
import {Event} from "@/database";
import { ObjectId } from 'mongodb';
import cloudinary from '@/lib/cloudinary';
import { setCorsHeaders, handleCors } from '@/lib/cors';

// Define route params type for type safety
type RouteParams = {
    params: Promise<{
        slug: string;
    }>;
};

/**
 * GET /api/events/[slug]
 * Fetches a single events by its slug
 */
export async function GET(
    req: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        // Connect to database
        await connectDB();

        // Await and extract slug from params
        const { slug } = await params;

        // Validate slug parameter
        if (!slug || typeof slug !== 'string' || slug.trim() === '') {
            return NextResponse.json(
                { message: 'Invalid or missing parameter' },
                { status: 400 }
            );
        }

        // Sanitize slug (remove any potential malicious input)
        const sanitizedSlug = slug.trim().toLowerCase();

        // Query events by slug or ID
        let event;
        if (ObjectId.isValid(sanitizedSlug)) {
            // If it's a valid ObjectId, search by ID
            event = await Event.findById(sanitizedSlug).lean();
        } else {
            // Otherwise, search by slug
            event = await Event.findOne({ slug: sanitizedSlug }).lean();
        }

        // Handle events not found
        if (!event) {
            const response = NextResponse.json(
                { message: `Event with slug '${sanitizedSlug}' not found` },
                { status: 404 }
            );
            setCorsHeaders(response);
            return response;
        }

        // Return successful response with events data
        const response = NextResponse.json(
            { message: 'Event fetched successfully', event },
            { status: 200 }
        );
        setCorsHeaders(response);
        return response;
    } catch (error) {
        // Log error for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.error('Error fetching events by slug:', error);
        }

        // Handle specific error types
        if (error instanceof Error) {
            // Handle database connection errors
            if (error.message.includes('MONGODB_URI')) {
                return NextResponse.json(
                    { message: 'Database configuration error' },
                    { status: 500 }
                );
            }

            // Return generic error with error message
            const response = NextResponse.json(
                { message: 'Failed to fetch events', error: error.message },
                { status: 500 }
            );
            setCorsHeaders(response);
            return response;
        }

        // Handle unknown errors
        return NextResponse.json(
            { message: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/events/[slug]
 * Updates an event by its ID (slug parameter is used as ID)
 */
export async function PUT(
    req: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        // Connect to database
        await connectDB();

        // Await and extract slug from params (used as ID)
        const { slug } = await params;

        // Validate slug parameter
        if (!slug || typeof slug !== 'string' || slug.trim() === '') {
            return NextResponse.json(
                { message: 'Invalid or missing ID parameter' },
                { status: 400 }
            );
        }

        // Check if the slug is a valid ObjectId
        if (!ObjectId.isValid(slug)) {
            return NextResponse.json(
                { message: 'Invalid event ID format' },
                { status: 400 }
            );
        }

        const formData = await req.formData();

        let event;
        try {
            event = Object.fromEntries(formData.entries());
        } catch (e) {
            return NextResponse.json({ message: 'Invalid form data format' }, { status: 400 });
        }

        // Handle image upload if new image is provided
        const file = formData.get('image') as File;
        if (file && file.size > 0) {
            const arrayBuffer = await file.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            const uploadResult = await new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    { resource_type: 'image', folder: 'DevEvent' },
                    (error, results) => {
                        if (error) return reject(error);
                        resolve(results);
                    }
                ).end(buffer);
            });

            event.image = (uploadResult as { secure_url: string }).secure_url;
        } else {
            // Remove image from form data if no new file was uploaded
            delete event.image;
        }

        // Extract tags and agenda from form data (they are sent as multiple entries)
        const tags = formData.getAll('tags') as string[];
        const agenda = formData.getAll('agenda') as string[];

        // Remove tags, agenda, and image from the event data to avoid conflicts
        delete event.tags;
        delete event.agenda;
        delete event.image;

        // Find and update the event
        const updatedEvent = await Event.findByIdAndUpdate(
            slug.trim(),
            {
                ...event,
                tags: tags,
                agenda: agenda,
            },
            { new: true, runValidators: true }
        );

        // Handle event not found
        if (!updatedEvent) {
            return NextResponse.json(
                { message: `Event with ID '${slug}' not found` },
                { status: 404 }
            );
        }

        // Return successful response
        return NextResponse.json(
            { message: 'Event updated successfully', event: updatedEvent },
            { status: 200 }
        );
    } catch (error) {
        // Log error for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.error('Error updating event:', error);
        }

        // Handle specific error types
        if (error instanceof Error) {
            // Handle database connection errors
            if (error.message.includes('MONGODB_URI')) {
                return NextResponse.json(
                    { message: 'Database configuration error' },
                    { status: 500 }
                );
            }

            // Return generic error with error message
            return NextResponse.json(
                { message: 'Failed to update event', error: error.message },
                { status: 500 }
            );
        }

        // Handle unknown errors
        return NextResponse.json(
            { message: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/events/[slug]
 * Deletes an event by its ID (slug parameter is used as ID)
 */
export async function DELETE(
    req: NextRequest,
    { params }: RouteParams
): Promise<NextResponse> {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        // Connect to database
        await connectDB();

        // Await and extract slug from params (used as ID)
        const { slug } = await params;

        // Validate slug parameter
        if (!slug || typeof slug !== 'string' || slug.trim() === '') {
            return NextResponse.json(
                { message: 'Invalid or missing ID parameter' },
                { status: 400 }
            );
        }

        // Check if the slug is a valid ObjectId
        if (!ObjectId.isValid(slug)) {
            return NextResponse.json(
                { message: 'Invalid event ID format' },
                { status: 400 }
            );
        }

        // Find and delete the event by ID
        const deletedEvent = await Event.findByIdAndDelete(slug.trim());

        // Handle event not found
        if (!deletedEvent) {
            return NextResponse.json(
                { message: `Event with ID '${slug}' not found` },
                { status: 404 }
            );
        }

        // Return successful response
        return NextResponse.json(
            { message: 'Event deleted successfully' },
            { status: 200 }
        );
    } catch (error) {
        // Log error for debugging (only in development)
        if (process.env.NODE_ENV === 'development') {
            console.error('Error deleting event:', error);
        }

        // Handle specific error types
        if (error instanceof Error) {
            // Handle database connection errors
            if (error.message.includes('MONGODB_URI')) {
                return NextResponse.json(
                    { message: 'Database configuration error' },
                    { status: 500 }
                );
            }

            // Return generic error with error message
            return NextResponse.json(
                { message: 'Failed to delete event', error: error.message },
                { status: 500 }
            );
        }

        // Handle unknown errors
        return NextResponse.json(
            { message: 'An unexpected error occurred' },
            { status: 500 }
        );
    }
}
