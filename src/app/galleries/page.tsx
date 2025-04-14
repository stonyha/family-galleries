import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';
import GalleryGrid from '@/components/gallery/GalleryGrid';
import { getGalleries } from '@/lib/contentful';

export const metadata: Metadata = {
  title: 'Thư viện ảnh | Sipikidi\'s Galleries',
  description: 'Xem qua bộ sưu tập các bức ảnh gia đình của chúng tôi',
};

export const revalidate = 3600; // Revalidate the data at most every hour

export default async function GalleriesPage() {
  const galleries = await getGalleries();
  
  return (
    <Layout
      title="Thư viện ảnh"
      description="Xem qua bộ sưu tập các bức ảnh gia đình của chúng tôi"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Thư viện ảnh</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Xem qua bộ sưu tập các bức ảnh gia đình của chúng tôi, được sắp xếp theo sự kiện và lễ hội. 
            Nhấp vào một bộ sưu tập để xem tất cả các bức ảnh từ sự kiện đó.
          </p>
        </div>
        
        <GalleryGrid
          galleries={galleries}
          emptyMessage="Chưa có bộ sưu tập nào được tạo. Hãy quay lại sau!"
        />
      </div>
    </Layout>
  );
} 