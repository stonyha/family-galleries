import jwt from 'jsonwebtoken';

// Secret key for JWT signing - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// This should be the same token store that's used in the share API
// In a production environment, this should be in a persistent database
declare global {
  var tokenStore: Map<string, { jwt: string, expires: number }>;
}

// Initialize global token store if it doesn't exist
if (typeof global.tokenStore === 'undefined') {
  global.tokenStore = new Map<string, { jwt: string, expires: number }>();
}

/**
 * Type definition for gallery share token payload
 */
export interface ShareTokenPayload {
  galleryId: string;
  slug: string;
  purpose: string;
  iat: number;
  exp: number;
}

/**
 * Validates a share token and returns the decoded payload if valid
 * @param token The token to validate (either a short token or JWT token)
 * @returns The decoded token payload or null if invalid
 */
export function validateShareToken(token: string): ShareTokenPayload | null {
  try {
    console.log('Validating token in tokenUtils:', token.substring(0, 8) + '...');
    
    // First, check if this is a short token in our token store
    const storedToken = global.tokenStore.get(token);
    
    if (storedToken) {
      console.log('Found short token in tokenStore:', token.substring(0, 8) + '...');
      // Check if the token has expired
      if (storedToken.expires < Date.now()) {
        console.warn('Short token has expired:', new Date(storedToken.expires).toISOString());
        // Clean up expired token
        global.tokenStore.delete(token);
        return null;
      }
      
      // Use the JWT from the token store
      const jwtToken = storedToken.jwt;
      console.log('Using stored JWT token from tokenStore');
      
      try {
        // Verify the JWT token
        const decoded = jwt.verify(jwtToken, JWT_SECRET) as ShareTokenPayload;
        
        console.log('JWT token validated successfully:', {
          galleryId: decoded.galleryId,
          slug: decoded.slug,
          purpose: decoded.purpose,
          expiresAt: new Date(decoded.exp * 1000).toISOString()
        });
        
        // Ensure this is a gallery share token
        if (decoded.purpose !== 'gallery-share') {
          console.warn('Invalid token purpose:', decoded.purpose);
          return null;
        }
        
        return decoded;
      } catch (jwtError) {
        console.error('JWT verification error:', jwtError);
        // Remove invalid token from store
        global.tokenStore.delete(token);
        return null;
      }
    }
    
    // If it's not in the token store, try to validate it as a regular JWT
    // (This is for backward compatibility with existing tokens)
    console.log('Token not found in tokenStore, trying as JWT...');
    console.log('Using JWT_SECRET:', JWT_SECRET.substring(0, 10) + '...');
    
    try {
      // Verify the token and cast to our expected type
      const decoded = jwt.verify(token, JWT_SECRET) as ShareTokenPayload;
      
      console.log('JWT token decoded successfully:', {
        galleryId: decoded.galleryId,
        slug: decoded.slug,
        purpose: decoded.purpose,
        expiresAt: new Date(decoded.exp * 1000).toISOString()
      });
      
      // Ensure this is a gallery share token
      if (decoded.purpose !== 'gallery-share') {
        console.warn('Invalid token purpose:', decoded.purpose);
        return null;
      }
      
      return decoded;
    } catch (jwtError) {
      console.error('Direct JWT validation error:', jwtError instanceof Error ? jwtError.message : jwtError);
      return null;
    }
  } catch (error) {
    console.error('Token validation error in tokenUtils:', error instanceof Error ? error.message : error);
    return null;
  }
} 