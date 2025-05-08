'use client';

import { useState } from 'react';

type ShareButtonProps = {
  galleryId: string;
  slug: string;
};

export default function ShareButton({ galleryId, slug }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSharePanel, setShowSharePanel] = useState(false);

  const generateShareLink = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/galleries/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          galleryId,
          slug,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Lỗi tạo link chia sẻ');
      }
      
      const data = await response.json();
      setShareUrl(data.shareUrl);
    } catch (err) {
      setError('Không thể tạo link chia sẻ. Vui lòng thử lại.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      if (shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Không thể sao chép: ', err);
    }
  };

  const toggleSharePanel = () => {
    if (!showSharePanel) {
      // If we're going to show the panel and don't have a URL yet, generate one
      if (!shareUrl && !isLoading) {
        generateShareLink();
      }
    }
    setShowSharePanel(!showSharePanel);
  };

  return (
    <div className="relative">
      {/* Share button - always visible */}
      <button
        onClick={toggleSharePanel}
        disabled={isLoading}
        className="bg-amber-600 hover:bg-amber-700 text-white rounded-full p-3 shadow-lg transition-colors disabled:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50"
        aria-label="Share gallery"
      >
        {isLoading ? (
          <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" 
            />
          </svg>
        )}
      </button>

      {/* Share panel - visible when showSharePanel is true */}
      {showSharePanel && (
        <div className="absolute bottom-16 right-0 mb-2 bg-white rounded-lg shadow-xl p-4 w-80">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Chia sẻ bộ sưu tập</h3>
            <button 
              onClick={() => setShowSharePanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {shareUrl ? (
            <div className="space-y-3">
              <div className="flex items-center w-full bg-gray-100 border border-gray-300 rounded overflow-hidden">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-grow px-3 py-2 text-sm text-gray-700 focus:outline-none"
                />
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 flex items-center justify-center h-10 w-10 bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                >
                  {copied ? (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 13l4 4L19 7" 
                      />
                    </svg>
                  ) : (
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" 
                      />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Link này sẽ hết hạn trong 1 giờ và có thể truy cập bởi bất kỳ ai mà không cần đăng nhập.
              </p>
              <button
                onClick={generateShareLink}
                className="text-sm text-amber-600 hover:text-amber-800 transition-colors self-start"
              >
                Tạo link mới
              </button>
            </div>
          ) : (
            <div className="flex justify-center">
              <button
                onClick={generateShareLink}
                disabled={isLoading}
                className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors disabled:bg-amber-400 flex items-center space-x-2"
              >
                {isLoading && (
                  <svg className="animate-spin h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                <span>Tạo link</span>
              </button>
            </div>
          )}
          
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      )}
    </div>
  );
} 