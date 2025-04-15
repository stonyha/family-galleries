"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

type UserProfile = {
  email?: string;
  email_verified?: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  sub?: string;
  updated_at?: string;
  [key: string]: any;
};

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
  const [user, setUser] = useState<UserProfile | null>(getUserFromStorage());
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(!user);

  const fetchUserProfile = useCallback(async (retryCount = 0) => {
    const now = Date.now();
    const lastFetch = getLastFetchTime();
    const minInterval = 2000; // 2 seconds minimum between requests
    
    // If we recently fetched and have a user already, don't fetch again
    if (now - lastFetch < minInterval && user) {
      console.log('Skipping fetch - too recent');
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching user profile');
      
      // Store current fetch time
      sessionStorage.setItem('last_auth_fetch', now.toString());
      
      const response = await fetch('/api/auth/me', {
        cache: 'no-store'
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('User not authenticated (401)');
          setUser(null);
          sessionStorage.removeItem('user_profile');
          return;
        }
        
        if (response.status === 429 && retryCount < 3) {
          const waitTime = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`Rate limited. Retrying in ${waitTime}ms`);
          
          // Wait and retry with exponential backoff
          setTimeout(() => {
            fetchUserProfile(retryCount + 1);
          }, waitTime);
          return;
        }
        
        // For other errors, get more details
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Error fetching user profile:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        
        throw new Error(`Failed to fetch user profile: ${response.status} ${response.statusText}`);
      }
      
      const userData = await response.json();
      console.log('User profile fetched successfully');
      setUser(userData);
      
      // Cache user data in session storage
      sessionStorage.setItem('user_profile', JSON.stringify(userData));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      console.error('Error in fetchUserProfile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Only fetch if we don't have a cached user
    if (!user) {
      fetchUserProfile();
    }
    
    // Set up infrequent refresh of user data
    const refreshInterval = setInterval(() => {
      // Only refresh if the page has been active
      if (document.visibilityState === 'visible') {
        fetchUserProfile();
      }
    }, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(refreshInterval);
  }, [fetchUserProfile, user]);

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
                <span className="text-xl font-bold text-amber-600">Sipikidi's Galleries</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop navigation */}
          <nav className="hidden md:ml-6 md:flex md:items-center md:space-x-8">
            <Link
              href="/"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <div className="flex items-center">
                <Image 
                  src="/images/home-menux48.png"
                  alt="Home"
                  width={48}
                  height={48}
                  priority
                  className="mr-2"
                />
              </div>
            </Link>
            <Link
              href="/galleries"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <div className="flex items-center">
                <Image 
                  src="/images/galleries-menux48.png"
                  alt="Galleries"
                  width={48}
                  height={48}
                  priority
                  className="mr-2"
                />
              </div>
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              <div className="flex items-center">
                <Image 
                  src="/images/about-us-menux48.png"
                  alt="About Us"
                  width={48}
                  height={48}
                  priority
                  className="mr-2"
                />
              </div>
            </Link>
            
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
                    Logout
                  </a>
                </div>
              ) : (
                <a
                  href="/api/auth/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                >
                  Login
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
              href="/"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Trang chủ
            </Link>
            <Link
              href="/galleries"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Thư viện
            </Link>
            <Link
              href="/about"
              className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
              onClick={() => setIsMenuOpen(false)}
            >
              Về chúng tôi
            </Link>
            
            {/* Mobile auth */}
            {user ? (
              <div className="space-y-2 pt-2">
                <Link
                  href="/profile"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Hồ sơ
                </Link>
                <a
                  href="/api/auth/logout"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-red-600 hover:bg-gray-50 hover:border-red-300 hover:text-red-800"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Đăng xuất
                </a>
              </div>
            ) : (
              <a
                href="/api/auth/login"
                className="block pl-3 pr-4 py-2 border-l-4 border-amber-500 text-base font-medium text-amber-700 bg-amber-50 hover:bg-amber-100"
                onClick={() => setIsMenuOpen(false)}
              >
                Đăng nhập
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
} 