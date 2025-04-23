"use client";

import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { PlayIcon } from '@heroicons/react/24/solid';
import { ChevronLeftIcon, ChevronRightIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useMediaQuery } from 'react-responsive';
import { VideoItem } from '@/types/video';
import { getVimeoThumbnail } from '@/utils/vimeo';

type FeaturedVideosProps = {
  videos: VideoItem[];
};

const FeaturedVideos: React.FC<FeaturedVideosProps> = ({ videos }) => {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [thumbnailUrls, setThumbnailUrls] = useState<Record<string, string>>({});
  const isMobile = useMediaQuery({ maxWidth: 768 });

  // Debug videos data in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('FeaturedVideos received videos:', videos);
    }
  }, [videos]);

  // Get Vimeo thumbnails for videos without thumbnails
  useEffect(() => {
    const newThumbnailUrls: Record<string, string> = {};
    
    videos.forEach(video => {
      if (!video.thumbnail && video.vimeoVideo) {
        const vimeoThumbnail = getVimeoThumbnail(video.vimeoVideo);
        if (vimeoThumbnail) {
          newThumbnailUrls[video.id] = vimeoThumbnail;
        }
      }
    });
    
    setThumbnailUrls(newThumbnailUrls);
  }, [videos]);

  const getVimeoId = (url: string) => {
    const match = url.match(/(?:vimeo\.com\/|video\/)(\d+)/);
    return match ? match[1] : null;
  };

  const handleVideoClick = (videoId: string) => {
    setActiveVideo(videoId);
  };

  const handleCloseModal = () => {
    setActiveVideo(null);
  };

  if (!videos.length) return null;

  return (
    <div className="featured-videos py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-left mb-8">Videos Nổi Bật</h2>
        
        <div className="relative">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={30}
            slidesPerView={isMobile ? 1 : 3}
            navigation={{
              prevEl: '.swiper-button-prev',
              nextEl: '.swiper-button-next',
            }}
            pagination={{ 
              clickable: true,
              el: '.swiper-pagination',
              bulletClass: 'swiper-pagination-bullet',
              bulletActiveClass: 'swiper-pagination-bullet-active',
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            className="relative"
          >
            {videos.map((video) => (
              <SwiperSlide key={video.id}>
                <div 
                  className="video-thumbnail relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => handleVideoClick(video.id)}
                >
                  {video.thumbnail && typeof video.thumbnail === 'object' && Array.isArray(video.thumbnail) && video.thumbnail[0]?.secure_url ? (
                    <img
                      src={video.thumbnail[0].secure_url}
                      alt={video.title || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading thumbnail:', video.thumbnail);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : thumbnailUrls[video.id] ? (
                    <img
                      src={thumbnailUrls[video.id]}
                      alt={video.title || 'Video thumbnail'}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        console.error('Error loading Vimeo thumbnail:', thumbnailUrls[video.id]);
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <PlayIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayIcon className="w-16 h-16 text-white" />
                  </div>
                  {video.title && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <h3 className="text-white font-semibold">{video.title}</h3>
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}

            {/* Navigation buttons */}
            <div className="swiper-button-prev !w-12 !h-12 !bg-white/90 !text-gray-800 rounded-full shadow-lg hover:!bg-white transition-colors duration-200 after:!content-none">
              <ChevronLeftIcon className="w-6 h-6" />
            </div>
            <div className="swiper-button-next !w-12 !h-12 !bg-white/90 !text-gray-800 rounded-full shadow-lg hover:!bg-white transition-colors duration-200 after:!content-none">
              <ChevronRightIcon className="w-6 h-6" />
            </div>

            {/* Pagination */}
            <div className="swiper-pagination !bottom-0 mt-4" />
          </Swiper>
        </div>
      </div>

      {/* Video Modal */}
      {activeVideo && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={handleCloseModal}
        >
          <div className="relative w-full max-w-4xl aspect-video">
            <button
              className="absolute -top-12 right-0 p-2 text-white hover:text-gray-300 transition-colors duration-200"
              onClick={handleCloseModal}
              aria-label="Close video"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            <iframe
              src={`https://player.vimeo.com/video/${getVimeoId(videos.find(v => v.id === activeVideo)?.vimeoVideo || '')}?autoplay=1`}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedVideos; 