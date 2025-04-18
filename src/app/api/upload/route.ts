// Add a type declaration for contentful-management
declare module 'contentful-management' {
  export function createClient(config: any): any;
}

import { NextRequest, NextResponse } from 'next/server';
import * as contentfulManagement from 'contentful-management';

// Initialize the Contentful Management client
const client = contentfulManagement.createClient({
  accessToken: process.env.CONTENTFUL_MANAGEMENT_TOKEN || '',
});

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const authResponse = await fetch(`${process.env.AUTH0_BASE_URL}/api/auth/me`, {
      headers: {
        cookie: req.headers.get('cookie') || '',
      },
    });

    if (!authResponse.ok) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get the user data
    const user = await authResponse.json();

    // Parse the form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const galleryId = formData.get('galleryId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get the file data as an ArrayBuffer
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    try {
      // Check environment variables
      const spaceId = process.env.CONTENTFUL_SPACE_ID;
      if (!spaceId) {
        throw new Error('CONTENTFUL_SPACE_ID environment variable is not set');
      }

      // Get space and environment
      const space = await client.getSpace(spaceId);
      const environment = await space.getEnvironment('master');

      // Upload the file to Contentful
      const uploadResponse = await environment.createUpload({
        file: fileBuffer,
        contentType: file.type,
        fileName: file.name,
      });

      // Create an asset in Contentful
      const asset = await environment.createAsset({
        fields: {
          title: {
            'en-US': title || file.name,
          },
          description: {
            'en-US': `Uploaded by ${user.name || 'user'} on ${new Date().toISOString()}`,
          },
          file: {
            'en-US': {
              contentType: file.type,
              fileName: file.name,
              uploadFrom: {
                sys: {
                  type: 'Link',
                  linkType: 'Upload',
                  id: uploadResponse.sys.id,
                },
              },
            },
          },
        },
      });

      // Process and publish the asset
      const processedAsset = await asset.processForAllLocales();
      const publishedAsset = await processedAsset.publish();

      // If a gallery ID was provided, add the asset to the gallery
      if (galleryId) {
        try {
          // Get the gallery entry
          const gallery = await environment.getEntry(galleryId);
          
          // Get the current images array or create a new one
          const currentImages = gallery.fields.images?.['en-US'] || [];
          
          // Add the new image to the array
          gallery.fields.images = {
            'en-US': [
              ...currentImages,
              {
                sys: {
                  type: 'Link',
                  linkType: 'Asset',
                  id: publishedAsset.sys.id,
                },
              },
            ],
          };
          
          // Update and publish the gallery
          const updatedGallery = await gallery.update();
          await updatedGallery.publish();
        } catch (error) {
          console.error('Error updating gallery:', error);
          // Continue execution even if gallery update fails
        }
      }

      return NextResponse.json({
        success: true,
        asset: {
          id: publishedAsset.sys.id,
          url: `https:${publishedAsset.fields.file['en-US'].url}`,
          title: publishedAsset.fields.title['en-US'],
        },
      });
    } catch (contentfulError: any) {
      console.error('Contentful API error:', contentfulError);
      
      // Provide more detailed error information
      const errorMessage = contentfulError.message || 'Failed to upload to Contentful';
      const statusCode = contentfulError.status || 500;
      const details = contentfulError.details || {};
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: details
        },
        { status: statusCode }
      );
    }
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to upload file' },
      { status: 500 }
    );
  }
} 