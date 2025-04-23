'use client';

import { PlayIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { getVimeoThumbnail } from '@/utils/vimeo';
import { VideoItem } from '@/types/video';
import { useState } from 'react';

type VideoGridProps = {
  videos: VideoItem[];
};

export default function VideoGrid({ videos }: VideoGridProps) {
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

  const getVimeoId = (url: string) => {
    // Check if it's a share URL
    if (url.includes('share')) {
      return null;
    }
    // Handle standard Vimeo URLs
    const match = url.match(/(?:vimeo\.com\/|video\/)(\d+)(?:\/|$)/);
    return match ? match[1] : null;
  };

  const getPlayerUrl = (url: string) => {
    const videoId = getVimeoId(url);
    if (videoId) {
      return `https://player.vimeo.com/video/${videoId}?autoplay=1`;
    }
    // For share URLs, use the URL directly
    return url;
  };

  const handleVideoClick = (video: VideoItem) => {
    setActiveVideo(video);
  };

  const handleCloseModal = () => {
    setActiveVideo(null);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => {
          const thumbnailUrl = video.thumbnail?.secure_url || getVimeoThumbnail(video.vimeoVideo);
          
          return (
            <div
              key={video.id}
              className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer"
              onClick={() => handleVideoClick(video)}
            >
              {thumbnailUrl ? (
                <img
                  src={thumbnailUrl}
                  alt={video.title || 'Video thumbnail'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <PlayIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <PlayIcon className="w-16 h-16 text-white" />
              </div>
              {(video.title || video.description) && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  {video.title && (
                    <h3 className="text-white font-semibold">{video.title}</h3>
                  )}
                  {video.description && (
                    <p className="text-white/80 text-sm mt-1 line-clamp-2">{video.description}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
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
              src={getPlayerUrl(activeVideo.vimeoVideo)}
              className="w-full h-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </>
  );
} 