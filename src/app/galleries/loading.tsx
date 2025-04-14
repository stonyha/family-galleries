import Layout from '@/components/layout/Layout';

export default function GalleriesLoading() {
  return (
    <Layout title="Loading Galleries">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Photo Galleries</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Loading our collection of family photos...
          </p>
        </div>
        
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-lg h-80 animate-pulse"></div>
          ))}
        </div>
      </div>
    </Layout>
  );
} 