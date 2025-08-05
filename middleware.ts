import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Check for user session cookie
  const sessionCookie = request.cookies.get('user-session')
  
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isHomePage = request.nextUrl.pathname === '/'
  
  // Allow API routes and auth pages
  if (isApiRoute) {
    return NextResponse.next()
  }
  
  // If user is not logged in
  if (!sessionCookie) {
    if (isAuthPage || isHomePage) {
      return NextResponse.next()
    }
    // Redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  
  // If user is logged in but trying to access auth pages, redirect to dashboard
  if (sessionCookie && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}