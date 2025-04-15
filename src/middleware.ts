import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Get the user session
  const res = NextResponse.next();
  
  // Public paths that don't require authentication
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/callback',
    '/api/auth/logout',
    '/api/auth/me',
  ];

  // Check if the path is public
  const { pathname } = req.nextUrl;
  
  // Always allow access to public paths
  if (publicPaths.includes(pathname)) {
    return res;
  }

  // Check if user is authenticated
  try {
    const authorizationHeader = req.headers.get('cookie') || '';
    const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000';
    const authRequest = new Request(`${baseUrl}/api/auth/me`, {
      headers: {
        cookie: authorizationHeader,
      },
    });
    
    const response = await fetch(authRequest);
    
    if (response.ok) {
      return res;
    }
    
    // If not authenticated, redirect to login
    return NextResponse.redirect(new URL('/api/auth/login', req.url));
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.redirect(new URL('/api/auth/login', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/auth routes (auth endpoints)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|api/auth).*)',
  ],
}; 