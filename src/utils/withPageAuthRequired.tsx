'use client';

import { useEffect, useState, ReactElement } from "react";
import { useRouter } from "next/navigation";

type WithPageAuthRequiredProps = {
  onRedirecting?: () => ReactElement;
  onError?: (error: Error) => ReactElement;
};

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

    useEffect(() => {
      async function checkUser() {
        try {
          setIsLoading(true);
          const response = await fetch('/api/auth/me');
          
          if (!response.ok) {
            if (response.status === 401) {
              router.push('/api/auth/login');
              return;
            }
            throw new Error('Failed to fetch user');
          }
          
          const userData = await response.json();
          setUser(userData);
        } catch (err) {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        } finally {
          setIsLoading(false);
        }
      }
      
      checkUser();
    }, [router]);

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