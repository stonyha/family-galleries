import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    
    if (!code) {
      console.error('No code provided in Auth0 callback');
      return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/api/auth/login`);
    }
    
    // Exchange code for tokens
    const tokenUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/oauth/token`;
    const redirectUri = `${process.env.AUTH0_BASE_URL}/api/auth/callback`;
    
    console.log(`Exchanging code for tokens with redirect_uri: ${redirectUri}`);
    
    const tokenRequest = {
      grant_type: 'authorization_code',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      code,
      redirect_uri: redirectUri
    };
    
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenRequest)
    });
    
    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Token error details:', {
        status: tokenResponse.status,
        error,
        request: {
          ...tokenRequest,
          client_secret: '[REDACTED]'
        }
      });
      return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/?error=auth_error`);
    }
    
    const { access_token, id_token, expires_in } = await tokenResponse.json();
    
    // Create response with redirect
    let redirectTo = '/';
    
    // Parse state parameter if exists
    if (state) {
      try {
        const decodedState = JSON.parse(Buffer.from(state, 'base64').toString());
        if (decodedState.returnTo) {
          redirectTo = decodedState.returnTo;
        }
      } catch (error) {
        console.error('Error parsing state:', error);
      }
    }
    
    const response = NextResponse.redirect(`${process.env.AUTH0_BASE_URL}${redirectTo}`);
    
    // Set cookies with the tokens
    response.cookies.set('auth0_access_token', access_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: expires_in,
      path: '/'
    });
    
    response.cookies.set('auth0_id_token', id_token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: expires_in,
      path: '/'
    });
    
    return response;
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(`${process.env.AUTH0_BASE_URL}/?error=auth_callback_error`);
  }
} 