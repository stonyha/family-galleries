export const getVimeoThumbnail = (vimeoUrl: string): string | null => {
  const vimeoId = vimeoUrl.match(/(?:vimeo\.com\/|video\/)(\d+)/)?.[1];
  if (!vimeoId) return null;
  
  // Vimeo provides different thumbnail sizes, we'll use the 640px width version
  return `https://vumbnail.com/${vimeoId}.jpg`;
}; 