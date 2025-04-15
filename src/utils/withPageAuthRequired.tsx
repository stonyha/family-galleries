"use client";

import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import React from 'react';
import { UserProfile } from '@/types/auth';

type WithPageAuthRequiredProps = {
  onRedirecting?: () => React.ReactElement;
  onError?: (error: Error) => React.ReactElement;
};

// Cache user data to reduce duplicate requests
const userCache = {
  data: null as UserProfile | null,
  timestamp: 0,
  maxAge: 5 * 60 * 1000, // 5 minutes
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

export default function withPageAuthRequired<P extends object>(
  Component: React.ComponentType<P>,
  options: WithPageAuthRequiredProps = {}
) {
  return function WithPageAuthRequired(props: P) {
    const router = useRouter();
    const { onRedirecting, onError } = options;
    const [user, setUser] = useState<UserProfile | null>(null);
    const [error, setError] = useState<Error | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check if we can use cached data
    const useCache = useMemo(() => {
      if (!userCache.data) return false;
      return (Date.now() - userCache.timestamp) < userCache.maxAge;
    }, []);

    useEffect(() => {
      async function checkUser() {
        try {
          setIsLoading(true);
          
          // First check session storage (client-side)
          const storedUser = getUserFromStorage();
          if (storedUser) {
            setUser(storedUser);
            setIsLoading(false);
            
            // Update cache
            userCache.data = storedUser;
            userCache.timestamp = Date.now();
            return;
          }
          
          // Then check memory cache
          if (useCache && userCache.data) {
            setUser(userCache.data);
            setIsLoading(false);
            return;
          }
          
          // Finally fetch from API
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch('/api/auth/me', {
            signal: controller.signal,
            cache: 'no-store'
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            if (response.status === 401) {
              router.push('/api/auth/login');
              return;
            }
            throw new Error('Failed to fetch user');
          }
          
          const userData = await response.json();
          setUser(userData);
          
          // Update cache
          userCache.data = userData;
          userCache.timestamp = Date.now();
          
          // Also store in session storage
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('user_profile', JSON.stringify(userData));
          }
        } catch (err) {
          if (err instanceof Error && err.name !== 'AbortError') {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
          }
        } finally {
          setIsLoading(false);
        }
      }
      
      checkUser();
    }, [router, useCache]);

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/api/auth/login');
      }
    }, [user, isLoading, router]);

    if (isLoading) {
      return onRedirecting ? onRedirecting() : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      );
    }

    if (error) {
      return onError ? onError(error) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{error.message}</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return null; // Will redirect in useEffect
    }

    return <Component {...props} />;
  };
} 