'use client';

import { PlayIcon } from '@heroicons/react/24/solid';
import { getVimeoThumbnail } from '@/utils/vimeo';
import { VideoItem } from '@/types/video';

type VideoGridProps = {
  videos: VideoItem[];
};

export default function VideoGrid({ videos }: VideoGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => {
        const thumbnailUrl = video.thumbnail?.secure_url || getVimeoThumbnail(video.vimeoVideo);
        
        return (
          <div
            key={video.id}
            className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer"
            onClick={() => window.open(video.vimeoVideo, '_blank')}
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
  );
} 