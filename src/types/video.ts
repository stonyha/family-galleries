export type VideoThumbnail = {
  secure_url?: string;
  width?: number;
  height?: number;
};

export type VideoItem = {
  id: string;
  title?: string;
  description?: string;
  vimeoVideo: string;
  thumbnail?: VideoThumbnail;
};

export type VideoListingPage = {
  fields: {
    heading?: string;
    description?: string;
  };
}; 