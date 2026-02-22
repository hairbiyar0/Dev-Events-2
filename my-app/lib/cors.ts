import { NextResponse } from 'next/server';

// CORS utility function for API routes
export function setCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

// Handle preflight requests
export function handleCors(request: Request) {
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 200 });
    setCorsHeaders(response);
    return response;
  }
  return null;
}
