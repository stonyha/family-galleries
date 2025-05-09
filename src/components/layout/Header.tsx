"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { UserProfile } from '@/types/auth';

// Store user data in session storage to avoid frequent API calls
const getUserFromStorage = (): UserProfile | null => {
  if (typeof window === 'undefined') return null;
  
  const stored = sessionStorage.getItem('user_profile');
  if (!stored) return null;
  
  try {
    return JSON.parse(stored);
  } catch (e) {
    return null;
  }
};

// Store last fetch time to implement rate limiting
const getLastFetchTime = (): number => {
  if (typeof window === 'undefined') return 0;
  
  const stored = sessionStorage.getItem('last_auth_fetch');
  return stored ? parseInt(stored, 10) : 0;
};

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Use useEffect to update from session storage on client-side
  useEffect(() => {
    setIsClient(true);
    const storedUser = getUserFromStorage();
    if (storedUser) {
      setUser(storedUser);
      setIsLoading(false);
    }
  }, []);

  // Memoize user ID to prevent unnecessary re-renders in useCallback
  const userId = useMemo(() => user?.sub || null, [user?.sub]);

  const fetchUserProfile = useCallback(async (retryCount = 0) => {
    // Skip if not client-side yet
    if (typeof window === 'undefined') return;
    
    const now = Date.now();
    const lastFetch = getLastFetchTime();
    const minInterval = 2000; // 2 seconds minimum between requests
    
    // If we recently fetched and have a user already, don't fetch again
    if (now - lastFetch < minInterval && userId) {
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Store current fetch time
      sessionStorage.setItem('last_auth_fetch', now.toString());
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch('/api/auth/me', {
        cache: 'no-store',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          sessionStorage.removeItem('user_profile');
          return;
        }
        
        if (response.status === 429 && retryCount < 3) {
          const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
          
          // Wait and retry with exponential backoff
          setTimeout(() => {
            fetchUserProfile(retryCount + 1);
          }, waitTime);
          return;
        }
        
        // For other errors, get more details
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        
        throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
      }
      
      const userData = await response.json();
      setUser(userData);
      
      // Cache user data in session storage
      sessionStorage.setItem('user_profile', JSON.stringify(userData));
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // Only depend on userId, not the entire user object

  useEffect(() => {
    if (isClient) {
      fetchUserProfile();
      
      // Set up infrequent refresh of user data
      const refreshInterval = setInterval(() => {
        // Only refresh if the page has been active
        if (document.visibilityState === 'visible') {
          fetchUserProfile();
        }
      }, 10 * 60 * 1000); // Every 10 minutes (increased to reduce API calls)
      
      // Listen for visibility changes
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          const lastFetch = getLastFetchTime();
          const now = Date.now();
          // Only fetch if it's been more than 5 minutes since last fetch
          if ((now - lastFetch) / 1000 > 300) {
            fetchUserProfile();
          }
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        clearInterval(refreshInterval);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [fetchUserProfile, isClient]);

  // Memoize navigation items to prevent re-renders
  const navItems = useMemo(() => (
    <>
      <Link
        href="/galleries"
        className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
        Bộ sưu tập
      </Link>
      <Link
        href="/videos"
        className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
        </svg>
        Video
      </Link>
      <Link
        href="/blog"
        className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
        Blog
      </Link>
      <Link
        href="/about"
        className="inline-flex items-center px-3 py-2 rounded-md text-sm font-medium text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 mr-2"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        Về chúng tôi
      </Link>
    </>
  ), []);

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href="/" 
              className="flex-shrink-0 flex items-center"
            >
              <div className="flex items-center">
                <Image 
                  src="/images/family-logox64.png"
                  alt="Family Galleries Logo"
                  width={64}
                  height={64}
                  priority
                  className="mr-2"
                />
                <span className="text-xl font-bold text-amber-600">Sipikidi's Family</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            {navItems}
            
            {/* Auth buttons */}
            <div className="flex items-center ml-4">
              {isLoading ? (
                <div className="animate-pulse h-8 w-20 bg-gray-200 rounded"></div>
              ) : user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/profile"
                    className="inline-flex items-center space-x-2"
                  >
                    {user.picture ? (
                      <Image
                        src={user.picture}
                        alt={user.name || 'User'}
                        width={32}
                        height={32}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-amber-500 flex items-center justify-center text-white">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                    )}
                    <span className="text-sm text-gray-700">{user.name}</span>
                  </Link>
                  <a
                    href="/api/auth/logout"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Đăng xuất
                  </a>
                </div>
              ) : (
                <a
                  href="/api/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Đăng nhập
                </a>
              )}
            </div>
          </nav>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              href="/galleries"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-amber-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Bộ sưu tập
              </div>
            </Link>
            <Link
              href="/videos"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-amber-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
                Video
              </div>
            </Link>
            <Link
              href="/blog"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-amber-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                </svg>
                Blog
              </div>
            </Link>
            <Link
              href="/about"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-amber-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Về chúng tôi
              </div>
            </Link>
            
            {/* Mobile auth */}
            {user ? (
              <div className="space-y-2 pt-2">
                <Link
                  href="/profile"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-amber-600 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    Hồ sơ
                  </div>
                </Link>
                <a
                  href="/api/auth/logout"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 8a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 14.586V11z" clipRule="evenodd" />
                    </svg>
                    Đăng xuất
                  </div>
                </a>
              </div>
            ) : (
              <a
                href="/api/auth/login"
                className="block pl-3 pr-4 py-2 border-l-4 border-amber-500 text-base font-medium text-amber-700 bg-amber-50 hover:bg-amber-100"
                onClick={() => setIsMenuOpen(false)}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-2"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M3 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm7.707 3.293a1 1 0 010 1.414L9.414 9H17a1 1 0 110 2H9.414l1.293 1.293a1 1 0 01-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Đăng nhập
                </div>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 