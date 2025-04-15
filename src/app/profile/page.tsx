'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { UserProfile } from '@/types/auth';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/me');
        
        if (!response.ok) {
          if (response.status === 401) {
            router.push('/api/auth/login');
            return;
          }
          throw new Error('Failed to fetch user profile');
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUserProfile();
  }, [router]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/api/auth/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              {user.picture ? (
                <div className="relative h-32 w-32 rounded-full overflow-hidden border-4 border-amber-200">
                  <Image
                    src={user.picture}
                    alt={user.name || 'User'}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-32 w-32 rounded-full bg-amber-500 flex items-center justify-center text-white text-4xl font-bold border-4 border-amber-200">
                  {user.name?.charAt(0) || 'U'}
                </div>
              )}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {user.name || 'Anonymous User'}
              </h1>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                <h2 className="text-lg font-semibold text-amber-800 mb-2">User Information</h2>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-600 font-medium">User ID:</span>
                    <span className="text-gray-800 col-span-2">{user.sub}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <span className="text-gray-600 font-medium">Email Verified:</span>
                    <span className="text-gray-800 col-span-2">
                      {user.email_verified ? 'Yes' : 'No'}
                    </span>
                  </div>
                  {user.nickname && (
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-gray-600 font-medium">Nickname:</span>
                      <span className="text-gray-800 col-span-2">{user.nickname}</span>
                    </div>
                  )}
                  {user.updated_at && (
                    <div className="grid grid-cols-3 gap-4">
                      <span className="text-gray-600 font-medium">Last Updated:</span>
                      <span className="text-gray-800 col-span-2">
                        {new Date(user.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-center md:justify-end">
            <a
              href="/api/auth/logout"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  );
} 