import { Metadata } from 'next';
import Image from 'next/image';
import Layout from '@/components/layout/Layout';
import { getAboutPage } from '@/lib/contentful';

export const metadata: Metadata = {
  title: 'About Us | Family Galleries',
  description: 'Learn more about our family and this photo gallery website.',
};

export const revalidate = 3600; // Revalidate the data at most every hour

export default async function AboutPage() {
  const aboutPage = await getAboutPage();
  
  // Use type assertion to handle Contentful data
  const aboutFields = aboutPage && typeof aboutPage === 'object' && 'fields' in aboutPage 
    ? aboutPage.fields as any
    : null;
  
  const title = aboutFields?.title || 'About Our Family';
  const content = aboutFields?.content || { 
    content: [{ 
      content: [{ value: 'Information about our family will be added soon.' }] 
    }]
  };
  
  // Get image if available
  let familyImageUrl: string | undefined = undefined;
  
  if (aboutFields?.familyImage?.fields?.file?.url) {
    familyImageUrl = `https:${aboutFields.familyImage.fields.file.url}`;
  }
  
  // Function to render rich text content - simple version
  const renderRichText = (richTextContent: any) => {
    if (!richTextContent || !richTextContent.content) {
      return <p>No content available.</p>;
    }
    
    return (
      <div className="prose prose-amber lg:prose-lg max-w-none">
        {richTextContent.content.map((block: any, blockIndex: number) => {
          // Handle paragraphs
          if (block.nodeType === 'paragraph') {
            return (
              <p key={blockIndex} className="mb-4">
                {block.content.map((textNode: any, textIndex: number) => {
                  // Bold text
                  if (textNode.marks?.some((mark: any) => mark.type === 'bold')) {
                    return <strong key={textIndex}>{textNode.value}</strong>;
                  }
                  
                  // Italic text
                  if (textNode.marks?.some((mark: any) => mark.type === 'italic')) {
                    return <em key={textIndex}>{textNode.value}</em>;
                  }
                  
                  // Regular text
                  return textNode.value || '';
                })}
              </p>
            );
          }
          
          // Handle headings
          if (block.nodeType === 'heading-1') {
            return <h1 key={blockIndex} className="text-3xl font-bold mt-6 mb-4">{block.content[0]?.value || ''}</h1>;
          }
          
          if (block.nodeType === 'heading-2') {
            return <h2 key={blockIndex} className="text-2xl font-bold mt-6 mb-3">{block.content[0]?.value || ''}</h2>;
          }
          
          if (block.nodeType === 'heading-3') {
            return <h3 key={blockIndex} className="text-xl font-bold mt-5 mb-2">{block.content[0]?.value || ''}</h3>;
          }
          
          // Handle lists
          if (block.nodeType === 'unordered-list') {
            return (
              <ul key={blockIndex} className="list-disc pl-5 mb-4">
                {block.content.map((listItem: any, listItemIndex: number) => (
                  <li key={listItemIndex} className="mb-1">
                    {listItem.content[0]?.content[0]?.value || ''}
                  </li>
                ))}
              </ul>
            );
          }
          
          if (block.nodeType === 'ordered-list') {
            return (
              <ol key={blockIndex} className="list-decimal pl-5 mb-4">
                {block.content.map((listItem: any, listItemIndex: number) => (
                  <li key={listItemIndex} className="mb-1">
                    {listItem.content[0]?.content[0]?.value || ''}
                  </li>
                ))}
              </ol>
            );
          }
          
          // Handle blockquotes
          if (block.nodeType === 'blockquote') {
            return (
              <blockquote key={blockIndex} className="border-l-4 border-amber-500 pl-4 italic my-4">
                {block.content[0]?.content[0]?.value || ''}
              </blockquote>
            );
          }
          
          // Fallback
          return <p key={blockIndex}>{block.content?.[0]?.content?.[0]?.value || ''}</p>;
        })}
      </div>
    );
  };
  
  return (
    <Layout
      title="About Us"
      description="Learn more about our family and this photo gallery website"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        </div>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {familyImageUrl && (
            <div className="lg:col-span-5">
              <div className="rounded-lg overflow-hidden shadow-md">
                <Image
                  src={familyImageUrl}
                  alt="Our Family"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          )}
          
          <div className={familyImageUrl ? "mt-8 lg:mt-0 lg:col-span-7" : "lg:col-span-12"}>
            {renderRichText(content)}
          </div>
        </div>
      </div>
    </Layout>
  );
} 