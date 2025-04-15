import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

// Short-term in-memory cache to prevent multiple calls within the same second
const tokenCache = new Map<string, { profile: any, timestamp: number }>();
const CACHE_TTL = 60 * 1000; // 1 minute cache

export async function GET(req: Request) {
  try {
    // Get the token from cookies
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('auth0_access_token')?.value;
    const idToken = cookieStore.get('auth0_id_token')?.value;
    
    if (!accessToken || !idToken) {
      console.log('No auth tokens found in cookies');
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    
    try {
      // Decode the ID token to get user information
      const decodedToken = jwtDecode<{ sub: string }>(idToken);
      console.log('Token decoded successfully, sub:', decodedToken.sub);
      
      // Check if we have a cached profile for this token
      const cacheKey = decodedToken.sub;
      const now = Date.now();
      
      if (tokenCache.has(cacheKey)) {
        const cached = tokenCache.get(cacheKey)!;
        
        // If cache is still valid, return the cached profile
        if (now - cached.timestamp < CACHE_TTL) {
          console.log('Returning cached profile for:', cacheKey);
          
          // Add cache control headers
          const response = NextResponse.json(cached.profile);
          response.headers.set('Cache-Control', 'private, max-age=60');
          return response;
        }
        
        // Cache expired, remove it
        tokenCache.delete(cacheKey);
      }
      
      // Get user profile from Auth0 API
      const userInfoUrl = `${process.env.AUTH0_ISSUER_BASE_URL}/userinfo`;
      console.log(`Fetching user info from: ${userInfoUrl}`);
      
      const userInfoResponse = await fetch(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        // Add cache-control to avoid browsers caching the response
        cache: 'no-store',
      });
      
      if (!userInfoResponse.ok) {
        const errorText = await userInfoResponse.text();
        console.error('User info error:', {
          status: userInfoResponse.status,
          text: errorText
        });
        
        // Handle rate limiting specifically
        if (userInfoResponse.status === 429) {
          console.log('Rate limited by Auth0. Checking if we have a cached version to use...');
          
          // If we've been rate limited, try to use decoded token info as fallback
          const fallbackProfile = {
            sub: decodedToken.sub,
            // Extract any other useful info from the decoded token
            ...Object.entries(decodedToken)
              .filter(([key]) => !['iat', 'exp', 'aud', 'iss'].includes(key))
              .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {})
          };
          
          // Store in cache to avoid further requests
          tokenCache.set(cacheKey, { profile: fallbackProfile, timestamp: now });
          
          const response = NextResponse.json(fallbackProfile);
          response.headers.set('Cache-Control', 'private, max-age=300'); // Cache longer during rate limiting
          return response;
        }
        
        return NextResponse.json({ 
          error: 'Failed to get user info',
          details: {
            status: userInfoResponse.status,
            text: errorText
          }
        }, { status: 500 });
      }
      
      const userInfo = await userInfoResponse.json();
      
      // Cache the successful response
      tokenCache.set(cacheKey, { profile: userInfo, timestamp: now });
      
      // Return the user info with cache headers
      const response = NextResponse.json(userInfo);
      response.headers.set('Cache-Control', 'private, max-age=60');
      return response;
    } catch (tokenError) {
      console.error('Token processing error:', tokenError);
      return NextResponse.json({ 
        error: 'Invalid token',
        details: tokenError instanceof Error ? tokenError.message : 'Unknown token error'
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Profile error:', error);
    return NextResponse.json({ 
      error: 'Failed to get user profile',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 