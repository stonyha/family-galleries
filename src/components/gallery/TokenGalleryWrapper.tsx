'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

type TokenGalleryWrapperProps = {
  token: string;
  children: React.ReactNode;
};

export default function TokenGalleryWrapper({ token, children }: TokenGalleryWrapperProps) {
  const [isValidating, setIsValidating] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Add a class to the document body to indicate this is a shared view
    // This can be used to hide elements via CSS if needed
    document.body.classList.add('shared-view-mode');
    
    // Ensure all share buttons are hidden on shared URLs
    // This is a backup in case the React conditional rendering doesn't catch it
    const hideShareButtons = () => {
      const shareButtons = document.querySelectorAll('.share-button-wrapper');
      shareButtons.forEach(button => {
        (button as HTMLElement).style.display = 'none';
      });
    };

    const validateToken = async () => {
      try {
        console.log('Validating token on client side');
        const response = await fetch(`/api/galleries/validate-token?token=${encodeURIComponent(token)}`);
        const data = await response.json();
        
        if (response.ok && data.valid) {
          console.log('Token is valid:', data);
          setIsValid(true);
          // Hide share buttons after validation
          setTimeout(hideShareButtons, 100);
        } else {
          console.error('Token validation failed:', data);
          setError(data.error || 'Invalid access token');
        }
      } catch (err) {
        console.error('Error validating token:', err);
        setError('Failed to validate access token');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
    
    // Clean up function to remove body class when component unmounts
    return () => {
      document.body.classList.remove('shared-view-mode');
    };
  }, [token]);

  if (isValidating) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
        <p className="mt-4 text-gray-700">Validating shared access...</p>
      </div>
    );
  }

  if (!isValid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Access Denied</h2>
          <p className="text-center text-gray-600 mb-6">{error || 'The shared link is invalid or has expired.'}</p>
          <div className="flex justify-center">
            <a 
              href="/galleries"
              className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700 transition-colors"
            >
              Browse Galleries
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Add a wrapper with a class to indicate shared view
  return <div className="shared-view-wrapper">{children}</div>;
} 