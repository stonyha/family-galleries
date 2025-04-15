import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const returnTo = new URL(req.url).searchParams.get('returnTo') || '/';
    const authUrl = new URL(`${process.env.AUTH0_ISSUER_BASE_URL}/authorize`);
    const redirectUri = `${process.env.AUTH0_BASE_URL}/api/auth/callback`;
    
    console.log(`Setting up Auth0 login with redirect_uri: ${redirectUri}`);
    
    // Add query parameters for Auth0 login
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('response_mode', 'query');
    authUrl.searchParams.append('client_id', process.env.AUTH0_CLIENT_ID || '');
    authUrl.searchParams.append('scope', process.env.AUTH0_SCOPE || 'openid profile email');
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('state', Buffer.from(JSON.stringify({ returnTo })).toString('base64'));
    
    return NextResponse.redirect(authUrl.toString());
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/?error=login_error`);
  }
} 