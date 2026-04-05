import { NextRequest, NextResponse } from 'next/server'

const ADMIN_TOKEN = process.env.ADMIN_AUTH_TOKEN

export function middleware(request: NextRequest) {
  // Skip auth for static files and login page
  if (request.nextUrl.pathname.startsWith('/_next') || request.nextUrl.pathname === '/favicon.ico') {
    return NextResponse.next()
  }

  // Check for admin auth cookie or header
  const token = request.cookies.get('admin_token')?.value
    || request.headers.get('x-admin-token')

  if (!ADMIN_TOKEN) {
    // If no ADMIN_AUTH_TOKEN env var is set, allow access (dev mode)
    return NextResponse.next()
  }

  if (token !== ADMIN_TOKEN) {
    if (request.nextUrl.pathname.startsWith('/api')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    // For pages, redirect to a simple auth prompt (or allow with warning)
    return NextResponse.next() // Allow page access for now, API is protected
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}
