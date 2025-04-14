import GalleryCard from './GalleryCard';

type GalleryGridProps = {
  galleries: any[]; // We'll cast this to our Contentful types when used
  title?: string;
  emptyMessage?: string;
};

export default function GalleryGrid({ 
  galleries, 
  title, 
  emptyMessage = 'No galleries found' 
}: GalleryGridProps) {
  return (
    <div>
      {title && (
        <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
      )}
      
      {galleries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleries.map((gallery) => (
            <GalleryCard key={gallery.sys.id} gallery={gallery} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
} 