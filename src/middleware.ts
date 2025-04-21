import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  // Allow public paths without authentication
  const publicPaths = [
    '/api/auth/login',
    '/api/auth/callback',
    '/api/auth/logout',
    '/api/auth/me',
    '/api/galleries/share',
    '/api/galleries/validate-token',
  ];
  
  const url = new URL(req.url);
  const { pathname, searchParams } = url;
  
  // Always allow access to public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    console.log('Public path access allowed:', pathname);
    return NextResponse.next();
  }
  
  // Skip auth check for URLs with a token parameter (client-side validation will handle these)
  if (searchParams.has('token')) {
    console.log('Share token found, skipping auth check:', pathname);
    
    // Add a cache control header to prevent caching for shared URLs
    const response = NextResponse.next();
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    return response;
  }
  
  // For galleries or other protected paths, check for authentication
  try {
    const authorizationHeader = req.headers.get('cookie') || '';
    const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000';
    
    // Skip auth check in development mode if AUTH0_DISABLE_AUTH is set
    if (process.env.NODE_ENV === 'development' && process.env.AUTH0_DISABLE_AUTH === 'true') {
      console.log('Auth check skipped in development mode');
      return NextResponse.next();
    }
    
    const authRequest = new Request(`${baseUrl}/api/auth/me`, {
      headers: {
        cookie: authorizationHeader,
      },
    });
    
    const response = await fetch(authRequest);
    
    if (response.ok) {
      console.log('User is authenticated, access allowed:', pathname);
      return NextResponse.next();
    }
    
    // If not authenticated, redirect to login
    console.log('User not authenticated, redirecting to login:', pathname);
    return NextResponse.redirect(new URL('/api/auth/login', req.url));
  } catch (error) {
    console.error('Authentication error:', error);
    
    // For development, allow access even if auth fails to prevent login loops
    if (process.env.NODE_ENV === 'development') {
      console.log('Auth failed but allowing access in development mode to prevent login loops');
      return NextResponse.next();
    }
    
    return NextResponse.redirect(new URL('/api/auth/login', req.url));
  }
}

// Make sure to configure the matcher to exclude static assets
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - Static assets (_next/static, images, etc.)
     * - Public assets in the public directory
     */
    '/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$|.*\\.ico$).*)'
  ]
}; 