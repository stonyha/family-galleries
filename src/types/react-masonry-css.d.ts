declare module 'react-masonry-css' {
  import React from 'react';
  
  export interface MasonryProps {
    breakpointCols?: number | { [key: string]: number };
    className?: string;
    columnClassName?: string;
    children?: React.ReactNode;
  }
  
  const Masonry: React.FC<MasonryProps>;
  
  export default Masonry;
} 