import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { hostname, pathname, search } = request.nextUrl
  
  // Redirect www to apex domain (non-www)
  // Change this if you prefer www as your canonical domain
  if (hostname === 'www.seekfirstbible.com') {
    const url = request.nextUrl.clone()
    url.hostname = 'seekfirstbible.com'
    return NextResponse.redirect(url, 301)
  }
  
  // Alternative: Redirect apex to www (uncomment if you prefer www)
  // if (hostname === 'seekfirstbible.com') {
  //   const url = request.nextUrl.clone()
  //   url.hostname = 'www.seekfirstbible.com'
  //   return NextResponse.redirect(url, 301)
  // }
  
  return NextResponse.next()
}

// Apply middleware to all routes except static assets and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
