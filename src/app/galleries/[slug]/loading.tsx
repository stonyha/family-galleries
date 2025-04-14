import Layout from '@/components/layout/Layout';

export default function GalleryDetailLoading() {
  return (
    <Layout title="Loading Gallery">
      {/* Hero Section Skeleton */}
      <div className="relative bg-gray-900 text-white">
        <div className="bg-gray-800 animate-pulse absolute inset-0"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-3xl">
            <div className="h-6 w-32 bg-gray-700 animate-pulse mb-6 rounded"></div>
            
            <div className="h-10 w-3/4 bg-gray-700 animate-pulse mb-4 rounded"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4">
              <div className="h-5 w-32 bg-gray-700 animate-pulse rounded"></div>
              <div className="h-5 w-24 bg-gray-700 animate-pulse rounded"></div>
              <div className="h-5 w-20 bg-gray-700 animate-pulse rounded"></div>
            </div>
            
            <div className="h-20 w-full bg-gray-700 animate-pulse mt-4 rounded"></div>
          </div>
        </div>
      </div>
      
      {/* Photo Grid Skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center my-6">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
          {[...Array(12)].map((_, i) => (
            <div 
              key={i} 
              className="aspect-square bg-gray-200 animate-pulse rounded"
            ></div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 