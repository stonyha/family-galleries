import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

// Secret key for JWT signing - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Set token expiration time to 1 hour (in seconds)
const TOKEN_EXPIRY = 60 * 60; // 1 hour

// Use the global token store
declare global {
  var tokenStore: Map<string, { jwt: string, expires: number }>;
}

// Initialize global token store if it doesn't exist
if (typeof global.tokenStore === 'undefined') {
  global.tokenStore = new Map<string, { jwt: string, expires: number }>();
  
  // Clean up expired tokens every hour
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of global.tokenStore.entries()) {
      if (value.expires < now) {
        global.tokenStore.delete(key);
      }
    }
  }, 60 * 60 * 1000); // Run cleanup every hour
}

/**
 * Generate a short random token
 * @returns A short random token
 */
function generateShortToken(length = 8): string {
  // Generate random bytes and convert to base64url format (URL-safe)
  return crypto.randomBytes(length)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, length);
}

export async function POST(req: NextRequest) {
  try {
    // Parse request body to get gallery ID
    const body = await req.json();
    const { galleryId, slug } = body;
    
    if (!galleryId || !slug) {
      return NextResponse.json({ error: 'Gallery ID and slug are required' }, { status: 400 });
    }
    
    // Generate JWT token
    const jwtToken = jwt.sign(
      { 
        galleryId,
        slug,
        purpose: 'gallery-share',
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY }
    );
    
    // Generate a short token
    let shortToken = generateShortToken();
    
    // Ensure short token is unique (very unlikely to collide, but just in case)
    while (global.tokenStore.has(shortToken)) {
      shortToken = generateShortToken();
    }
    
    // Store the mapping between short token and JWT token
    global.tokenStore.set(shortToken, {
      jwt: jwtToken,
      expires: Date.now() + TOKEN_EXPIRY * 1000
    });
    
    console.log(`Generated short token: ${shortToken} for gallery: ${slug}`);
    
    // Generate share URL with the short token
    const baseUrl = process.env.AUTH0_BASE_URL || 'http://localhost:3000';
    const shareUrl = `${baseUrl}/galleries/${slug}?token=${shortToken}`;
    
    return NextResponse.json({ 
      token: shortToken,
      shareUrl,
      expiresIn: TOKEN_EXPIRY,
      expiresAt: new Date(Date.now() + TOKEN_EXPIRY * 1000).toISOString()
    });
  } catch (error) {
    console.error('Share token generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate share token' },
      { status: 500 }
    );
  }
} 