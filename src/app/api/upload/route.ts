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
    const galleryId = formData.get('galleryId') as string;
    
    // First check for files with direct array-like naming (files[0], files[1], etc)
    let fileEntries = Array.from(formData.entries()).filter(([key]) => 
      key.startsWith('files[') || key === 'file'
    );

    // If no files found with array-style names, check for multiple files with the same field name
    if (fileEntries.length === 0) {
      const filesField = formData.getAll('files');
      console.log('Found files field with', filesField.length, 'entries');
      
      // Convert to the expected format for processing
      fileEntries = filesField.map((file, index) => [`files[${index}]`, file]);
    }
    
    if (fileEntries.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    console.log(`Processing ${fileEntries.length} files`);

    try {
      // Check environment variables
      const spaceId = process.env.CONTENTFUL_SPACE_ID;
      if (!spaceId) {
        throw new Error('CONTENTFUL_SPACE_ID environment variable is not set');
      }

      // Get space and environment
      const space = await client.getSpace(spaceId);
      const environment = await space.getEnvironment('master');

      // Process all files in parallel with controlled concurrency
      const results = await processFilesWithConcurrency(fileEntries, formData, user, environment, galleryId);
      
      return NextResponse.json({
        success: true,
        assets: results.filter(r => r.success),
        errors: results.filter(r => !r.success),
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

// Function to process files with controlled concurrency
async function processFilesWithConcurrency(
  fileEntries: [string, FormDataEntryValue][],
  formData: FormData,
  user: any,
  environment: any,
  galleryId?: string,
  concurrencyLimit = 3
) {
  const results: any[] = [];
  const queue = [...fileEntries];
  const activePromises: Promise<void>[] = [];

  async function processNextFile() {
    if (queue.length === 0) return;
    
    const [key, fileValue] = queue.shift()!;
    const file = fileValue as File;
    
    // Get title from formData if available
    const titleKey = key === 'file' ? 'title' : `titles[${key.match(/\d+/)?.[0]}]`;
    const title = formData.get(titleKey) as string || file.name;
    
    try {
      const result = await processFile(file, title, user, environment);
      
      if (galleryId && result.success) {
        await addAssetToGallery(environment, galleryId, result.asset.id);
      }
      
      results.push(result);
    } catch (error: any) {
      results.push({
        success: false,
        filename: file.name,
        error: error.message || 'Failed to process file'
      });
    }
    
    // Process next file in queue
    await processNextFile();
  }

  // Start initial batch of file processing
  for (let i = 0; i < Math.min(concurrencyLimit, queue.length); i++) {
    activePromises.push(processNextFile());
  }

  // Wait for all files to be processed
  await Promise.all(activePromises);
  return results;
}

// Process a single file and return the result
async function processFile(file: File, title: string, user: any, environment: any) {
  try {
    // Get the file data as an ArrayBuffer
    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

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

    return {
      success: true,
      asset: {
        id: publishedAsset.sys.id,
        url: `https:${publishedAsset.fields.file['en-US'].url}`,
        title: publishedAsset.fields.title['en-US'],
        filename: file.name,
      }
    };
  } catch (error: any) {
    console.error(`Error processing file ${file.name}:`, error);
    throw error;
  }
}

// Add an asset to gallery
async function addAssetToGallery(environment: any, galleryId: string, assetId: string) {
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
            id: assetId,
          },
        },
      ],
    };
    
    // Update and publish the gallery
    const updatedGallery = await gallery.update();
    await updatedGallery.publish();
    return true;
  } catch (error) {
    console.error('Error updating gallery:', error);
    // Return false but don't fail completely, as the asset was still uploaded
    return false;
  }
} 