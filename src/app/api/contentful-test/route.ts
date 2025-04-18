import { NextResponse } from 'next/server';
import * as contentfulManagement from 'contentful-management';

export async function GET() {
  try {
    // Log environment variables (redacted for security)
    console.log('CONTENTFUL_SPACE_ID exists:', !!process.env.CONTENTFUL_SPACE_ID);
    console.log('CONTENTFUL_MANAGEMENT_TOKEN exists:', !!process.env.CONTENTFUL_MANAGEMENT_TOKEN);
    
    // Initialize the Contentful Management client
    const client = contentfulManagement.createClient({
      accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN || '',
    });

    // Check if space exists
    const spaceId = process.env.CONTENTFUL_SPACE_ID;
    if (!spaceId) {
      return NextResponse.json(
        { error: 'CONTENTFUL_SPACE_ID environment variable is not set' },
        { status: 500 }
      );
    }

    // Attempt to get space information
    const space = await client.getSpace(spaceId);
    const spaceInfo = {
      id: space.sys.id,
      name: space.name,
      createdAt: space.sys.createdAt,
    };

    // Get environment information
    const environment = await space.getEnvironment('master');
    const environmentInfo = {
      id: environment.sys.id,
      name: environment.name,
      createdAt: environment.sys.createdAt,
    };

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Contentful',
      space: spaceInfo,
      environment: environmentInfo,
    });
  } catch (error: any) {
    console.error('Contentful connection test error:', error);
    
    // Try to extract useful error information
    const errorMessage = error.message || 'Failed to connect to Contentful';
    const statusCode = error.status || 500;
    const details = error.details || {};
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: details,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: statusCode }
    );
  }
} 