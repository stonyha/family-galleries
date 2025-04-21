import { NextRequest, NextResponse } from 'next/server';
import { validateShareToken } from '@/utils/tokenUtils';

export async function GET(req: NextRequest) {
  try {
    console.log('Token validation request received:', req.url);
    // Get token from query parameters
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    
    console.log('Token to validate:', token?.substring(0, 4) + '...');
    
    if (!token) {
      console.log('No token provided in request');
      return NextResponse.json(
        { valid: false, error: 'No token provided' }, 
        { status: 400 }
      );
    }
    
    try {
      // Validate the token - make sure to await the result
      console.log('Attempting to validate token...');
      const tokenData = await Promise.resolve(validateShareToken(token));
      
      if (!tokenData) {
        console.log('Token validation failed - invalid or expired token');
        return NextResponse.json(
          { valid: false, error: 'Invalid or expired token' }, 
          { status: 401 }
        );
      }
      
      console.log('Token validated successfully for gallery:', tokenData.slug);
      
      // Return token validation result
      return NextResponse.json({
        valid: true,
        galleryId: tokenData.galleryId,
        slug: tokenData.slug,
        expiresAt: new Date(tokenData.exp * 1000).toISOString()
      });
    } catch (error) {
      console.error('Token validation error:', error);
      
      return NextResponse.json(
        { valid: false, error: 'Token validation failed' },
        { status: 500 }
      );
    }
  } catch (urlError) {
    console.error('URL parsing error:', urlError);
    return NextResponse.json(
      { valid: false, error: 'Invalid request format' },
      { status: 400 }
    );
  }
} 