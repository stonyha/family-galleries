import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  // Create response with redirect to Auth0 logout
  const returnTo = new URL(req.url).searchParams.get('returnTo') || '/';
  const logoutUrl = new URL(`${process.env.AUTH0_ISSUER_BASE_URL}/v2/logout`);
  
  // Add parameters for Auth0 logout
  logoutUrl.searchParams.append('client_id', process.env.AUTH0_CLIENT_ID || '');
  logoutUrl.searchParams.append('returnTo', `${process.env.AUTH0_BASE_URL}${returnTo}`);
  
  const response = NextResponse.redirect(logoutUrl.toString());
  
  // Clear auth cookies
  response.cookies.set('auth0_access_token', '', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/'
  });
  
  response.cookies.set('auth0_id_token', '', { 
    httpOnly: true, 
    secure: process.env.NODE_ENV === 'production',
    maxAge: 0,
    path: '/'
  });
  
  return response;
} 