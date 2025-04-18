import { NextResponse } from 'next/server';
import { getGalleries } from '@/lib/contentful';

export const revalidate = 3600; // Revalidate the data at most every hour

export async function GET() {
  try {
    const galleries = await getGalleries();
    
    if (!galleries || !Array.isArray(galleries)) {
      console.error('Invalid gallery data returned from Contentful');
      return NextResponse.json(
        { error: 'Failed to retrieve galleries', success: false },
        { status: 500 }
      );
    }
    
    // Sort galleries by event date (newest first)
    const sortedGalleries = [...galleries].sort((a, b) => {
      const dateA = a.fields?.eventDate ? new Date(a.fields.eventDate).getTime() : 0;
      const dateB = b.fields?.eventDate ? new Date(b.fields.eventDate).getTime() : 0;
      return dateB - dateA; // Descending order
    });
    
    return NextResponse.json({ 
      galleries: sortedGalleries,
      count: sortedGalleries.length,
      success: true 
    });
  } catch (error) {
    console.error('Error fetching galleries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch galleries', success: false },
      { status: 500 }
    );
  }
} 