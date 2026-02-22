import {NextRequest, NextResponse} from "next/server";

import connectDB from "@/lib/mongodb";
import {Event} from "@/database";
import cloudinary from "@/lib/cloudinary";
import { setCorsHeaders, handleCors } from "@/lib/cors";

export async function POST(req: NextRequest) {
    // Handle CORS preflight
    const corsResponse = handleCors(req);
    if (corsResponse) return corsResponse;

    try {
        await connectDB();

        // Check Cloudinary configuration
        if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
            const response = NextResponse.json({ 
                message: 'Cloudinary configuration missing. Please check environment variables.' 
            }, { status: 500 });
            setCorsHeaders(response);
            return response;
        }

        const formData = await req.formData();

        const file = formData.get('image') as File;

        if(!file) {
            const response = NextResponse.json({ message: 'Image file is required'}, { status: 400 });
            setCorsHeaders(response);
            return response;
        }

        // Extract tags and agenda from form data (they are sent as multiple entries)
        const tags = formData.getAll('tags') as string[];
        const agenda = formData.getAll('agenda') as string[];

        // Remove tags, agenda, and image from the event data to avoid conflicts
        const eventData = Object.fromEntries(formData.entries());
        delete eventData.tags;
        delete eventData.agenda;
        delete eventData.image;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ resource_type: 'image', folder: 'DevEvent' }, (error, results) => {
                if(error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(error);
                }

                resolve(results);
            }).end(buffer);
        });

        eventData.image = (uploadResult as { secure_url: string }).secure_url;

        const createdEvent = await Event.create({
            ...eventData,
            tags: tags,
            agenda: agenda,
        });

        const response = NextResponse.json({ message: 'Event created successfully', event: createdEvent }, { status: 201 });
        setCorsHeaders(response);
        return response;
    } catch (e) {
        console.error(e);
        const response = NextResponse.json({ message: 'Event Creation Failed', error: e instanceof Error ? e.message : 'Unknown'}, { status: 500 });
        setCorsHeaders(response);
        return response;
    }
}

export async function GET() {
    try {
        await connectDB();

        const events = await Event.find().sort({ createdAt: -1 });

        const response = NextResponse.json({ message: 'Events fetched successfully', events }, { status: 200 });
        setCorsHeaders(response);
        return response;
    } catch (e) {
        const response = NextResponse.json({ message: 'Event fetching failed', error: e }, { status: 500 });
        setCorsHeaders(response);
        return response;
    }
}
