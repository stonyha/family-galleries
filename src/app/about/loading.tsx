import Layout from '@/components/layout/Layout';

export default function AboutLoading() {
  return (
    <Layout title="Đang tải về chúng tôi">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="h-10 w-48 bg-gray-200 animate-pulse mx-auto mb-4 rounded"></div>
        </div>
        
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="rounded-lg overflow-hidden shadow-md bg-gray-200 animate-pulse h-96"></div>
          </div>
          
          <div className="mt-8 lg:mt-0 lg:col-span-7">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 animate-pulse rounded w-full"></div>
              ))}
              <div className="h-4 bg-gray-200 animate-pulse rounded w-3/4"></div>
              
              <div className="pt-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 animate-pulse rounded w-full mt-2"></div>
                ))}
                <div className="h-4 bg-gray-200 animate-pulse rounded w-2/3 mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
} 