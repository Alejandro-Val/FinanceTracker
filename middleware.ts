import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get token from cookies
  const token = request.cookies.get('auth-token')?.value
  
  // Check if user is logged in
  const isLoggedIn = !!token
  
  // If not logged in, redirect to login
  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If logged in, continue to the requested route
  return NextResponse.next()
}

// Run middleware on all routes except login and public assets
export const config = {
  matcher: [
    '/((?!login|_next/static|_next/image|favicon.ico|public/).*)',
  ],
}